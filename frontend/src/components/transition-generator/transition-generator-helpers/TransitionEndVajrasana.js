export const TransitionEndVajrasana = async (
  start_category,
  break_status_start,
  break_status_end,
  start_video,
  end_video,
  drm_status
) => {
  if (!start_category) {
    // first video
  }
  if (start_category === "Closing Prayer Sitting") {
    if (break_status_end === "Break") {
      if (start_video.namaskara_end === true) {
        //Prayer Sitting Namaskara Unlock
        //Pranayama Unlock Legs
        // Sitting To Vajra Transition
      } else {
        //Pranayama Unlock Legs
        // Sitting To Vajra Transition
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        //Prayer Sitting Namaskara Unlock
        //Pranayama Unlock Legs
        //Sitting To Vajra Transition
        //Vajrasana Relax To Dyanmudra Position
      } else {
        //Pranayama Unlock Legs
        //Sitting To Vajra Transition
        //Vajrasana Relax To Dyanmudra Position
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      // Prayer End Standing
      //Standing To Vajra Transition
    }
    if (break_status_end === "No Break") {
      // Prayer End Standing
      //Standing To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      //Prayer Sitting Namaskara Unlock
      //Pranayama Unlock Legs
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
    if (break_status_end === "No Break") {
      //Prayer Sitting Namaskara Unlock
      //Pranayama Unlock Legs
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      // Prayer End Standing
      //Standing To Vajra Transition
    }
    if (break_status_end === "No Break") {
      // Prayer End Standing
      //Standing To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      //Feet Apart Hands Loose Standing Transition Front
      //Standing To Vajra Transition
    }

    if (break_status_end === "No Break") {
      //Feet Apart Hands Loose Standing Transition Front
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      //Suryanamaskara Non AI Non Stithi Suffix
      //Standing To Vajra Transition
    }

    if (break_status_end === "No Break") {
      //Suryanamaskara Non AI Non Stithi Suffix
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      //Standing To Vajra Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      //Standing To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Feet Apart Hands Loose Standing Transition Front
      //Standing To Vajra Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Feet Apart Hands Loose Standing Transition Front
      //Standing To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      //Sitting To Vajra Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Feet Apart Hands Back Sitting Transition
      //Sitting To Vajra Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Feet Apart Hands Back Sitting Transition
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      //Supine To Vajra Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      //Supine To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Arms Down Feet Apart Supine Transition
      //Supine To Vajra Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Arms Down Feet Apart Supine Transition
      //Supine To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      //Prone To Vajra Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      //Prone To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Fold Hands Feet Apart Prone Transition
      //Prone To Vajra Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Fold Hands Feet Apart Prone Transition
      //Prone To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      // nothing
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      // Vajrasana Relax To Dyanmudra Position
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      // Vajrasana Dyanmudra To Relax Position
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      // nothing
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
    }

    if (break_status_end === "No Break") {
    }
  }

  if (start_category === "Pranayama Prayer") {
    if (break_status_end === "Break") {
      //Pranayama Inhale Hands Up Exhale Down
      //Pranayama Unlock Legs
      //Sitting To Vajra Transition
    }

    if (break_status_end === "No Break") {
      //Pranayama Inhale Hands Up Exhale Down
      //Pranayama Unlock Legs
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      //Feet Apart Hands Back Sitting Transition
      //Sitting To Vajra Transition
    }

    if (break_status_end === "No Break") {
      //Feet Apart Hands Back Sitting Transition
      //Sitting To Vajra Transition
      //Vajrasana Relax To Dyanmudra Position
    }
  }
};
