// import { useEffect, useState } from "react";
import { For, createResource } from "solid-js";
import usePlaylistStore from "../../store/PlaylistStore";
import { Fetch } from "../../utils/Fetch";
import PlaylistItem from "./PlaylistItem";

function Playlist() {
	const [allAsanas] = createResource(async (source, {}) => {
		try {
			const response = await Fetch({
				url: "/content/video/getAllAsanas",
			});
			const data = response.data;
			return data;
		} catch (error) {
			console.error(error);
			return [];
		}
	});
	const [allTransitions] = createResource(async (source, {}) => {
		try {
			const response = await Fetch({
				url: "/content/video/getAllTransitions",
			});
			const data = response.data;
			// console.log(data);
			return data;
		} catch (error) {
			console.error(error);
			return [];
		}
	});
	const queue = usePlaylistStore((state) => state.queue);
	const addToQueue = usePlaylistStore((state) => state.addToQueue);

	const [playlists] = createResource(async (source, {}) => {
		try {
			const response = await Fetch({
				url: "/content/playlists/getAllPlaylists",
			});
			const data = response.data;
			console.log({ playlists: data });
			return data ?? [];
		} catch (error) {
			// setLoading(false);
			console.error(error);
			return [];
		}
	});

	const getAllAsanas = async (asana_ids) => {
		if (asana_ids.length === 0) {
			return [];
		}
		const allAsanasData = asana_ids.map((asana_id) => {
			// console.log("FETCHING FOR : ", asana_id, "\n");
			if (Number(asana_id)) {
				const asanaObject = allAsanas().find(
					(asana) => asana.id === asana_id
				);
				return asanaObject || null;
			} else {
				const transitionObject = allTransitions().find(
					(transition) => transition.transition_id === asana_id
				);
				// console.log(transitionObject);
				return transitionObject || null;
			}
		});
		return allAsanasData;
	};

	const handleAddToQueue = (asana_ids) => {
		getAllAsanas(asana_ids)
			.then((asanas) => {
				console.log(asanas);
				addToQueue(asanas.filter((v) => v !== null));
			})
			.catch((err) => console.log(err));
	};

	const showDetails = (x) => {
		console.log("in show details");
	};

	return (
		<div class="rounded-xl">
			<h4>6AM Yoga Playlists</h4>
			<p class="pb-4 text-sm">
				Choose from a variety of playlists to practice.
			</p>
			<div class="grid grid-cols-3 gap-2">
				<For each={playlists()} fallback={<div>Loading..</div>}>
					{(item) => (
						<PlaylistItem
							key={item.playlist_name}
							type={
								queue
									? queue.includes(item)
										? "success"
										: "secondary"
									: "secondary"
							}
							add={() => handleAddToQueue(item.asana_ids)}
							deets={() => showDetails(item)}
							playlist={item}
							isFuture={false}
						/>
					)}
				</For>
			</div>
		</div>
	);
}

export default Playlist;
