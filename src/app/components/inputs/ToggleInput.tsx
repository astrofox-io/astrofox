import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ToggleInputProps {
	name?: string;
	value?: boolean;
	label?: string;
	labelPosition?: "left" | "right";
	onChange?: (name: string, value: boolean) => void;
}

export default function ToggleInput({
	name = "toggle",
	value = false,
	label,
	labelPosition = "right",
	onChange,
}: ToggleInputProps) {
	return (
		<div className="flex items-center">
			<Switch
				className="order-[1] h-4 w-8 data-unchecked:bg-neutral-900 data-checked:bg-primary [&_[data-slot=switch-thumb]]:size-4 [&_[data-slot=switch-thumb]]:data-checked:translate-x-4 [&_[data-slot=switch-thumb]]:bg-neutral-100 [&_[data-slot=switch-thumb]]:border [&_[data-slot=switch-thumb]]:border-border-input [&_[data-slot=switch-thumb]]:shadow-[0_0_2px_rgba(0,0,0,0.3)]"
				checked={value}
				onCheckedChange={(checked) => onChange?.(name, Boolean(checked))}
			/>
			{label && (
				<div
					className={cn("inline-block shrink-0 whitespace-nowrap", {
						"order-[0] pr-3": labelPosition === "left",
						"order-[2] pl-4": labelPosition === "right",
					})}
				>
					{label}
				</div>
			)}
		</div>
	);
}
