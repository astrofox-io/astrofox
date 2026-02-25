const styles = {
  "active": ["tw-57dacef2-active", "[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "button": ["tw-56d46558-button", "[color:var(--text100)]", "[background-color:var(--input-bg-color)]", "[min-height:24px]", "[min-width:24px]", "[text-align:center]", "[border-radius:2px]", "[display:inline-flex]", "[justify-content:center]", "[align-items:center]", "[cursor:default]", "[flex-shrink:0]", "[&:hover]:[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "disabled": ["tw-8cd2874d-disabled", "[&_svg]:[color:var(--gray500)]", "[&:hover]:[background-color:var(--input-bg-color)]"].filter(Boolean).join(" "),
  "icon": ["tw-76de5f99-icon", "[color:var(--text100)]", "[width:12px]", "[height:12px]"].filter(Boolean).join(" "),
  "input": ["tw-b73a128f-input", "[margin:0_5px]"].filter(Boolean).join(" "),
  "text": ["tw-117b5b1c-text", "[font-size:var(--font-size-small)]"].filter(Boolean).join(" "),
};

export default styles;
