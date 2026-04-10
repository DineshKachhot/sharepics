import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export interface Album {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  images?: Image[];
}

export interface Image {
  id: string;
  album_id: string;
  imagekit_file_id: string;
  url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export const useAlbums = () => {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          images (
            id,
            url,
            thumbnail_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as Album[];
    },
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data, error } = await supabase
        .from('albums')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};
