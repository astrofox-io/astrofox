/**
 * Example worker-runtime display plugin. Runs inside Astrofox's plugin
 * sandbox worker: no DOM, no app internals — just the factory contract.
 * All animation derives from frame.time/frame.delta so video export is
 * deterministic.
 */
export default function createPlugin({ properties }) {
  let props = { ...properties };
  let canvas = null;
  let ctx = null;
  let peaks = null;

  function resizeIfNeeded() {
    const width = Math.max(16, Math.round(Number(props.width) || 800));
    const height = Math.max(16, Math.round(Number(props.height) || 300));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  return {
    init({ canvas: c }) {
      canvas = c;
      ctx = canvas.getContext('2d');
    },

    update(properties) {
      props = { ...props, ...properties };
    },

    render(frame) {
      const fft = frame.fft || new Float32Array(32);
      const bins = fft.length;

      resizeIfNeeded();

      if (!peaks || peaks.length !== bins) {
        peaks = new Float32Array(bins);
      }

      const { width, height } = canvas;
      const gravity = Number(props.gravity) || 1.5;
      const barWidth = width / bins;
      const dt = (frame.delta || 16.7) / 1000;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bins; i += 1) {
        const value = fft[i];

        // Peaks fall with gravity and get pushed back up by the signal.
        peaks[i] = Math.max(value, peaks[i] - gravity * dt);

        const barHeight = value * height;
        const peakY = height - peaks[i] * height;

        ctx.fillStyle = String(props.barColor || '#66ffcc');
        ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight);

        ctx.fillStyle = String(props.peakColor || '#ffffff');
        ctx.fillRect(i * barWidth + 1, peakY - 2, barWidth - 2, 2);
      }

      return { width, height };
    },

    dispose() {},
  };
}
