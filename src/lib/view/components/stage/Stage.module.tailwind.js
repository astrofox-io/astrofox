const styles = {
  "canvas": ["tw-5bc6f837-canvas", "[position:relative]", "[display:flex]", "[flex-direction:column]", "[justify-content:center]", "[box-shadow:0_5px_20px_rgba(0,_0,_0,_0.5)]", "[margin:20px]", "[&_canvas]:[z-index:var(--z-index-canvas)]"].filter(Boolean).join(" "),
  "loadingOverlay": ["tw-312e0103-loadingOverlay", "[position:absolute]", "[inset:0]", "[z-index:var(--z-index-render-panel)]", "[display:flex]", "[align-items:center]", "[justify-content:center]", "[pointer-events:none]"].filter(Boolean).join(" "),
  "loadingSpinnerLeave": ["tw-b9e31cf0-loadingSpinnerLeave", "[animation:stage-loader-out_220ms_ease-in_forwards]"].filter(Boolean).join(" "),
  "loadingSpinnerWrap": ["tw-83bf0e34-loadingSpinnerWrap", "[animation:stage-loader-pop_220ms_ease-out]"].filter(Boolean).join(" "),
  "scroll": ["tw-e12a00c1-scroll", "[margin:auto]"].filter(Boolean).join(" "),
  "stage": ["tw-71c68cea-stage", "[display:flex]", "[flex-direction:column]", "[flex:1]", "[min-width:0]", "[min-height:0]", "[overflow:auto]", "[position:relative]"].filter(Boolean).join(" "),
};

export default styles;
