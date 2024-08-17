import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export default function SortableColumn({ column, children }) {
	return (
		<div
			auto
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			className="flex flex-row items-center gap-2">
			{children}
			{column.getIsSorted() === "asc" ? (
				<ArrowDownIcon size={12} />
			) : (
				<ArrowUpIcon size={12} />
			)}
		</div>
	);
}
