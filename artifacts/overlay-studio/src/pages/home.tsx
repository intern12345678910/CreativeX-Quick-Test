import { useEditorStore } from '@/store/useEditorStore';
import DropZone from '@/components/DropZone';
import Toolbar from '@/components/Toolbar';
import Canvas from '@/components/Canvas';
import LayersPanel from '@/components/LayersPanel';
import PropertiesPanel from '@/components/PropertiesPanel';

export default function Home() {
  const baseMedia = useEditorStore((state) => state.baseMedia);

  if (!baseMedia) {
    return <DropZone />;
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden dark">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Canvas />
        <LayersPanel />
        <PropertiesPanel />
      </div>
    </div>
  );
}
