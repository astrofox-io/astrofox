const styles = {
  "grip": ["tw-39c13e2d-grip", "[color:var(--text200)]", "[width:12px]", "[height:12px]"].filter(Boolean).join(" "),
  "horizontal": ["tw-1872fd68-horizontal"].filter(Boolean).join(" "),
  "splitter": ["tw-a3257fad-splitter", "[background-color:var(--gray75)]", "[text-align:center]", "[position:relative]", "[&.tw-1872fd68-horizontal]:[height:5px]", "[&.tw-1872fd68-horizontal]:[width:100%]", "[&.tw-1872fd68-horizontal]:[cursor:ns-resize]", "[&.tw-1872fd68-horizontal_>_.tw-39c13e2d-grip]:[display:block]", "[&.tw-1872fd68-horizontal_>_.tw-39c13e2d-grip]:[position:absolute]", "[&.tw-1872fd68-horizontal_>_.tw-39c13e2d-grip]:[margin:0_auto]", "[&.tw-1872fd68-horizontal_>_.tw-39c13e2d-grip]:[top:-4px]", "[&.tw-1872fd68-horizontal_>_.tw-39c13e2d-grip]:[left:0]", "[&.tw-1872fd68-horizontal_>_.tw-39c13e2d-grip]:[right:0]", "[&.tw-42a72860-vertical]:[width:5px]", "[&.tw-42a72860-vertical]:[height:100%]", "[&.tw-42a72860-vertical]:[cursor:ew-resize]"].filter(Boolean).join(" "),
  "vertical": ["tw-42a72860-vertical"].filter(Boolean).join(" "),
};

export default styles;
