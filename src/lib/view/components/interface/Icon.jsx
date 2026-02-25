import classNames from "classnames";
import React from "react";

const Icon = ({
	className,
	width,
	height,
	title,
	glyph,
	monochrome,
	shapeRendering,
	onClick,
}) => {
	const isSpriteGlyph = glyph && typeof glyph === "object" && glyph.url;
	const Glyph = glyph;

	return (
		<span
			className={classNames(
				"inline-flex [align-self:center] relative text-[var(--text100)] w-[16px] h-[16px] [&_svg]:text-inherit [&_svg]:w-[inherit] [&_svg]:h-[inherit]",
				{ ["[&_svg_path:not([fill])]:[fill:currentColor] [&_svg_circle:not([fill])]:[fill:currentColor] [&_svg_ellipse:not([fill])]:[fill:currentColor] [&_svg_rect:not([fill])]:[fill:currentColor] [&_svg_polygon:not([fill])]:[fill:currentColor] [&_svg_polyline:not([fill])]:[fill:currentColor] [&_svg_path:not([stroke])]:[stroke:currentColor] [&_svg_circle:not([stroke])]:[stroke:currentColor] [&_svg_ellipse:not([stroke])]:[stroke:currentColor] [&_svg_rect:not([stroke])]:[stroke:currentColor] [&_svg_polygon:not([stroke])]:[stroke:currentColor] [&_svg_polyline:not([stroke])]:[stroke:currentColor] [&_svg_line:not([stroke])]:[stroke:currentColor]"]: monochrome },
				className,
			)}
			title={title}
		>
			{isSpriteGlyph ? (
				<svg
					viewBox={glyph.viewBox}
					width={width}
					height={height}
					onClick={onClick}
					shapeRendering={shapeRendering}
				>
					<use xlinkHref={glyph.url} />
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

Icon.defaultProps = {
	monochrome: true,
	shapeRendering: "geometricPrecision",
};

export default Icon;
