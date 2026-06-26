import { useLocalSearchParams, Stack, router } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useState, useCallback, memo, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useImages, useUploadImages, useDeleteImage, Image as ImageType } from '@/hooks/useImages';
import { FlashList } from '@shopify/flash-list';

import { ImageModal } from '@/components/ImageModal';
import { ImageGridItem } from '@/components/ImageGridItem';

import { LegendList, LegendListRef } from "@legendapp/list"

export default function AlbumDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: images, isLoading } = useImages(id);
  const { mutateAsync: uploadImages, isPending: isUploading } = useUploadImages();
  const { mutateAsync: deleteImage, isPending: isDeleting } = useDeleteImage(id);


  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  // const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const selectedImage = useRef<ImageType | null>(null);


  const handlePickAndUploadImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 100,
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

  const handleDeleteImage = async () => {
    if (!selectedImage) return;

    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImage(selectedImage.current!);
              selectedImage.current = null;
            } catch (error: any) {
              Alert.alert("Delete Failed", error.message);
            }
          }
        }
      ]
    );
  };


  const renderItem = memo(({ item }: { item: ImageType }) => {
    return (
      <ImageGridItem
        item={item}
        onPress={() => {
          selectedImage.current = item;
          router.push({
            pathname: "/album/full-image/[id]",
            params: {
              id: item.id,
              url: item.url,
              thumbnail_url: item.thumbnail_url || '',
              albumId: id,
            }
          });
        }}
      />
    );
  });

  const AnimatedOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Album',
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => (
            <AnimatedOpacity onPress={handlePickAndUploadImages} disabled={isUploading} style={{
              animationName: {
                '100%': {
                  transform: [{ translateX: 100 }],
                }
              }
            }}>
              <Ionicons name="cloud-upload" size={24} color={isUploading ? "#aaa" : "#007AFF"} style={{ marginRight: 15 }} />
            </AnimatedOpacity>
          )
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <LegendList
          data={images || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          recycleItems={true}
          estimatedItemSize={120}
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

      {!isUploading && (
        <TouchableOpacity
          style={[styles.fab, {
            animationName: {
              '100%': {
                transform: [{ translateX: 100 }],
              }
            }
          }]}
          onPress={handlePickAndUploadImages}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onDelete={handleDeleteImage}
        isDeleting={isDeleting}
      /> */}

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
    padding: theme.margins.sm,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 30,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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

}));
