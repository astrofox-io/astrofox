const styles = {
  "active": ["tw-00f9c197-active"].filter(Boolean).join(" "),
  "content": ["tw-b86beccf-content", "[width:100%]", "[overflow:auto]", "[&_.tw-5f0c443a-hidden]:[display:none]"].filter(Boolean).join(" "),
  "hidden": ["tw-5f0c443a-hidden"].filter(Boolean).join(" "),
  "horizontal": ["tw-38109990-horizontal", "[display:flex]", "[flex-direction:row]"].filter(Boolean).join(" "),
  "panel": ["tw-3be99404-panel", "[display:flex]", "[flex:1]"].filter(Boolean).join(" "),
  "positionBottom": ["tw-eb79079c-positionBottom", "[flex-direction:column]", "[&_.tw-cef2a8bc-tabs]:[order:99]"].filter(Boolean).join(" "),
  "positionLeft": ["tw-9df2ddde-positionLeft", "[flex-direction:row]", "[&_.tw-cef2a8bc-tabs]:[width:160px]"].filter(Boolean).join(" "),
  "positionRight": ["tw-6e49325d-positionRight", "[flex-direction:row]", "[&_.tw-cef2a8bc-tabs]:[order:99]", "[&_.tw-cef2a8bc-tabs]:[width:160px]"].filter(Boolean).join(" "),
  "positionTop": ["tw-233efbe5-positionTop", "[flex-direction:column]"].filter(Boolean).join(" "),
  "tab": ["tw-fa076721-tab", "[text-align:center]", "[list-style:none]", "[padding:8px_16px]", "[cursor:default]", "[&.tw-00f9c197-active]:[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "tabs": ["tw-cef2a8bc-tabs", "[background-color:var(--gray75)]"].filter(Boolean).join(" "),
};

export default styles;
