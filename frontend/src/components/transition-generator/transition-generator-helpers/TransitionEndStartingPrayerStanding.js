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
export const TransitionEndStartingPrayerStanding = async (
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
    let res = handleTransition([
      "Standing Position Transition",
      "Prayer Start Standing",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Closing Prayer Sitting") {
    if (start_video.namaskara_end === true) {
      let res = handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    } else {
      let res = handleTransition([
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Closing Prayer Standing") {
    return [];
  }

  if (start_category === "Starting Prayer Sitting") {
    let res = handleTransition([
      "Pranayama Inhale Hands Up Exhale Down",
      "Pranayama Unlock Legs",
      "Sitting To Standing Transition",
      "Prayer Start Standing",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Starting Prayer Standing") {
    return [];
  }

  if (start_category === "Suryanamaskara Stithi") {
    let res = handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    let res = handleTransition([
      "Suryanamaskara Non AI Non Stithi Suffix",
      "Prayer Start Standing",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break") {
      let res = handleTransition(["Prayer Start Standing"]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break") {
      let res = handleTransition([
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Sitting To Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      let res = handleTransition([
        "Supine To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break") {
      let res = handleTransition([
        "Prone Breath After Asana",
        "Prone To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone Breath After Asana",
        "Prone To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      let res = handleTransition([
        "Vajra To Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Vajrasana Dyanmudra To Relax Position",
        "Vajra To Standing Transition",
        "Prayer Start Standing",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
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
    let res = handleTransition([
      "Pranayama Inhale Hands Up Exhale Down",
      "Pranayama Unlock Legs",
      "Sitting To Standing Transition",
      "Prayer Start Standing",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Special") {
    let res = handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Prayer Start Standing",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }
};
