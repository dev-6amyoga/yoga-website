import { Table } from "@geist-ui/core";

export default function JsonTable({
	data,
	renderMap = {},
	excludeKeys = [],
	includeKeys = [],
}) {
	return (
		<Table
			data={
				data
					? excludeKeys.length > 0
						? Object.keys(data)
								.filter((k) => {
									return !excludeKeys.includes(k);
								})
								.map((k) => ({ key: k, value: data[k] }))
						: includeKeys.length > 0
						? Object.keys(data)
								.filter((k) => {
									return includeKeys.includes(k);
								})
								.map((k) => ({ key: k, value: data[k] }))
						: []
					: []
			}>
			<Table.Column
				prop="key"
				label="Keys"
				render={(value) => {
					return (
						<p className="max-w-xl break-all break-words capitalize">
							{String(value).split("_").join(" ")}
						</p>
					);
				}}
			/>
			<Table.Column
				prop="value"
				label="Values"
				render={(value, rowData) => {
					if (renderMap[rowData.key]) {
						return renderMap[rowData.key](value, rowData, data);
					}
					return (
						<p className="max-w-xl break-all break-words">
							{typeof value === "object"
								? JSON.stringify(value)
								: value}
						</p>
					);
				}}
			/>
		</Table>
	);
}
