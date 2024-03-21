import * as React from "react";

import { cn } from "../../lib/utils";

const variants = {
	primary:
		"border border-y-grey solid-shadow-darkgreen text-y-black bg-white",
	secondary:
		"border border-y-grey solid-shadow-black text-y-black bg-y-white",
	success: "border border-y-grey solid-shadow-black text-y-black bg-y-green",
	"success-alt":
		"border border-y-grey solid-shadow-black text-y-white bg-y-darkgreen",
	destructive:
		"border border-y-grey solid-shadow-black text-y-black bg-y-red",
};

const Card = React.forwardRef(
	({ className, variant = "primary", ...props }, ref) => (
		<div
			ref={ref}
			className={cn("rounded-xl", variants[variant], className)}
			{...props}
		/>
	)
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 p-6", className)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			"text-2xl font-semibold leading-none tracking-tight",
			className
		)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground py-2", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-center p-6 pt-0 gap-2", className)}
		{...props}
	/>
));
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
