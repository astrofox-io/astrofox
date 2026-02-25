const styles = {
  "icon": ["tw-2dd92a91-icon"].filter(Boolean).join(" "),
  "mute": ["tw-b05e5483-mute", "[&_.tw-2dd92a91-icon]:[color:var(--text300)]"].filter(Boolean).join(" "),
  "slider": ["tw-7f904ada-slider", "[display:flex]", "[align-items:center]", "[width:100px]"].filter(Boolean).join(" "),
  "speaker": ["tw-74f5c0ea-speaker", "[margin-right:10px]", "[&_.tw-2dd92a91-icon]:[color:var(--text100)]", "[&_.tw-2dd92a91-icon]:[width:20px]", "[&_.tw-2dd92a91-icon]:[height:20px]"].filter(Boolean).join(" "),
  "volume": ["tw-9e2966be-volume", "[display:flex]"].filter(Boolean).join(" "),
};

export default styles;
