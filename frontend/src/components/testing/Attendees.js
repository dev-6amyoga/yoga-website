import { Avatar, Card, CardContent } from "@mui/material";

const attendees = [
	{ id: 1, name: "Smriti", insync: true },
	{ id: 2, name: "Sivakumar", insync: true },
	{ id: 3, name: "Inaya", insync: true },
	{ id: 4, name: "Akash", insync: false },
	{ id: 5, name: "Saanvi", insync: true },
	{ id: 6, name: "Reyansh", insync: true },
	{ id: 7, name: "Kavya", insync: false },
	{ id: 8, name: "Ishaan", insync: true },
	{ id: 9, name: "Siya", insync: true },
	{ id: 10, name: "Vivaan", insync: true },
	{ id: 11, name: "Myra", insync: true },
	{ id: 12, name: "Veer", insync: true },
];

export default function Attendees() {
	return (
		<Card>
			<CardContent>
				<h3>Students [12]</h3>
				<div className="grid grid-cols-4 gap-4 p-4">
					{attendees.map((attendee) => {
						return (
							<div
								key={attendee.id}
								className="flex flex-row gap-2 items-center">
								<Avatar>{attendee.name[0]}</Avatar>
								<div className="flex flex-col gap-1">
									<p>{attendee.name}</p>
									<div className="flex flex-row gap-2 items-center">
										<div
											className={`w-2 h-2 rounded-full ${attendee.insync ? "bg-green-500" : "bg-red-500"}`}></div>
										<p>
											{attendee.insync
												? "In Sync"
												: "Out of sync"}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
