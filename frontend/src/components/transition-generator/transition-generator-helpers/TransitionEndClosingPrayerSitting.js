import { toast } from "react-toastify";

export const TransitionEndClosingPrayerSitting = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status
) => {
  if (!start_category) {
    //Feet Apart Hands Loose Standing Transition Front
    //Standing To Sitting Transition
    //Pranayama Start Sitting
  }

  const filteredTransitions_all = transitions.filter(
    (transition) =>
      transition.drm_transition === drm_status &&
      transition.asana_category_start === start_category &&
      transition.asana_category_end === "Closing Prayer Sitting" &&
      transition.teacher_mode === end_video.teacher_mode
  );

  const handleTransition = (transitions) => {
    return transitions
      .map((transition) => {
        const filtered = filteredTransitions_all.filter(
          (transitions) => transitions.transi === transition
        );
        return getUniqueTransition(filtered);
      })
      .filter(Boolean);
  };

  if (start_category === "Closing Prayer Sitting") {
    if (start_video.namaskara_end === true) {
      return [];
    } else {
      return handleTransition(["Pranayama Start Sitting"]);
    }
  }

  if (start_category === "Closing Prayer Standing") {
    return handleTransition([
      "Prayer End Standing",
      "Standing To Sitting Transition",
      "Pranayama Start Sitting",
    ]);
  }

  if (start_category === "Starting Prayer Sitting") {
    return [];
  }

  if (start_category === "Starting Prayer Standing") {
    return handleTransition([
      "Prayer End Standing",
      "Standing To Sitting Transition",
      "Pranayama Start Sitting",
    ]);
  }

  if (start_category === "Suryanamaskara Stithi") {
    return handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Standing To Sitting Transition",
      "Pranayama Start Sitting",
    ]);
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    return handleTransition([
      "Suryanamaskara Non AI Non Stithi Suffix",
      "Standing To Sitting Transition",
      "Pranayama Start Sitting",
    ]);
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Standing To Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }

    if (break_status_start === "No Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Standing To Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break") {
      return handleTransition(["Pranayama Start Sitting"]);
    }
    if (break_status_start === "No Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Supine To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }

    if (break_status_start === "No Break") {
      return handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Prone To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }

    if (break_status_start === "No Break") {
      return handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Vajra To Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }
    if (break_status_start === "No Break") {
      return handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Sitting Transition",
        "Pranayama Start Sitting",
      ]);
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
      return [];
    }
    if (break_status_end === "No Break") {
      return [];
    }
  }

  if (start_category === "Pranayama Prayer") {
    return [];
  }

  if (start_category === "Special") {
    return handleTransition([
      "Feet Apart Hands Back Sitting Transition",
      "Pranayama Start Sitting",
    ]);
  }
};
