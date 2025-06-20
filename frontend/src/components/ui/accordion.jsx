import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn("border-b border-b-y-darkgreen", className)}
		{...props}
	/>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(
	({ className, children, ...props }, ref) => (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				ref={ref}
				className={cn(
					"flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>button>svg]:rotate-180",
					className
				)}
				{...props}>
				{children}
				<button className="solid-shadow-darkgreen p-1 w-6 h-6 rounded-full bg-y-white">
					<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
				</button>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	)
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(
	({ className, children, ...props }, ref) => (
		<AccordionPrimitive.Content
			ref={ref}
			className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
			{...props}>
			<div className={cn("pb-4 pt-0", className)}>{children}</div>
		</AccordionPrimitive.Content>
	)
);

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
