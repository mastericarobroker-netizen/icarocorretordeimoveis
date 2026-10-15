import { cn } from '@/lib/utils';
import type { MouseEventHandler } from 'react';
import { hasPropertyPhotoWatermark } from '@/lib/propertyPhotoWatermark';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  watermarkClassName?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function WatermarkedImage({
  src,
  alt,
  className,
  imageClassName,
  watermarkClassName,
  onClick,
}: WatermarkedImageProps) {
  const showWatermark = hasPropertyPhotoWatermark(src);

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={onClick}>
      <img
        src={src}
        alt={alt}
        className={cn('block h-full w-full object-cover', imageClassName)}
      />
      {showWatermark && (
        <img
          src="/brand-watermark.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 z-20 w-[28%] max-h-[34%] max-w-[240px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-50 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]',
            watermarkClassName
          )}
        />
      )}
    </div>
  );
}
