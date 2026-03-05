// @ts-nocheck
import useModals, { closeModal } from "@/app/actions/modals";
import * as modalComponents from "@/app/components/modals";
import ModalWindow from "@/app/components/window/ModalWindow";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Modals() {
	const modals = useModals((state) => state.modals);

	function handleClose() {
		closeModal();
	}

	return modals.map((item) => {
		const { id, component, modalProps, componentProps } = item;
		const Component = modalComponents[component];
		const showCloseButton = modalProps?.showCloseButton !== false;

		return (
			<Dialog key={id} open onOpenChange={(open) => !open && handleClose()}>
				<DialogContent
					showCloseButton={showCloseButton}
					className="w-auto max-h-[85vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 p-0 text-neutral-100 sm:max-w-[calc(100%-2rem)]"
				>
					<ModalWindow {...modalProps} onClose={handleClose}>
						{Component && <Component {...componentProps} onClose={handleClose} />}
					</ModalWindow>
				</DialogContent>
			</Dialog>
		);
	});
}
