import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { cn } from "../../lib/utils";
import { Input } from "./input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";
import { Label } from "./label";

const Form = FormProvider;

const FormFieldContext = React.createContext({});

const FormField = ({ ...props }) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

const FormItemContext = React.createContext({});

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div ref={ref} className={cn("space-y-2", className)} {...props} />
		</FormItemContext.Provider>
	);
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
	const { error, formItemId } = useFormField();

	return (
		<Label
			ref={ref}
			className={cn(error && "text-destructive", className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef(({ ...props }, ref) => {
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return (
		<Slot
			ref={ref}
			id={formItemId}
			aria-describedby={
				!error
					? `${formDescriptionId}`
					: `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!error}
			{...props}
		/>
	);
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
	const { formDescriptionId } = useFormField();

	return (
		<p
			ref={ref}
			id={formDescriptionId}
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef(
	({ className, children, ...props }, ref) => {
		const { error, formMessageId } = useFormField();
		const body = error ? String(error?.message) : children;

		if (!body) {
			return null;
		}

		return (
			<p
				ref={ref}
				id={formMessageId}
				className={cn(
					"text-sm font-medium text-destructive",
					className
				)}
				{...props}>
				{body}
			</p>
		);
	}
);
FormMessage.displayName = "FormMessage";

const FormFieldWrapper = ({
	form,
	name,
	label,
	placeholder,
	description,
	disabled = false,
	className = "",
	defaultValue,
	type,
	children,
	...props
}) => {
	return (
		<FormField
			control={form?.control}
			name={name}
			defaultValue={defaultValue ?? ""}
			{...props}
			render={({ field }) => (
				<FormItem className={className}>
					{label || children ? (
						<FormLabel>{label || children}</FormLabel>
					) : (
						<></>
					)}
					<FormControl className="max-w-full">
						{type === "otp" ? (
							<InputOTP
								maxLength={6}
								pattern={REGEXP_ONLY_DIGITS}
								className="w-full sm:text-sm"
								{...field}>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						) : (
							<Input
								placeholder={placeholder}
								type={type ?? "text"}
								disabled={disabled}
								{...field}
							/>
						)}
					</FormControl>
					<FormDescription>{description}</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormFieldWrapper,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
};
