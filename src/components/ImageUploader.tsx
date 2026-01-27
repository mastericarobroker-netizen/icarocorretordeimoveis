import { useState, useRef, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, ImagePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, isUploading, uploadProgress } = useImageUpload();

  const canAddMore = images.length < maxImages;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      for (const file of filesToUpload) {
        const url = await uploadImage(file);
        if (url) {
          onImagesChange([...images, url]);
          // Update images reference for next iteration
          images = [...images, url];
        }
      }
    },
    [images, maxImages, onImagesChange, uploadImage]
  );

  const handleRemove = async (index: number) => {
    const imageUrl = images[index];
    
    // Only try to delete from storage if it's a Supabase URL
    if (imageUrl.includes('supabase.co')) {
      await deleteImage(imageUrl);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAddMore) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (canAddMore) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (canAddMore && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-background/80 text-foreground text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enviando imagem...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Drop Zone */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            {images.length === 0 ? (
              <Upload className="h-8 w-8 text-muted-foreground" />
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {images.length === 0
                  ? 'Clique ou arraste para adicionar fotos'
                  : 'Adicionar mais fotos'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {images.length}/{maxImages} imagens • JPG, PNG, WebP (máx. 5MB cada)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Max reached message */}
      {!canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          Limite de {maxImages} imagens atingido
        </p>
      )}
    </div>
  );
}
