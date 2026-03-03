import mime from "mime";

export function blobToDataUrl(blob: Blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			resolve(e.target?.result);
		};

		reader.onerror = (e) => {
			reject(e.target?.error);
		};

		reader.readAsDataURL(blob);
	});
}

export function blobToArrayBuffer(blob: Blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			resolve(e.target?.result);
		};

		reader.onerror = (e) => {
			reject(e.target?.error);
		};

		return reader.readAsArrayBuffer(blob);
	});
}

export async function dataToBlob(data: ArrayBuffer | Uint8Array, ext: string) {
	return new Blob([new Uint8Array(data).buffer], {
		type: mime.getType(ext) ?? undefined,
	});
}

export function base64ToBytes(base64: string) {
	const str = atob(base64);
	const len = str.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = str.charCodeAt(i);
	}
	return bytes;
}
