import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useImages, useUploadImages, Image as ImageType } from '@/hooks/useImages';
import { imagekit } from '@/utils/imagekit';

export default function AlbumDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: images, isLoading } = useImages(id);
  const { mutateAsync: uploadImages, isPending: isUploading } = useUploadImages();
  
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const getThumbnailUrl = (imageUrl: string) => {
    return imagekit.url({
      src: imageUrl,
      transformation: [{ height: "400", width: "400", cropMode: "pad_resize", quality: "80" }]
    });
  };

  const getFullImageUrl = (imageUrl: string) => {
    // Basic imagekit URL conversion for optimized web delivery if needed, or raw URL
    return imagekit.url({
      src: imageUrl,
      transformation: [{ quality: "95" }]
    });
  };

  const handlePickAndUploadImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 20,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUploadProgress({ current: 0, total: result.assets.length });
      try {
        await uploadImages({
          albumId: id,
          files: result.assets,
          onProgress: (current, total) => {
            setUploadProgress({ current, total });
          }
        });
        // Upload finished successfully
        setUploadProgress({ current: 0, total: 0 }); // reset
      } catch (error: any) {
        Alert.alert("Upload Failed", error.message);
        setUploadProgress({ current: 0, total: 0 }); // reset
      }
    }
  };

  const renderItem = ({ item }: { item: ImageType }) => {
    return (
      <TouchableOpacity
        style={styles.imageGridItem}
        onPress={() => setSelectedImage(item)}
      >
        <Image
          source={{ uri: item.thumbnail_url || getThumbnailUrl(item.url) }}
          style={styles.gridImage}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Album',
          headerRight: () => (
            <TouchableOpacity onPress={handlePickAndUploadImages} disabled={isUploading}>
              <Ionicons name="cloud-upload" size={24} color={isUploading ? "#aaa" : "#007AFF"} style={{ marginRight: 15 }} />
            </TouchableOpacity>
          )
        }} 
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No images in this album.</Text>
            </View>
          }
        />
      )}

      {/* Progress Bar Area */}
      {isUploading && uploadProgress.total > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Uploading {uploadProgress.current} of {uploadProgress.total}
          </Text>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={{ flex: 1, position: 'relative' }}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            {selectedImage && (
              <View style={styles.fullImageContainer}>
                {/* 
                  React Native Image component natively supports caching. 
                  We fetch the full image over the preview image.
                */}
                <Image
                  source={{ uri: getFullImageUrl(selectedImage.url) }}
                  defaultSource={{ uri: selectedImage.thumbnail_url || getThumbnailUrl(selectedImage.url) }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  listContent: {
    padding: theme.margins.xs,
  },
  imageGridItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    padding: theme.margins.md,
    paddingBottom: 30, // SafeArea padding basically
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: theme.colors.typography,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  }
}));
