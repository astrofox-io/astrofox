const styles = {
  "active": ["tw-c57408c3-active"].filter(Boolean).join(" "),
  "item": ["tw-f9c69d84-item", "[display:inline-block]", "[position:relative]"].filter(Boolean).join(" "),
  "text": ["tw-6a6720d6-text", "[line-height:40px]", "[padding:0_8px]", "[position:relative]", "[cursor:default]", "[&.tw-c57408c3-active]:[color:var(--primary300)]", "[&.tw-c57408c3-active]:[background-color:var(--gray50)]", "[&:hover]:[color:var(--primary300)]"].filter(Boolean).join(" "),
};

export default styles;
