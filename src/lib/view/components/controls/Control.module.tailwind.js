const styles = {
  "control": ["tw-5a32684c-control", "[padding-bottom:8px]"].filter(Boolean).join(" "),
  "displayName": ["tw-7078fe3c-displayName", "[color:var(--text200)]", "[overflow:hidden]", "[text-overflow:ellipsis]", "[white-space:nowrap]", "[min-width:0]", "[max-width:100px]"].filter(Boolean).join(" "),
  "header": ["tw-05227319-header", "[position:relative]", "[padding:0_10px]", "[height:30px]", "[cursor:default]"].filter(Boolean).join(" "),
  "label": ["tw-39733d26-label", "[position:relative]", "[text-transform:uppercase]", "[padding-right:20px]", "[&:after]:[content:'\\2022']", "[&:after]:[position:absolute]", "[&:after]:[right:7px]", "[&:after]:[color:var(--text300)]"].filter(Boolean).join(" "),
  "title": ["tw-a5bd51e7-title", "[display:flex]", "[justify-content:center]", "[font-size:var(--font-size-xsmall)]", "[color:var(--text100)]", "[line-height:30px]", "[overflow:hidden]"].filter(Boolean).join(" "),
};

export default styles;
