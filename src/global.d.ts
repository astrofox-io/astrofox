interface Window {
	_astrofox: unknown;
	showOpenFilePicker?: (options?: {
		types?: Array<{ description: string; accept: Record<string, string[]> }>;
		multiple?: boolean;
	}) => Promise<FileSystemFileHandle[]>;
	showSaveFilePicker?: (options?: {
		suggestedName?: string;
		types?: Array<{ description: string; accept: Record<string, string[]> }>;
	}) => Promise<FileSystemFileHandle>;
}

declare module "jsmediatags/dist/jsmediatags.min.js" {
	const jsmediatags: {
		read(
			file: File | Blob | string,
			callbacks: {
				onSuccess: (result: { tags: Record<string, unknown> | null }) => void;
				onError: (error: unknown) => void;
			},
		): void;
	};
	export default jsmediatags;
}
