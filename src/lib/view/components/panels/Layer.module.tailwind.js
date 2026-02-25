const styles = {
  "active": ["tw-2588f2b6-active", "[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "disabled": ["tw-f5e7c8e1-disabled"].filter(Boolean).join(" "),
  "edit": ["tw-0638b095-edit", "[background-color:var(--gray100)]"].filter(Boolean).join(" "),
  "enableIcon": ["tw-d62d3662-enableIcon", "[width:13px]", "[height:13px]", "[&.tw-f5e7c8e1-disabled]:[opacity:0.3]"].filter(Boolean).join(" "),
  "icon": ["tw-65403023-icon", "[width:12px]", "[height:12px]"].filter(Boolean).join(" "),
  "input": ["tw-a48ead70-input", "[white-space:nowrap]", "[overflow:hidden]", "[text-overflow:ellipsis]", "[min-width:0]", "[margin-right:24px]"].filter(Boolean).join(" "),
  "layer": ["tw-bf522725-layer", "[display:flex]", "[flex-direction:row]", "[font-size:var(--font-size-small)]", "[color:var(--text100)]", "[background-color:var(--gray200)]", "[border-bottom:1px_solid_var(--gray75)]", "[padding:5px]", "[margin:0_5px]", "[position:relative]", "[cursor:default]", "[&_>_*]:[margin-right:8px]", "[&_>_*:last-child]:[margin-right:0]", "[&:after]:[content:'\\00a0']"].filter(Boolean).join(" "),
  "text": ["tw-3a5047a5-text", "[flex:1]"].filter(Boolean).join(" "),
};

export default styles;
