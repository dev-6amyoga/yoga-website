const getUniqueTransition = (transition_1) => {
  let highestTransition_1;
  if (transition_1.length > 0) {
    highestTransition_1 = transition_1.reduce((max, current) => {
      const maxId = parseInt(max.transition_id.split("_")[1]);
      const currentId = parseInt(current.transition_id.split("_")[1]);
      return currentId > maxId ? current : max;
    });
  } else {
    highestTransition_1 = transition_1;
  }
  return highestTransition_1;
};

export const TransitionEndVajrasana = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status,
  transitions
) => {
  const filteredTransitions_all = transitions.filter(
    (transition) =>
      transition.drm_transition === drm_status &&
      transition.teacher_mode === end_video.teacher_mode
  );

  const handleTransition = (transitions) => {
    return transitions
      .map((transition) => {
        const filtered = filteredTransitions_all.filter(
          (transitions) => transitions.transition_video_name === transition
        );
        return getUniqueTransition(filtered);
      })
      .filter(Boolean);
  };

  if (!start_category) {
    if (break_status_end) {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    } else {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Vajra Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end === true) {
        return handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Sitting To Vajra Transition",
        ]);
      } else {
        return handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Vajra Transition",
        ]);
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        return handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Sitting To Vajra Transition",
          "Vajrasana Relax To Dyanmudra Position",
        ]);
      } else {
        return handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Vajra Transition",
          "Vajrasana Relax To Dyanmudra Position",
        ]);
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Prayer End Standing",
        "Standing To Vajra Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Prayer End Standing",
        "Standing To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Prayer End Standing",
        "Standing To Vajra Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      return handleTransition([
        "Prayer End Standing",
        "Standing To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Standing To Vajra Transition",
      ]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Standing To Vajra Transition",
      ]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition(["Standing To Vajra Transition"]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Standing To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Standing To Vajra Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Standing To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition(["Sitting To Vajra Transition"]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Vajra Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition(["Supine To Vajra Transition"]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Supine To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Vajra Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return handleTransition(["Prone To Vajra Transition"]);
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition([
        "Prone To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone To Vajra Transition",
      ]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      // Handle this case if needed
      return [];
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      return handleTransition(["Vajrasana Relax To Dyanmudra Position"]);
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      return handleTransition(["Vajrasana Dyanmudra To Relax Position"]);
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      // Handle this case if needed
      return [];
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
      // Handle Break state for Pranayama if needed
      return [];
    }

    if (break_status_end === "No Break") {
      // Handle No Break state for Pranayama if needed
      return [];
    }
  }

  if (start_category === "Pranayama Prayer") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Sitting To Vajra Transition",
      ]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Vajra Transition",
      ]);
    }

    if (break_status_end === "No Break") {
      return handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Vajra Transition",
        "Vajrasana Relax To Dyanmudra Position",
      ]);
    }
  }
};
