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

export const TransitionEndProne = async (
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
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }
  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end) {
        let res = handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      } else {
        let res = handleTransition([
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end) {
        let res = handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
          "Arms Straight Feet Together Prone Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      } else {
        let res = handleTransition([
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Prone Transition",
          "Arms Straight Feet Together Prone Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      let res = handleTransition(["Supine To Prone Transition"]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Supine To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return [];
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let res = handleTransition(["Arms Down Feet Apart Supine Transition"]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return [];
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      let res = handleTransition(["Vajra To Prone Transition"]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Vajra To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Prone Transition",
        "Arms Straight Feet Together Prone Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
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
      let res = handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      let res = handleTransition(["Arms Down Feet Apart Supine Transition"]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }
};
