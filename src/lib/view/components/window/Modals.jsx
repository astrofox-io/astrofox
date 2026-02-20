import { easeInOutQuad } from "@/lib/utils/easing";
import useModals, { closeModal } from "@/lib/view/actions/modals";
import * as modalComponents from "@/lib/view/components/modals";
import ModalWindow from "@/lib/view/components/window/ModalWindow";
import Overlay from "@/lib/view/components/window/Overlay";
import React from "react";
import { animated, useTransition } from "react-spring";
import styles from "./Modals.module.less";

export default function Modals() {
	const modals = useModals((state) => state.modals);

	const transitions = useTransition(modals, {
		keys: (item) => item.id,
		from: { opacity: 0, transform: "scale(0.7) rotateX(-90deg)" },
		enter: { opacity: 1, transform: "scale(1.0) rotateX(0deg)" },
		leave: { opacity: 0, transform: "scale(0.7) rotateX(-90deg)" },
		config: { duration: 300, easing: easeInOutQuad },
	});

	function handleClose() {
		closeModal();
	}

	return transitions((style, item) => {
		const { component, modalProps, componentProps } = item;
		const Component = modalComponents[component];
		return (
			<div className={styles.container} key={component}>
				<Overlay show={!!modals.length} />
				<animated.div className={styles.modal} style={style}>
					<ModalWindow {...modalProps} onClose={handleClose}>
						{Component && (
							<Component {...componentProps} onClose={handleClose} />
						)}
					</ModalWindow>
				</animated.div>
			</div>
		);
	});
}
