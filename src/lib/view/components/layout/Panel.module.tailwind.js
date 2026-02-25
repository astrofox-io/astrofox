const styles = {
  "header": ["tw-dafd2270-header", "[display:flex]", "[height:30px]", "[line-height:30px]", "[flex-shrink:0]"].filter(Boolean).join(" "),
  "horizontal": ["tw-a43b0dcd-horizontal"].filter(Boolean).join(" "),
  "panel": ["tw-f6c9af5d-panel", "[display:flex]", "[position:relative]", "[&.tw-5d3df4bb-vertical]:[flex-direction:column]", "[&.tw-5d3df4bb-vertical]:[flex-shrink:0]", "[&.tw-a43b0dcd-horizontal]:[flex-direction:row]", "[&.tw-a43b0dcd-horizontal]:[flex-shrink:0]", "[&.tw-636a0c41-stretch]:[flex:1]", "[&.tw-636a0c41-stretch]:[min-height:0]", "[&.tw-636a0c41-stretch]:[min-width:0]", "[&.tw-636a0c41-stretch]:[overflow:hidden]"].filter(Boolean).join(" "),
  "stretch": ["tw-636a0c41-stretch"].filter(Boolean).join(" "),
  "title": ["tw-4d241088-title", "[font-size:var(--font-size-small)]", "[color:var(--text200)]", "[text-transform:uppercase]", "[margin-left:10px]", "[cursor:default]"].filter(Boolean).join(" "),
  "vertical": ["tw-5d3df4bb-vertical"].filter(Boolean).join(" "),
};

export default styles;
