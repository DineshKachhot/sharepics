import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Image as ImageType } from '@/hooks/useImages';
import { getThumbnailUrl } from '@/utils/imagekit';
import Animated, { SharedTransition, withSpring } from 'react-native-reanimated';
import { Link } from 'expo-router';

interface ImageGridItemProps {
  item: ImageType;
  onPress: (item: ImageType) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedImage = Animated.createAnimatedComponent(Image);

const customTransition = new SharedTransition()
  .springify()
  .damping(26)
  .stiffness(170);

export const ImageGridItem = memo(({ item, onPress }: ImageGridItemProps) => {
  return (
    <Link
      style={styles.imageGridItem}
      onPress={() => onPress(item)}
      href={{
        pathname: "/album/full-image/[id]",
        params: {
          id: item.id,
          url: item.url,
          thumbnail_url: item.thumbnail_url || '',
        }
      }}
      asChild
    >
      <Link.Trigger withAppleZoom={true}>
        <Pressable style={styles.pressable}>
          <AnimatedImage
            sharedTransitionTag={`image-${item.id}`}
            sharedTransitionStyle={customTransition}
            source={{ uri: item.thumbnail_url || getThumbnailUrl(item.url) }}
            style={styles.gridImage}
            contentFit="none"
            transition={200}
          />
        </Pressable>
      </Link.Trigger>
      <Link.Preview />
    </Link>
  );
});

const styles = StyleSheet.create({
  imageGridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 2,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    // backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});
