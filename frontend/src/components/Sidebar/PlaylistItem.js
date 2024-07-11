import { Add } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import { memo, useMemo } from "react";

function PlaylistItem({ playlist, add, deets, isFuture }) {
  const name = useMemo(() => {
    return String(playlist.playlist_name ?? playlist.schedule_name ?? "");
  }, [playlist]);

  return (
    <div className="border border-y-slate-100 rounded-lg p-2 grid playlist-item-grid items-center">
      <Tooltip title={name}>
        <p className="">
          {name.length > 35 ? name.substring(0, 35) + "..." : name}
        </p>
      </Tooltip>
      <div className="flex gap-2 justify-between scale-75">
        <Button
          onClick={add}
          disabled={isFuture}
          startIcon={<Add />}
          variant="outlined"
        >
          Add To Queue
        </Button>
        <Button onClick={deets} variant="outlined">
          Details
        </Button>
      </div>
    </div>
  );
}

export default memo(PlaylistItem);
