import React, { memo } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native-unistyles';
import { Image as ImageType } from '@/hooks/useImages';
import { getThumbnailUrl, getFullImageUrl } from '@/utils/imagekit';

interface ImageModalProps {
  image: ImageType | null;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const ImageModal = memo(({ image, onClose, onDelete, isDeleting }: ImageModalProps) => {
  if (!image) return null;

  return (
    <Modal
      visible={!!image}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <SafeAreaView style={{ flex: 1, position: 'relative' }}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="trash" size={26} color="#FF3B30" />
            )}
          </TouchableOpacity>

          <View style={styles.fullImageContainer}>
            <Image
              source={{ uri: getFullImageUrl(image.url) }}
              placeholder={{ uri: image.thumbnail_url || getThumbnailUrl(image.url) }}
              style={styles.fullImage}
              contentFit="contain"
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create((theme) => ({
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
  deleteButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
