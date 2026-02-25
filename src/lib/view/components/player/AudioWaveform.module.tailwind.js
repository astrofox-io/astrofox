const styles = {
  "canvas": ["tw-2d3a2400-canvas", "[margin:20px_auto]", "[display:block]"].filter(Boolean).join(" "),
  "hidden": ["tw-899edf06-hidden", "[max-height:0]", "[transition:max-height_0.2s_ease-in]"].filter(Boolean).join(" "),
  "waveform": ["tw-b18070a9-waveform", "[min-width:900px]", "[position:relative]", "[background-color:var(--gray75)]", "[border-top:1px_solid_var(--gray200)]", "[box-shadow:inset_0_0_40px_rgba(0,_0,_0,_0.5)]", "[max-height:200px]", "[transition:max-height_0.2s_ease-out]", "[overflow:hidden]"].filter(Boolean).join(" "),
};

export default styles;
