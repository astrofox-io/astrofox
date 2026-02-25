const styles = {
  "body": ["tw-5da72af7-body", "[position:relative]", "[min-height:100px]", "[background-color:var(--gray100)]", "[display:flex]", "[flex-direction:column]"].filter(Boolean).join(" "),
  "buttons": ["tw-18e85c67-buttons", "[background-color:var(--gray300)]", "[text-align:center]", "[padding:10px]"].filter(Boolean).join(" "),
  "closeButton": ["tw-0b3bada2-closeButton", "[position:absolute]", "[top:0]", "[right:0]", "[height:24px]", "[width:24px]", "[text-align:center]", "[z-index:var(--z-index-above)]", "[&_.tw-036fc8b6-closeIcon]:[color:var(--text100)]", "[&_.tw-036fc8b6-closeIcon]:[width:14px]", "[&_.tw-036fc8b6-closeIcon]:[height:14px]", "[&_.tw-036fc8b6-closeIcon]:[margin-top:5px]", "[&:hover]:[background-color:var(--primary100)]"].filter(Boolean).join(" "),
  "closeIcon": ["tw-036fc8b6-closeIcon"].filter(Boolean).join(" "),
  "container": ["tw-ee8b92fe-container", "[position:absolute]", "[width:100%]", "[height:100%]", "[display:flex]"].filter(Boolean).join(" "),
  "header": ["tw-fa5473e6-header", "[position:relative]", "[background-color:var(--gray200)]", "[line-height:36px]", "[text-align:center]", "[text-transform:uppercase]", "[letter-spacing:2px]", "[cursor:default]"].filter(Boolean).join(" "),
  "modal": ["tw-51502c94-modal", "[position:relative]", "[margin:auto]", "[min-width:400px]", "[display:flex]", "[flex-direction:column]", "[box-shadow:5px_5px_40px_rgba(0,_0,_0,_0.5)]"].filter(Boolean).join(" "),
};

export default styles;
