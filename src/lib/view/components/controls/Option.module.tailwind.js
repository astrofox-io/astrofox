const styles = {
  "hidden": ["tw-6c211417-hidden", "[display:none]"].filter(Boolean).join(" "),
  "label": ["tw-8321f8ee-label", "[display:flex]", "[margin-left:20px]", "[cursor:default]", "[min-width:100px]"].filter(Boolean).join(" "),
  "labelWithReactor": ["tw-12246769-labelWithReactor", "[min-width:88px]"].filter(Boolean).join(" "),
  "linkIcon": ["tw-8718529f-linkIcon", "[color:var(--text500)]", "[width:12px]", "[height:12px]"].filter(Boolean).join(" "),
  "linkIconActive": ["tw-993e81bd-linkIconActive", "[color:var(--text100)]"].filter(Boolean).join(" "),
  "option": ["tw-a93eddec-option", "[display:flex]", "[flex-direction:row]", "[align-items:center]", "[padding:8px_0]", "[margin:0_10px]", "[position:relative]", "[font-size:var(--font-size-small)]", "[color:var(--text300)]", "[line-height:20px]", "[&_>_*]:[margin-right:8px]", "[&_>_*:last-child]:[margin-right:0]"].filter(Boolean).join(" "),
  "optionWithReactor": ["tw-c81df9f1-optionWithReactor", "[&_>_*]:[margin-right:6px]", "[&_>_*:last-child]:[margin-right:0]"].filter(Boolean).join(" "),
  "reactorIcon": ["tw-9bb03f50-reactorIcon", "[position:absolute]", "[margin-left:-5px]"].filter(Boolean).join(" "),
  "text": ["tw-542d683d-text", "[flex:1]", "[white-space:nowrap]", "[text-overflow:ellipsis]", "[overflow:hidden]", "[margin-right:8px]"].filter(Boolean).join(" "),
};

export default styles;
