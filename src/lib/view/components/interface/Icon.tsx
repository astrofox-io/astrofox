import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import type React from "react";

interface SpriteGlyph {
	url: string;
	viewBox: string;
}

type IconGlyph =
	| LucideIcon
	| React.ComponentType<Record<string, unknown>>
	| SpriteGlyph;

interface IconProps {
	className?: string;
	width?: number;
	height?: number;
	glyph?: IconGlyph | null;
	monochrome?: boolean;
	shapeRendering?: string;
	onClick?: (e: React.MouseEvent) => void;
}

const Icon = ({
	className,
	width,
	height,
	glyph,
	monochrome = true,
	shapeRendering = "geometricPrecision",
	onClick,
}: IconProps) => {
	const isSpriteGlyph = glyph && typeof glyph === "object" && "url" in glyph;
	const Glyph = glyph as LucideIcon;
	const applyMonochrome = monochrome && isSpriteGlyph;

	return (
		<span
			className={classNames(
				"relative inline-flex h-4 w-4 shrink-0 items-center justify-center align-middle leading-none text-neutral-100 [&_svg]:h-full [&_svg]:w-full [&_svg]:text-inherit",
				{
					"[&_svg_path:not([fill])]:[fill:currentColor] [&_svg_circle:not([fill])]:[fill:currentColor] [&_svg_ellipse:not([fill])]:[fill:currentColor] [&_svg_rect:not([fill])]:[fill:currentColor] [&_svg_polygon:not([fill])]:[fill:currentColor] [&_svg_polyline:not([fill])]:[fill:currentColor] [&_svg_path:not([stroke])]:[stroke:currentColor] [&_svg_circle:not([stroke])]:[stroke:currentColor] [&_svg_ellipse:not([stroke])]:[stroke:currentColor] [&_svg_rect:not([stroke])]:[stroke:currentColor] [&_svg_polygon:not([stroke])]:[stroke:currentColor] [&_svg_polyline:not([stroke])]:[stroke:currentColor] [&_svg_line:not([stroke])]:[stroke:currentColor]":
						applyMonochrome,
				},
				className,
			)}
		>
			{isSpriteGlyph ? (
				<svg
					viewBox={(glyph as SpriteGlyph).viewBox}
					width={width}
					height={height}
					onClick={onClick}
					shapeRendering={shapeRendering}
				>
					<use xlinkHref={(glyph as SpriteGlyph).url} />
				</svg>
			) : Glyph ? (
				<Glyph
					width={width}
					height={height}
					onClick={onClick}
					shapeRendering={shapeRendering}
				/>
			) : null}
		</span>
	);
};

export default Icon;
