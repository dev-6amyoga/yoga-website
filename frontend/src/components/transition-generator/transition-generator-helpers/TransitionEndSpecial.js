export const TransitionEndSpecial = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status
) => {
  if (!start_category) {
    return [];
  }

  if (start_category === "Closing Prayer Sitting") {
    return [];
  }

  if (start_category === "Closing Prayer Standing") {
    return [];
  }

  if (start_category === "Starting Prayer Sitting") {
    return [];
  }

  if (start_category === "Starting Prayer Standing") {
    return [];
  }

  if (start_category === "Suryanamaskara Stithi") {
    return [];
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    return [];
  }

  if (start_category === "Standing") {
    return [];
  }

  if (start_category === "Sitting") {
    return [];
  }

  if (start_category === "Supine") {
    return [];
  }

  if (start_category === "Prone") {
    return [];
  }

  if (start_category === "Vajrasana") {
    return [];
  }

  if (start_category === "Pranayama") {
    return [];
  }

  if (start_category === "Pranayama Prayer") {
    return [];
  }

  if (start_category === "Special") {
    return [];
  }
};
