// @ts-nocheck
import useModals, { closeModal } from "@/app/actions/modals";
import * as modalComponents from "@/app/components/modals";
import ModalWindow from "@/app/components/window/ModalWindow";
import {
	Dialog,
	DialogOverlay,
	DialogPortal,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

export default function Modals() {
	const modals = useModals((state) => state.modals);

	function handleClose() {
		closeModal();
	}

	return modals.map((item) => {
		const { id, component, modalProps, componentProps } = item;
		const Component = modalComponents[component];

		return (
			<Dialog key={id} open onOpenChange={(open) => !open && handleClose()}>
				<DialogPortal>
					<DialogOverlay className="bg-black/50" />
					<DialogPrimitive.Popup className="fixed inset-0 z-50 flex items-center justify-center outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
						<ModalWindow {...modalProps} onClose={handleClose}>
							{Component && (
								<Component {...componentProps} onClose={handleClose} />
							)}
						</ModalWindow>
					</DialogPrimitive.Popup>
				</DialogPortal>
			</Dialog>
		);
	});
}
