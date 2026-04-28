import ImageKit from 'imagekit-javascript';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';

const urlEndpoint = process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';
const publicKey = process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';

export const imagekit = new ImageKit({
  urlEndpoint,
  publicKey,
});


export const uploadFileToImageKit = async (file: any): Promise<any> => {
  // 1. Prepare upload parameters. V2 requires these to be signed into the JWT.
  const fileName = file.fileName || file.name || `img_${Date.now()}.jpg`;
  const folder = '/albums'; // You can customize this

  const uploadParams = {
    fileName,
    useUniqueFileName: 'true', // ImageKit expects strings for these in the payload
    folder,
  };

  // 2. Get JWT from our edge function
  // We send the parameters we want signed.
  const { data, error: authError } = await supabase.functions.invoke('imagekit-auth', {
    body: { uploadParams },
  });

  console.log('data:- ', data, authError);

  if (authError) {
    if (authError instanceof FunctionsHttpError) {
      const body = await authError.context.json().catch(() => ({ error: authError.message }));
      const reason = body?.error || body?.message || JSON.stringify(body);
      throw new Error(`Edge Function error: ${reason}`);
    }
    throw new Error(`Auth request failed: ${authError.message}`);
  }

  const jwt = data?.token;
  if (!jwt) throw new Error('Edge function did not return a token');

  // 3. Build multipart FormData
  // For V2, all signed parameters must also be present in the FormData.
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: fileName,
    type: file.mimeType || 'image/jpeg',
  } as any);

  // These MUST match the uploadParams sent to the edge function exactly
  formData.append('fileName', fileName);
  formData.append('useUniqueFileName', 'true');
  formData.append('folder', folder);

  // V2 API Authentication: The JWT token goes into the 'token' field
  formData.append('token', jwt);

  const response = await fetch('https://upload.imagekit.io/api/v2/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ImageKit upload failed (${response.status}): ${errorBody}`);
  }

  return response.json();
};


export const getThumbnailUrl = (imageUrl: string) => {
  return imagekit.url({
    src: imageUrl,
    transformation: [{ height: 400, width: 400, cropMode: "extract", quality: 80 }]
  });
};

export const getFullImageUrl = (imageUrl: string) => {
  return imagekit.url({
    src: imageUrl,
    transformation: [{ quality: 95 }]
  });
};
