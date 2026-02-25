const styles = {
  "checked": ["tw-ac69a559-checked", "[&:before]:[content:'\\2713']", "[&:before]:[color:var(--text100)]", "[&:before]:[position:absolute]", "[&:before]:[top:5px]", "[&:before]:[left:5px]", "[&:hover:before]:[color:var(--text100)]"].filter(Boolean).join(" "),
  "disabled": ["tw-0a3a3d09-disabled", "[color:var(--text300)]", "[&:hover]:[color:var(--text300)]", "[&:hover]:[background-color:transparent]"].filter(Boolean).join(" "),
  "item": ["tw-edad1ec7-item", "[position:relative]", "[display:block]", "[font-size:var(--font-size-small)]", "[padding:5px_5px_5px_20px]", "[min-width:140px]", "[&:hover]:[color:var(--text100)]", "[&:hover]:[background-color:var(--primary100)]", "[&:hover]:[cursor:default]"].filter(Boolean).join(" "),
};

export default styles;
