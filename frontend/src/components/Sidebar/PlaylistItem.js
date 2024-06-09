import { Add } from "@mui/icons-material";
import { Button, Card, CardActions, CardContent } from "@mui/material";
import { memo } from "react";

function PlaylistItem({ playlist, add, deets, isFuture }) {
	return (
		<Card
			sx={{
				flexShrink: 0,
			}}>
			<CardContent>
				<div>
					<p>{playlist.playlist_name || playlist.schedule_name}</p>
					<div className="flex gap-4 items-center scale-75"></div>
				</div>
			</CardContent>
			<CardActions>
				<Button
					onClick={add}
					disabled={isFuture}
					startIcon={<Add />}
					variant="outlined">
					Add
				</Button>
				<Button onClick={deets}>Details</Button>
			</CardActions>
		</Card>
	);
}

export default memo(PlaylistItem);
