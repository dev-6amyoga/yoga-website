import { useState } from "react";
import { Fetch } from "./Fetch";
import { toast } from "react-toastify";
import { IoEllipseSharp } from "react-icons/io5";

export const MonthlyPlaylistChecker = async (user_id, user_type) => {
  try {
    const { data } = await Fetch({
      url: "/playlist-configs/getAllConfigs",
    });
    const monthlyPlaylistLimit = data.find(
      (config) => config.playlist_config_name === "MONTHLY_PLAYLIST_LIMIT"
    );
    if (monthlyPlaylistLimit.playlist_config_value) {
      const response1 = await Fetch({
        url: "/user-plan/get-active-user-plan-by-id",
        method: "POST",
        data: { user_id: user_id },
      });
      const data1 = response1.data;
      const activePlan = data1.userPlan.find(
        (entry) => entry.user_type === user_type
      );
      const validity_start = new Date(activePlan.validity_from);
      const validity_end = new Date(activePlan.validity_to);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (today >= validity_start && today <= validity_end) {
        console.log("Today is within the validity period.");
        const response = await Fetch({
          url: `/user-playlists/getAllUserPlaylists/${user_id}`,
          method: "GET",
        });
        const data = response.data;
        if (data?.length >= monthlyPlaylistLimit.playlist_config_value) {
          return -1;
        } else {
          console.log(
            "You can make ",
            monthlyPlaylistLimit.playlist_config_value - data.length,
            " more playlists this month"
          );
          return monthlyPlaylistLimit.playlist_config_value - data.length;
        }
      } else {
        console.log("Today is outside the validity period.");
        // carry forward mechanism
      }
    }
    return monthlyPlaylistLimit;
  } catch (error) {
    console.log(error);
  }
};
