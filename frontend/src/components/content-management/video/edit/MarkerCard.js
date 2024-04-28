import { Button, Checkbox, Input, Tag } from "@geist-ui/core";
import { useState } from "react";
import { toTimeString } from "../../../../utils/toTimeString";

function MarkerCard({
	idx,
	marker,
	handleSave,
	handleDelete,
	moveToTimestamp,
	isActive,
}) {
	const [markerData, setMarkerData] = useState(marker);
	const [dirty, setDirty] = useState(false);

	const handleChange = (e) => {
		const name = e?.target?.name || e?.nativeEvent?.target?.name;
		console.log(name, e.target.value, e.target.checked);
		if (name === "loop")
			setMarkerData((m) => ({ ...m, [name]: e.target.checked }));
		else setMarkerData((m) => ({ ...m, [name]: e.target.value }));
	};

	const handleEdit = () => {
		if (!dirty) {
			setDirty(true);
		} else {
			handleSave(markerData, idx);
			setDirty(false);
		}
	};

	return (
		<div
			className={`rounded-lg p-4  flex flex-col justify-between shrink-0 ${
				isActive ? "border-2 border-red-500" : "border"
			}`}>
			<div className="flex flex-col gap-4">
				{dirty ? (
					<Input
						initialValue={markerData.timestamp}
						name="timestamp"
						onChange={handleChange}>
						Marker Timestamp
					</Input>
				) : (
					<Button
						scale={0.6}
						auto
						mb={1}
						type="success"
						onClick={() => {
							moveToTimestamp(markerData.timestamp);
						}}>
						{`Marker : ${markerData?.timestamp}s | ${toTimeString(
							markerData?.timestamp || 0
						)}`}
					</Button>
				)}
				<div
					className={`flex items-start ${
						dirty
							? "flex-col gap-4"
							: "flex-row justify-between gap-2"
					}`}>
					{dirty ? (
						<>
							<Input
								initialValue={markerData.title}
								name="title"
								onChange={handleChange}>
								Marker Title
							</Input>
							<Checkbox
								onChange={handleChange}
								name="loop"
								initialChecked={markerData.loop}>
								Loop
							</Checkbox>
						</>
					) : (
						<>
							<p className="max-w-[22ch] break-all break-words text-sm">
								{markerData.title}
							</p>
							{markerData.loop ? (
								<Tag type="success" scale={0.3}>
									Loop On
								</Tag>
							) : (
								<Tag type="warning" scale={0.3}>
									Loop Off
								</Tag>
							)}
						</>
					)}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2 py-4">
				<Button
					scale={0.2}
					onClick={handleEdit}
					type={dirty ? "success" : "secondary"}>
					{dirty ? "Save" : "Edit"}
				</Button>
				<Button scale={0.2} onClick={() => handleDelete(idx)}>
					Delete
				</Button>
			</div>
		</div>
	);
}
export default MarkerCard;
