const styles = {
  "controls": ["tw-c4ed2e82-controls", "[display:flex]", "[align-items:center]", "[gap:0]", "[margin-left:6px]"].filter(Boolean).join(" "),
  "focused": ["tw-902b606f-focused"].filter(Boolean).join(" "),
  "icon": ["tw-2171646f-icon", "[width:28px]", "[height:28px]"].filter(Boolean).join(" "),
  "menu": ["tw-738601c2-menu", "[top:calc(100%_+_6px)]", "[left:0]", "[min-width:190px]", "[border:1px_solid_var(--gray300)]"].filter(Boolean).join(" "),
  "menuButton": ["tw-61b2fbff-menuButton", "[width:28px]", "[height:28px]", "[border:0]", "[padding:0]", "[border-radius:6px]", "[background-color:transparent]", "[color:var(--text300)]", "[display:inline-flex]", "[align-items:center]", "[justify-content:center]", "[&:hover]:[color:var(--text100)]", "[&:hover]:[background-color:var(--gray100)]"].filter(Boolean).join(" "),
  "menuButtonActive": ["tw-38a694d9-menuButtonActive", "[color:var(--text100)]", "[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "menuWrap": ["tw-15e9262b-menuWrap", "[position:relative]"].filter(Boolean).join(" "),
  "rightIcon": ["tw-eec9a5c6-rightIcon", "[position:absolute]", "[top:6px]", "[right:8px]", "[width:28px]", "[height:28px]"].filter(Boolean).join(" "),
  "title": ["tw-5f44a69d-title", "[position:absolute]", "[left:50%]", "[transform:translateX(-50%)]", "[font-size:var(--font-size-normal)]", "[color:var(--text400)]", "[line-height:40px]", "[letter-spacing:5px]", "[text-transform:uppercase]", "[cursor:default]", "max-[700px]:[display:none]"].filter(Boolean).join(" "),
  "titlebar": ["tw-09347610-titlebar", "[display:flex]", "[align-items:center]", "[position:relative]", "[height:40px]", "[background-color:var(--gray75)]", "[border-bottom:1px_solid_var(--gray300)]", "[&.tw-902b606f-focused_.tw-5f44a69d-title]:[color:var(--text300)]"].filter(Boolean).join(" "),
};

export default styles;
