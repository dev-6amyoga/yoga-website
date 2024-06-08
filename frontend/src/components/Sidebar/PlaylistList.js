import { Divider } from "@geist-ui/core";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PlaylistItem from "./PlaylistItem";

export default function PlaylistList({
	name,
	desc,
	playlists,
	handleAddToQueue,
	showDetails,
	show,
}) {
	const [showIndex, setShowIndex] = useState(5);
	const [results, setResults] = useState(playlists ?? []);
	const searchTimeout = useRef(null);

	const handleShowMore = () => {
		setShowIndex(() => Math.min(showIndex + 5, 4 * playlists.length));
	};

	const handleShowLess = () => {
		setShowIndex(() => Math.max(showIndex - 5, 5));
	};

	useEffect(() => {
		setResults(playlists);
	}, [playlists]);

	const handleSearch = (e) => {
		console.log("e", e);
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}

		searchTimeout.current = setTimeout(() => {
			const query = String(e.target.value).toLowerCase();
			console.log("query", query);

			if (!query) {
				setResults(playlists);
				return;
			}

			setResults((prev) => {
				return prev.filter((playlist) =>
					playlist.playlist_name.toLowerCase().includes(query)
				);
			});
		}, 500);
	};

	return (
		<>
			{show ? (
				<>
					<div className="flex justify-between items-start">
						<div className="flex flex-col">
							<h2 className="text-2xl font-bold">{name}</h2>
							<p className="pb-4 text-sm">{desc}</p>
						</div>

						<div className="flex gap-2">
							<Autocomplete
								disablePortal
								options={
									playlists?.map(
										(playlist) => playlist.playlist_name
									) ?? []
								}
								sx={{ width: 200 }}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Search"
										size="small"
										onChange={handleSearch}
									/>
								)}
							/>
							<Button onClick={handleShowMore} size="small">
								Show More
							</Button>
							<Button onClick={handleShowLess} size="small">
								Show Less
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4 gap-4">
						{results?.slice(0, showIndex).map((playlist, idx) => (
							<PlaylistItem
								key={playlist.playlist_name + idx}
								add={() => handleAddToQueue(playlist)}
								deets={() => showDetails(playlist)}
								playlist={playlist}
								isFuture={false}
							/>
						))}
					</div>
					<Divider />
				</>
			) : (
				<></>
			)}
		</>
	);
}
