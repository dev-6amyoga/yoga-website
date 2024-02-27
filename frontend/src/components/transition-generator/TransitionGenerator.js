

export const transitionGenerator = (startVideo, endVideo, transitions) => {
    const transitionFinder = (transition_video_name, ai_transition, non_ai_transition, asana_category_start, asana_category_end, language, person_ending_position, person_starting_position, mat_ending_position, mat_starting_position, going_to_relax, coming_from_relax) =>{
        console.log(transition_video_name)
        console.log(language)
        const matchingTransition1 = transitions.find(
            (transition) => {
                return (
                (transition_video_name === "" || transition.transition_video_name === transition_video_name) &&
                (ai_transition === "" || transition.ai_transition === ai_transition) &&
                (non_ai_transition === "" || transition.non_ai_transition === non_ai_transition) &&
                (asana_category_start === "" || transition.asana_category_start === asana_category_start) &&
                (asana_category_end === "" || transition.asana_category_end === asana_category_end) &&
                (language === "" || transition.language === language) &&
                (person_ending_position === "" || transition.person_ending_position === person_ending_position) &&
                (person_starting_position === "" || transition.person_starting_position === person_starting_position) &&
                (mat_starting_position === "" || transition.mat_starting_position === mat_starting_position) &&
                (mat_ending_position === "" || transition.mat_ending_position === mat_ending_position) &&
                (coming_from_relax === "" || transition.coming_from_relax === coming_from_relax) &&
                (going_to_relax === "" || transition.going_to_relax === going_to_relax)
                )
            }
        )
        console.log(matchingTransition1);
        return matchingTransition1
    }
    if(startVideo === "start"){
        console.log("startttt")
        if(endVideo.asana_category === "Standing"){
           if(endVideo.nobreak_asana === true){
                if(endVideo.person_starting_position === "Front"){
                    const m1 = transitionFinder("Standing Position Transition Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    const m2 = transitionFinder("Feet Together Hands Tight Standing Transition Front Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    if(m1 && m2){
                        return [m1, m2]
                    }
                    else{
                        return []
                    }
                }
                else if(endVideo.person_starting_position === "Left"){
                    const m1 = transitionFinder("Standing Position Transition Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    const m2 = transitionFinder("Person Transit Front to Left Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    const m3 = transitionFinder("Feet Together Hands Tight Standing Side Transition Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                     if(m1 && m2 && m3){
                        return [m1, m2, m3]
                    }
                    else{
                        return []
                    }
                }
           } 
           if(endVideo.nobreak_asana === false){
                if(endVideo.person_starting_position === "Front"){
                    const m1 = transitionFinder("Standing Position Transition Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    console.log(m1);
                    if(m1){
                        return [m1]
                    }
                    else{
                        return []
                    }

                }
                else if(endVideo.person_starting_position === "Left"){
                    const m1 = transitionFinder("Standing Position Transition Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    const m2 = transitionFinder("Person Transit Front to Left Non AI", "", "", "", "", endVideo.language, "", "", "", "", "", "");
                    if(m1 && m2){
                        return [m1, m2]
                    }
                    else{
                        return []
                    }
                }

           }
        }

    }
    else if(startVideo === endVideo){
        return []
    }
    else{
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // standing
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Standing" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // sitting
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Sitting" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // supine
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Supine" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // prone
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Prone" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // vajrasana
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Vajrasana" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // pranayama
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Pranayama" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // Prayer Standing
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Prayer Standing" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // Prayer Sitting
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        if(startVideo.asana_category === "Prayer Sitting" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // Surayanamaskara With Prefix-Suffix
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Surayanamaskara With Prefix-Suffix" && endVideo.asana_category ==="Surayanamaskara Without Prefix-Suffix" ){}
        // Surayanamaskara Without Prefix-Suffix
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Standing" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Sitting" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Supine" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Prone" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Vajrasana" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Pranayama" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Prayer Standing" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Prayer Sitting" ){}
        if(startVideo.asana_category === "Surayanamaskara Without Prefix-Suffix" && endVideo.asana_category ==="Surayanamaskara With Prefix-Suffix" ){}
        
    }
}
