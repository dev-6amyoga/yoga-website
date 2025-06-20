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

export const TransitionEndSupine = async (
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
        console.log(transition);
        const filtered = filteredTransitions_all.filter(
          (transitions) => transitions.transition_video_name === transition
        );
        console.log(filtered);
        return getUniqueTransition(filtered);
      })
      .filter(Boolean);
  };

  if (!start_category) {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
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
          "Sitting To Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      } else {
        let res = handleTransition([
          "Pranayama Unlock Legs",
          "Turn Mat Front To Side Sitting Transition",
          "Sitting To Supine Transition",
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
          "Sitting To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      } else {
        let res = handleTransition([
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
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
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
        "Sitting To Supine Transition",
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
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
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
        "Standing To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Prayer End Standing",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
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
        "Standing To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Loose Standing Transition Front",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
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
        "Standing To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_end === "No Break") {
      let res = handleTransition([
        "Suryanamaskara Non AI Non Stithi Suffix",
        "Turn Mat Front To Side Standing Transition",
        "Standing To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (start_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Feet Together Hands Tight Standing Side Transition",
          "Jump Side To Front Transition",
          "Feet Apart Hands Loose Standing Transition Front",
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (start_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (start_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Feet Together Hands Tight Standing Side Transition",
          "Jump Side To Front Transition",
          "Feet Apart Hands Loose Standing Transition Front",
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (start_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (start_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Jump Side To Front Transition",
          "Feet Apart Hands Loose Standing Transition Front",
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (start_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Feet Apart Hands Loose Standing Transition Front",
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      if (start_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Jump Side To Front Transition",
          "Feet Apart Hands Loose Standing Transition Front",
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (start_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Feet Apart Hands Loose Standing Transition Front",
          "Turn Mat Front To Side Standing Transition",
          "Standing To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Feet Apart Hands Back Sitting Transition",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      return [];
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Arms Overhead Feet Together Supine Transition",
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

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (start_video.prone_breath === false) {
        let res = handleTransition(["Prone To Supine Transition"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Prone Breath After Asana",
        "Prone To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (start_video.prone_breath === false) {
        let res = handleTransition([
          "Prone To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Prone Breath After Asana",
        "Prone To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (start_video.prone_breath === false) {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone To Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone Breath After Asana",
        "Prone To Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      console.log(start_video.prone_breath);
      if (start_video.prone_breath === false) {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone To Supine Transition",
          "Arms Overhead Feet Together Supine Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      let res = handleTransition([
        "Fold Hands Feet Apart Prone Transition",
        "Prone Breath After Asana",
        "Prone To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      let res = handleTransition(["Vajra To Supine Transition"]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      let res = handleTransition([
        "Vajra To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
      res = res.map((transition) => transition.transition_id);
      res = res.filter((element) => element !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      let transitions = [];
      if (start_video.vajra_side === true) {
        transitions.push("Vajrasana Dyanmudra To Relax Position Side");
      } else {
        transitions.push("Vajrasana Dyanmudra To Relax Position Front");
      }
      transitions.push("Vajra To Supine Transition");
      let res = handleTransition(transitions);
      res = res
        .map((transition) => transition.transition_id)
        .filter((id) => id !== undefined);
      return res;
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      let transitions = [];
      if (start_video.vajra_side === true) {
        transitions.push("Vajrasana Dyanmudra To Relax Position Side");
      } else {
        transitions.push("Vajrasana Dyanmudra To Relax Position Front");
      }
      transitions.push(
        "Vajra To Supine Transition",
        "Arms Overhead Feet Together Supine Transition"
      );
      let res = handleTransition(transitions);
      res = res
        .map((transition) => transition.transition_id)
        .filter((id) => id !== undefined);
      return res;
    }
  }

  if (start_category === "Pranayama") {
    let res1;
    let pending_2 = [];
    if (break_status_end === "Break") {
      res1 = handleTransition([
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
      ]);
    }
    if (break_status_end === "No Break") {
      res1 = handleTransition([
        "Pranayama Unlock Legs",
        "Turn Mat Front To Side Sitting Transition",
        "Sitting To Supine Transition",
        "Arms Overhead Feet Together Supine Transition",
      ]);
    }
    pending_2 = res1;
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
        res = res.filter((transition) =>
          transition.transition_video_name.toLowerCase().includes("unlock")
        );
        let new_res = [...res, ...pending_2];
        new_res = new_res.filter((element) => element !== undefined);
        new_res = new_res.map((transition) => transition.transition_id);
        return new_res;
      } else {
        if (start_video.nose_lock_start && start_video.chin_lock_end) {
          console.log("pratiloma last cycle");
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
          let new_res = [...res, ...pending_2, res1];
          new_res = new_res.filter((element) => element !== undefined);
          new_res = new_res.map((transition) => transition.transition_id);
          return new_res;
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
          res = res.filter((transition) =>
            transition.transition_video_name.toLowerCase().includes("unlock")
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
