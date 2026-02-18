import classNames from "classnames";
import React from "react";
import styles from "./Icon.module.less";

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
				styles.icon,
				{ [styles.monochrome]: monochrome },
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
