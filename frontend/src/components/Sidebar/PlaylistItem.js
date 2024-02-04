import { Button } from "@geist-ui/core";
import { memo } from "react";

function PlaylistItem({ playlist, add, deets }) {
	return (
		<div className="px-2 py-2 rounded-xl border border-zinc-800">
			<div className="flex justify-between gap-8 items-center">
				<p>{playlist.playlist_name}</p>
				<div className="flex gap-4 items-center scale-75">
					<Button auto type="outline" onClick={add}>
						Add
					</Button>
					<Button auto type="outline" onClick={deets}>
						Details
					</Button>
				</div>
			</div>
		</div>
	);
}

export default memo(PlaylistItem);
