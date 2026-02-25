const styles = {
  "active": ["tw-360af517-active", "[color:var(--text100)]", "[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "button": ["tw-458a112e-button", "[width:38px]", "[height:38px]", "[border:0]", "[padding:0]", "[border-radius:8px]", "[background-color:transparent]", "[color:var(--text300)]", "[display:inline-flex]", "[align-items:center]", "[justify-content:center]", "[cursor:default]", "[&:hover]:[color:var(--text100)]", "[&:hover]:[background-color:var(--gray100)]"].filter(Boolean).join(" "),
  "group": ["tw-0f7b8e05-group", "[position:relative]", "[display:flex]", "[justify-content:center]"].filter(Boolean).join(" "),
  "menu": ["tw-e1be7991-menu", "[top:0]", "[left:calc(100%_+_8px)]", "[min-width:180px]", "[border:1px_solid_var(--gray300)]"].filter(Boolean).join(" "),
  "sidebar": ["tw-b48a12ea-sidebar", "[display:flex]", "[flex-direction:column]", "[width:52px]", "[flex-shrink:0]", "[padding:8px_6px]", "[gap:6px]", "[background-color:var(--gray75)]", "[border-right:1px_solid_var(--gray300)]"].filter(Boolean).join(" "),
};

export default styles;
