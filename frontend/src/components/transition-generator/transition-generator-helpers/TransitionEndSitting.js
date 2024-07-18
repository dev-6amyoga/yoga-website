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
    if (break_status_end) {
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
