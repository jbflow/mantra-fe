import { NOUN_MAP, SUB_NOUNS, VERBS } from "./MidiConstants";

const make_paths = (noun_adj, noun, config) => {
  // JB I think the error is in here somewhere, it's not erroring out anymore but the path is getting sent through wrong

  console.log("make_paths: noun_adj, noun, config: ", noun_adj, noun, config);
  // Used to navigate to the correct parent list in the config for inserting, moving, renaming and deleting items
  let path = config[NOUN_MAP[noun]]; // Set the path to the correct list in the config with noun
  console.log("make_paths noun: ", noun);
  console.log("make_paths NOUN_MAP: ", NOUN_MAP);
  console.log("make_paths: path: ", path);
  for (let i = 1; i < noun_adj.length; i += 3) {
    const index = convert_bytes(noun_adj.slice(i, i + 2)) - 1; // convert the bytes into an index
    console.log("index:", index);
    if (typeof path[index] != "undefined") {
      // JB Try catch wasn't working here, path = path[index] was just setting path to undefined
      path = path[index]; // Set the path
    } else {
      // Unless it doesn't exist
      path.splice(index, 0, []); // Then insert it first
      console.log("make_paths path:", path);
      path = path[index]; // Then set it
      console.log("make_paths path:", path);
    }
  }
  console.log("make_paths: path: ", path);
  return path;
};
const make_sub_paths = (noun_adj, noun, config) => {
  /* Used to navigate to the correct part of the config, generating sub paths for objects
	e.g When a track is created, an empty list needs to be inserted in the devices list to hold
	that tracks devices, the smae applies for parameters, clips etc. The list of CONFIG_SUB_NOUNS shows
	how the hierachy works, this will get expanded as things like notes, return tracks, clips etc are added,
	the code allows for this. */
  const sub_paths = [];
  if (noun in SUB_NOUNS) {
    SUB_NOUNS[noun].forEach((sub_noun) => {
      console.log("sub_noun: ", sub_noun);
      sub_paths.push(make_paths(noun_adj, sub_noun, config)); // make the paths and append them as sub paths
    });
  }
  // JB Removed try catch here too in favour of if noun in SUB_NOUNS
  return sub_paths;
};
const get_all_paths = (noun_adj, noun, config) => {
  console.log(
    "get_all_paths: noun_adj, noun, config: ",
    noun_adj,
    noun,
    config
  );
  // This code was repeating in every function above so made sense to put it here
  const path = make_paths(noun_adj.slice(noun_adj.length - 3), noun, config);
  console.log("noun_adj.length - 3: ", noun_adj.length - 3);
  console.log("noun_adj.length: ", noun_adj.length);
  const sub_paths = make_sub_paths(
    noun_adj.slice(noun_adj.length - 3),
    noun,
    config
  );
  const index = convert_bytes(noun_adj.slice(-2)) - 1;
  return { path, sub_paths, index };
};

const select_item = (noun_adj, noun, value, config) => {
  //  Handles selecting an item
  let path = noun === 3 && "sel_track";
  if (noun === 10) path = "sel_device";
  if (path) config[path] = convert_bytes(noun_adj.slice(-2)); // Set the item, these are ints not lists
};

const move_item = (noun_adj, noun, value, config) => {
  // Handles moving an item
  // Get the paths and indexs to mutate in config
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);

  // Now INSERT everything where it needs to go, popping it from it's old position
  // RW: Is this even being used?
  sub_paths.forEach((sub_path) => {
    sub_path.push(value, sub_path.pop(index));
  });

  path.splice(value, 0, path.pop(index));
};

const rename_item = (noun_adj, noun, value, config) => {
  // Handles renaming an item
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);

  // Try overwriting first, otherwise insert.
  try {
    path[index] = value;
  } catch (error) {
    path.splice(index, 0, value);
  }
};

const load_item = (noun_adj, noun, value, config) => {
  console.log(
    "load_item: noun_adj, noun, value, config: ",
    noun_adj,
    noun,
    value,
    config
  );
  // Handles loading an item
  console.log("load_item: noun_adj, noun", noun_adj, noun);
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);
  console.log("load_item: path, sub_paths, index: ", path, sub_paths, index);

  sub_paths.forEach((sub_path) => {
    sub_path.push(convert_bytes(noun_adj.slice(-2) - 1), 0, []);
  });
  // Insert the items in the list
  // for each in sub_paths:
  //     each.insert(convert_bytes(noun_adj[-2:]) - 1, [])
  path.splice(index, 0, value);
};

const delete_item = (noun_adj, noun, value, config) => {
  // Handles deleting an item
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);
  console.log("delete_item: path, sub_paths, index: ", path, sub_paths, index);

  path.splice(index, 1);
};

const VERB_MAP = {};
VERB_MAP[VERBS["rename"]] = rename_item;
VERB_MAP[VERBS["load"]] = load_item;
VERB_MAP[VERBS["select"]] = select_item;
VERB_MAP[VERBS["delete"]] = delete_item;
VERB_MAP[VERBS["move"]] = move_item;

const convert_bytes = (byteArray) => {
  if (byteArray.length === 2) {
    return byteArray[1] * 128 + byteArray[0];
  } else if (byteArray.length === 3) {
    return byteArray[2] * 16384 + byteArray[1] * 128 + byteArray[0];
  } else {
    return (
      byteArray[3] * 2097152 +
      byteArray[2] * 16384 +
      byteArray[1] * 128 +
      byteArray[0]
    );
  }
};

export const MidiToJson = (midiArray, config) => {
  console.log("midiArray: ", midiArray);
  if (midiArray[0] !== 240) return; // If the message isn't a SysEx message
  config = config || {
    tracks: [],
    scenes: [],
    devices: [],
    clips: [],
    parameters: [],
    instruments: [],
    audio_devices: [],
    midi_devices: [],
    sel_track: null,
    sel_device: null,
  };
  midiArray = midiArray.slice(6, -1);
  return updateConfig(midiArray, config);
};

const updateConfig = (midiArray, config) => {
  console.log("updateConfig: midiArray: ", midiArray);
  /*This is the main function for updating the config, it is not complete. 
	Other options will need to be added for different attributes etc.*/

  const quantity = midiArray[0]; // Get the number of noun_adj pairs, used for extracting remaining bytes with slicing
  console.log("updateConfig: quantity: ", quantity);
  const noun_adj = midiArray.slice(1, quantity * 3 + 1); // Get the list of noun_adj
  console.log("updateConfig: noun_adj: ", noun_adj);
  const noun = noun_adj[noun_adj.length - 3]; // Get the noun, -3 of noun_adj
  console.log("updateConfig: noun: ", noun);
  const verb = midiArray[quantity * 3 + 1]; // Get the verb, between noun_adj and adverb in originl list
  console.log("updateConfig: verb: ", verb);
  // if (verb === 1 || verb === 2){ // If the verb is 1 or 2, (load or rename)
  // 	const adverb = midiArray.slice((quantity*3) + 2).reduce((acc, cur) => acc + String.fromCharCode(cur), '') // conver the adverb bytes into a string
  // }
  // else{ // Other wise (move or delete), note - delete has no adverb, the system won't work without it, so just uses 0
  // 	const adverb = convert_bytes(midiArray.slice((quantity*3) + 2)) - 1 // convert the bytes to a single int
  // }

  const adverb =
    verb === 1 || verb === 2
      ? midiArray
          .slice(quantity * 3 + 2)
          .reduce((acc, cur) => acc + String.fromCharCode(cur), "") // conver the adverb bytes into a string
      : convert_bytes(midiArray.slice(quantity * 3 + 2)) - 1; // convert the bytes to a single int

  VERB_MAP[verb](noun_adj, noun, adverb, config); // Call the functions with verb map

  // if (midiArray[4] === VERBS['delete']) { // If the verb byte is delet
  // 	config[NOUN_MAP[midiArray[1]]] = [] // clear the list
  // }
  // else if (midiArray[4] === VERBS['select']) { // If it's select,
  // 	config[SEL_MAP[midiArray[1]]] = convert_bytes(midiArray.slice(2, -3)) + 1 // use SEL_MAP to update the sel_device, or sel_track etc
  // }
  // else {
  // 	// Loop over the bytes and convert to ASCII/String
  // 	config[NOUN_MAP[midiArray[1]]] =
  // 		[
  // 			...config[NOUN_MAP[midiArray[1]]],
  // 			...[midiArray.slice(5).reduce((acc, cur) => acc + String.fromCharCode(cur), '')]
  // 		];
  // }
  return config;
};
