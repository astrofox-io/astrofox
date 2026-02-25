const styles = {
  "hidden": ["tw-827a1f42-hidden", "[display:none]"].filter(Boolean).join(" "),
  "menu": ["tw-2db4abd2-menu", "[position:absolute]", "[top:100%]", "[left:0]", "[list-style:none]", "[background-color:var(--gray100)]", "[box-shadow:0_5px_10px_rgba(0,_0,_0,_0.5)]", "[overflow:hidden]", "[z-index:var(--z-index-menu)]"].filter(Boolean).join(" "),
  "separator": ["tw-972edb13-separator", "[padding:5px]", "[&:after]:[content:'']", "[&:after]:[border-top:1px_solid_var(--primary100)]", "[&:after]:[display:block]", "[&:hover]:[background-color:transparent]"].filter(Boolean).join(" "),
};

export default styles;
