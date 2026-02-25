const styles = {
  "header": ["tw-a94f4859-header", "[font-size:var(--font-size-small)]", "[color:var(--text200)]", "[text-transform:uppercase]", "[letter-spacing:1px]", "[margin-bottom:8px]", "[padding:6px_8px]"].filter(Boolean).join(" "),
  "item": ["tw-8deea4a1-item", "[background:transparent]", "[border:0]", "[color:var(--text100)]", "[text-align:left]", "[font-size:var(--font-size-normal)]", "[padding:8px]", "[cursor:default]", "[&:hover]:[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "section": ["tw-5325e748-section", "[display:flex]", "[flex-direction:column]", "[gap:4px]", "[margin-top:8px]", "[padding-top:8px]", "[border-top:1px_solid_var(--gray300)]", "[&:first-of-type]:[margin-top:0]", "[&:first-of-type]:[padding-top:0]", "[&:first-of-type]:[border-top:0]"].filter(Boolean).join(" "),
  "sidebar": ["tw-e033fa11-sidebar", "[display:flex]", "[flex-direction:column]", "[width:180px]", "[flex-shrink:0]", "[background-color:var(--gray75)]", "[border-right:1px_solid_var(--gray300)]", "[padding:8px]", "[overflow:auto]"].filter(Boolean).join(" "),
};

export default styles;
