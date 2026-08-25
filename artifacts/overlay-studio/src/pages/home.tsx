import { useEditorStore } from '@/store/useEditorStore';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
import { ArrowUpRight, FileImage, Film, Grid3X3, Upload, WandSparkles } from 'lucide-react';
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
      'video/quicktime': ['.mov'],
      'video/mov': ['.mov'],
    },
    maxFiles: 1,
  });

  return (
    <div className="studio-grain min-h-[100dvh] w-full overflow-hidden bg-[#f1eee7] text-[#1b2a2d]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex items-center justify-between studio-reveal">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#1b2a2d] text-[#f1eee7] shadow-[0_5px_16px_rgba(27,42,45,.15)]">
              <Grid3X3 className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1b2a2d]">Overlay Studio</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#718080]">Social production utility</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#718080] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d66050]" />
            Local workspace
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-20 lg:py-16">
          <section className="studio-reveal max-w-2xl" style={{ animationDelay: '90ms' }}>
            <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b04f43]">
              <WandSparkles className="h-3.5 w-3.5" /> Position before publish
            </p>
            <h1 className="max-w-xl text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[.92] tracking-[-0.07em] text-[#1b2a2d]">
              Make space<br /><span className="text-[#b04f43]">for the story.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-[#607073] sm:text-lg">
              A quick way to check CreativeX Clear Presence and Safezones
            </p>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-3 border-t border-[#d6d1c7] pt-5 text-[11px] leading-5 text-[#718080]">
              <div><span className="font-mono text-[#1b2a2d]">01</span><br />Choose a guide</div>
              <div><span className="font-mono text-[#1b2a2d]">02</span><br />Export a clean PNG</div>
            </div>
          </section>

          <section className="studio-reveal" style={{ animationDelay: '180ms' }}>
            <div
              {...getRootProps()}
              data-testid="dropzone-area"
              className={`group relative overflow-hidden rounded-[22px] border bg-[#ebe7de] p-5 shadow-[0_24px_65px_rgba(43,53,49,.11)] transition-all duration-300 sm:p-7 ${
                isDragActive ? 'border-[#b04f43] bg-[#e7ddd5]' : 'border-[#d6d1c7] hover:-translate-y-1 hover:border-[#b04f43]/60'
              }`}
            >
              <input {...getInputProps()} data-testid="file-input" />
              <div className="flex min-h-[310px] flex-col justify-between rounded-[15px] border border-dashed border-[#b9b8ac] bg-[#f3f0e9]/70 p-6 sm:min-h-[365px] sm:p-8">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#879090]">Input / 001</span>
                  <div className="flex gap-1.5 text-[#a1a49d]">
                    <FileImage className="h-4 w-4" />
                    <Film className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className={`upload-orbit mb-6 flex h-16 w-16 items-center justify-center rounded-[18px] transition-colors ${isDragActive ? 'bg-[#b04f43] text-[#f8f4eb]' : 'bg-[#1b2a2d] text-[#f1eee7] group-hover:bg-[#b04f43]'}`}>
                    <Upload className="h-7 w-7" strokeWidth={1.7} />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1b2a2d]">
                    {isDragActive ? 'Release to load' : 'Bring in a frame'}
                  </h2>
                  <p className="mt-2 max-w-[270px] text-sm leading-6 text-[#718080]">
                    Drop an image or video here, or browse your local files.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1b2a2d] px-4 py-2.5 text-xs font-semibold text-[#f1eee7] transition-colors group-hover:bg-[#b04f43]">
                    Browse files <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#92978f]">JPG · PNG · GIF · WebP · MP4 · WebM · MOV</p>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-[#879090]">Files stay in your browser. Nothing is uploaded.</p>
          </section>
        </main>

        <footer className="flex items-center justify-between border-t border-[#d6d1c7] pt-4 text-[10px] uppercase tracking-[0.16em] text-[#879090]">
          <span className="font-mono">v1.0 / 24 FPS</span>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const baseMedia = useEditorStore((s) => s.baseMedia);

  if (!baseMedia) return <DropZone />;

  return (
    <div className="studio-grain flex h-[100dvh] w-full flex-col overflow-hidden bg-[#162326] text-[#e8e4d9]">
      <header className="flex h-[58px] flex-shrink-0 items-center justify-between border-b border-white/[.08] bg-[#1b2a2d] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#d66050] text-[#f8f4eb]">
            <Grid3X3 className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#eee9dd]">Overlay Studio</p>
            <p className="hidden text-[10px] text-[#92a09d] sm:block">Composition workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#82908d]">
          <span className="hidden sm:inline">Local only</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#8da998]" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <Canvas />
        <OverlayPanel />
      </div>
    </div>
  );
}
