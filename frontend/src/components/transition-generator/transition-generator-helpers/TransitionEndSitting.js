import { toast } from "react-toastify";

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

export const TransitionEndSitting = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status,
  transitions
) => {
  if (!start_category) {
    const filteredTransitions = transitions.filter(
      (transition) =>
        transition.drm_transition === drm_status &&
        transition.asana_category_start === "Sitting" &&
        transition.asana_category_end === "Sitting" &&
        transition.teacher_mode === end_video.teacher_mode
    );
    const transition_1 = filteredTransitions.filter(
      (transition) =>
        transition.transition_video_name === "Sitting Position Transition"
    );
    let t2 = null;
    if (break_status_end === "No Break") {
      const transition_2 = filteredTransitions.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      t2 = getUniqueTransition(transition_2);
    }
    let t1 = null;
    t1 = getUniqueTransition(transition_1);
    const result = [];
    if (t1) {
      result.push(t1.transition_id);
    }
    if (t2) {
      result.push(t2.transition_id);
    }
    console.log(result);
    return result;
  }

  const filteredTransitions_all = transitions.filter(
    (transition) =>
      transition.drm_transition === drm_status &&
      transition.asana_category_end === "Sitting" &&
      transition.teacher_mode === end_video.teacher_mode
  );

  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end === true) {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Prayer Sitting Namaskara Unlock"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        if (t2) {
          result.push(t2);
        }
        return result;
      } else {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        let t1 = getUniqueTransition(transition_1);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        return result;
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Prayer Sitting Namaskara Unlock"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        const transition_3 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Feet Together Hands Side Sitting Transition"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        let t3 = getUniqueTransition(transition_3);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        if (t2) {
          result.push(t2);
        }
        if (t3) {
          result.push(t3);
        }
        return result;
      } else {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Feet Together Hands Side Sitting Transition"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        if (t2) {
          result.push(t2);
        }
        return result;
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Prayer End Standing"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Prayer End Standing"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end === true) {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Prayer Sitting Namaskara Unlock"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        if (t2) {
          result.push(t2);
        }
        return result;
      } else {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        let t1 = getUniqueTransition(transition_1);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        return result;
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Prayer Sitting Namaskara Unlock"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        const transition_3 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Feet Together Hands Side Sitting Transition"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        let t3 = getUniqueTransition(transition_3);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        if (t2) {
          result.push(t2);
        }
        if (t3) {
          result.push(t3);
        }
        return result;
      } else {
        const transition_1 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name === "Pranayama Unlock Legs"
        );
        const transition_2 = filteredTransitions_all.filter(
          (transition) =>
            transition.transition_video_name ===
            "Feet Together Hands Side Sitting Transition"
        );
        let t1 = getUniqueTransition(transition_1);
        let t2 = getUniqueTransition(transition_2);
        const result = [];
        if (t1) {
          result.push(t1);
        }
        if (t2) {
          result.push(t2);
        }
        return result;
      }
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Prayer End Standing"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Prayer End Standing"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Suryanamaskara Non AI Non Stithi Suffix"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Suryanamaskara Non AI Non Stithi Suffix"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Loose Standing Transition Front"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Standing To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return [];
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Back Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      return [];
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Supine To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Supine To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Arms Down Feet Apart Supine Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Supine To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Arms Down Feet Apart Supine Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Supine To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      if (t4) {
        result.push(t4);
      }
      return result;
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Prone To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Prone To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Fold Hands Feet Apart Prone Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Supine To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Fold Hands Feet Apart Prone Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Supine To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Turn Mat Side To Front Sitting Transition"
      );
      const transition_4 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      let t4 = getUniqueTransition(transition_4);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      if (t4) {
        result.push(t4);
      }
      return result;
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Vajra To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      return result;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Vajra To Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Vajrasana Dyanmudra To Relax Position"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Vajra To Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Vajrasana Dyanmudra To Relax Position"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Vajra To Sitting Transition"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Pranayama") {
    let res1;
    if (break_status_end === "Break") {
      res1 = handleTransition(["Pranayama Unlock Legs"]);
    }
    if (break_status_end === "No Break") {
      res1 = handleTransition([
        "Pranayama Unlock Legs",
        "Feet Together Hands Side Sitting Transition",
      ]);
    }
    const pending_2 = res1;
    if (start_video.vibhagiya) {
      if (start_video.vibhagiya === "Abdomen") {
        let res = [];
        for (var i = 0; i !== filteredTransitions_all.length; i++) {
          let transition_ind = filteredTransitions_all[i];
          if (
            transition_ind.transition_video_name
              .toLowerCase()
              .indexOf("stomach") !== -1
          ) {
            res.push(transition_ind);
          }
        }
        res = res.filter((transition) =>
          transition.transition_video_name.toLowerCase().includes("unlock")
        );
        let new_res = [...res, ...pending_2];
        new_res = new_res.filter((element) => element !== undefined);
        new_res = new_res.map((transition) => transition.transition_id);
        return new_res;
      }
      if (start_video.vibhagiya === "Clavicular") {
        let res = [];
        for (var i = 0; i !== filteredTransitions_all.length; i++) {
          let transition_ind = filteredTransitions_all[i];
          if (
            transition_ind.transition_video_name
              .toLowerCase()
              .indexOf("clavicular") !== -1
          ) {
            res.push(transition_ind);
          }
        }
        res = res.filter((transition) =>
          transition.transition_video_name.toLowerCase().includes("unlock")
        );
        let new_res = [...res, ...pending_2];
        new_res = new_res.filter((element) => element !== undefined);
        new_res = new_res.map((transition) => transition.transition_id);
        return new_res;
      }
      if (start_video.vibhagiya === "Thoracic") {
        let res = [];
        for (var i = 0; i !== filteredTransitions_all.length; i++) {
          let transition_ind = filteredTransitions_all[i];
          if (
            transition_ind.transition_video_name
              .toLowerCase()
              .indexOf("thoracic") !== -1
          ) {
            res.push(transition_ind);
          }
        }
        res = res.filter((transition) =>
          transition.transition_video_name.toLowerCase().includes("unlock")
        );
        let new_res = [...res, ...pending_2];
        new_res = new_res.filter((element) => element !== undefined);
        new_res = new_res.map((transition) => transition.transition_id);
        return new_res;
      }
      if (start_video.vibhagiya === "Final") {
        let res = [];
        for (var i = 0; i !== filteredTransitions_all.length; i++) {
          let transition_ind = filteredTransitions_all[i];
          if (
            transition_ind.transition_video_name
              .toLowerCase()
              .indexOf("jalandhara") !== -1
          ) {
            res.push(transition_ind);
          }
        }
        res = res.filter((transition) =>
          transition.transition_video_name.toLowerCase().includes("unlock")
        );
        let new_res = [...res, ...pending_2];
        new_res = new_res.filter((element) => element !== undefined);
        new_res = new_res.map((transition) => transition.transition_id);
        return new_res;
      }
    } else {
      if (pranayama.omkara) {
        let res = [];
        for (var i = 0; i !== filteredTransitions_all.length; i++) {
          if (filteredTransitions_all[i]) {
            let transition_ind = filteredTransitions_all[i];
            if (
              transition_ind.transition_video_name
                .toLowerCase()
                .indexOf("om") !== -1 &&
              transition_ind.transition_video_name
                .toLowerCase()
                .indexOf("chanting") !== -1
            ) {
              res.push(transition_ind);
            }
          }
        }
        let new_res = [...res, ...pending_2];
        new_res = new_res.filter((element) => element !== undefined);
        return new_res;
      } else {
        if (pranayama.nose_lock_start && pranayama.nose_lock_end) {
          let res = [];
          for (var i = 0; i !== filteredTransitions_all.length; i++) {
            let transition_ind = filteredTransitions_all[i];
            if (
              transition_ind.transition_video_name
                .toLowerCase()
                .indexOf("nasika") !== -1
            ) {
              res.push(transition_ind);
            }
          }
          res = res.filter((transition) =>
            transition.transition_video_name.toLowerCase().includes("unlock")
          );
          let new_res = [...res, ...pending_2];
          new_res = new_res.filter((element) => element !== undefined);
          return new_res;
        } else {
          if (pranayama.chin_lock_start && pranayama.chin_lock_end) {
            let res = [];
            for (var i = 0; i !== filteredTransitions_all.length; i++) {
              let transition_ind = filteredTransitions_all[i];
              if (
                transition_ind.transition_video_name
                  .toLowerCase()
                  .indexOf("jalandhara") !== -1
              ) {
                res.push(transition_ind);
              }
            }
            res = res.filter((transition) =>
              transition.transition_video_name.toLowerCase().includes("unlock")
            );
            let new_res = [...res, ...pending_2];
            new_res = new_res.filter((element) => element !== undefined);
            return new_res;
          } else {
            if (pranayama.shanmuga_start && pranayama.shanmuga_end) {
              // add bhramari lock and unlock
              let res = [];
              for (var i = 0; i !== filteredTransitions_all.length; i++) {
                let transition_ind = filteredTransitions_all[i];
                if (
                  transition_ind.transition_video_name
                    .toLowerCase()
                    .indexOf("bhramari") !== -1
                ) {
                  res.push(transition_ind);
                }
              }
              res = res.filter((transition) =>
                transition.transition_video_name
                  .toLowerCase()
                  .includes("unlock")
              );
              let new_res = [...res, ...pending_2];
              new_res = new_res.filter((element) => element !== undefined);
              return new_res;
            } else {
              let new_res = [...pending_2];
              new_res = new_res.filter((element) => element !== undefined);
              return new_res;
            }
          }
        }
      }
    }
  }

  if (start_category === "Pranayama Prayer") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Pranayama Inhale Hands Up Exhale Down"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Pranayama Unlock Legs"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Pranayama Inhale Hands Up Exhale Down"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name === "Pranayama Unlock Legs"
      );
      const transition_3 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      let t3 = getUniqueTransition(transition_3);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      if (t3) {
        result.push(t3);
      }
      return result;
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Back Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      return result;
    }

    if (break_status_end === "No Break") {
      const transition_1 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Apart Hands Back Sitting Transition"
      );
      const transition_2 = filteredTransitions_all.filter(
        (transition) =>
          transition.transition_video_name ===
          "Feet Together Hands Side Sitting Transition"
      );
      let t1 = getUniqueTransition(transition_1);
      let t2 = getUniqueTransition(transition_2);
      const result = [];
      if (t1) {
        result.push(t1);
      }
      if (t2) {
        result.push(t2);
      }
      return result;
    }
  }
};
