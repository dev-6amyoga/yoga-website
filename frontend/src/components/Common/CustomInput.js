import { useState } from "react";

export default function CustomInput({ children, ...inputProps }) {
  const [val, setVal] = useState(inputProps?.initialValue);
  return (
    <label htmlFor={inputProps?.name} className="flex flex-col gap-2">
      <p className="text-sm text-gray-700">{children}</p>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        {...inputProps}
        className={
          inputProps?.type !== "text"
            ? "border rounded-lg p-1 focus:border-black transition-colors duration-200"
            : ""
        }
      />
    </label>
  );
}
