import { useEffect, useState } from "react";

import { Input } from "@geist-ui/core";

export default function DebouncedInput({
	value,
	onChange,
	placeholder,
	iconRight,
	children,
}) {
	const [stateValue, setStateValue] = useState(value);

	useEffect(() => {
		let t = setTimeout(() => {
			onChange(stateValue);
		}, 250);
		return () => clearTimeout(t);
	}, [stateValue, onChange]);

	useEffect(() => {
		setStateValue(value);
	}, [value]);

	return (
		<Input
			value={stateValue}
			placeholder={placeholder}
			iconRight={iconRight}
			onChange={(e) => {
				setStateValue(e.target.value);
			}}>
			{children}
		</Input>
	);
}
