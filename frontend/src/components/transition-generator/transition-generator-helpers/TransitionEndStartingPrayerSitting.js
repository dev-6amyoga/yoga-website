export const TransitionEndStartingPrayerSitting = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status
) => {
  if (!start_category) {
    // first video
  }
  if (start_category === "Closing Prayer Sitting") {
    if (start_video.namaskara_end === true) {
      //nothing
    } else {
      //Pranayama Start Sitting
    }
  }

  if (start_category === "Closing Prayer Standing") {
    //Prayer End Standing
    //Standing To Sitting Transition
    //Pranayama Start Sitting
  }

  if (start_category === "Starting Prayer Sitting") {
    //nothing
  }

  if (start_category === "Starting Prayer Standing") {
    //Prayer End Standing
    //Standing To Sitting Transition
    //Pranayama Start Sitting
  }

  if (start_category === "Suryanamaskara Stithi") {
    //Feet Apart Hands Loose Standing Transition Front
    //Standing To Sitting Transition
    //Pranayama Start Sitting
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    //Suryanamaskara Non AI Non Stithi Suffix
    //Standing To Sitting Transition
    //Pranayama Start Sitting
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break") {
      //Standing To Sitting Transition
      //Pranayama Start Sitting
    }

    if (break_status_start === "No Break") {
      //Feet Apart Hands Loose Standing Transition Front
      //Standing To Sitting Transition
      //Pranayama Start Sitting
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break") {
      //Pranayama Start Sitting
    }
    if (break_status_start === "No Break") {
      //Feet Apart Hands Back Sitting Transition
      //Pranayama Start Sitting
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      //Supine To Sitting Transition
      //Turn Mat Side To Front Sitting Transition
      //Pranayama Start Sitting
    }

    if (break_status_start === "No Break") {
      //Arms Down Feet Apart Supine Transition
      //Supine To Sitting Transition
      //Turn Mat Side To Front Sitting Transition
      //Pranayama Start Sitting
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break") {
      //Prone To Sitting Transition
      //Turn Mat Side To Front Sitting Transition
      //Pranayama Start Sitting
    }

    if (break_status_start === "No Break") {
      //Fold Hands Feet Apart Prone Transition
      //Prone To Sitting Transition
      //Turn Mat Side To Front Sitting Transition
      //Pranayama Start Sitting
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      // Vajra To Sitting Transition
      //Pranayama Start Sitting
    }
    if (break_status_start === "No Break") {
      // Vajrasana Dyanmudra To Relax Position
      // Vajra To Sitting Transition
      //Pranayama Start Sitting
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
    }

    if (break_status_end === "No Break") {
    }
  }

  if (start_category === "Pranayama Prayer") {
    //nothing
  }

  if (start_category === "Special") {
    //Feet Apart Hands Back Sitting Transition
    //Pranayama Start Sitting
  }
};
