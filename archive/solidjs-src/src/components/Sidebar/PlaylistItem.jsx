// import { memo } from "react";

function PlaylistItem({ playlist, add, deets, isFuture }) {
	return (
		<div class="px-2 py-2 rounded-xl border border-zinc-800">
			<div class="flex justify-between gap-8 items-center">
				<p>{playlist.playlist_name || playlist.schedule_name}</p>
				<div class="flex gap-4 items-center scale-75">
					<button
						auto
						type="outline"
						onClick={add}
						disabled={isFuture}>
						Add
					</button>
					<button auto type="outline" onClick={deets}>
						Details
					</button>
				</div>
			</div>
		</div>
	);
}

export default PlaylistItem;
