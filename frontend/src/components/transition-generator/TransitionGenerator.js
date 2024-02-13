export const transitionGenerator = (startVideo, endVideo, transitions) => {
  if (startVideo === "start") {
    if (endVideo.asana_category === "Standing") {
      const standingTransition = transitions.find((transition) => {
        return (
          transition.transition_video_name === "Standing Position Transition"
        );
      });
      if (endVideo.nobreak_asana === true) {
        if (endVideo.person_starting_position === "Front") {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.coming_from_relax === true &&
              transition.going_to_relax === false
            );
          });
          if (matchingTransition1) {
            return [standingTransition, matchingTransition1];
          } else {
            return [];
          }
        }
        if (endVideo.person_starting_position === "Left") {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.transition_video_name ===
              "Person Transit Front to Left"
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Left" &&
              transition.person_starting_position === "Left" &&
              transition.coming_from_relax === true &&
              transition.going_to_relax === false
            );
          });
          console.log(matchingTransition1, matchingTransition2);
          if (matchingTransition1 && matchingTransition2) {
            return [
              standingTransition,
              matchingTransition1,
              matchingTransition2,
            ];
          } else {
            return [];
          }
        }
      } else {
        if (endVideo.person_starting_position === "Front") {
          return [standingTransition];
        }
        if (endVideo.person_starting_position === "Left") {
          console.log("in false, left");
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.transition_video_name ===
              "Person Transit Front to Left"
            );
          });
          if (matchingTransition1) {
            return [standingTransition, matchingTransition1];
          } else {
            return [];
          }
        }
      }
    }
    if (endVideo.asana_category === "Sitting") {
      if (endVideo.nobreak_asana === false) {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Sitting" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition1) {
          return [matchingTransition1];
        } else {
          return [];
        }
      } else {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Sitting" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === false
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Sitting" &&
            transition.coming_from_relax === true &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [matchingTransition1, matchingTransition2];
        } else {
          return [];
        }
      }
    }
    if (endVideo.asana_category === "Supine") {
      const matTurningTransition = transitions.find((transition) => {
        return (
          transition.transition_video_name ===
          "Turn Mat Front To Side Standing Transition"
        );
      });
      if (endVideo.nobreak_asana === false) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Supine" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition) {
          return [matTurningTransition, matchingTransition];
        } else {
          return [];
        }
      } else {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Supine" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === false
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Supine" &&
            transition.coming_from_relax === true &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [
            matTurningTransition,
            matchingTransition1,
            matchingTransition2,
          ];
        } else {
          return [];
        }
      }
    }
    if (endVideo.asana_category === "Prone") {
      const matTurningTransition = transitions.find((transition) => {
        return (
          transition.transition_video_name ===
          "Turn Mat Front To Side Standing Transition"
        );
      });
      if (endVideo.nobreak_asana === false) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Prone" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition) {
          return [matTurningTransition, matchingTransition];
        } else {
          return [];
        }
      } else {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Prone" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === false
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Prone" &&
            transition.coming_from_relax === true &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition1 && matchingTransition2) {
          return [
            matTurningTransition,
            matchingTransition1,
            matchingTransition2,
          ];
        } else {
          return [];
        }
      }
    }
  }
  if (startVideo === endVideo) {
    return [];
  } else {
    if (
      startVideo.asana_category === endVideo.asana_category &&
      startVideo.asana_category === "Standing"
    ) {
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        if (
          startVideo.person_ending_position === "Front" &&
          endVideo.person_starting_position === "Left"
        ) {
          const matchingTransition = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_starting_position === "Front" &&
              transition.person_ending_position === "Left"
            );
          });
          if (matchingTransition) {
            return [matchingTransition];
          } else {
            return [];
          }
        }
        if (
          startVideo.person_ending_position === "Left" &&
          endVideo.person_starting_position === "Front"
        ) {
          const matchingTransition = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_starting_position === "Left" &&
              transition.person_ending_position === "Front"
            );
          });
          if (matchingTransition) {
            return [matchingTransition];
          } else {
            return [];
          }
        }
        if (
          startVideo.person_ending_position ===
          endVideo.person_starting_position
        ) {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        if (
          startVideo.person_ending_position === "Front" &&
          endVideo.person_starting_position === "Left"
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category === "Standing" &&
              transition.person_starting_position === "Front" &&
              transition.person_ending_position === "Left"
            );
          });
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Left" &&
              transition.person_starting_position === "Left" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (
            matchingTransition1 &&
            matchingTransition2 &&
            matchingTransition3
          ) {
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
          startVideo.person_ending_position === "Left" &&
          endVideo.person_starting_position === "Front"
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.transition_video_name ===
              "Side To Front Jumping Transition"
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (
            matchingTransition1 &&
            matchingTransition2 &&
            matchingTransition3
          ) {
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
          startVideo.person_ending_position ===
          endVideo.person_starting_position
        ) {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        if (
          startVideo.person_ending_position === "Front" &&
          endVideo.person_starting_position === "Left"
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category === "Standing" &&
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
        if (
          startVideo.person_ending_position === "Left" &&
          endVideo.person_starting_position === "Front"
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.transition_video_name ===
              "Side To Front Jumping Transition"
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, matchingTransition2];
          } else {
            return [];
          }
        }
        if (
          startVideo.person_ending_position ===
          endVideo.person_starting_position
        ) {
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Left" &&
                transition.person_starting_position === "Left" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [matchingTransition1];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Front" &&
                transition.person_starting_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [matchingTransition1];
            } else {
              return [];
            }
          }
        }
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        if (
          startVideo.person_ending_position === "Front" &&
          endVideo.person_starting_position === "Left"
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_starting_position === "Front" &&
              transition.person_ending_position === "Left"
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Left" &&
              transition.person_starting_position === "Left" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          console.log(matchingTransition1, matchingTransition2);
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, matchingTransition2];
          } else {
            return [];
          }
        }
        if (
          startVideo.person_ending_position === "Left" &&
          endVideo.person_starting_position === "Front"
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Left" &&
              transition.person_starting_position === "Left" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.transition_video_name ===
              "Side To Front Jumping Transition"
            );
          });
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition4 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Standing" &&
              transition.asana_category_end === "Standing" &&
              transition.person_ending_position === "Front" &&
              transition.person_starting_position === "Front" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
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
        if (
          startVideo.person_ending_position ===
          endVideo.person_starting_position
        ) {
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Left" &&
                transition.person_starting_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1) {
              return [matchingTransition1];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Front" &&
                transition.person_starting_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1) {
              return [matchingTransition1];
            } else {
              return [];
            }
          }
        }
      }
    } else if (
      startVideo.asana_category === endVideo.asana_category &&
      startVideo.asana_category === "Sitting"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Sitting" &&
            transition.coming_from_relax === true &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Sitting" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === true
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
    } else if (
      startVideo.asana_category === endVideo.asana_category &&
      startVideo.asana_category === "Supine"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Supine" &&
            transition.coming_from_relax === true &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Supine" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === true
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
    } else if (
      startVideo.asana_category === endVideo.asana_category &&
      startVideo.asana_category === "Prone"
    ) {
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === true
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === false
      ) {
        return [];
      }
      if (
        startVideo.nobreak_asana === false &&
        endVideo.nobreak_asana === true
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Prone" &&
            transition.coming_from_relax === true &&
            transition.going_to_relax === false
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
      if (
        startVideo.nobreak_asana === true &&
        endVideo.nobreak_asana === false
      ) {
        const matchingTransition = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Prone" &&
            transition.coming_from_relax === false &&
            transition.going_to_relax === true
          );
        });
        if (matchingTransition) {
          return [matchingTransition];
        } else {
          return [];
        }
      }
    } else {
      if (
        startVideo.asana_category === "Standing" &&
        endVideo.asana_category === "Sitting"
      ) {
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition4 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Sitting" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
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
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Sitting" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matchingTransition3,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [matchingTransition1];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Left" &&
                transition.person_starting_position === "Front"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [matchingTransition1, matchingTransition2];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_end === "Sitting" &&
                transition.asana_category_start === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [matchingTransition1, matchingTransition2];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_end === "Standing" &&
                transition.asana_category_start === "Standing" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_end === "Standing" &&
                transition.asana_category_start === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition4 = transitions.find((transition) => {
              return (
                transition.asana_category_end === "Standing" &&
                transition.asana_category_start === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition5 = transitions.find((transition) => {
              return (
                transition.asana_category_end === "Sitting" &&
                transition.asana_category_start === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3 &&
              matchingTransition4 &&
              matchingTransition5
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matchingTransition3,
                matchingTransition4,
                matchingTransition5,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [matchingTransition1, matchingTransition2];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_end === "Standing" &&
                transition.asana_category_start === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matchingTransition3,
              ];
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
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Front To Side Standing Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                matTurningTransition,
                matchingTransition2,
                matchingTransition3,
              ];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition4 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
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
                matTurningTransition,
                matchingTransition3,
                matchingTransition4,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [matTurningTransition, matchingTransition1];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            console.log(matchingTransition1, matchingTransition2);
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                matTurningTransition,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matTurningTransition,
                matchingTransition1,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Left" &&
                transition.person_starting_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });

            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });

            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_ending_position === "Front" &&
                transition.person_starting_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition4 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition5 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3 &&
              matchingTransition4 &&
              matchingTransition5
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matchingTransition3,
                matTurningTransition,
                matchingTransition4,
                matchingTransition5,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                matTurningTransition,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matTurningTransition,
                matchingTransition3,
              ];
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
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Front To Side Standing Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });

            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });

            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                matTurningTransition,
                matchingTransition2,
                matchingTransition3,
              ];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });

            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });

            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });

            const matchingTransition4 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
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
                matTurningTransition,
                matchingTransition3,
                matchingTransition4,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [matTurningTransition, matchingTransition1];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Left to Front"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                matTurningTransition,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });

            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matTurningTransition,
                matchingTransition1,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Left" &&
                transition.person_ending_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition4 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition5 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3 &&
              matchingTransition4 &&
              matchingTransition5
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matchingTransition3,
                matTurningTransition,
                matchingTransition4,
                matchingTransition5,
              ];
            } else {
              return [];
            }
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                matTurningTransition,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Side To Front Jumping Transition"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === false
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                matchingTransition2,
                matTurningTransition,
                matchingTransition3,
              ];
            } else {
              return [];
            }
          }
        }
      }
      if (
        startVideo.asana_category === "Sitting" &&
        endVideo.asana_category === "Standing"
      ) {
        const sittingToStanding = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Standing" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (endVideo.person_starting_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Sitting" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                sittingToStanding,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Sitting" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Left" &&
                transition.person_ending_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                sittingToStanding,
                matchingTransition2,
                matchingTransition3,
              ];
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
            return [sittingToStanding];
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            if (matchingTransition1) {
              return [sittingToStanding, matchingTransition1];
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
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1) {
              return [sittingToStanding, matchingTransition1];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                sittingToStanding,
                matchingTransition1,
                matchingTransition2,
              ];
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
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Sitting" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [matchingTransition1, sittingToStanding];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Sitting" &&
                transition.asana_category_end === "Sitting" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                sittingToStanding,
                matchingTransition2,
              ];
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
        const sittingToSupine = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Supine" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Front To Side Sitting Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [
              matchingTransition1,
              matTurningTransition,
              sittingToSupine,
              matchingTransition2,
            ];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          return [sittingToSupine];
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1) {
            return [matTurningTransition, sittingToSupine, matchingTransition1];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1) {
            return [matchingTransition1, matTurningTransition, sittingToSupine];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.asana_category === "Sitting" &&
        endVideo.asana_category === "Prone"
      ) {
        const sittingToProne = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Prone" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Front To Side Sitting Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [
              matchingTransition1,
              matTurningTransition,
              sittingToProne,
              matchingTransition2,
            ];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          return [matTurningTransition, sittingToProne];
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1) {
            return [matTurningTransition, sittingToProne, matchingTransition1];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1) {
            return [matchingTransition1, matTurningTransition, sittingToProne];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.asana_category === "Supine" &&
        endVideo.asana_category === "Standing"
      ) {
        const supineToStanding = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Standing" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Side To Front Standing Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (endVideo.person_starting_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                supineToStanding,
                matTurningTransition,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Left" &&
                transition.person_ending_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                supineToStanding,
                matTurningTransition,
                matchingTransition2,
                matchingTransition3,
              ];
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
            return [supineToStanding, matTurningTransition];
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            if (matchingTransition1) {
              return [
                supineToStanding,
                matTurningTransition,
                matchingTransition1,
              ];
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
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1) {
              return [
                supineToStanding,
                matTurningTransition,
                matchingTransition1,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Left" &&
                transition.person_ending_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                supineToStanding,
                matTurningTransition,
                matchingTransition1,
                matchingTransition2,
              ];
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
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [
                matchingTransition1,
                supineToStanding,
                matTurningTransition,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Supine" &&
                transition.asana_category_end === "Supine" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                supineToStanding,
                matTurningTransition,
                matchingTransition2,
              ];
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
        const supineToSitting = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Sitting" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Side To Front Sitting Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [
              matchingTransition1,
              supineToSitting,
              matTurningTransition,
              matchingTransition2,
            ];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          return [supineToSitting, matTurningTransition];
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1) {
            return [supineToSitting, matTurningTransition, matchingTransition1];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1) {
            return [matchingTransition1, supineToSitting, matTurningTransition];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.asana_category === "Supine" &&
        endVideo.asana_category === "Prone"
      ) {
        const supineToProne = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Prone" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });

        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, supineToProne, matchingTransition2];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          return [supineToProne];
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1) {
            return [supineToProne, matchingTransition1];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1) {
            return [matchingTransition1, supineToProne];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.asana_category === "Prone" &&
        endVideo.asana_category === "Standing"
      ) {
        const proneToStanding = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Standing" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Side To Front Standing Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (endVideo.person_starting_position === "Front") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                matchingTransition1,
                proneToStanding,
                matTurningTransition,
                matchingTransition2,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition3 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Left" &&
                transition.person_ending_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (
              matchingTransition1 &&
              matchingTransition2 &&
              matchingTransition3
            ) {
              return [
                matchingTransition1,
                proneToStanding,
                matTurningTransition,
                matchingTransition2,
                matchingTransition3,
              ];
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
            return [proneToStanding, matTurningTransition];
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            if (matchingTransition1) {
              return [
                proneToStanding,
                matTurningTransition,
                matchingTransition1,
              ];
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
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Front" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1) {
              return [
                proneToStanding,
                matTurningTransition,
                matchingTransition1,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Standing" &&
                transition.asana_category_end === "Standing" &&
                transition.person_starting_position === "Left" &&
                transition.person_ending_position === "Left" &&
                transition.going_to_relax === false &&
                transition.coming_from_relax === true
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                proneToStanding,
                matTurningTransition,
                matchingTransition1,
                matchingTransition2,
              ];
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
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1) {
              return [
                matchingTransition1,
                proneToStanding,
                matTurningTransition,
              ];
            } else {
              return [];
            }
          }
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.transition_video_name ===
                "Person Transit Front to Left"
              );
            });
            const matchingTransition2 = transitions.find((transition) => {
              return (
                transition.asana_category_start === "Prone" &&
                transition.asana_category_end === "Prone" &&
                transition.going_to_relax === true &&
                transition.coming_from_relax === false
              );
            });
            if (matchingTransition1 && matchingTransition2) {
              return [
                proneToStanding,
                matTurningTransition,
                matchingTransition1,
                matchingTransition2,
              ];
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
        const proneToSitting = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Sitting" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        const matTurningTransition = transitions.find((transition) => {
          return (
            transition.transition_video_name ===
            "Turn Mat Side To Front Sitting Transition"
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [
              matchingTransition1,
              proneToSitting,
              matTurningTransition,
              matchingTransition2,
            ];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          return [proneToSitting, matTurningTransition];
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Sitting" &&
              transition.asana_category_end === "Sitting" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1) {
            return [proneToSitting, matTurningTransition, matchingTransition1];
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1) {
            return [matchingTransition1, proneToSitting, matTurningTransition];
          } else {
            return [];
          }
        }
      }
      if (
        startVideo.asana_category === "Prone" &&
        endVideo.asana_category === "Supine"
      ) {
        const proneToSupine = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Supine" &&
            transition.going_to_relax === false &&
            transition.coming_from_relax === false
          );
        });
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1 && matchingTransition2) {
            return [matchingTransition1, proneToSupine, matchingTransition2];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          return [proneToSupine];
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Supine" &&
              transition.asana_category_end === "Supine" &&
              transition.going_to_relax === false &&
              transition.coming_from_relax === true
            );
          });
          if (matchingTransition1) {
            return [proneToSupine, matchingTransition1];
          } else {
            return [];
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          const matchingTransition1 = transitions.find((transition) => {
            return (
              transition.asana_category_start === "Prone" &&
              transition.asana_category_end === "Prone" &&
              transition.going_to_relax === true &&
              transition.coming_from_relax === false
            );
          });
          if (matchingTransition1) {
            return [matchingTransition1, proneToSupine];
          } else {
            return [];
          }
        }
      }
    }
  }
};
