import classNames from "classnames";
import React, { useState, useRef, useEffect } from "react";

export default function TextInput({
	name = "text",
	width = 160,
	size = null,
	value = "",
	spellCheck = false,
	autoFocus = false,
	autoSelect = false,
	buffered = false,
	readOnly = false,
	disabled = false,
	className,
	onChange,
}: any) {
	const [bufferedValue, setBufferedValue] = useState(value);
	const input = useRef(null);
	const shouldAutoFocus = useRef(Boolean(autoFocus));
	const shouldAutoSelect = useRef(Boolean(autoSelect));

	useEffect(() => {
		if (!input.current) {
			return;
		}

		if (shouldAutoFocus.current || shouldAutoSelect.current) {
			input.current.focus();
		}

		if (shouldAutoSelect.current) {
			input.current.select();
		}
	}, []);

	useEffect(() => {
		setBufferedValue(value);
	}, [value]);

	function handleChange(e) {
		const { value } = e.currentTarget;

		setBufferedValue(value);

		if (!buffered) {
			onChange(name, value);
		}
	}

	function handleKeyUp(e) {
		if (buffered) {
			// Enter key
			if (e.keyCode === 13) {
				onChange(name, bufferedValue);
			}
			// Esc key
			else if (e.keyCode === 27) {
				onChange(name, value);
			}
		}
	}

	function handleBlur() {
		if (buffered) {
			onChange(name, bufferedValue);
		}
	}

	return (
		<input
			ref={input}
			type="text"
			className={classNames(
				"text-sm text-neutral-300 bg-neutral-900 border border-neutral-600 rounded-md py-1 px-2 [outline:none] [&:focus]:border [&:focus]:border-primary [&:read-only]:border-neutral-600 [&:disabled]:text-neutral-500 [&:disabled]:border-neutral-600",
				className,
			)}
			style={{ width }}
			name={name}
			size={size}
			spellCheck={spellCheck}
			value={buffered ? bufferedValue : value}
			onChange={handleChange}
			onBlur={handleBlur}
			onKeyUp={handleKeyUp}
			readOnly={readOnly}
			disabled={disabled}
		/>
	);
}
