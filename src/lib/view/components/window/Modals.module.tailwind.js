const styles = {
  "container": ["tw-4a27805e-container", "[position:absolute]", "[width:100%]", "[height:100%]", "[display:flex]", "[flex-direction:column]", "[justify-content:center]", "[align-items:center]", "[z-index:var(--z-index-modal-overlay)]", "[perspective:800px]"].filter(Boolean).join(" "),
  "hidden": ["tw-76ef2a60-hidden", "[display:none]"].filter(Boolean).join(" "),
  "modal": ["tw-b858690c-modal", "[display:flex]", "[transform-style:preserve-3d]", "[z-index:var(--z-index-modal-window)]"].filter(Boolean).join(" "),
};

export default styles;
