const FONT_FAMILY_BY_NAME = {
	Abel: "var(--font-abel), sans-serif",
	"Abril Fatface": "var(--font-abril-fatface), serif",
	Bangers: "var(--font-bangers), cursive",
	Bevan: "var(--font-bevan), serif",
	Cardo: "var(--font-cardo), serif",
	Caveat: "var(--font-caveat), cursive",
	Dynalight: "var(--font-dynalight), cursive",
	"Exo 2": "var(--font-exo-2), sans-serif",
	Merriweather: "var(--font-merriweather), serif",
	Oswald: "var(--font-oswald), sans-serif",
	Oxygen: "var(--font-oxygen), sans-serif",
	"Permanent Marker": "var(--font-permanent-marker), cursive",
	"Playfair Display": "var(--font-playfair-display), serif",
	"Racing Sans One": "var(--font-racing-sans-one), sans-serif",
	Raleway: "var(--font-raleway), sans-serif",
	Roboto: "var(--font-roboto), sans-serif",
	"Vast Shadow": "var(--font-vast-shadow), cursive",
};

const CANVAS_FONT_FAMILY_BY_NAME = {
	Abel: '"Abel", sans-serif',
	"Abril Fatface": '"Abril Fatface", serif',
	Bangers: '"Bangers", cursive',
	Bevan: '"Bevan", serif',
	Cardo: '"Cardo", serif',
	Caveat: '"Caveat", cursive',
	Dynalight: '"Dynalight", cursive',
	"Exo 2": '"Exo 2", sans-serif',
	Merriweather: '"Merriweather", serif',
	Oswald: '"Oswald", sans-serif',
	Oxygen: '"Oxygen", sans-serif',
	"Permanent Marker": '"Permanent Marker", cursive',
	"Playfair Display": '"Playfair Display", serif',
	"Racing Sans One": '"Racing Sans One", sans-serif',
	Raleway: '"Raleway", sans-serif',
	Roboto: '"Roboto", sans-serif',
	"Vast Shadow": '"Vast Shadow", cursive',
};

export function resolveFontFamily(fontName) {
	return FONT_FAMILY_BY_NAME[fontName] || fontName;
}

export function resolveCanvasFontFamily(fontName) {
	return CANVAS_FONT_FAMILY_BY_NAME[fontName] || fontName;
}

export default FONT_FAMILY_BY_NAME;
