const styles = {
  "child": ["tw-2f5891f6-child", "[padding-left:20px]"].filter(Boolean).join(" "),
  "children": ["tw-d871f97a-children", "[display:flex]", "[flex-direction:column]"].filter(Boolean).join(" "),
  "contaainer": ["tw-068afe4f-contaainer", "[display:flex]", "[flex-direction:column]", "[&:first-child]:[border-top:1px_solid_var(--gray75)]"].filter(Boolean).join(" "),
  "hidden": ["tw-3f8b512a-hidden", "[display:none]"].filter(Boolean).join(" "),
};

export default styles;
