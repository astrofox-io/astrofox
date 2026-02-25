import composedStyles1 from "./TextInput.module.tailwind";

const styles = {
  "active": ["tw-f3573e78-active"].filter(Boolean).join(" "),
  "hidden": ["tw-d8127b42-hidden"].filter(Boolean).join(" "),
  "input": ["tw-0ebd3a75-input", "[cursor:default]", composedStyles1.input].filter(Boolean).join(" "),
  "option": ["tw-1189dc46-option", "[color:var(--input-text-color)]", "[font-size:var(--font-size-small)]", "[line-height:24px]", "[padding:0_6px]", "[min-width:100px]", "[overflow:hidden]", "[text-overflow:ellipsis]", "[white-space:nowrap]", "[&:hover]:[cursor:default]", "[&:hover]:[color:var(--text100)]", "[&:hover]:[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "options": ["tw-e45faf9b-options", "[position:absolute]", "[top:100%]", "[z-index:var(--z-index-above)]", "[list-style:none]", "[background-color:var(--input-bg-color)]", "[overflow:hidden]", "[box-shadow:0_5px_10px_rgba(0,_0,_0,_0.5)]", "[&.tw-d8127b42-hidden]:[display:none]"].filter(Boolean).join(" "),
  "select": ["tw-cd08180d-select", "[display:inline-block]", "[position:relative]", "[&:after]:[content:'']", "[&:after]:[position:absolute]", "[&:after]:[transform:rotate(135deg)]", "[&:after]:[height:6px]", "[&:after]:[width:6px]", "[&:after]:[right:10px]", "[&:after]:[bottom:12px]", "[&:after]:[border-top:1px_solid_var(--input-text-color)]", "[&:after]:[border-right:1px_solid_var(--input-text-color)]", "[&:after]:[pointer-events:none]", "[&_.tw-0ebd3a75-input.tw-f3573e78-active]:[border-color:var(--primary100)]"].filter(Boolean).join(" "),
  "separator": ["tw-b0d998ea-separator", "[position:relative]", "[height:10px]", "[&:after]:[content:'']", "[&:after]:[display:block]", "[&:after]:[position:absolute]", "[&:after]:[top:0]", "[&:after]:[left:6px]", "[&:after]:[right:6px]", "[&:after]:[bottom:0]", "[&:after]:[margin:auto]", "[&:after]:[height:1px]", "[&:after]:[background-color:var(--primary100)]", "[&:hover]:[background-color:transparent]"].filter(Boolean).join(" "),
};

export default styles;
