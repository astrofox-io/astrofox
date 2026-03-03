import type { LucideProps } from "lucide-react";
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
	Link,
	Unlink,
	Pause,
	Image as Picture,
	Play as PlayBase,
	Plus,
	Sun,
	AudioLines as SoundBars,
	Waves as SoundWaves,
	Square as StopBase,
	X as Times,
	Trash2 as TrashEmpty,
	Volume2 as Volume,
	Volume1 as Volume2,
	Volume as Volume3,
	VolumeX as Volume4,
	TriangleAlert as Warning,
} from "lucide-react";

export {
	ChevronDown,
	ChevronUp,
	Cube,
	Cycle,
	DocumentLandscape,
	DotsHorizontal,
	Eye,
	FolderOpen,
	Flash,
	Link,
	Unlink,
	Pause,
	Picture,
	Plus,
	Sun,
	SoundBars,
	SoundWaves,
	Times,
	TrashEmpty,
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
	return <StopBase strokeWidth={2.4} {...props} />;
}
