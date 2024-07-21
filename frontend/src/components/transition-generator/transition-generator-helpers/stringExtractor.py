# import re
# import os

# def extract_quoted_words_from_files(js_file_paths):
#     all_quoted_words = []

#     for js_file_path in js_file_paths:
#         if os.path.isfile(js_file_path):
#             with open(js_file_path, 'r') as file:
#                 js_content = file.read()
#                 # Regular expression to match words within single or double quotes
#                 quoted_words = re.findall(r'["\'](.*?)["\']', js_content)
#                 all_quoted_words.extend(quoted_words)
#         else:
#             print(f"File not found: {js_file_path}")

#     return all_quoted_words

# # Example usage
# js_file_paths = ["TransitionEndSpecial.js",
# "TransitionEndStanding.js",
# "TransitionEndStartingPrayerSitting.js",
# "TransitionEndStartingPrayerStanding.js",
# "TransitionEndSupine.js",
# "TransitionEndSuryanamaskaraNonStithi.js",
# "TransitionEndSuryanamaskaraStithi.js",
# "TransitionEndVajrasana.js",
# "TransitionEndClosingPrayerSitting.js",
# "TransitionEndClosingPrayerStanding.js",
# "TransitionEndPranayama.js",
# "TransitionEndPranayamaPrayer.js",
# "TransitionEndProne.js",
# "TransitionEndSitting.js"]
# all_words = list(set(extract_quoted_words_from_files(js_file_paths)))
# print(all_words)

import json

# Example list
# example_list = ['Pranayama Start Sitting', 'Pranayama Unlock Legs', 'Arms Straight Feet Together Prone Transition', 'Vajrasana Relax To Dyanmudra Position', 'Turn Mat Side To Front Standing Transition',  'Standing To Supine Transition', 'Vajrasana Dyanmudra To Relax Position', 'Arms Overhead Feet Together Supine Transition', 'Pranayama Inhale Arms Up Exhale Namaskara', 'Prone To Supine Transition', 'Prone To Standing Transition', 'Sitting To Supine Transition', 'Prone To Vajra Transition', 'Vajra To Supine Transition', 'Pranayama Inhale Hands Up Exhale Down',  'Feet Apart Hands Back Sitting Transition', 'Fold Hands Feet Apart Prone Transition', 'Feet Apart Hands Loose Standing Transition Front', 'Supine To Prone Transition', 'Turn Mat Side To Front Sitting Transition', 'Feet Together Hands Tight Standing Side Transition', 'Prayer Start Standing', 'Turn Mat Front To Side Sitting Transition', 'Feet Together Hands Tight Standing Transition Front', 'Sitting Position Transition', 'Turn Mat Front To Side Standing Transition', 'Standing To Prone Transition', 'Prayer End Standing', 'Standing To Vajra Transition', 'Closing Prayer Standing', 'Suryanamaskara Non AI Non Stithi Prefix', 'Suryanamaskara Preparation And Mantra Stithi Type', 'Supine To Sitting Transition', 'Starting Prayer Sitting', 'Prone To Sitting Transition', 'Sitting To Prone Transition', 'Feet Together Hands Side Sitting Transition','Pranayama Legs Lock', 'Vajra To Standing Transition', 'Prayer Sitting Namaskara Unlock', 'Vajra To Prone Transition', 'Supine To Vajra Transition', 'Sitting To Vajra Transition', 'Suryanamaskara Non AI Non Stithi Suffix', 'Standing To Sitting Transition', 'Suryanamaskara Preparation And Mantra Non Stithi', 'Person Transit Front To Left', 'Supine To Standing Transition', 'Feet Apart Hands Loose Standing Transition Side', 'Starting Prayer Standing', 'Closing Prayer Sitting', 'Vajra To Sitting Transition', 'Sitting To Standing Transition', 'Suryanamaskara Non Stithi', 'Arms Down Feet Apart Supine Transition', 'Suryanamaskara Stithi', 'Jump Side To Front Transition']

example_list = ['Feet Apart Hands Loose Standing Transition Front', 'Feet Apart Hands Loose Standing Transition Side', 'Feet Together Hands Side Sitting Transition', 'Pranayama Inhale Arms Up Exhale Namaskara', 'Pranayama Unlock Legs', 'Pranayama Legs Lock', 'Prayer Sitting Namaskara Unlock', 'Prone To Sitting Transition', 'Prone To Standing Transition', 'Prone To Supine Transition', 'Sitting Position Transition', 'Sitting To Prone Transition', 'Sitting To Standing Transition', 'Sitting To Vajra Transition', 'Standing To Prone Transition', 'Standing To Supine Transition', 'Supine To Prone Transition', 'Supine To Sitting Transition', 'Supine To Standing Transition', 'Supine To Vajra Transition', 'Suryanamaskara Preparation And Mantra Non Stithi', 'Turn Mat Front To Side Sitting Transition', 'Turn Mat Front To Side Standing Transition', 'Turn Mat Side To Front Sitting Transition', 'Turn Mat Side To Front Standing Transition', 'Vajra To Prone Transition', 'Vajra To Standing Transition', 'Vajrasana Dyanmudra To Relax Position']
# Convert list to JSON string
json_string = json.dumps(example_list, indent=4)

# Print JSON string
print(json_string)


# def find_missing_elements(list1, list2):
#     set1 = set(list1)
#     missing_elements = [item for item in list2 if item not in set1]
#     return missing_elements





# list_1 = ["Jump Side To Front Transition",
# "Prone To Vajra Transition",
# "Pranayama Start Sitting",
# "Pranayama Inhale Hands Up Exhale Down",
# "Arms Down Feet Apart Supine Transition",
# "Feet Apart Hands Back Sitting Transition",
# "Standing To Sitting Transition",
# "Vajrasana Dyanmudra To Relax Position ",
# "Vajra To Sitting Transition",
# "Vajrasana Relax To Dyanmudra Position",
# "Suryanamaskara Preparation And Mantra Stithi Type",
# "Standing To Vajra Transition",
# "Prone Breath After Asana",
# "Suryanamaskara Non AI Non Stithi Prefix",
# "Suryanamaskara Non AI Non Stithi Suffix",
# "Suryanamaskara Preparation and Mantra Non Stithi",
# "Prayer Start Standing",
# "Prayer End Standing",
# "Supine To Prone Transition With Prone Breath",
# "Vajrasana Relax To Dyanmudra Position Side",
# "Vajrasana Dyanmudra To Relax Position Side",
# "vibhagiya 2 thoracic unlock eng teacher cmaf sp",
# "vibhagiya 3 clavicular unlock eng teacher cmaf sp",
# "vibhagiya 3 stomach unlock eng teacher cmaf sp",
# "vibhagiya pranayama 1 stomach breath lock eng teacher cmaf sp",
# "vibhagiya pranayama 2 thoracic breath lock eng teacher cmaf sp",
# "vibhagiya pranayama 3 clavicular breath lock eng teacher cmaf sp",
# "bhramari pranayama lock eng teacher cmaf sp",
# "Jalandhara Bandha Lock Teacher Mode",
# "Jalandhara Bandha Unlock Teacher Mode",
# "Feet Together Hands Tight Standing Side Transition",
# "bhramari mudra unlock eng teacher cmaf sp",
# "Om Chanting Preparation Teacher Mode",
# "Fold Hands Feet Apart Prone Transition",
# "Arms Overhead Feet Together Supine Transition",
# "Arms Straight Feet Together Prone Transition",
# "Feet Together Hands Tight Standing Transition Front",
# "Person Transit Front To Left",
# "Vajra To Supine Transition",
# "Turn Mat Side To Front Sitting Transition ",
# "Turn Mat Front To Side Sitting Transition ",
# "Sitting To Supine Transition"]

# list_2 = ["Arms Down Feet Apart Supine Transition",
# "Arms Overhead Feet Together Supine Transition",
# "Arms Straight Feet Together Prone Transition",
# "Feet Apart Hands Back Sitting Transition",
# "Feet Apart Hands Loose Standing Transition Front",
# "Feet Apart Hands Loose Standing Transition Side",
# "Feet Together Hands Side Sitting Transition",
# "Feet Together Hands Tight Standing Side Transition",
# "Feet Together Hands Tight Standing Transition Front",
# "Fold Hands Feet Apart Prone Transition",
# "Jump Side To Front Transition",
# "Person Transit Front To Left",
# "Prayer End Standing",
# "Pranayama Inhale Arms Up Exhale Namaskara",
# "Pranayama Inhale Hands Up Exhale Down",
# "Pranayama Unlock Legs",
# "Pranayama Legs Lock",
# "Pranayama Start Sitting",
# "Prayer Sitting Namaskara Unlock",
# "Prayer Start Standing",
# "Prone To Sitting Transition",
# "Prone To Standing Transition",
# "Prone To Supine Transition",
# "Prone To Vajra Transition",
# "Sitting Position Transition",
# "Sitting To Prone Transition",
# "Sitting To Standing Transition",
# "Sitting To Supine Transition",
# "Sitting To Vajra Transition",
# "Standing To Prone Transition",
# "Standing To Sitting Transition",
# "Standing To Supine Transition",
# "Standing To Vajra Transition",
# "Supine To Prone Transition",
# "Supine To Sitting Transition",
# "Supine To Standing Transition",
# "Supine To Vajra Transition",
# "Suryanamaskara Non AI Non Stithi Prefix",
# "Suryanamaskara Non AI Non Stithi Suffix",
# "Suryanamaskara Preparation And Mantra Non Stithi",
# "Suryanamaskara Preparation And Mantra Stithi Type",
# "Turn Mat Front To Side Sitting Transition",
# "Turn Mat Front To Side Standing Transition",
# "Turn Mat Side To Front Sitting Transition",
# "Turn Mat Side To Front Standing Transition",
# "Vajra To Prone Transition",
# "Vajra To Sitting Transition",
# "Vajra To Standing Transition",
# "Vajra To Supine Transition",
# "Vajrasana Dyanmudra To Relax Position",
# "Vajrasana Relax To Dyanmudra Position"]

# missing_elements = find_missing_elements(list_1, list_2)
# print(missing_elements)
