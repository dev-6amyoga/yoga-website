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
                "Person Transit Left to Front"
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
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
          }
          if (startVideo.person_ending_position === "Left") {
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
          }
          if (startVideo.person_ending_position === "Left") {
          }
        }
        if (
          startVideo.nobreak_asana === false &&
          endVideo.nobreak_asana === true
        ) {
          if (startVideo.person_ending_position === "Front") {
          }
          if (startVideo.person_ending_position === "Left") {
          }
        }
        if (
          startVideo.nobreak_asana === true &&
          endVideo.nobreak_asana === false
        ) {
          if (startVideo.person_ending_position === "Front") {
          }
          if (startVideo.person_ending_position === "Left") {
          }
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
            transition.language === endVideo.language &&
            transition.asana_category_end === "Sitting" &&
            transition.asana_category_start === "Sitting"
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Supine" &&
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
            transition.language === endVideo.language &&
            transition.asana_category_end === "Sitting" &&
            transition.asana_category_start === "Sitting"
          );
        });
        const matchingTransition2 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Prone" &&
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
            transition.language === endVideo.language &&
            transition.asana_category_end === "Standing" &&
            transition.asana_category_start === "Standing"
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
            transition.asana_category_start === "Supine" &&
            transition.asana_category_end === "Sitting" &&
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
            transition.language === endVideo.language &&
            transition.asana_category_end === "Sitting" &&
            transition.asana_category_start === "Sitting"
          );
        });
        const matchingTransition3 = transitions.find((transition) => {
          return (
            transition.asana_category_start === "Sitting" &&
            transition.asana_category_end === "Sitting" &&
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
            transition.language === endVideo.language &&
            transition.asana_category_end === "Standing" &&
            transition.asana_category_start === "Standing"
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
            transition.asana_category_start === "Prone" &&
            transition.asana_category_end === "Sitting" &&
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
            transition.language === endVideo.language &&
            transition.asana_category_end === "Sitting" &&
            transition.asana_category_start === "Sitting"
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
