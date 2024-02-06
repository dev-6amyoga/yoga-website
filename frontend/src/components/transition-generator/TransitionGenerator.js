export const transitionGenerator = (startVideo, endVideo, transitions) => {
  if (startVideo === "start") {
    const matchingTransition1 = transitions.find((transition) => {
      return (
        transition.asana_category_start === endVideo.asana_category &&
        transition.asana_category_end === endVideo.asana_category &&
        transition.language === endVideo.language &&
        transition.mat_starting_position === null &&
        transition.mat_ending_position === null &&
        transition.person_starting_position === null &&
        transition.person_ending_position === null
      );
    });
    if (endVideo.person_starting_position === "Left") {
      const matchingTransition2 = transitions.find((transition) => {
        return (
          transition.asana_category_start === endVideo.asana_category &&
          transition.person_starting_position === "Front" &&
          transition.person_ending_position ===
            endVideo.person_starting_position
        );
      });
      if (matchingTransition2 && matchingTransition1) {
        return [matchingTransition1, matchingTransition2];
      } else {
        return [];
      }
    }
    if (matchingTransition1) {
      return [matchingTransition1];
    } else {
      return [];
    }
  }
  if (startVideo === endVideo) {
    return [];
  } else {
    if (startVideo.asana_category === endVideo.asana_category) {
      if (
        startVideo.person_ending_position === "Left" &&
        endVideo.person_starting_position === "Front"
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category === startVideo.asana_category_end &&
            transition.person_starting_position ===
              startVideo.person_ending_position &&
            transition.person_ending_position ===
              endVideo.person_starting_position
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      } else if (
        startVideo.person_ending_position === "Front" &&
        endVideo.person_starting_position === "Left"
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category === startVideo.asana_category_end &&
            transition.person_starting_position ===
              startVideo.person_ending_position &&
            transition.person_ending_position ===
              endVideo.person_starting_position
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      } else if (
        startVideo.person_ending_position === endVideo.person_starting_position
      ) {
        return [];
      } else if (
        startVideo.asana_category === "Suryanamaskara" &&
        endVideo.asana_category === "Suryanamaskara"
      ) {
        return [];
      }
    } else {
      if (
        startVideo.asana_category === "Suryanamaskara" &&
        endVideo.asana_category === "Standing"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Standing" &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (endVideo.person_starting_position === "Left") {
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_end === "Standing" &&
              transition.person_starting_position === "Front" &&
              transition.person_ending_position ===
                endVideo.person_starting_position
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, matchingTransition2];
          } else {
            return [];
          }
        }
        if (matchingTransition1) {
          return [matchingTransition1];
        } else {
          return [];
        }
      }
      if (
        (startVideo.asana_category === "Standing" &&
          endVideo.asana_category === "Sitting") ||
        (startVideo.asana_category === "Suryanamaskara" &&
          endVideo.asana_category === "Sitting")
      ) {
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Standing" &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (startVideo.person_ending_position === "Left") {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.person_starting_position ===
                startVideo.person_ending_position &&
              transition.person_ending_position === "Front"
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, matchingTransition2];
          } else {
            return [];
          }
        }
        if (matchingTransition2) {
          return [matchingTransition2];
        } else {
          return [];
        }
      }
      if (
        (startVideo.asana_category === "Standing" &&
          endVideo.asana_category === "Supine") ||
        (startVideo.asana_category === "Suryanamaskara" &&
          endVideo.asana_category === "Supine")
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Front" &&
            transition.mat_ending_position === "Side"
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Standing" &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [matchingTransition1, matchingTransition2];
        } else {
          return [];
        }
      }
      if (
        (startVideo.asana_category === "Standing" &&
          endVideo.asana_category === "Prone") ||
        (startVideo.asana_category === "Suryanamaskara" &&
          endVideo.asana_category === "Prone")
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Front" &&
            transition.mat_ending_position === "Side"
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Standing" &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [matchingTransition1, matchingTransition2];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Sitting" &&
        endVideo.asana_category === "Standing"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (endVideo.person_starting_position === "Left") {
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.person_starting_position === "Front" &&
              transition.person_ending_position === "Left"
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, matchingTransition2];
          } else {
            return [];
          }
        }
        if (matchingTransition1) {
          return [matchingTransition1];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Sitting" &&
        endVideo.asana_category === "Supine"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Front" &&
            transition.mat_ending_position === "Side" &&
            transition.language === endVideo.language
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [matchingTransition1, matchingTransition2];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Sitting" &&
        endVideo.asana_category === "Prone"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Front" &&
            transition.mat_ending_position === "Side" &&
            transition.language === endVideo.language
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [matchingTransition1, matchingTransition2];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Supine" &&
        endVideo.asana_category === "Standing"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Side" &&
            transition.mat_ending_position === "Front" &&
            transition.language === endVideo.language
          );
        });
        const matchingTransition3 = transitions.find((transition) => {
          return (
            transition.asana_category_end === "Standing" &&
            transition.asana_category_start === "Standing" &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (endVideo.person_starting_position === "Left") {
          const matchingTransition4 = transitions.find((transition) => {
            return (
              transition.person_starting_position === "Front" &&
              transition.person_ending_position === "Left"
            );
          });
          if (
            matchingTransition1 &&
            matchingTransition2 &&
            matchingTransition3 &&
            matchingTransition4
          ) {
            return [
              matchingTransition1,
              matchingTransition2,
              matchingTransition3,
              matchingTransition4,
            ];
          } else {
            return [];
          }
        }
        if (matchingTransition1 && matchingTransition2 && matchingTransition3) {
          return [
            matchingTransition1,
            matchingTransition2,
            matchingTransition3,
          ];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Supine" &&
        endVideo.asana_category === "Sitting"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Side" &&
            transition.mat_ending_position === "Front" &&
            transition.language === endVideo.language
          );
        });
        const matchingTransition3 = transitions.find((transition) => {
          return (
            transition.asana_category_end === "Sitting" &&
            transition.asana_category_start === "Sitting" &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition1 && matchingTransition2 && matchingTransition3) {
          return [
            matchingTransition1,
            matchingTransition2,
            matchingTransition3,
          ];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Supine" &&
        endVideo.asana_category === "Prone"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition1) {
          return [matchingTransition1];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Prone" &&
        endVideo.asana_category === "Standing"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Side" &&
            transition.mat_ending_position === "Front" &&
            transition.language === endVideo.language
          );
        });
        const matchingTransition3 = transitions.find((transition) => {
          return (
            transition.asana_category_end === "Standing" &&
            transition.asana_category_start === "Standing" &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (endVideo.person_starting_position === "Left") {
          const matchingTransition4 = transitions.find((transition) => {
            return (
              transition.person_starting_position === "Front" &&
              transition.person_ending_position === "Left"
            );
          });
          if (
            matchingTransition1 &&
            matchingTransition2 &&
            matchingTransition3 &&
            matchingTransition4
          ) {
            return [
              matchingTransition1,
              matchingTransition2,
              matchingTransition3,
              matchingTransition4,
            ];
          } else {
            return [];
          }
        }
        if (matchingTransition1 && matchingTransition2 && matchingTransition3) {
          return [
            matchingTransition1,
            matchingTransition2,
            matchingTransition3,
          ];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Prone" &&
        endVideo.asana_category === "Sitting"
      ) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.mat_starting_position === "Side" &&
            transition.mat_ending_position === "Front" &&
            transition.language === endVideo.language
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [matchingTransition1, matchingTransition2];
        } else {
          return [];
        }
      }
      if (
        startVideo.asana_category === "Prone" &&
        endVideo.asana_category === "Supine"
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === startVideo.asana_category &&
            transition.asana_category_end === endVideo.asana_category &&
            transition.language === endVideo.language &&
            transition.mat_starting_position === null &&
            transition.mat_ending_position === null &&
            transition.person_starting_position === null &&
            transition.person_ending_position === null
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
    }
  }
};
