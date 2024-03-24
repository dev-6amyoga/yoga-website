import { cva } from "class-variance-authority";
import * as React from "react";

import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
	"relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-y-darkgreen text-y-white border-2 border-transparent hover:border-y-black hover:bg-y-darkgreen/90",
				destructive:
					"bg-y-red text-y-black btn-move-base transition-all text-y-black hover:solid-shadow-black",
				outline:
					"border border-input bg-background hover:bg-y-white border-2 border-y-gray hover:border-y-black",
				secondary:
					"bg-y-white text-y-black border-2 border-transparent hover:border-y-black hover:bg-y-white/90",
				ghost: "bg-y-white text-y-green btn-move-base transition-all hover:solid-shadow-darkgreen",
				link: "text-primary underline-offset-4 hover:underline",
				experiment:
					"z-10 relative bg-y-darkgreen btn-move-base transition-all text-y-white hover:solid-shadow-black",
				dark: "z-10 relative bg-y-black btn-move-base transition-all text-y-white hover:solid-shadow-green",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				xs: "h-5 rounded-full py-2 px-2 text-xs",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
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
