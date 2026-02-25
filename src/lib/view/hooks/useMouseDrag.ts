import { useCallback, useRef } from "react";

export default function useMouseDrag() {
	const eventHandlers = useRef<any>(null);

	const handleMouseMove = useCallback((e) => {
		const { onDrag } = eventHandlers.current;

		if (onDrag) {
			onDrag(e);
		}
	}, []);

	const handleMouseUp = useCallback((e) => {
		const { onDragEnd } = eventHandlers.current;

		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mousemove", handleMouseUp);

		if (onDragEnd) {
			onDragEnd(e);
		}
	}, []);

	function startDrag(e, props: any = {}) {
		e.persist();

		const { onDrag, onDragStart, onDragEnd } = props;

		eventHandlers.current = { onDrag, onDragStart, onDragEnd };

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		if (onDragStart) {
			onDragStart(e);
		}
	}

	return startDrag;
}
