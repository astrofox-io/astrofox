const styles = {
  "checkbox": ["tw-89a4c9fb-checkbox", "[display:flex]", "[align-items:center]"].filter(Boolean).join(" "),
  "checked": ["tw-4a0ae3b8-checked"].filter(Boolean).join(" "),
  "input": ["tw-a40213f7-input", "[order:1]", "[position:relative]", "[width:16px]", "[height:16px]", "[line-height:16px]", "[background-color:var(--input-bg-color)]", "[border:1px_solid_var(--input-border-color)]", "[border-radius:var(--input-border-radius)]", "[overflow:hidden]", "[&:before]:[content:'']", "[&:before]:[position:absolute]", "[&:before]:[width:16px]", "[&:before]:[height:16px]", "[&:before]:[line-height:16px]", "[&:before]:[color:var(--text100)]", "[&:before]:[background-color:var(--input-bg-color)]", "[&:before]:[font-size:var(--font-size-xsmall)]", "[&:before]:[text-align:center]", "[&:before]:[transform:scale(0.5)]", "[&:before]:[transition:all_0.3s]", "[&.tw-4a0ae3b8-checked:before]:[content:'\\2713']", "[&.tw-4a0ae3b8-checked:before]:[background-color:var(--primary400)]", "[&.tw-4a0ae3b8-checked:before]:[transform:scale(1)]"].filter(Boolean).join(" "),
  "label": ["tw-cf99cb1d-label", "[display:inline-block]"].filter(Boolean).join(" "),
  "left": ["tw-5106f89e-left", "[order:0]", "[margin-right:8px]"].filter(Boolean).join(" "),
  "right": ["tw-42385280-right", "[order:2]", "[margin-left:8px]"].filter(Boolean).join(" "),
};

export default styles;
