import {
	Abel,
	Abril_Fatface,
	Bangers,
	Bevan,
	Cardo,
	Caveat,
	Dynalight,
	Exo_2,
	Inter,
	Merriweather,
	Oswald,
	Oxygen,
	Permanent_Marker,
	Playfair_Display,
	Racing_Sans_One,
	Raleway,
	Roboto,
	Vast_Shadow,
} from "next/font/google";

export const abel = Abel({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-abel",
});
export const abrilFatface = Abril_Fatface({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-abril-fatface",
});
export const bangers = Bangers({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-bangers",
});
export const bevan = Bevan({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-bevan",
});
export const cardo = Cardo({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-cardo",
});
export const caveat = Caveat({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-caveat",
});
export const dynalight = Dynalight({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-dynalight",
});
export const exo2 = Exo_2({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-exo-2",
});
export const inter = Inter({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-inter",
});
export const merriweather = Merriweather({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-merriweather",
});
export const oswald = Oswald({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-oswald",
});
export const oxygen = Oxygen({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-oxygen",
});
export const permanentMarker = Permanent_Marker({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-permanent-marker",
});
export const playfairDisplay = Playfair_Display({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-playfair-display",
});
export const racingSansOne = Racing_Sans_One({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-racing-sans-one",
});
export const raleway = Raleway({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-raleway",
});
export const roboto = Roboto({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-roboto",
});
export const vastShadow = Vast_Shadow({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-vast-shadow",
});

export const fontVariables = [
	abel.variable,
	abrilFatface.variable,
	bangers.variable,
	bevan.variable,
	cardo.variable,
	caveat.variable,
	dynalight.variable,
	exo2.variable,
	inter.variable,
	merriweather.variable,
	oswald.variable,
	oxygen.variable,
	permanentMarker.variable,
	playfairDisplay.variable,
	racingSansOne.variable,
	raleway.variable,
	roboto.variable,
	vastShadow.variable,
].join(" ");
