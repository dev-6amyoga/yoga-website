export const TransitionEndStanding = async (
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
      transition.asana_category_end === "Standing" &&
      transition.teacher_mode === end_video.teacher_mode
  );

  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end === true) {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name === "Prayer Sitting Namaskara Unlock"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) => transition.transition_name === "Pranayama Unlock Legs"
        );
        const transition_3 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name === "Sitting To Standing Transition"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        let t3 = getUniqueTransition(transition_3);
        const result = [t1, t2, t3].filter(Boolean);
        return result;
      } else {
        const transition_1 = filteredTransitions_all.filter(
          (transition) => transition.transition_name === "Pranayama Unlock Legs"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name === "Sitting To Standing Transition"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        const result = [t1, t2].filter(Boolean);
        return result;
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name === "Prayer Sitting Namaskara Unlock"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) => transition.transition_name === "Pranayama Unlock Legs"
        );
        const transition_3 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name === "Sitting To Standing Transition"
        );
        const transition_4 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name ===
            "Feet Together Hands Tight Standing Transition Front"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        let t3 = getUniqueTransition(transition_3);
        let t4 = getUniqueTransition(transition_4);
        const result = [t1, t2, t3, t4].filter(Boolean);
        return result;
      } else {
        const transition_1 = filteredTransitions_all.filter(
          (transition) => transition.transition_name === "Pranayama Unlock Legs"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name === "Sitting To Standing Transition"
        );
        const transition_3 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_name ===
            "Feet Together Hands Tight Standing Transition Front"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        let t3 = getUniqueTransition(transition_3);
        const result = [t1, t2, t3].filter(Boolean);
        return result;
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Prayer End Standing"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Prayer End Standing"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Pranayama Inhale Hands Up Exhale Down"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Pranayama Unlock Legs"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Pranayama Inhale Hands Up Exhale Down"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Pranayama Unlock Legs"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [t1, t2, t3, t4].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Prayer End Standing"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Prayer End Standing"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Suryanamaskara Non AI Non Stithi Suffix"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Suryanamaskara Non AI Non Stithi Suffix"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return [];
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return [];
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Back Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Back Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Supine To Standing Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Supine To Standing Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Arms Down Feet Apart Supine Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Supine To Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Arms Down Feet Apart Supine Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Supine To Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [t1, t2, t3, t4].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Prone To Standing Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Prone To Standing Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Fold Hands Feet Apart Prone Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Prone To Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Fold Hands Feet Apart Prone Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Prone To Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Turn Mat Side To Front Standing Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [t1, t2, t3, t4].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Vajra To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Vajra To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Vajrasana Dyanmudra To Relax Position"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Vajra To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Vajrasana Dyanmudra To Relax Position"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Vajra To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [t1, t2, t3, t4].filter(Boolean);
      return result;
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
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Pranayama Inhale Hands Up Exhale Down"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Pranayama Unlock Legs"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [t1, t2, t3].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Pranayama Inhale Hands Up Exhale Down"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) => transition.transition_name === "Pranayama Unlock Legs"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name === "Sitting To Standing Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [t1, t2, t3, t4].filter(Boolean);
      return result;
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [t1].filter(Boolean);
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_name ===
          "Feet Together Hands Tight Standing Transition Front"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [t1, t2].filter(Boolean);
      return result;
    }
  }
};
