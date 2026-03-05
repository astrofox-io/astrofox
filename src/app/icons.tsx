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
	Pause,
	Image as Picture,
	Play as PlayBase,
	Plus,
	AudioLines as SoundBars,
	Square as SquareBase,
	Waves as SoundWaves,
	Sun,
	X as Times,
	Trash2 as TrashEmpty,
	Unlink,
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
	SquareBase as Square,
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
	return <SquareBase strokeWidth={2.4} {...props} />;
}
