const styles = {
  "center": ["tw-e8aef3c4-center", "[text-align:center]", "[flex:1]", "[width:34%]", "[&_.tw-bde37702-item]:[margin:0_10px]"].filter(Boolean).join(" "),
  "item": ["tw-bde37702-item", "[display:inline-block]", "[line-height:28px]"].filter(Boolean).join(" "),
  "itemButton": ["tw-bfefdb6e-itemButton", "[padding:0_8px]", "[&:hover]:[background-color:var(--primary200)]"].filter(Boolean).join(" "),
  "left": ["tw-4cbe1d32-left", "[text-align:left]", "[width:33%]", "[&_.tw-bde37702-item]:[margin-right:20px]"].filter(Boolean).join(" "),
  "right": ["tw-539879a6-right", "[text-align:right]", "[width:33%]", "[&_.tw-bde37702-item]:[margin-left:20px]"].filter(Boolean).join(" "),
  "statusBar": ["tw-28aa0bff-statusBar", "[display:flex]", "[color:var(--text100)]", "[background-color:var(--primary100)]", "[font-size:11px]", "[padding:0_20px]", "[cursor:default]", "[white-space:nowrap]", "[z-index:var(--z-index-above)]"].filter(Boolean).join(" "),
};

export default styles;
