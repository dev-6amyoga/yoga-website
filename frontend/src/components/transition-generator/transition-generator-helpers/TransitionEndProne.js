export const TransitionEndProne = async (
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
        //Turn Mat Front To Side Sitting Transition
        //Sitting To Prone Transition
      } else {
        //Pranayama Unlock Legs
        //Turn Mat Front To Side Sitting Transition
        //Sitting To Prone Transition
      }
    }
    if (break_status_end === "No Break") {
      if (start_video.namaskara_end === true) {
        //Prayer Sitting Namaskara Unlock
        //Pranayama Unlock Legs
        //Turn Mat Front To Side Sitting Transition
        //Sitting To Prone Transition
        //Arms Straight Feet Together Prone Transition
      } else {
        //Pranayama Unlock Legs
        //Turn Mat Front To Side Sitting Transition
        //Sitting To Prone Transition
        //Arms Straight Feet Together Prone Transition
      }
    }
  }

  if (start_category === "Closing Prayer Standing") {
    if (break_status_end === "Break") {
      // Prayer End Standing
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
    }
    if (break_status_end === "No Break") {
      // Prayer End Standing
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Starting Prayer Sitting") {
    if (break_status_end === "Break") {
      //Prayer Sitting Namaskara Unlock
      //Pranayama Unlock Legs
      //Turn Mat Front To Side Sitting Transition
      //Sitting To Prone Transition
    }
    if (break_status_end === "No Break") {
      //Prayer Sitting Namaskara Unlock
      //Pranayama Unlock Legs
      //Turn Mat Front To Side Sitting Transition
      //Sitting To Prone Transition
      //Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Starting Prayer Standing") {
    if (break_status_end === "Break") {
      // Prayer End Standing
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
    }
    if (break_status_end === "No Break") {
      // Prayer End Standing
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Suryanamaskara Stithi") {
    if (break_status_end === "Break") {
      //Feet Apart Hands Loose Standing Transition Front
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
    }

    if (break_status_end === "No Break") {
      //Feet Apart Hands Loose Standing Transition Front
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Suryanamaskara Non Stithi") {
    if (break_status_end === "Break") {
      // Suryanamaskara Non AI Non Stithi Suffix
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
    }

    if (break_status_end === "No Break") {
      // Suryanamaskara Non AI Non Stithi Suffix
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Standing") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
      //Arms Straight Feet Together Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Feet Apart Hands Loose Standing Transition Front
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Feet Apart Hands Loose Standing Transition Front
      // Turn Mat Front To Side Standing Transition
      // Standing To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Sitting") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      // Turn Mat Front To Side Sitting Transition
      // Sitting To Prone Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      // Turn Mat Front To Side Sitting Transition
      // Sitting To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Feet Apart Hands Back Sitting Transition
      // Turn Mat Front To Side Sitting Transition
      // Sitting To Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Feet Apart Hands Back Sitting Transition
      // Turn Mat Front To Side Sitting Transition
      // Sitting To Prone Transition
      // Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Supine") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      //Supine To Prone Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      //Supine To Prone Transition
      //Arms Straight Feet Together Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Arms Down Feet Apart Supine Transition
      //Supine To Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //Arms Down Feet Apart Supine Transition
      //Supine To Prone Transition
      //Arms Straight Feet Together Prone Transition
    }
  }

  if (start_category === "Prone") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      //nothing
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      //Arms Straight Feet Together Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      //Arms Down Feet Apart Supine Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      //nothing
    }
  }

  if (start_category === "Vajrasana") {
    if (break_status_start === "Break" && break_status_end === "Break") {
      // Vajra To Prone Transition
    }
    if (break_status_start === "Break" && break_status_end === "No Break") {
      // Vajra To Prone Transition
      //Arms Straight Feet Together Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "Break") {
      // Vajrasana Dyanmudra To Relax Position
      // Vajra To Prone Transition
    }
    if (break_status_start === "No Break" && break_status_end === "No Break") {
      // Vajrasana Dyanmudra To Relax Position
      // Vajra To Prone Transition
      //Arms Straight Feet Together Prone Transition
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
      //Turn Mat Front To Side Sitting Transition
      //Sitting To Supine Transition
    }

    if (break_status_end === "No Break") {
      //Pranayama Inhale Hands Up Exhale Down
      //Pranayama Unlock Legs
      //Turn Mat Front To Side Sitting Transition
      //Sitting To Supine Transition
      //Arms Overhead Feet Together Supine Transition
    }
  }

  if (start_category === "Special") {
    if (break_status_end === "Break") {
      //Arms Down Feet Apart Supine Transition
    }

    if (break_status_end === "No Break") {
      // Arms Overhead Feet Together Supine Transition
    }
  }
};
