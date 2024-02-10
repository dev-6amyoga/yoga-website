import { Button } from "@geist-ui/core";
import { ArrowUpDown } from "lucide-react";

export default function SortableColumn({ column, children }) {
	return (
		<Button
			auto
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			iconRight={<ArrowUpDown className="ml-2 h-4 w-4" />}>
			{children}
		</Button>
	);
}
