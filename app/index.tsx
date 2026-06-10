import { Link, Stack, useRouter } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useEffect, useState } from 'react';
import { useAlbums, useCreateAlbum } from '@/hooks/useAlbums';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { imagekit } from '@/utils/imagekit';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { useLogoutMutation } from '@/hooks/useAuthQueries';

export default function Home() {
  const { data: albums, isLoading } = useAlbums();
  const { mutateAsync: createAlbum, isPending: isCreating } = useCreateAlbum();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const router = useRouter();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogoutMutation();

  // const handle = requestIdleCallback((deadline) => {
  //   console.log(deadline.timeRemaining());
  // }, { timeout: 1000 })

  // // Remove idle callback on unmount to prevent memory leaks
  // useEffect(() => {
  //   return () => {
  //     cancelIdleCallback(handle)
  //   }
  // }, [])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    try {
      await createAlbum(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const getThumbnailUrl = (imageUrl: string) => {
    // We add simple transformation parameters for thumbnails, ensuring uniform size and low bandwidth usage
    return imagekit.url({
      src: imageUrl,
      transformation: [{ height: "300", width: "300", cropMode: "extract" }]
    });
  };

  const onLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <TouchableOpacity
        style={styles.albumCard}
        onPress={() => router.push(`/album/${item.id}`)}
      >
        <View style={styles.thumbnailContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage.thumbnail_url || getThumbnailUrl(firstImage.url) }}
              style={styles.thumbnail}
              contentFit="none"
            />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Ionicons name="folder-outline" size={40} color="#888" />
            </View>
          )}
        </View>
        <View style={styles.albumInfo}>
          <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.imageCount}>{item.images?.length || 0} images</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'My Albums', headerBackButtonDisplayMode: 'minimal', headerRight: () => (
          <View style={{ marginRight: 15, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={onLogout} >
              <Ionicons name="log-out" size={24} color={"#007AFF"} />
            </TouchableOpacity>
          </View>
        )
      }} />

      {isCreatingFolder && (
        <View style={styles.createFolderContainer}>
          <TextInput
            style={styles.input}
            placeholder="Folder Name"
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus
          />
          <View style={styles.createButtons}>
            <Button
              title="Cancel"
              onPress={() => setIsCreatingFolder(false)}
              style={styles.cancelButton}
            />
            <Button
              title={isCreating ? "Creating..." : "Create"}
              onPress={handleCreateFolder}
              disabled={isCreating}
            />
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No albums yet.</Text>
            </View>
          }
        />
      )}

      {!isCreatingFolder && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsCreatingFolder(true)}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
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
    padding: theme.margins.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.margins.md,
  },
  albumCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    // backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    padding: theme.margins.sm,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.typography,
  },
  imageCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
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
  createFolderContainer: {
    padding: theme.margins.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.md,
    padding: theme.margins.sm,
    marginBottom: theme.margins.sm,
    color: theme.colors.typography,
  },
  createButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.margins.sm,
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  searchContainer: {
    padding: theme.margins.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));
