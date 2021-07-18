const phrases = [
  "arm track",
  "arm the",
  "track [0-9] to",
  "rename track [0-9]",
  "load a Reverb",
  "load a flanger",
  "load a phaser flanger",
  "load a hybrid reverb",
  "a reverb",
  "beat [0-9] to beat [0-9]",
  "bar [0-9] to bar [0-9]",
  "[A-Z][0-9] note",
  "[0-9] [A-Z][0-9] notes",
  "eq8",
  "eq3",
];

export function CleanupTranscript(results) {
  console.log(results);
  // Loop through the alternatives to check if any of our hot phrases are contained in them.
  for (let result in results[0]) {
    if (new RegExp(phrases.join("|")).test(results[0][result].transcript)) {
      return results[0][result].transcript; // Return them if they are
    }
  }
  return results[0][0].transcript; // Otherwise return the highest confidence
}

const RemoveLeadingSpace = (transcript) => {
  if (transcript[0] === " ") {
    transcript = transcript.substring(1);
  }
  return transcript;
};
