const styles = {
  "closeIcon": ["tw-e807c8e0-closeIcon", "[position:absolute]", "[top:10px]", "[right:20px]", "[color:var(--text200)]", "[width:14px]", "[height:14px]", "[&:hover]:[color:var(--text100)]"].filter(Boolean).join(" "),
  "control": ["tw-7d7d812b-control", "[background-color:transparent]", "[border:0]", "[margin:0]"].filter(Boolean).join(" "),
  "controls": ["tw-ba4bb449-controls", "[min-width:300px]", "[margin:10px_10px_0_0]"].filter(Boolean).join(" "),
  "display": ["tw-83fb3c76-display", "[display:flex]", "[flex-direction:row]", "[justify-content:center]", "[align-items:center]"].filter(Boolean).join(" "),
  "header": ["tw-09e527ad-header", "[color:var(--text200)]", "[font-size:var(--font-size-xsmall)]", "[text-shadow:1px_1px_0_var(--gray75)]", "[&_.tw-97873d62-node]:[text-transform:uppercase]", "[&_.tw-97873d62-node]:[cursor:default]", "[&_.tw-97873d62-node:after]:[content:'\\2022']", "[&_.tw-97873d62-node:after]:[color:var(--primary100)]", "[&_.tw-97873d62-node:after]:[margin:8px]", "[&_.tw-97873d62-node:last-child:after]:[content:none]"].filter(Boolean).join(" "),
  "hidden": ["tw-0af5689a-hidden", "[display:none]"].filter(Boolean).join(" "),
  "label": ["tw-0cad4d87-label", "[color:var(--text200)]", "[margin-left:0]"].filter(Boolean).join(" "),
  "node": ["tw-97873d62-node"].filter(Boolean).join(" "),
  "option": ["tw-f1fa3540-option", "[margin:0]", "[&:after]:[content:none]"].filter(Boolean).join(" "),
  "output": ["tw-2aa80d61-output", "[margin-left:10px]", "[box-shadow:inset_0_0_20px_rgba(0,_0,_0,_0.5)]", "[border:1px_solid_var(--gray200)]"].filter(Boolean).join(" "),
  "reactor": ["tw-0689a1fc-reactor", "[width:100%]", "[min-width:910px]", "[overflow:hidden]", "[background-color:var(--gray75)]", "[border-top:1px_solid_var(--gray200)]", "[position:relative]", "[padding:10px_20px_15px]"].filter(Boolean).join(" "),
  "spectrum": ["tw-45ebe370-spectrum", "[position:relative]", "[background-color:var(--gray75)]", "[box-shadow:inset_0_0_60px_rgba(0,_0,_0,_0.5)]", "[border:1px_solid_var(--gray200)]"].filter(Boolean).join(" "),
};

export default styles;
