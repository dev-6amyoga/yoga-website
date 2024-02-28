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

  const m3 = transitionFinder2("Pranayama Start Sitting", endVideo.language);

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
