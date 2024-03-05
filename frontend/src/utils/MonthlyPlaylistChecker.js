import { useState } from "react";
import { Fetch } from "./Fetch";
import { toast } from "react-toastify";

export const MonthlyPlaylistChecker = async (user_id) => {
  //   const [monthlyPlaylistLimit, setMonthlyPlaylistLimit] = useState(0);
  try {
    const { data } = await Fetch({
      url: "/playlist-configs/getAllConfigs",
    });
    const monthlyPlaylistLimit = data.find(
      (config) => config.playlist_config_name === "MONTHLY_PLAYLIST_LIMIT"
    );
    if (monthlyPlaylistLimit) {
      console.log("hi");
      //   setMonthlyPlaylistLimit(monthlyPlaylistLimit.playlist_config_value);
    }
    return "hi";
  } catch (error) {
    toast(error);
  }
};
