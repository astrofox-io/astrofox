declare module 'fourier-transform' {
  function ft(input: Float32Array | number[]): Float64Array;
  export = ft;
}

declare module 'window-function/blackman' {
  function blackman(i: number, N: number): number;
  export = blackman;
}

declare module 'mime' {
  const mime: {
    getType(path: string): string | null;
    getExtension(type: string): string | null;
  };
  export = mime;
}
