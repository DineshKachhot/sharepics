import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { getThumbnailUrl, getFullImageUrl } from '@/utils/imagekit';
import { useDeleteImage } from '@/hooks/useImages';
import Animated, { SharedTransition, withSpring } from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const customTransition = new SharedTransition()
    .springify()
    .damping(26)
    .stiffness(170);

export default function FullImage() {
    const { id, url, thumbnail_url, albumId } = useLocalSearchParams<{
        id: string;
        url: string;
        thumbnail_url?: string;
        albumId: string;
    }>();
    const router = useRouter();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const { mutateAsync: deleteImage, isPending: isDeleting } = useDeleteImage(albumId);

    const onClose = () => {
        router.back();
    };

    const onDelete = async () => {
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
                            await deleteImage({ id: id!, url: url!, albumId: albumId!, thumbnail_url: thumbnail_url || '' } as any);
                            router.back();
                        } catch (error: any) {
                            Alert.alert("Delete Failed", error.message);
                        }
                    }
                }
            ]
        );
    };

    const { theme } = useUnistyles();

    return (
        <View style={styles.modalContainer}>
            <Stack.Screen options={{ headerShown: true, presentation: 'transparentModal', headerBackButtonDisplayMode: 'minimal' }} />
            <SafeAreaView style={{ flex: 1, position: 'relative' }}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Ionicons name="close" size={30} color={theme.colors.error} />
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

                <ScrollView contentContainerStyle={styles.fullImageContainer} maximumZoomScale={5} minimumZoomScale={1} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    <AnimatedImage
                        sharedTransitionTag={`image-${id}`}
                        sharedTransitionStyle={customTransition}
                        source={{ uri: getFullImageUrl(url) }}
                        placeholder={{ uri: thumbnail_url || getThumbnailUrl(url) }}
                        style={{ width: screenWidth, height: screenHeight }}
                        contentFit="contain"
                    />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: theme.colors.background,
        borderRadius: 25,
    },
    deleteButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: theme.colors.background,
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
