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
				className="order-[1]"
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
