import { cva } from "class-variance-authority";
import * as React from "react";

import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
	"relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "btn-default",
				destructive: "btn-destructive",
				outline: "btn-outline",
				secondary: "btn-secondary",
				ghost: "btn-ghost",
				link: "btn-link",
				experiment: "btn-experiment",
				dark: "btn-dark",
			},
			size: {
				default: "btn",
				sm: "btn-sm",
				xs: "btn-xs",
				lg: "btn-lg",
				icon: "btn-icon",
			},
		},
		defaultVariants: {
			variant: "experiment",
			size: "default",
		},
	}
);

const Button = React.forwardRef(
	(
		{
			className,
			variant,
			size,
			loading,
			disabled,
			asChild = false,
			children,
			...props
		},
		ref
	) => {
		const Comp = "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={disabled || loading}
				{...props}>
				<div
					className={`absolute top-0 left-0 right-0 bottom-0 h-full w-full flex-center 
						${loading ? "opacity-100" : "opacity-0"}
						`}>
					<Loader2 className="animate-spin" />
				</div>
				<div className={`${loading ? "opacity-0" : "opacity-100"}`}>
					{children}
				</div>
			</Comp>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
