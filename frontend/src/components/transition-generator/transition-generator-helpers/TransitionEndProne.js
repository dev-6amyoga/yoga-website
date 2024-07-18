export const TransitionEndProne = async (
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
      transition.asana_category_end === "Prone" &&
      transition.teacher_mode === end_video.teacher_mode
  );

  const handleTransition = (names) => {
    return names
      .map((name) => {
        const filtered = filteredTransitions_all.filter(
          (transition) => transition.transition_name === name
        );
        return getUniqueTransition(filtered);
      })
      .filter(Boolean);
  };

  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end) {
        return handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
        ]);
      } else {
        return handleTransition([
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
        ]);
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end) {
        return handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
          "Arms Straight Feet Together Prone Transition",
        ]);
      } else {
        return handleTransition([
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
          "Arms Straight Feet Together Prone Transition",
        ]);
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition([
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition([
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition(["Supine To Prone Transition"]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Supine To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return [];
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition(["Arms Straight Feet Together Prone Transition"]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition(["Arms Down Feet Apart Supine Transition"]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return [];
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition(["Vajra To Prone Transition"]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Vajra To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Prone Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
      // Handle Break state for Pranayama if needed
    }

    if (break_status_end === "No Break") {
      // Handle No Break state for Pranayama if needed
    }
  }

  if (start_category === "Pranayama Prayer") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
      ]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      return handleTransition(["Arms Down Feet Apart Supine Transition"]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([
        "Arms Overhead Feet Together Supine Transition",
      ]);
    }
  }
};
