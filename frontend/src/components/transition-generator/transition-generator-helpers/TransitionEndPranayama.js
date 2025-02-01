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

export const TransitionEndPranayama = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status,
  transitions
) => {
  const pranayamaFinder = (pranayama, filteredTransitions_all) => {
    if (pranayama.vibhagiya) {
      if (pranayama.vibhagiya === "Abdomen") {
        // is vibhagiya Abdomen
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
        res = res.filter(
          (transition) =>
            !transition.transition_video_name.toLowerCase().includes("unlock")
        );
        return res;
      }
      if (pranayama.vibhagiya === "Clavicular") {
        // is vibhagiya Clavicular
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
        res = res.filter(
          (transition) =>
            !transition.transition_video_name.toLowerCase().includes("unlock")
        );
        return res;
      }
      if (pranayama.vibhagiya === "Thoracic") {
        // is vibhagiya Thoracic
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
        res = res.filter(
          (transition) =>
            !transition.transition_video_name.toLowerCase().includes("unlock")
        );
        return res;
      }
      if (pranayama.vibhagiya === "Final") {
        // is vibhagiya Final
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
        res = res.filter(
          (transition) =>
            !transition.transition_video_name.toLowerCase().includes("unlock")
        );
        return res;
      }
    } else {
      if (pranayama.omkara) {
        console.log(filteredTransitions_all);
        let res = [];
        for (var i = 0; i !== filteredTransitions_all.length; i++) {
          if (filteredTransitions_all[i]) {
            let transition_ind = filteredTransitions_all[i];
            // console.log(transition_ind);
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
        return res;
      } else {
        if (pranayama.nose_lock_start && pranayama.nose_lock_end) {
          console.log("in nasika");
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
          res = res
            .filter(
              (transition) =>
                !transition.transition_video_name
                  .toLowerCase()
                  .includes("unlock")
            )
            .filter(
              (transition) =>
                !transition.transition_video_name
                  .toLowerCase()
                  .includes("prenatal")
            );
          console.log(res);
          return res;
        } else {
          if (pranayama.chin_lock_start && pranayama.chin_lock_end) {
            // add ujjayi lock and unlock
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
            res = res.filter(
              (transition) =>
                !transition.transition_video_name
                  .toLowerCase()
                  .includes("unlock")
            );
            return res;
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
              res = res.filter(
                (transition) =>
                  !transition.transition_video_name
                    .toLowerCase()
                    .includes("unlock")
              );
              return res;
            } else {
              // return nothing
              console.log("nothing");
              return [];
            }
          }
        }
      }
    }
  };

  if (!start_category) {
    const filteredTransitions = transitions.filter(
      (transition) =>
        transition.drm_transition === drm_status &&
        transition.asana_category_end === "Pranayama" &&
        transition.teacher_mode === end_video.teacher_mode
    );
    const transition_1 = filteredTransitions.filter(
      (transition) => transition.transition_video_name === "Pranayama Legs Lock"
    );
    let pending_1 = getUniqueTransition(transition_1);
    let pending_2 = pranayamaFinder(end_video, filteredTransitions);
    const transitionIds = pending_2.map(
      (transition) => transition.transition_id
    );
    let result = [];
    if (pending_1) {
      result.push(pending_1.transition_id);
    }
    if (transitionIds) {
      result.push(...transitionIds);
    }
    return result;
  }

  const filteredTransitions_all = transitions.filter(
    (transition) =>
      transition.drm_transition === drm_status &&
      //   transition.asana_category_start === start_category &&
      // transition.asana_category_end === "Pranayama" &&
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

  if (start_category === "Closing Prayer Sitting") {
    const filteredTransitions = transitions.filter(
      (transition) =>
        transition.drm_transition === drm_status &&
        transition.asana_category_end === "Pranayama" &&
        transition.teacher_mode === end_video.teacher_mode
    );
    let pending_2 = pranayamaFinder(end_video, filteredTransitions);
    if (start_video.namaskara_end === true) {
      let pending_1 = handleTransition(["Prayer Sitting Namaskara Unlock"]);
      let new_res = [...pending_2, ...pending_1];
      new_res = new_res.filter((element) => element !== undefined);
      new_res = new_res.map((transition) => transition.transition_id);
      return new_res;
    } else {
      let new_res = [...pending_2];
      new_res = new_res.filter((element) => element !== undefined);
      new_res = new_res.map((transition) => transition.transition_id);
      return new_res;
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
    if (break_status_start === "Break") {
      if (start_video.mat_ending_position === "Side") {
        let res = handleTransition([
          "Turn Mat Side To Front Sitting Transition",
          "Pranayama Start Sitting",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        console.log(res);
        return res;
      } else {
        let res = handleTransition(["Pranayama Start Sitting"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }

    if (break_status_start === "No Break") {
      if (start_video.mat_ending_position === "Side") {
        let res = handleTransition([
          "Feet Apart Hands Back Sitting Transition",
          "Turn Mat Side To Front Sitting Transition",
          "Pranayama Start Sitting",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      } else {
        let res = handleTransition([
          "Feet Apart Hands Back Sitting Transition",
          "Pranayama Start Sitting",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      let res = handleTransition([
        "Supine To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
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
        "Prone To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      let res = handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone Breath After Asana",
        "Prone To Sitting Transition",
        "Turn Mat Side To Front Sitting Transition",
        "Pranayama Start Sitting",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      let res = handleTransition([
        "Vajra To Sitting Transition",
        "Pranayama Start Sitting",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break") {
      let transitions = [];
      if (start_video.vajra_side === true) {
        transitions.push("Vajrasana Dyanmudra To Relax Position Side");
      } else {
        transitions.push("Vajrasana Dyanmudra To Relax Position Front");
      }
      transitions.push(
        "Vajra To Sitting Transition",
        "Pranayama Start Sitting"
      );
      let res = handleTransition(transitions);
      res = res
        .map((transition) => transition.transition_id)
        .filter((id) => id !== undefined);
      return res;
    }
  }

  if (start_category === "Pranayama") {
    const filteredTransitions_all = transitions.filter(
      (transition) =>
        transition.drm_transition === drm_status &&
        transition.teacher_mode === end_video.teacher_mode
    );
    if (start_video.id === end_video.id) {
      return [];
    }
    let pending_2 = pranayamaFinder(end_video, filteredTransitions_all);
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
      if (start_video.omkara) {
        let res = [];
        // for (var i = 0; i !== filteredTransitions_all.length; i++) {
        //   if (filteredTransitions_all[i]) {
        //     let transition_ind = filteredTransitions_all[i];
        //     if (
        //       transition_ind.transition_video_name
        //         .toLowerCase()
        //         .indexOf("om") !== -1 &&
        //       transition_ind.transition_video_name
        //         .toLowerCase()
        //         .indexOf("chanting") !== -1
        //     ) {
        //       res.push(transition_ind);
        //     }
        //   }
        // }
        let new_res = [...res];
        new_res = new_res.filter((element) => element !== undefined);
        new_res = new_res.map((transition) => transition.transition_id);
        return new_res;
      } else {
        if (start_video.nose_lock_end && end_video.nose_lock_start) {
          return [];
        }
        if (start_video.nose_lock_start && start_video.nose_lock_end) {
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
          res = res
            .filter((transition) =>
              transition.transition_video_name.toLowerCase().includes("unlock")
            )
            .filter(
              (transition) =>
                !transition.transition_video_name
                  .toLowerCase()
                  .includes("prenatal")
            );

          let new_res = [...res, ...pending_2];
          new_res = new_res.filter((element) => element !== undefined);
          new_res = new_res.map((transition) => transition.transition_id);

          return new_res;
        } else {
          if (start_video.chin_lock_start && start_video.chin_lock_end) {
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
          } else {
            if (start_video.shanmuga_start && start_video.shanmuga_end) {
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
              new_res = new_res.map((transition) => transition.transition_id);
              return new_res;
            } else {
              let new_res = [...pending_2];
              console.log(new_res);
              new_res = new_res.filter((element) => element !== undefined);
              new_res = new_res.map((transition) => transition.transition_id);
              return new_res;
            }
          }
        }
      }
    }
  }

  if (start_category === "Pranayama Prayer") {
    const filteredTransitions = transitions.filter(
      (transition) =>
        transition.drm_transition === drm_status &&
        transition.teacher_mode === end_video.teacher_mode
    );
    const transition_1 = filteredTransitions.filter(
      (transition) =>
        transition.transition_video_name ===
        "Pranayama Inhale Hands Up Exhale Down"
    );
    console.log(transition_1);
    let t1 = getUniqueTransition(transition_1);
    console.log(t1);
    let pending_2 = pranayamaFinder(end_video, filteredTransitions);
    console.log(pending_2);
    const result = [];
    if (t1) {
      result.push(t1);
    }
    console.log(t1);
    let new_res = [...result, ...pending_2];
    new_res = new_res.filter((element) => element !== undefined);
    new_res = new_res.map((transition) => transition.transition_id);
    return new_res;
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
