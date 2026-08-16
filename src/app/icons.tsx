import type { LucideProps } from 'lucide-react';
import {
  ChevronDown,
  ChevronUp,
  Box as Cube,
  Repeat as Cycle,
  FileText as DocumentLandscape,
  Ellipsis as DotsHorizontal,
  Eye,
  Zap as Flash,
  FolderOpen,
  Focus as LayerFocus,
  Layers,
  Link,
  Pause,
  Image as Picture,
  Play as PlayBase,
  Plus,
  AudioLines as SoundBars,
  Waves as SoundWaves,
  Square as SquareBase,
  Sun,
  X as Times,
  Trash2 as TrashEmpty,
  Unlink,
  VectorSquare,
  Video,
  Volume2 as Volume,
  Volume1 as Volume2,
  Volume as Volume3,
  VolumeX as Volume4,
  TriangleAlert as Warning,
} from 'lucide-react';

export {
  ChevronDown,
  ChevronUp,
  Cube,
  Cycle,
  DocumentLandscape,
  DotsHorizontal,
  Eye,
  Flash,
  FolderOpen,
  LayerFocus,
  Layers,
  Link,
  Pause,
  Picture,
  Plus,
  SoundBars,
  SoundWaves,
  SquareBase as Square,
  Sun,
  Times,
  TrashEmpty,
  Unlink,
  VectorSquare,
  Video,
  Volume,
  Volume2,
  Volume3,
  Volume4,
  Warning,
};

export function Play(props: LucideProps) {
  return <PlayBase strokeWidth={2.4} {...props} />;
}

export function Stop(props: LucideProps) {
  return <SquareBase strokeWidth={2.4} {...props} />;
}
