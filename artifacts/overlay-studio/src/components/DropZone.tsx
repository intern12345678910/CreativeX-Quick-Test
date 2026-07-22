import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { BaseMedia } from '@/types';

export default function DropZone() {
  const [error, setError] = useState<string | null>(null);
  const setBaseMedia = useEditorStore((state) => state.setBaseMedia);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('Please upload a valid image or video file');
      return;
    }

    const file = acceptedFiles[0];
    const fileType = file.type;

    // Determine media type
    let mediaType: 'image' | 'video';
    if (fileType.startsWith('image/')) {
      mediaType = 'image';
    } else if (fileType.startsWith('video/')) {
      mediaType = 'video';
    } else {
      setError('Unsupported file type. Please upload an image or video.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (mediaType === 'image') {
      const img = new Image();
      img.onload = () => {
        const media: BaseMedia = {
          type: 'image',
          src: objectUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          file,
        };
        setBaseMedia(media);
      };
      img.onerror = () => setError('Failed to load image');
      img.src = objectUrl;
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const media: BaseMedia = {
          type: 'video',
          src: objectUrl,
          width: video.videoWidth,
          height: video.videoHeight,
          file,
        };
        setBaseMedia(media);
      };
      video.onerror = () => setError('Failed to load video');
      video.src = objectUrl;
    }
  }, [setBaseMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
    },
    multiple: false,
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div
        {...getRootProps()}
        data-testid="dropzone-area"
        className={`
          w-full max-w-3xl border-2 border-dashed rounded-lg p-16
          transition-all duration-200 cursor-pointer
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }
        `}
      >
        <input {...getInputProps()} data-testid="file-input" />
        
        <div className="flex flex-col items-center gap-6 text-center">
          <div className={`
            rounded-full p-6 transition-all duration-200
            ${isDragActive ? 'bg-primary/20' : 'bg-muted'}
          `}>
            <Upload className={`
              w-16 h-16 transition-colors
              ${isDragActive ? 'text-primary' : 'text-muted-foreground'}
            `} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              {isDragActive ? 'Drop your file here' : 'Drop media to start'}
            </h2>
            <p className="text-muted-foreground max-w-md">
              Drag and drop an image or video, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG, GIF, WebP, MP4, WebM
            </p>
          </div>

          {error && (
            <div className="text-destructive text-sm font-medium" data-testid="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
