const phrases = [
  "arm track [0-9]",
  "arm the [a-z]*",
  "track [0-9] to",
  "load [a-z]*",
  "load a [a-z]*",
  "load an [a-z]*",
  "load a drum bus",
  "load a reverb",
  "tuner",
  "a reverb",
  "beat [0-9] to beat [0-9]",
  "bar [0-9] to bar [0-9]",
  "[A-Z][0-9] note",
  "[0-9] [A-Z][0-9] notes",
  "eq8",
  "eq3",
];

const replace = {
  loading: "load an",
  "load of": "load a",
  "load and": "load a",
  "igloo compressor": "glue compressor",
  autofilter: "Auto Filter",
  eq8: "EQ Eight",
  eq3: "EQ Three",
  tuna: "tuner",
  cord: "chord",
  base: "bass",
  "notes lengths": "note length",
  "note Lancs": "note length",
  "loaded rhombus": "load a Drum buss",
  "drum bus": "Drum Buss",
  "chorus ensemble": "Chorus-Ensemble",
  "phaser flanger": "Phaser-Flanger",
  "phase of lounger": "Phaser-Flanger",
  "load a saturated": "load a Saturator",
};

export function CleanupTranscript(results) {
  let transcript = checkPhrases(results);
  for (let item in replace) {
    transcript = directReplace(transcript, item, replace[item]);
  }
  return transcript;
}

const checkPhrases = (results) => {
  // Loop through the alternatives to check if any of our hot phrases are contained in them.
  console.log("alt", results[0]);
  for (let result in results[0]) {
    if (new RegExp(phrases.join("|")).test(results[0][result].transcript)) {
      return results[0][result].transcript; // Return them if they are
    }
  }
  return results[0][0].transcript; // Otherwise return the highest confidence
};

const directReplace = (transcript, find, rep) => {
  transcript = transcript.replace(find, rep);
  return transcript;
};

const RemoveLeadingSpace = (transcript) => {
  if (transcript[0] === " ") {
    transcript = transcript.substring(1);
  }
  return transcript;
};
