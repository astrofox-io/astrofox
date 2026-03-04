import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckboxInputProps {
	name?: string;
	value?: boolean;
	label?: string;
	labelPosition?: "left" | "right";
	onChange?: (name: string, value: boolean) => void;
}

export default function CheckboxInput({
	name = "checkbox",
	value = false,
	label,
	labelPosition = "right",
	onChange,
}: CheckboxInputProps) {
	return (
		<div className="flex items-center">
			<Checkbox
				className="order-[1] size-4 rounded border-border-input bg-neutral-900 shadow-none data-checked:border-primary data-checked:bg-primary data-checked:text-neutral-100"
				checked={value}
				onCheckedChange={(checked) => onChange?.(name, Boolean(checked))}
			/>
			{label && (
				<div
					className={cn("inline-block", {
						"order-[0] mr-2": labelPosition === "left",
						"order-[2] ml-2": labelPosition === "right",
					})}
				>
					{label}
				</div>
			)}
		</div>
	);
}
