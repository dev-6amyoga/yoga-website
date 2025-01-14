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

export const TransitionEndStanding = async (
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
      if (end_video.person_starting_position === "Front") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Standing Position Transition",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition(["Standing Position Transition"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Standing Position Transition",
            "Person Transit Front To Left",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Standing Position Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Standing Position Transition",
            "Feet Together Hands Tight Standing Transition Front",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Standing Position Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Standing Position Transition",
            "Person Transit Front To Left",
            "Feet Together Hands Tight Standing Side Transition",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Standing Position Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end === true) {
        if (end_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Prayer Sitting Namaskara Unlock",
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Prayer Sitting Namaskara Unlock",
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (end_video.person_starting_position === "Left") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Prayer Sitting Namaskara Unlock",
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Person Transit Front To Left",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Prayer Sitting Namaskara Unlock",
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
            "Person Transit Front To Left",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      } else {
        if (end_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (end_video.person_starting_position === "Left") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Person Transit Front To Left",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
            "Person Transit Front To Left",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        if (end_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Prayer Sitting Namaskara Unlock",
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Feet Apart Hands Loose Standing Transition Front",
              "Feet Together Hands Tight Standing Transition Front",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Prayer Sitting Namaskara Unlock",
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
            "Feet Apart Hands Loose Standing Transition Front",
            "Feet Together Hands Tight Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (end_video.person_starting_position === "Left") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Prayer Sitting Namaskara Unlock",
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Feet Apart Hands Loose Standing Transition Front",
              "Person Transit Front To Left",
              "Feet Together Hands Tight Standing Side Transition",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Prayer Sitting Namaskara Unlock",
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
            "Feet Apart Hands Loose Standing Transition Front",
            "Person Transit Front To Left",
            "Feet Together Hands Tight Standing Side Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      } else {
        if (end_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Feet Apart Hands Loose Standing Transition Front",
              "Feet Together Hands Tight Standing Transition Front",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
            "Feet Apart Hands Loose Standing Transition Front",
            "Feet Together Hands Tight Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (end_video.person_starting_position === "Left") {
          if (end_video.catch_waist_start === true) {
            let res = handleTransition([
              "Pranayama Unlock Legs",
              "Sitting To Standing Transition",
              "Feet Apart Hands Loose Standing Transition Front",
              "Person Transit Front To Left",
              "Feet Together Hands Tight Standing Side Transition",
              "Catch Your Waist",
            ]);
            res = res.map((transition) => transition.transition_id);
            res = res.filter((element) => element !== undefined);
            return res;
          }
          let res = handleTransition([
            "Pranayama Unlock Legs",
            "Sitting To Standing Transition",
            "Feet Apart Hands Loose Standing Transition Front",
            "Person Transit Front To Left",
            "Feet Together Hands Tight Standing Side Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Prayer End Standing",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition(["Prayer End Standing"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Prayer End Standing",
            "Person Transit Front To Left",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Prayer End Standing",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Prayer End Standing",
            "Feet Together Hands Tight Standing Transition Front",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Prayer End Standing",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        if (end_video.catch_waist_start === true) {
          let res = handleTransition([
            "Prayer End Standing",
            "Person Transit Front To Left",
            "Feet Together Hands Tight Standing Side Transition",
            "Catch Your Waist",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        let res = handleTransition([
          "Prayer End Standing",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition(["Prayer End Standing"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Prayer End Standing",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Prayer End Standing",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Prayer End Standing",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Feet Apart Hands Loose Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Feet Apart Hands Loose Standing Transition Front",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Feet Apart Hands Loose Standing Transition Front",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Feet Apart Hands Loose Standing Transition Front",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Suryanamaskara Non AI Non Stithi Suffix",
          "Feet Apart Hands Loose Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Suryanamaskara Non AI Non Stithi Suffix",
          "Feet Apart Hands Loose Standing Transition Front",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Suryanamaskara Non AI Non Stithi Suffix",
          "Feet Apart Hands Loose Standing Transition Front",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Suryanamaskara Non AI Non Stithi Suffix",
          "Feet Apart Hands Loose Standing Transition Front",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        if (start_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            if (start_video.catch_waist_end === true) {
              return [];
            } else {
              let res = handleTransition(["Catch Your Waist"]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            }
          }
          if (end_video.catch_waist_start === false) {
            if (start_video.catch_waist_end === true) {
              let res = handleTransition(["Release Your Waist"]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            } else {
              return [];
            }
          }
          return [];
        }
        if (start_video.person_starting_position === "Left") {
          if (end_video.catch_waist_start === true) {
            if (start_video.catch_waist_end === false) {
              let res = handleTransition([
                "Jump Side To Front Transition",
                "Feet Apart Hands Loose Standing Transition Front",
                "Catch Your Waist",
              ]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            }
          }
          if (end_video.catch_waist_start === false) {
            if (start_video.catch_waist_end === true) {
              let res = handleTransition([
                "Release Your Waist",
                "Jump Side To Front Transition",
                "Feet Apart Hands Loose Standing Transition Front",
              ]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            }
          }
          let res = handleTransition([
            "Jump Side To Front Transition",
            "Feet Apart Hands Loose Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
      if (end_video.person_starting_position === "Left") {
        if (start_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            if (start_video.catch_waist_end === true) {
              let res = handleTransition([
                "Release Your Waist",
                "Person Transit Front To Left",
                "Catch Your Waist",
              ]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            } else {
              let res = handleTransition([
                "Person Transit Front To Left",
                "Catch Your Waist",
              ]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            }
          }
          if (end_video.catch_waist_start === false) {
            if (start_video.catch_waist_end === true) {
              let res = handleTransition([
                "Release Your Waist",
                "Person Transit Front To Left",
              ]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            } else {
              let res = handleTransition(["Person Transit Front To Left"]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            }
          }
        }
        if (start_video.person_starting_position === "Left") {
          return [];
        }
      }
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        if (start_video.person_starting_position === "Front") {
          let res = handleTransition([
            "Feet Together Hands Tight Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (start_video.person_starting_position === "Left") {
          let res = handleTransition(["Jump Side To Front Transition"]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
      if (end_video.person_starting_position === "Left") {
        if (start_video.person_starting_position === "Front") {
          let res = handleTransition([
            "Person Transit Front To Left",
            "Feet Together Hands Tight Standing Side Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (start_video.person_starting_position === "Left") {
          let res = handleTransition([
            "Feet Together Hands Tight Standing Side Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        if (start_video.person_starting_position === "Front") {
          let res = handleTransition([
            "Feet Apart Hands Loose Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (start_video.person_starting_position === "Left") {
          let res = handleTransition([
            "Feet Apart Hands Loose Standing Transition Side",
            "Jump Side To Front Transition",
            "Feet Apart Hands Loose Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
      if (end_video.person_starting_position === "Left") {
        if (start_video.person_starting_position === "Front") {
          let res = handleTransition([
            "Feet Apart Hands Loose Standing Transition Front",
            "Person Transit Front To Left",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (start_video.person_starting_position === "Left") {
          let res = handleTransition([
            "Feet Apart Hands Loose Standing Transition Side",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        if (start_video.person_starting_position === "Front") {
          if (end_video.catch_waist_start === true) {
            if (start_video.catch_waist_end === true) {
              return [];
            } else {
              let res = handleTransition(["Catch Your Waist"]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            }
          }
          if (end_video.catch_waist_start === false) {
            if (start_video.catch_waist_end === true) {
              let res = handleTransition(["Release Your Waist"]);
              res = res.map((transition) => transition.transition_id);
              res = res.filter((element) => element !== undefined);
              return res;
            } else {
              return [];
            }
          }
        }
        if (start_video.person_starting_position === "Left") {
          let res = handleTransition([
            "Jump Side To Front Transition",
            "Feet Apart Hands Loose Standing Transition Front",
            "Feet Together Hands Tight Standing Transition Front",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
      }
      if (end_video.person_starting_position === "Left") {
        if (start_video.person_starting_position === "Front") {
          let res = handleTransition([
            "Feet Apart Hands Loose Standing Transition Front",
            "Person Transit Front To Left",
            "Feet Together Hands Tight Standing Side Transition",
          ]);
          res = res.map((transition) => transition.transition_id);
          res = res.filter((element) => element !== undefined);
          return res;
        }
        if (start_video.person_starting_position === "Left") {
          return [];
        }
      }
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition(["Sitting To Standing Transition"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Feet Apart Hands Back Sitting Transition",
          "Sitting To Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Feet Apart Hands Back Sitting Transition",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Feet Apart Hands Back Sitting Transition",
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Feet Apart Hands Back Sitting Transition",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Arms Down Feet Apart Supine Transition",
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Arms Down Feet Apart Supine Transition",
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Arms Down Feet Apart Supine Transition",
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Arms Down Feet Apart Supine Transition",
          "Supine To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Fold Hands Feet Apart Prone Transition",
          "Prone Breath After Asana",
          "Prone To Standing Transition",
          "Turn Mat Side To Front Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition(["Vajra To Standing Transition"]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Vajra To Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Vajra To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Vajra To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let transitions = [];
        if (start_video.vajra_side === true) {
          transitions.push("Vajrasana Dyanmudra To Relax Position Side");
        } else {
          transitions.push("Vajrasana Dyanmudra To Relax Position Front");
        }
        transitions.push("Vajra To Standing Transition");
        let res = handleTransition(transitions);
        res = res
          .map((transition) => transition.transition_id)
          .filter((id) => id !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let transitions = [];
        if (start_video.vajra_side === true) {
          transitions.push("Vajrasana Dyanmudra To Relax Position Side");
        } else {
          transitions.push("Vajrasana Dyanmudra To Relax Position Front");
        }
        transitions.push(
          "Vajra To Standing Transition",
          "Person Transit Front To Left"
        );
        let res = handleTransition(transitions);
        res = res
          .map((transition) => transition.transition_id)
          .filter((id) => id !== undefined);
        return res;
      }
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let transitions = [];
        if (start_video.vajra_side === true) {
          transitions.push("Vajrasana Dyanmudra To Relax Position Side");
        } else {
          transitions.push("Vajrasana Dyanmudra To Relax Position Front");
        }
        transitions.push(
          "Vajra To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front"
        );
        let res = handleTransition(transitions);
        res = res
          .map((transition) => transition.transition_id)
          .filter((id) => id !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let transitions = [];
        if (start_video.vajra_side === true) {
          transitions.push("Vajrasana Dyanmudra To Relax Position Side");
        } else {
          transitions.push("Vajrasana Dyanmudra To Relax Position Front");
        }
        transitions.push(
          "Vajra To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition"
        );
        let res = handleTransition(transitions);
        res = res
          .map((transition) => transition.transition_id)
          .filter((id) => id !== undefined);
        return res;
      }
    }
  }

  if (start_category === "Pranayama") {
    let res1;
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        res1 = handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
        ]);
      }
      if (end_video.person_starting_position === "Left") {
        res1 = handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
        ]);
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        res1 = handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
      }
      if (end_video.person_starting_position === "Left") {
        res1 = handleTransition([
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
      }
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
    if (break_status_end === "Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
    }
    if (break_status_end === "No Break") {
      if (end_video.person_starting_position === "Front") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Feet Together Hands Tight Standing Transition Front",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
      if (end_video.person_starting_position === "Left") {
        let res = handleTransition([
          "Pranayama Inhale Hands Up Exhale Down",
          "Pranayama Unlock Legs",
          "Sitting To Standing Transition",
          "Person Transit Front To Left",
          "Feet Together Hands Tight Standing Side Transition",
        ]);
        res = res.map((transition) => transition.transition_id);
        res = res.filter((element) => element !== undefined);
        return res;
      }
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
