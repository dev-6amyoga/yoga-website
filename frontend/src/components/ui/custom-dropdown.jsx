import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const CustomDropdown = AccordionPrimitive.Root;

const CustomDropdownItem = React.forwardRef(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn("", className)}
		{...props}
	/>
));
CustomDropdownItem.displayName = "CustomDropdownItem";

const CustomDropdownTrigger = React.forwardRef(
	({ className, children, ...props }, ref) => (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				ref={ref}
				className={cn(
					"flex flex-1 items-center justify-center bg-y-white text-y-green font-normal hover:-translate-x-1 hover:-translate-y-1 hover:solid-shadow-darkgreen rounded-lg relative py-3 text-sm text-center transition-all [&[data-state=open]>button>svg]:rotate-180",
					className
				)}
				{...props}>
				<p className="text-center">{children}</p>
				<button className="absolute right-4 top-[20%] solid-shadow-darkgreen p-1 w-6 h-6 rounded-full bg-y-white">
					<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
				</button>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	)
);
CustomDropdownTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const CustomDropdownContent = React.forwardRef(
	({ className, children, ...props }, ref) => (
		<AccordionPrimitive.Content
			ref={ref}
			className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
			{...props}>
			<div
				className={cn(
					"pb-4 pt-4 flex flex-col w-full gap-4",
					className
				)}>
				{children}
			</div>
		</AccordionPrimitive.Content>
	)
);

CustomDropdownContent.displayName = AccordionPrimitive.Content.displayName;

export {
	CustomDropdown,
	CustomDropdownContent,
	CustomDropdownItem,
	CustomDropdownTrigger,
};
