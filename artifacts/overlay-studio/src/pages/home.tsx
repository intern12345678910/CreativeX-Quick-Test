import { useEditorStore } from '@/store/useEditorStore';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import Canvas from '@/components/Canvas';
import OverlayPanel from '@/components/OverlayPanel';
import { BaseMedia } from '@/types';

function DropZone() {
  const setBaseMedia = useEditorStore((s) => s.setBaseMedia);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      const src = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        const vid = document.createElement('video');
        vid.src = src;
        vid.onloadedmetadata = () => {
          const media: BaseMedia = {
            type: 'video',
            src,
            naturalWidth: vid.videoWidth,
            naturalHeight: vid.videoHeight,
          };
          setBaseMedia(media);
        };
      } else {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const media: BaseMedia = {
            type: 'image',
            src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          };
          setBaseMedia(media);
        };
      }
    },
    [setBaseMedia],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
      'video/mp4': [],
      'video/webm': [],
    },
    maxFiles: 1,
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] p-8">
      {/* Logo */}
      <div className="mb-10 text-center">
        <p className="text-xs tracking-[0.3em] text-white/25 uppercase font-medium">
          Overlay Studio
        </p>
      </div>

      <div
        {...getRootProps()}
        data-testid="dropzone-area"
        className={`
          relative w-full max-w-2xl rounded-xl border-2 border-dashed p-20 cursor-pointer
          flex flex-col items-center gap-6 text-center transition-all duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/5'
              : 'border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.04]'
          }
        `}
      >
        <input {...getInputProps()} data-testid="file-input" />

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragActive ? 'bg-blue-500/20' : 'bg-white/6'
          }`}
        >
          <Upload
            className={`w-7 h-7 transition-colors ${
              isDragActive ? 'text-blue-400' : 'text-white/30'
            }`}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white/80">
            {isDragActive ? 'Drop to load' : 'Drop an image or video'}
          </h2>
          <p className="text-sm text-white/30">
            JPG, PNG, GIF, WebP, MP4, WebM
          </p>
        </div>

        {!isDragActive && (
          <span className="px-4 py-1.5 rounded-full border border-white/10 text-xs text-white/30 hover:text-white/50 hover:border-white/20 transition-colors">
            Browse files
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const baseMedia = useEditorStore((s) => s.baseMedia);

  if (!baseMedia) return <DropZone />;

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Top bar */}
      <header className="h-11 flex-shrink-0 flex items-center px-4 border-b border-white/8 bg-[#111113]">
        <span className="text-xs tracking-[0.25em] text-white/30 uppercase font-medium">
          Overlay Studio
        </span>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        <OverlayPanel />
      </div>
    </div>
  );
}
