import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Image as ImageType } from '@/hooks/useImages';
import { getThumbnailUrl } from '@/utils/imagekit';

interface ImageGridItemProps {
  item: ImageType;
  onPress: (item: ImageType) => void;
}

export const ImageGridItem = memo(({ item, onPress }: ImageGridItemProps) => {
  return (
    <TouchableOpacity
      style={styles.imageGridItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.thumbnail_url || getThumbnailUrl(item.url) }}
        style={styles.gridImage}
        contentFit="cover"
        transition={200}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  imageGridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});
