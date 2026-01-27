import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BUCKET_NAME = 'property-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato não permitido. Use JPG, PNG ou WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Máximo 5MB.';
    }
    return null;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Simulate progress (Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      toast.success('Imagem enviada com sucesso!');
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao enviar imagem. Tente novamente.');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        console.error('Invalid image URL');
        return false;
      }

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast.success('Imagem removida!');
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Erro ao remover imagem.');
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress,
  };
}
