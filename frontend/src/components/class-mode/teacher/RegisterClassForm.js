import { Divider, Modal, Spacer, Text } from "@geist-ui/core";

import { TextField } from "@mui/material";

import { Button } from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClassModeAPI } from "../../../api/class-mode.api";
import getFormData from "../../../utils/getFormData";

export default function RegisterNewClass({ visible = false, setVisible }) {
	const [days, setDays] = useState(null);
	const navigate = useNavigate();
	const [duration, setDuration] = useState(null);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);

	const handler = (val) => {
		setDays(val);
	};
	const handleEndTimeChange = (e) => {
		setEndTime(e.target.value);
	};
	const handleStartTimeChange = (e) => {
		setStartTime(e.target.value);
	};

	useEffect(() => {
		if (!startTime || !endTime) {
			setDuration(0 + " hour, " + 0 + " minutes, " + 0 + " seconds");
		}

		const startDate = new Date(startTime);
		const endDate = new Date(endTime);
		const difference = endDate.getTime() - startDate.getTime();
		let milliseconds = difference;
		let seconds = Math.floor(milliseconds / 1000);
		milliseconds %= 1000;
		let minutes = Math.floor(seconds / 60);
		seconds %= 60;
		let hours = Math.floor(minutes / 60);
		minutes %= 60;
		const duration =
			String(hours) +
			" hour, " +
			String(minutes) +
			" minutes, " +
			String(seconds) +
			" seconds";
		setDuration(duration);
	}, [startTime, endTime]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);

		// formData["days"] = days;

		// console.log(formData, new Date(formData.start_time).toISOString());

		const [res, err] = await ClassModeAPI.postCreateClass(
			formData.class_name,
			formData.class_desc,
			4,
			new Date(formData.start_time).toISOString(),
			new Date(formData.end_time).toISOString()
		);

		if (err) {
			toast.error("Error updating class");
			return;
		}

		setVisible(false);
	};

	return (
		<Modal
			visible={visible}
			onClose={() => {
				setVisible(false);
			}}>
			<Modal.Title>Create New Class</Modal.Title>

			<Modal.Content>
				<form
					className="flex-col items-center justify-center space-y-10 my-10 bg-white"
					onSubmit={handleSubmit}>
					<TextField
						className="w-full"
						name="class_name"
						label="Class Name"
					/>
					<TextField
						className="w-full"
						name="class_desc"
						label="Class Description"
					/>

					<div className="mb-4">
						{" "}
						<p className="text-sm text-gray-600">Start Time</p>
						<input
							type="datetime-local"
							name="start_time"
							onChange={handleStartTimeChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div className="mb-4">
						<p className="text-sm text-gray-600">End Time</p>
						<input
							type="datetime-local"
							name="end_time"
							onChange={handleEndTimeChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<Divider />

					<Spacer h={1} />

					{duration && <Text>Duration : {duration}</Text>}

					<Button
						type="submit"
						className="w-full"
						variant="contained">
						Submit
					</Button>
				</form>
			</Modal.Content>
		</Modal>
	);
}
