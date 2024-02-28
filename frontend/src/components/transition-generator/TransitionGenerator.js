export const transitionGenerator = (startVideo, endVideo, transitions) => {
  const transitionFinder1 = (
    transition_video_name,
    ai_transition,
    non_ai_transition,
    asana_category_start,
    asana_category_end,
    language,
    person_ending_position,
    person_starting_position,
    mat_ending_position,
    mat_starting_position,
    going_to_relax,
    coming_from_relax
  ) => {
    console.log(transition_video_name);
    console.log(language);
    const matchingTransition1 = transitions.find((transition) => {
      return (
        (transition_video_name === "" ||
          transition.transition_video_name === transition_video_name) &&
        (ai_transition === "" || transition.ai_transition === ai_transition) &&
        (non_ai_transition === "" ||
          transition.non_ai_transition === non_ai_transition) &&
        (asana_category_start === "" ||
          transition.asana_category_start === asana_category_start) &&
        (asana_category_end === "" ||
          transition.asana_category_end === asana_category_end) &&
        (language === "" || transition.language === language) &&
        (person_ending_position === "" ||
          transition.person_ending_position === person_ending_position) &&
        (person_starting_position === "" ||
          transition.person_starting_position === person_starting_position) &&
        (mat_starting_position === "" ||
          transition.mat_starting_position === mat_starting_position) &&
        (mat_ending_position === "" ||
          transition.mat_ending_position === mat_ending_position) &&
        (coming_from_relax === "" ||
          transition.coming_from_relax === coming_from_relax) &&
        (going_to_relax === "" || transition.going_to_relax === going_to_relax)
      );
    });
    console.log(matchingTransition1);
    return matchingTransition1;
  };
  const transitionFinder2 = (transition_video_name, language) => {
    const matchingTransition1 = transitions.find((transition) => {
      return (
        (transition_video_name === "" ||
          transition.transition_video_name === transition_video_name) &&
        (language === "" || transition.language === language)
      );
    });
    return matchingTransition1;
  };
  if (startVideo === "start") {
    if (endVideo.asana_category === "Standing") {
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder1(
            "Standing Position Transition Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          const m2 = transitionFinder1(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder1(
            "Standing Position Transition Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          const m2 = transitionFinder1(
            "Person Transit Front to Left Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          const m3 = transitionFinder1(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (endVideo.nobreak_asana === false) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder1(
            "Standing Position Transition Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          console.log(m1);
          if (m1) {
            return [m1];
          } else {
            return [];
          }
        } else if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder1(
            "Standing Position Transition Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          const m2 = transitionFinder1(
            "Person Transit Front to Left Non AI",
            "",
            "",
            "",
            "",
            endVideo.language,
            "",
            "",
            "",
            "",
            "",
            ""
          );
          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (endVideo.asana_category === "Sitting") {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Sitting Position Transition Non AI",
          endVideo.language
        );
        const m2 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );
        if (m1 && m2) return [m1, m2];
        else return [];
      } else if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Sitting Position Transition Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
    }
    if (endVideo.asana_category === "Supine") {
      const m1 = transitionFinder2(
        "Turn Mat Front To Side Standing Transition AI+Non AI",
        endVideo.language
      );
      const m2 = transitionFinder2(
        "Standing To Supine Transition AI+Non AI",
        endVideo.language
      );
      if (endVideo.nobreak_asana === true) {
        const m3 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );
        if (m1 && m2 && m3) return [m1, m2, m3];
        else return [];
      } else if (endVideo.nobreak_asana === false) {
        if (m1 && m2) return [m1, m2];
        else return [];
      }
    }
    if (endVideo.asana_category === "Prone") {
      const m1 = transitionFinder2(
        "Turn Mat Front To Side Standing Transition AI+Non AI",
        endVideo.language
      );
      const m2 = transitionFinder2(
        "Standing To Prone Transition AI+Non AI",
        endVideo.language
      );
      if (endVideo.nobreak_asana === true) {
        const m3 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );
        if (m1 && m2 && m3) return [m1, m2, m3];
      } else if (endVideo.nobreak_asana === false) {
        if (m1 && m2) return [m1, m2];
        else return [];
      }
    }
    if (endVideo.asana_category === "Vajrasana") {
      const m1 = transitionFinder2(
        "Vajrasana Position Front Non AI",
        endVideo.language
      );
      if (endVideo.asana_stithi_start === "stithi") {
        const m2 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );
        if (m1 && m2) return [m1, m2];
        else return [];
      } else if (endVideo.asana_stithi_start === "relax") {
        if (m1) return [m1];
        else return [];
      }
    }
    if (endVideo.asana_category === "Pranayama") {
      const m1 = transitionFinder2(
        "Sitting Position Transition Non AI",
        endVideo.language
      );
      const m2 = transitionFinder2(
        "Pranayama Start Sitting",
        endVideo.language
      );
      if (m1 && m2) return [m1, m2];
      else return [];
    }
    if (endVideo.asana_category === "Prayer Standing") {
      const m1 = transitionFinder2("Prayer Standing Start", endVideo.language);
      if (m1) return [m1];
      else return [];
    }
    if (endVideo.asana_category === "Prayer Sitting") {
      const m1 = transitionFinder2(
        "Sitting Position Transition Non AI",
        endVideo.language
      );
      const m2 = transitionFinder2(
        "Prayer Sitting Start Fold + Namaskara",
        endVideo.language
      );
      if (m1 && m2) return [m1, m2];
      else return [];
    }
    if (endVideo.asana_category === "Suryanamaskara With Prefix-Suffix") {
      console.log("in hereee!!");
      const m1 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );
      const m2 = transitionFinder2(
        "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
        endVideo.language
      );
      if (m1 && m2) return [m1, m2];
      else return [];
    }
    if (endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix") {
      const m1 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );
      if (m1) return [m1];
      else return [];
    }
  } else if (startVideo === endVideo) {
    return [];
  } else {
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Standing"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          if (endVideo.person_starting_position === "Front") {
            return [];
          } else if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Feet Apart Hands Loose Standing Transition Front Non AI",
              endVideo.language
            );
            const m2 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );
            const m3 = transitionFinder2(
              "Feet Together Hands Tight Standing Side Transition Non AI",
              endVideo.language
            );
            if (m1 && m2 && m3) return [m1, m2, m3];
            else return [];
          }
        }
        if (startVideo.person_starting_position === "Left") {
          if (endVideo.person_starting_position === "Left") {
            return [];
          } else if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Jump Side To Front Non AI",
              endVideo.language
            );
            const m2 = transitionFinder2(
              "Feet Apart Hands Loose Standing Transition Front Non AI",
              endVideo.language
            );
            const m3 = transitionFinder2(
              "Feet Together Hands Tight Standing Transition Front Non AI",
              endVideo.language
            );
            if (m1 && m2 && m3) return [m1, m2, m3];
            else return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Feet Apart Hands Loose Standing Transition Front Non AI",
              endVideo.language
            );
            if (m1) return [m1];
            else return [];
          } else if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Feet Apart Hands Loose Standing Transition Front Non AI",
              endVideo.language
            );
            const m2 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );
            if (m1 && m2) return [m1, m2];
            else return [];
          }
        }
        if (startVideo.person_starting_position === "Left") {
          if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Feet Apart Hands Loose Standing Side Transition Front Non AI",
              endVideo.language
            );
            if (m1) return [m1];
            else return [];
          } else if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Jump Side To Front Non AI",
              endVideo.language
            );
            const m2 = transitionFinder2(
              "Feet Apart Hands Loose Standing Transition Front Non AI",
              endVideo.language
            );
            if (m1 && m2) return [m1, m2];
            else return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Feet Together Hands Tight Standing Transition Front Non AI",
              endVideo.language
            );
            if (m1) return [m1];
            else return [];
          } else if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );
            const m2 = transitionFinder2(
              "Feet Together Hands Tight Standing Side Transition Non AI",
              endVideo.language
            );
            if (m1 && m2) return [m1, m2];
            else return [];
          }
        }
        if (startVideo.person_starting_position === "Left") {
          if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Feet Together Hands Tight Standing Side Transition Non AI",
              endVideo.language
            );
            if (m1) return [m1];
            else return [];
          } else if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Feet Together Hands Tight Standing Side Transition Non AI",
              endVideo.language
            );
            const m2 = transitionFinder2(
              "Jump Side To Front Non AI",
              endVideo.language
            );
            const m3 = transitionFinder2(
              "Feet Apart Hands Loose Standing Transition Front Non AI",
              endVideo.language
            );
            const m4 = transitionFinder2(
              "Feet Together Hands Tight Standing Transition Front Non AI",
              endVideo.language
            );

            if (m1 && m2 && m3 && m4) return [m1, m2, m3, m4];
            else return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          if (endVideo.person_starting_position === "Front") {
            return [];
          } else if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );
            if (m1) return [m1];
            else return [];
          }
        }
        if (startVideo.person_starting_position === "Left") {
          if (endVideo.person_starting_position === "Left") {
            return [];
          } else if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Person Transit Left To Front Non AI",
              endVideo.language
            );
            if (m1) return [m1];
            else return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Supine"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Prone"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );
        if (m1) return [m1];
        else return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        if (endVideo.asana_stithi_start === "stithi") {
          return [];
        }
        if (endVideo.asana_stithi_start === "relax") {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );
          if (m1) return [m1];
          else return [];
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        if (endVideo.asana_stithi_start === "stithi") {
          const m1 = transitionFinder2(
            "Vajrasana Relax To Dyanmudra Position Non AI",
            endVideo.language
          );
          if (m1) return [m1];
          else return [];
        }
        if (endVideo.asana_stithi_start === "relax") {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Pranayama"
    ) {
      return [];
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      return [];
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      return [];
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      return [];
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      return [];
    }

    // standing
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Side Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Side Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Together Hands Side Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Feet Together Hands Side Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Supine"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Arms Overhead Feet Together Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Arms Overhead Feet Together Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );
          if (m1 && m2 && m3) return [m1, m2, m3];
          else return [];
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );
          if (m1 && m2 && m3 && m4) return [m1, m2, m3, m4];
          else return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Arms Overhead Feet Together Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );

          const m6 = transitionFinder2(
            "Arms Overhead Feet Together Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5 && m6) {
            return [m1, m2, m3, m4, m5, m6];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Prone"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Arms Straight Feet Together Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Arms Straight Feet Together Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Arms Straight Feet Together Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          const m6 = transitionFinder2(
            "Arms Straight Feet Together Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5 && m6) {
            return [m1, m2, m3, m4, m5, m6];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Vajrasana Relax To Dyanmudra Position Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Vajrasana Relax To Dyanmudra Position Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "relax"
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajrasana Relax To Dyanmudra Position Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Vajrasana Relax To Dyanmudra Position Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "relax"
      ) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Vajra Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Pranayama"
    ) {
      if (startVideo.nobreak_asana === true) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Pranayama Start Sitting",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Pranayama Start Sitting",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (startVideo.nobreak_asana === false) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Pranayama Start Sitting",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Pranayama Start Sitting",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      if (startVideo.nobreak_asana === true) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prayer Standing Start",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Prayer Standing Start",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (startVideo.nobreak_asana === false) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prayer Standing Start",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prayer Standing Start",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      if (startVideo.nobreak_asana === true) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Prayer Sitting Start Fold + Namaskara",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Prayer Sitting Start Fold + Namaskara",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (startVideo.nobreak_asana === false) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prayer Sitting Start Fold + Namaskara",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Prayer Sitting Start Fold + Namaskara",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (startVideo.nobreak_asana === false) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Standing To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Prayer Sitting Start Fold + Namaskara",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Standing" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Jump Side To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (startVideo.nobreak_asana === false) {
        if (startVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        } else if (startVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Person Transit Left To Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Suryanamaskara Preparation And Mantra All",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }

    // sitting
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Standing"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Back Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Back Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Back Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Back Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Supine"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Prone"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "relax"
      ) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        const m1 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "relax"
      ) {
        const m1 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1) {
          return [m1];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Pranayama"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1) {
          return [m1];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Sitting To Standing Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1) {
          return [m1];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All + Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Sitting To Standing Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All + Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Sitting" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Back Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Sitting To Standing Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }

    // supine
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Standing"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Arms Down Feet Apart Supine Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Arms Down Feet Apart Supine Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Arms Down Feet Apart Supine Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Arms Down Feet Apart Supine Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Supine To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Prone"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Prone Transition With Prone Breath AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Prone Transition With Prone Breath AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Supine To Prone Transition With Prone Breath AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Supine To Prone Transition With Prone Breath AI+Non AI",
          endVideo.language
        );

        if (m1) {
          return [m1];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "relax"
      ) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        const m1 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "relax"
      ) {
        const m1 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Pranayama"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Supine To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Supine To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }

    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );
        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Supine To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
    }

    if (
      startVideo.asana_category === "Supine" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Arms Down Feet Apart Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Supine To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Supine To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }

    // prone

    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Standing"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Fold Hands Feet Apart Prone Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Fold Hands Feet Apart Prone Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Fold Hands Feet Apart Prone Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Fold Hands Feet Apart Prone Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Prone To Standing Transition AI+Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Side To Front Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Supine"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const m1 = transitionFinder2(
          "Prone To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        const m1 = transitionFinder2(
          "Prone To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1) {
          return [m1];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }

      if (
        startVideo.nobreak_asana === true &&
        endVideo.asana_stithi_start === "relax"
      ) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "stithi"
      ) {
        const m1 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.asana_stithi_start === "relax"
      ) {
        const m1 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Pranayama"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prone To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prone To Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );
        const m4 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );
        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prone To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );
        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );
        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prone" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      if (startVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Fold Hands Feet Apart Prone Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prone To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prone To Standing Transition AI+Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Side To Front Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    // vajrasana
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Standing"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        if (endVideo.nobreak_asana === true) {
          if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Vajrasana Dyanmudra To Relax Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            const m3 = transitionFinder2(
              "Feet Together Hands Tight Standing Transition Front Non AI",
              endVideo.language
            );

            if (m1 && m2 && m3) {
              return [m1, m2, m3];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Vajrasana Dyanmudra To Relax Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            const m3 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );

            const m4 = transitionFinder2(
              "Feet Together Hands Tight Standing Side Transition Non AI",
              endVideo.language
            );

            if (m1 && m2 && m3 && m4) {
              return [m1, m2, m3, m4];
            } else {
              return [];
            }
          }
        } else if (endVideo.nobreak_asana === false) {
          if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Vajrasana Dyanmudra To Relax Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            if (m1 && m2) {
              return [m1, m2];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Vajrasana Dyanmudra To Relax Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            const m3 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );

            if (m1 && m2 && m3) {
              return [m1, m2, m3];
            } else {
              return [];
            }
          }
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        if (endVideo.nobreak_asana === true) {
          if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Feet Together Hands Tight Standing Transition Front Non AI",
              endVideo.language
            );

            if (m1 && m2) {
              return [m1, m2];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );

            const m3 = transitionFinder2(
              "Feet Together Hands Tight Standing Side Transition Non AI",
              endVideo.language
            );

            if (m1 && m2 && m3) {
              return [m1, m2, m3];
            } else {
              return [];
            }
          }
        } else if (endVideo.nobreak_asana === false) {
          if (endVideo.person_starting_position === "Front") {
            const m1 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            if (m1) {
              return [m1];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const m1 = transitionFinder2(
              "Vajra To Standing Transition Non AI",
              endVideo.language
            );

            const m2 = transitionFinder2(
              "Person Transit Front To Left Non AI",
              endVideo.language
            );

            if (m1 && m2) {
              return [m1, m2];
            } else {
              return [];
            }
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        if (endVideo.nobreak_asana === true) {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Side Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        } else if (endVideo.nobreak_asana === false) {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        if (endVideo.nobreak_asana === true) {
          const m1 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Together Hands Side Sitting Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        } else if (endVideo.nobreak_asana === false) {
          const m1 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Supine"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        if (endVideo.nobreak_asana === true) {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Sitting To Supine Transition AI+Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Arms Overhead Feet Together Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        } else if (endVideo.nobreak_asana === false) {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Sitting To Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        if (endVideo.nobreak_asana === true) {
          const m1 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Supine Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Arms Overhead Feet Together Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        } else if (endVideo.nobreak_asana === false) {
          const m1 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Supine Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Prone"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        if (endVideo.nobreak_asana === true) {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Sitting To Prone Transition AI+Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Arms Straight Feet Together Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        } else if (endVideo.nobreak_asana === false) {
          const m1 = transitionFinder2(
            "Vajrasana Dyanmudra To Relax Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Sitting To Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        if (endVideo.nobreak_asana === true) {
          const m1 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Prone Transition AI+Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Arms Straight Feet Together Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        } else if (endVideo.nobreak_asana === false) {
          const m1 = transitionFinder2(
            "Vajra To Sitting Transition Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Turn Mat Front To Side Sitting Transition AI+Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Prone Transition AI+Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Pranayama"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Vajrasana Dyanmudra To Relax Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Vajra To Sitting Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Vajra To Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Start Sitting",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Vajrasana Dyanmudra To Relax Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Vajra To Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Vajra To Standing Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prayer Standing Start",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Vajrasana Dyanmudra To Relax Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Vajra To Sitting Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Vajra To Sitting Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Prayer Sitting Start Fold + Namaskara",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Vajrasana Dyanmudra To Relax Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Vajra To Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Vajra To Standing Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Vajrasana" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      if (startVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Vajrasana Dyanmudra To Relax Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Vajra To Standing Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (startVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Vajra To Standing Transition Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Suryanamaskara Preparation And Mantra All",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }

    // pranayama
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Standing"
    ) {
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (endVideo.nobreak_asana === false) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );
        if (m1) {
          return [m1];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Supine"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Prone"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (endVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (endVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      const m1 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m2 = transitionFinder2(
        "Sitting To Standing Transition Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2("Prayer Standing Start", endVideo.language);

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      const m1 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m2 = transitionFinder2(
        "Prayer Sitting Start Fold + Namaskara",
        endVideo.language
      );

      if (m1 && m2) {
        return [m1, m2];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      const m1 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m2 = transitionFinder2(
        "Sitting To Standing Transition Non AI",
        endVideo.language
      );
      const m3 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );
      const m4 = transitionFinder2(
        "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
        endVideo.language
      );

      if (m1 && m2 && m3 && m4) {
        return [m1, m2, m3, m4];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Pranayama" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      const m1 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m2 = transitionFinder2(
        "Sitting To Standing Transition Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }

    // Prayer Standing
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Standing"
    ) {
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prayer Standing End",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Prayer Standing End",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
      if (endVideo.nobreak_asana === false) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prayer Standing End",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Prayer Standing End",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Standing To Sitting Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Standing To Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Supine"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Prone"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (endVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Standing To Vajra Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (endVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

        const m2 = transitionFinder2(
          "Standing To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Pranayama"
    ) {
      const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

      const m2 = transitionFinder2(
        "Standing To Sitting Transition Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Pranayama Start Sitting",
        endVideo.language
      );

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

      const m2 = transitionFinder2(
        "Standing To Sitting Transition Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Prayer Sitting Start Fold + Namaskara",
        endVideo.language
      );

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      console.log("here i am ");
      const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

      const m2 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );
      const m3 = transitionFinder2(
        "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
        endVideo.language
      );
      console.log("in here", m1, m2, m3);
      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prayer Standing" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      const m1 = transitionFinder2("Prayer Standing End", endVideo.language);

      const m2 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );

      if (m1 && m2) {
        return [m1, m2];
      } else {
        return [];
      }
    }

    // Prayer Sitting
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Standing"
    ) {
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prayer Sitting End To Dyanmudra",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Prayer Sitting End To Dyanmudra",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (endVideo.nobreak_asana === false) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Prayer Sitting End To Dyanmudra",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Prayer Sitting End To Dyanmudra",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Pranayama Unfold Legs",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Sitting To Standing Transition Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Supine"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Prone"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Sitting Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Sitting To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (endVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Prayer Sitting End To Dyanmudra",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Pranayama Unfold Legs",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Sitting To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Pranayama"
    ) {
      const m1 = transitionFinder2(
        "Prayer Sitting End To Dyanmudra",
        endVideo.language
      );

      const m2 = transitionFinder2(
        "Pranayama Start Sitting",
        endVideo.language
      );

      if (m1 && m2) {
        return [m1, m2];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      const m1 = transitionFinder2(
        "Prayer Sitting End To Dyanmudra",
        endVideo.language
      );

      const m2 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m3 = transitionFinder2(
        "Sitting To Standing Transition Non AI",
        endVideo.language
      );

      const m4 = transitionFinder2("Prayer Standing Start", endVideo.language);

      if (m1 && m2 && m3 && m4) {
        return [m1, m2, m3, m4];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      const m1 = transitionFinder2(
        "Prayer Sitting End To Dyanmudra",
        endVideo.language
      );

      const m2 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m3 = transitionFinder2(
        "Sitting To Standing Transition Non AI",
        endVideo.language
      );

      const m4 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );
      const m5 = transitionFinder2(
        "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
        endVideo.language
      );
      if (m1 && m2 && m3 && m4 && m5) {
        return [m1, m2, m3, m4, m5];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Prayer Sitting" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      const m1 = transitionFinder2(
        "Prayer Sitting End To Dyanmudra",
        endVideo.language
      );

      const m2 = transitionFinder2("Pranayama Unfold Legs", endVideo.language);

      const m3 = transitionFinder2(
        "Sitting To Standing Transition Non AI",
        endVideo.language
      );

      const m4 = transitionFinder2(
        "Suryanamaskara Preparation And Mantra All",
        endVideo.language
      );

      if (m1 && m2 && m3 && m4) {
        return [m1, m2, m3, m4];
      } else {
        return [];
      }
    }
    // Suryanamaskara With Prefix-Suffix
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Standing"
    ) {
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m5 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4 && m5) {
            return [m1, m2, m3, m4, m5];
          } else {
            return [];
          }
        }
      }
      if (endVideo.nobreak_asana === false) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3) {
            return [m1, m2, m3];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Sitting Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Supine"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Standing To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Standing To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Prone"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Standing To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m5 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4 && m5) {
          return [m1, m2, m3, m4, m5];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Standing To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (endVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Vajra Transition Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Pranayama"
    ) {
      const m1 = transitionFinder2(
        "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
        endVideo.language
      );

      const m2 = transitionFinder2(
        "Feet Apart Hands Loose Standing Transition Front Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Standing To Sitting Transition Non AI",
        endVideo.language
      );

      const m4 = transitionFinder2(
        "Pranayama Start Sitting",
        endVideo.language
      );

      if (m1 && m2 && m3 && m4) {
        return [m1, m2, m3, m4];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      const m1 = transitionFinder2(
        "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
        endVideo.language
      );

      const m2 = transitionFinder2(
        "Feet Apart Hands Loose Standing Transition Front Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2("Prayer Standing Start", endVideo.language);

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      const m1 = transitionFinder2(
        "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
        endVideo.language
      );

      const m2 = transitionFinder2(
        "Feet Apart Hands Loose Standing Transition Front Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Standing To Sitting Transition Non AI",
        endVideo.language
      );

      const m4 = transitionFinder2(
        "Prayer Sitting Start Fold + Namaskara",
        endVideo.language
      );

      if (m1 && m2 && m3 && m4) {
        return [m1, m2, m3, m4];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara With Prefix-Suffix" &&
      endVideo.asana_category === "Suryanamaskara Without Prefix-Suffix"
    ) {
      const m1 = transitionFinder2(
        "Inhale Arms Up Exhale Sideway Down Thigh Suryanamaskara Prefix",
        endVideo.language
      );

      if (m1) {
        return [m1];
      } else {
        return [];
      }
    }
    // Suryanamaskara Without Prefix-Suffix

    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Standing"
    ) {
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Feet Together Hands Tight Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m3 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          const m4 = transitionFinder2(
            "Feet Together Hands Tight Standing Side Transition Non AI",
            endVideo.language
          );

          if (m1 && m2 && m3 && m4) {
            return [m1, m2, m3, m4];
          } else {
            return [];
          }
        }
      }
      if (endVideo.nobreak_asana === false) {
        if (endVideo.person_starting_position === "Front") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          if (m1) {
            return [m1];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const m1 = transitionFinder2(
            "Feet Apart Hands Loose Standing Transition Front Non AI",
            endVideo.language
          );

          const m2 = transitionFinder2(
            "Person Transit Front To Left Non AI",
            endVideo.language
          );

          if (m1 && m2) {
            return [m1, m2];
          } else {
            return [];
          }
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Sitting"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Standing To Sitting Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Feet Together Hands Side Sitting Transition Non AI",
          endVideo.language
        );
        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Standing To Sitting Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Supine"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Supine Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Overhead Feet Together Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Supine Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Prone"
    ) {
      if (endVideo.nobreak_asana === true) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Prone Transition AI+Non AI",
          endVideo.language
        );

        const m4 = transitionFinder2(
          "Arms Straight Feet Together Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3 && m4) {
          return [m1, m2, m3, m4];
        } else {
          return [];
        }
      }
      if (endVideo.nobreak_asana === false) {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Turn Mat Front To Side Standing Transition AI+Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Standing To Prone Transition AI+Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Vajrasana"
    ) {
      if (endVideo.asana_stithi_start === "stithi") {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Standing To Vajra Transition Non AI",
          endVideo.language
        );

        const m3 = transitionFinder2(
          "Vajrasana Relax To Dyanmudra Position Non AI",
          endVideo.language
        );

        if (m1 && m2 && m3) {
          return [m1, m2, m3];
        } else {
          return [];
        }
      }
      if (endVideo.asana_stithi_start === "relax") {
        const m1 = transitionFinder2(
          "Feet Apart Hands Loose Standing Transition Front Non AI",
          endVideo.language
        );

        const m2 = transitionFinder2(
          "Standing To Vajra Transition Non AI",
          endVideo.language
        );

        if (m1 && m2) {
          return [m1, m2];
        } else {
          return [];
        }
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Pranayama"
    ) {
      const m1 = transitionFinder2(
        "Feet Apart Hands Loose Standing Transition Front Non AI",
        endVideo.language
      );

      const m2 = transitionFinder2(
        "Standing To Sitting Transition Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Pranayama Start Sitting",
        endVideo.language
      );

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Prayer Standing"
    ) {
      const m1 = transitionFinder2(
        "Feet Apart Hands Loose Standing Transition Front Non AI",
        endVideo.language
      );

      const m2 = transitionFinder2("Prayer Standing Start", endVideo.language);

      if (m1 && m2) {
        return [m1, m2];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Prayer Sitting"
    ) {
      const m1 = transitionFinder2(
        "Feet Apart Hands Loose Standing Transition Front Non AI",
        endVideo.language
      );

      const m2 = transitionFinder2(
        "Standing To Sitting Transition Non AI",
        endVideo.language
      );

      const m3 = transitionFinder2(
        "Prayer Sitting Start Fold + Namaskara",
        endVideo.language
      );

      if (m1 && m2 && m3) {
        return [m1, m2, m3];
      } else {
        return [];
      }
    }
    if (
      startVideo.asana_category === "Suryanamaskara Without Prefix-Suffix" &&
      endVideo.asana_category === "Suryanamaskara With Prefix-Suffix"
    ) {
      const m1 = transitionFinder2(
        "Inhale Arms Up Exhale Namaskara Suryanamaskara Prefix",
        endVideo.language
      );

      if (m1) {
        return [m1];
      } else {
        return [];
      }
    }
  }
};
