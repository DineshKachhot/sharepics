import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { uploadFileToImageKit } from '../utils/imagekit';

export interface Image {
  id: string;
  album_id: string;
  imagekit_file_id: string;
  url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export const useImages = (albumId: string) => {
  return useQuery({
    queryKey: ['images', albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as Image[];
    },
    enabled: !!albumId, // Only fetch if we have an album ID
  });
};

interface UploadImageData {
  albumId: string;
  files: any[]; // Assuming array of picked image objects from expo-image-picker
  onProgress?: (index: number, total: number) => void;
}

export const useUploadImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, files, onProgress }: UploadImageData) => {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload to ImageKit
        try {
          const result: any = await uploadFileToImageKit(file);
          
          // Save to Supabase
          const { data, error } = await supabase
            .from('images')
            .insert([{
              album_id: albumId,
              imagekit_file_id: result.fileId,
              url: result.url,
              thumbnail_url: result.thumbnailUrl,
            }])
            .select()
            .single();

          if (error) throw new Error(error.message);
          uploadedImages.push(data);
          
          if (onProgress) {
            onProgress(i + 1, files.length);
          }
        } catch (error: any) {
          console.error(`Failed to upload file ${file.name || 'image'}:`, error.message);
          throw new Error('Failed to upload some images');
        }
      }
      
      return uploadedImages;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] }); // Invalidate albums to refresh thumbnails
    },
  });
};

export const useDeleteImage = (albumId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: Image) => {
      // 1. Delete from ImageKit via Edge Function
      const { data, error: edgeError } = await supabase.functions.invoke('imagekit-delete', {
        body: { fileId: image.imagekit_file_id },
      });

      if (edgeError) {
        throw new Error(`Failed to delete from ImageKit: ${edgeError.message}`);
      }

      // 2. Delete from Supabase
      const { error: supabaseError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id);

      if (supabaseError) {
        throw new Error(`Failed to delete from database: ${supabaseError.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};

