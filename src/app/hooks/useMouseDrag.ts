import type { DragHandlers } from "@/lib/types";
import { useCallback, useRef } from "react";

export default function useMouseDrag() {
	const eventHandlers = useRef<DragHandlers | null>(null);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		const { onDrag } = eventHandlers.current || {};

		if (onDrag) {
			onDrag(e);
		}
	}, []);

	const handleMouseUp = useCallback((e: MouseEvent) => {
		const { onDragEnd } = eventHandlers.current || {};

		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mousemove", handleMouseUp);

		if (onDragEnd) {
			onDragEnd(e);
		}
	}, []);

	function startDrag(e: React.MouseEvent, props: DragHandlers = {}) {
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
