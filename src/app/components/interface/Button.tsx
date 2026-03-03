import { Button as ShadcnButton } from "@/components/ui/button";

interface ButtonProps {
	text?: string;
	disabled?: boolean;
	className?: string;
	onClick?: (() => void) | null;
}

export default function Button({ text, disabled, className, onClick }: ButtonProps) {
	return (
		<ShadcnButton
			variant="default"
			size="sm"
			className={className}
			disabled={disabled}
			onClick={disabled ? undefined : (onClick ?? undefined)}
		>
			{text}
		</ShadcnButton>
	);
}
