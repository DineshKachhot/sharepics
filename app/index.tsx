import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput, useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { memo, useCallback, useState } from 'react';
import { useAlbums, useCreateAlbum } from '@/hooks/useAlbums';
import { Button } from '@/components/Button';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { imagekit } from '@/utils/imagekit';
import { Image } from 'expo-image';
import { useLogoutMutation } from '@/hooks/useAuthQueries';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LegendList } from '@legendapp/list';

const LIST_IMG_SIZE = 80;
const SPRING_CONFIG = { damping: 50, stiffness: 300 };

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedImage = Animated.createAnimatedComponent(Image);

const getThumbnailUrl = (imageUrl: string) =>
  imagekit.url({
    src: imageUrl,
    transformation: [{ height: '300', width: '300', cropMode: 'extract' }],
  });

type AlbumCardProps = {
  item: any;
  progress: SharedValue<number>;
  gridCardWidth: number;
  listCardWidth: number;
  onPress: () => void;
};

const AlbumCard = memo(({ item, progress, gridCardWidth, listCardWidth, onPress }: AlbumCardProps) => {
  const cardStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [gridCardWidth, listCardWidth]),
    flexDirection: 'row',
    flexWrap: 'wrap',
  }));

  // height follows from aspectRatio: 1 in base styles
  const imgContainerStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [gridCardWidth, LIST_IMG_SIZE]),
  }));

  const firstImage = item.images?.[0] ?? null;

  return (
    <AnimatedTouchableOpacity style={[styles.albumCard, cardStyle]} onPress={onPress}>
      <Animated.View style={[styles.thumbnailContainer, imgContainerStyle]}>
        {firstImage ? (
          <AnimatedImage
            source={{ uri: firstImage.thumbnail_url || getThumbnailUrl(firstImage.url) }}
            style={styles.thumbnail}
            contentFit="cover"
            sharedTransitionTag={`thumbnail-${item.id}`}
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="folder-outline" size={40} color="#888" />
          </View>
        )}
      </Animated.View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.imageCount}>{item.images?.length ?? 0} images</Text>
      </View>
    </AnimatedTouchableOpacity>
  );
});

export default function Home() {
  const { data: albums, isLoading } = useAlbums();
  const { mutateAsync: createAlbum, isPending: isCreating } = useCreateAlbum();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const router = useRouter();
  const { mutateAsync: logout } = useLogoutMutation();

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const progress = useSharedValue(0); // 0=grid, 1=list

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const GRID_CARD_WIDTH = (SCREEN_WIDTH - 40) / 2;
  const LIST_CARD_WIDTH = SCREEN_WIDTH - 24;

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

  const onLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handelViewTypeToggle = () => {
    const toList = viewType === 'grid';
    progress.value = withSpring(toList ? 1 : 0, SPRING_CONFIG);
    setViewType(toList ? 'list' : 'grid');
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <AlbumCard
        item={item}
        progress={progress}
        gridCardWidth={GRID_CARD_WIDTH}
        listCardWidth={LIST_CARD_WIDTH}
        onPress={() => router.push(`/album/${item.id}`)}
      />
    ),
    [GRID_CARD_WIDTH, LIST_CARD_WIDTH, progress, router],
  );

  const numColumns = viewType === 'grid' ? 2 : 1;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Albums',
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
              <TouchableOpacity onPress={handelViewTypeToggle}>
                <Entypo name="grid" size={24} color="#007AFF" style={{ marginRight: 15, marginLeft: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handelViewTypeToggle}>
                <Entypo name="list" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

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
            <Button title="Cancel" onPress={() => setIsCreatingFolder(false)} style={styles.cancelButton} />
            <Button
              title={isCreating ? 'Creating...' : 'Create'}
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
        <LegendList
          data={albums!}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={viewType === 'grid' ? { columnGap: 16 } : undefined}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.listContent}
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
  albumCard: {
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
    aspectRatio: 1,
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
    flex: 1,
    padding: theme.margins.md,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
}));
