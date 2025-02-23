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

export const TransitionEndSuryanamaskaraNonStithi = async (
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
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Closing Prayer Sitting") {
    if (start_video.namaskara_end === true) {
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Prayer Sitting Namaskara Unlock",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Prayer Sitting Namaskara Unlock",
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    } else {
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Prayer End Standing",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Prayer End Standing",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Starting Prayer Sitting") {
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Pranayama Inhale Hands Up Exhale Down",
      "Pranayama Unlock Legs",
      "Sitting To Standing Transition",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Starting Prayer Standing") {
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Prayer End Standing",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Prayer End Standing",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    return [];
  }

  if (start_category === "Standing") {
    let transitions = [];
    if (start_video.mat_ending_position === "Side") {
      transitions.push("Turn Mat Side To Front Standing Transition");
    }
    if (break_status_start === "No Break") {
      transitions.push("Feet Apart Hands Loose Standing Transition Front");
    }
    if (end_video.vinyasa_suryanamaskara === true) {
      transitions.push(
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix"
      );
    } else {
      transitions.push(
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix"
      );
    }
    let res = handleTransition(transitions);
    res = res
      .map((transition) => transition.transition_id)
      .filter((id) => id !== undefined);
    return res;
  }

  if (start_category === "Sitting") {
    let transitions = [];
    if (start_video.mat_ending_position === "Side") {
      transitions.push("Turn Mat Side To Front Sitting Transition");
    }
    if (break_status_start === "No Break") {
      transitions.push("Feet Apart Hands Back Sitting Transition");
    }
    if (end_video.vinyasa_suryanamaskara === true) {
      transitions.push(
        "Sitting To Standing Transition",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix"
      );
    } else {
      transitions.push(
        "Sitting To Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix"
      );
    }

    let res = handleTransition(transitions);
    res = res
      .map((transition) => transition.transition_id)
      .filter((id) => id !== undefined);
    return res;
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Supine To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Arms Down Feet Apart Supine Transition",
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Arms Down Feet Apart Supine Transition",
        "Supine To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break") {
      if (start_video.prone_breath === false) {
        if (end_video.vinyasa_suryanamaskara === true) {
          let res = handleTransition([
            "Prone To Standing Transition",
            "Turn Mat Side To Front Standing Transition",
            "Feet Together Hands Tight Standing Transition Front",
            "Suryanamaskara Non AI Non Stithi Prefix",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Suryanamaskara Preparation And Mantra Non Stithi",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Prone Breath After Asana",
        "Prone To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }

    if (break_status_start === "No Break") {
      if (start_video.prone_breath === false) {
        if (end_video.vinyasa_suryanamaskara === true) {
          let res = handleTransition([
            "Fold Hands Feet Apart Prone Transition",
            "Prone To Standing Transition",
            "Turn Mat Side To Front Standing Transition",
            "Feet Together Hands Tight Standing Transition Front",
            "Suryanamaskara Non AI Non Stithi Prefix",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Suryanamaskara Preparation And Mantra Non Stithi",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone Breath After Asana",
        "Prone To Standing Transition",
        "Turn Mat Side To Front Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      if (end_video.vinyasa_suryanamaskara === true) {
        let res = handleTransition([
          "Vajra To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Vajra To Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
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
      if (end_video.vinyasa_suryanamaskara === true) {
        transitions.push(
          "Vajra To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
          "Suryanamaskara Non AI Non Stithi Prefix"
        );
      } else {
        transitions.push(
          "Vajra To Standing Transition",
          "Suryanamaskara Preparation And Mantra Non Stithi",
          "Suryanamaskara Non AI Non Stithi Prefix"
        );
      }
      transitions.push(
        "Vajra To Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix"
      );
      let res = handleTransition(transitions);
      res = res
        .map((transition) => transition.transition_id)
        .filter((id) => id !== undefined);
      return res;
    }
  }

  if (start_category === "Pranayama") {
    let res1 = [];
    if (end_video.vinyasa_suryanamaskara === true) {
      res1 = handleTransition([
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
    } else {
      res1 = handleTransition([
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Suryanamaskara Preparation And Mantra Non Stithi",
        "Suryanamaskara Non AI Non Stithi Prefix",
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
      if (start_video.omkara) {
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
          res = res.filter((transition) =>
            transition.transition_video_name.toLowerCase().includes("unlock")
          );
          let new_res = [...res, ...pending_2];
          new_res = new_res.filter((element) => element !== undefined);
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
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Pranayama Inhale Hands Up Exhale Down",
        "Pranayama Unlock Legs",
        "Sitting To Standing Transition",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Pranayama Inhale Hands Up Exhale Down",
      "Pranayama Unlock Legs",
      "Sitting To Standing Transition",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }

  if (start_category === "Special") {
    if (end_video.vinyasa_suryanamaskara === true) {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Feet Together Hands Tight Standing Transition Front",
        "Suryanamaskara Non AI Non Stithi Prefix",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    let res = handleTransition([
      "Feet Apart Hands Loose Standing Transition Front",
      "Suryanamaskara Preparation And Mantra Non Stithi",
      "Suryanamaskara Non AI Non Stithi Prefix",
    ]);
    res = res.map((transition) => transition.transition_id);
    res = res.filter((element) => element !== undefined);
    return res;
  }
};
