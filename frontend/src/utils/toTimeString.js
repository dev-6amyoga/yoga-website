export const toTimeString = (seconds) => {
	const s = seconds > 0 ? seconds : 0;

	return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
		Math.ceil(s) % 60
	).padStart(2, "0")}`;
};
