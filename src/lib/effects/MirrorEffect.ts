import Effect from "@/lib/core/Effect";

const mirrorOptions = [
	{ label: "Left \u{1F816} Right", value: 0 },
	{ label: "Right \u{1F816} Left", value: 1 },
	{ label: "Top \u{1F816} Bottom", value: 2 },
	{ label: "Bottom \u{1F816} Top", value: 3 },
];

export default class MirrorEffect extends Effect {
	[key: string]: any;
	static config = {
		name: "MirrorEffect",
		description: "Mirror effect.",
		type: "effect",
		label: "Mirror",
		defaultProperties: {
			side: 0,
		},
		controls: {
			side: {
				label: "Side",
				type: "select",
				items: mirrorOptions,
			},
		},
	};

	constructor(properties) {
		super(MirrorEffect, properties);
	}
}
