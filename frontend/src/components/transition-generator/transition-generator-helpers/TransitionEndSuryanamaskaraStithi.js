export const TransitionEndSuryanamaskaraStithi = async (
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
    if (start_video.namaskara_end === true) {
      //Prayer Sitting Namaskara Unlock
      //Pranayama Unlock Legs
      // Sitting To Standing Transition
      //Suryanamaskara Preparation And Mantra Stithi Type
    } else {
      //Pranayama Unlock Legs
      //Sitting To Standing Transition
      // Suryanamaskara Preparation And Mantra Stithi Type
    }
  }

  if (start_category === "Closing Prayer Standing") {
    // Prayer End Standing
    // Suryanamaskara Preparation And Mantra Stithi Type
  }

  if (start_category === "Starting Prayer Sitting") {
    //Pranayama Inhale Hands Up Exhale Down
    //Pranayama Unlock Legs
    //Sitting To Standing Transition
    //Suryanamaskara Preparation And Mantra Stithi Type
  }

  if (start_category === "Starting Prayer Standing") {
    //Prayer End Standing
    //Suryanamaskara Preparation And Mantra Stithi Type
  }

  if (start_category === "Suryanamaskara Stithi") {
    // nothing
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    // Suryanamaskara Non AI Non Stithi Suffix
    // Suryanamaskara Preparation And Mantra Stithi Type
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break") {
      // Suryanamaskara Preparation And Mantra Stithi Type
    }

    if (break_status_start === "No Break") {
      //Feet Apart Hands Loose Standing Transition Front
      // Suryanamaskara Preparation And Mantra Stithi Type
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break") {
      // Sitting To Standing Transition
      // Suryanamaskara Preparation And Mantra Stithi Type
    }
    if (break_status_start === "No Break") {
      //Feet Apart Hands Back Sitting Transition
      // Sitting To Standing Transition
      // Suryanamaskara Preparation And Mantra Stithi Type
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break") {
      //Supine To Standing Transition
      //Turn Mat Side To Front Standing Transition
      //Suryanamaskara Preparation And Mantra Stithi Type
    }

    if (break_status_start === "No Break") {
      //Arms Down Feet Apart Supine Transition
      //Supine To Standing Transition
      //Turn Mat Side To Front Standing Transition
      // Suryanamaskara Preparation And Mantra Stithi Type
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break") {
      //Prone To Standing Transition
      //Turn Mat Side To Front Standing Transition
      //Suryanamaskara Preparation And Mantra Stithi Type
    }

    if (break_status_start === "No Break") {
      //Fold Hands Feet Apart Prone Transition
      //Prone To Standing Transition
      //Turn Mat Side To Front Standing Transition
      //Suryanamaskara Preparation And Mantra Stithi Type
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break") {
      // Vajra To Standing Transition
      //Suryanamaskara Preparation And Mantra Stithi Type
    }
    if (break_status_start === "No Break") {
      // Vajrasana Dyanmudra To Relax Position
      // Vajra To Standing Transition
      //Suryanamaskara Preparation And Mantra Stithi Type
    }
  }

  if (start_category === "Pranayama") {
    if (break_status_end === "Break") {
    }

    if (break_status_end === "No Break") {
    }
  }

  if (start_category === "Pranayama Prayer") {
    //Pranayama Inhale Hands Up Exhale Down
    //Pranayama Unlock Legs
    //Sitting To Standing Transition
    // Suryanamaskara Preparation And Mantra Stithi Type
  }

  if (start_category === "Special") {
    //Feet Apart Hands Loose Standing Transition Front
    // Suryanamaskara Preparation And Mantra Stithi Type
  }
};
