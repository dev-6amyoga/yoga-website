export const TransitionEndStartingPrayerStanding = async (
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
  const filteredTransitions_all = transitions.filter(
    (transition) =>
      transition.drm_transition === drm_status &&
      transition.asana_category_start === start_category &&
      transition.asana_category_end === "Starting Prayer Standing" &&
      transition.teacher_mode === end_video.teacher_mode
  );

  const handleTransition = (transitions) => {
    return transitions
      .map((transition) => {
        const filtered = filteredTransitions_all.filter(
          (t) => t.transi === transition
        );
        return getUniqueTransition(filtered);
      })
      .filter(Boolean);
  };

  if (start_category === "Closing Prayer Sitting") {
    if (start_video.namaskara_end === true) {
      return handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
    } else {
      return handleTransition([
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
    }
  }

  if (start_category === "Closing Prayer Standing") {
    return [];
  }

  if (start_category === "Starting Prayer Sitting") {
    return handleTransition([
      "Pranayama Inhale Hands Up Exhale Down",
      "Pranayama Unlock Legs",
      "Sitting To Standing Transition",
      "Prayer Start Standing",
    ]);
  }

  if (start_category === "Starting Prayer Standing") {
    return [];
  }

  if (start_category === "Suryanamaskara Stithi") {
    return handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Prayer Start Standing",
    ]);
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    return handleTransition([
      "Suryanamaskara Non AI Non Stithi Suffix",
      "Prayer Start Standing",
    ]);
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break") {
      return handleTransition(["Prayer Start Standing"]);
    }

    if (break_status_start === "No Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Prayer Start Standing",
      ]);
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
    }
    if (break_status_start === "No Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Supine To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
    }

    if (break_status_start === "No Break") {
      return handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Prone To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
    }

    if (break_status_start === "No Break") {
      return handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      return handleTransition([
        "Vajra To Standing Transition",
        "Prayer Start Standing",
      ]);
    }
    if (break_status_start === "No Break") {
      return handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Standing Transition",
        "Prayer Start Standing",
      ]);
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
      return handleTransition([]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([]);
    }
  }

  if (start_category === "Pranayama Prayer") {
    return handleTransition([
      "Pranayama Inhale Hands Up Exhale Down",
      "Pranayama Unlock Legs",
      "Sitting To Standing Transition",
      "Prayer Start Standing",
    ]);
  }

  if (start_category === "Special") {
    return handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Prayer Start Standing",
    ]);
  }
};
