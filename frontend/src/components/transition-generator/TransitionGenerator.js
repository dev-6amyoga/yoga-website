import { Fetch } from "../../utils/Fetch";

const fetchAsanaData = async (asana_id) => {
  try {
    const response = await Fetch({
      url: "/content/get-asana-by-id",
      method: "POST",
      data: {
        asana_id: asana_id,
      },
    });

    if (response?.status === 200) {
      return response.data;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const transitionGenerator = async (startId, endVideo) => {
  if (startId) {
    try {
      const prevAsana = await fetchAsanaData(startId);
      console.log(prevAsana);
      console.log(
        "Transition function called with:",
        prevAsana.asana_name,
        endVideo.asana_name
      );
    } catch (err) {
      console.log("Error fetching previous asana:", err);
    }
  } else {
    // first video
  }
};
