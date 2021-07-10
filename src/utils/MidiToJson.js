import { NOUN_MAP, SUB_NOUNS, VERBS } from "./MidiConstants";

const make_paths = (noun_adj, noun, config) => {
  let path = config[NOUN_MAP[noun]];
  if (noun === noun_adj[0]) {
    return path;
  }
  for (let i = 1; i < noun_adj.length; i += 3) {
    const index = convert_bytes(noun_adj.slice(i, i + 2)) - 1;
    if (typeof path[index] !== "undefined") {
      path = path[index];
    } else {
      path.splice(index, 0, []);
      path = path[index];
    }
  }
  return path;
};

const make_sub_paths = (noun_adj, noun, config) => {
  const sub_paths = [];
  if (noun in SUB_NOUNS) {
    SUB_NOUNS[noun].forEach((sub_noun) => {
      sub_paths.splice(0, 0, make_paths(noun_adj, sub_noun, config));
    });
  }
  return sub_paths;
};

const get_all_paths = (noun_adj, noun, config) => {
  const index = convert_bytes(noun_adj.slice(-2)) - 1;
  noun_adj = noun_adj.slice(0, noun_adj.length - 3);
  const path = make_paths(noun_adj, noun, config);
  const sub_paths = make_sub_paths(noun_adj, noun, config);
  return { path, sub_paths, index };
};

const select_item = (noun_adj, noun, value, config) => {
  if (noun_adj.length === 3) {
    config["sel_track"] = convert_bytes(noun_adj.slice(1, 3));
  } else if (noun_adj.length === 6) {
    config["sel_track"] = convert_bytes(noun_adj.slice(1, 3));
    config["sel_device"] = convert_bytes(noun_adj.slice(4, 6));
  }
};

const move_item = (noun_adj, noun, value, config) => {
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);
  sub_paths.forEach((sub_path) => {
    sub_path.splice(value, 0, sub_path.pop(index));
  });
  path.splice(value, 0, path.pop(index));
};

const rename_item = (noun_adj, noun, value, config) => {
  // Handles renaming an item
  const { path, index } = get_all_paths(noun_adj, noun, config);
  // Try overwriting first, otherwise insert.
  try {
    path[index] = value;
  } catch (error) {
    path.splice(index, 0, value);
  }
};

const load_item = (noun_adj, noun, value, config) => {
  // Handles loading an item
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);
  for (var i = 0; i < sub_paths.length; i++) {
    if (sub_paths[i]) sub_paths[i].splice(index, 0, []);
  }
  path.splice(index, 0, value);
};

const delete_item = (noun_adj, noun, value, config) => {
  // Handles deleting an item
  const { path, sub_paths, index } = get_all_paths(noun_adj, noun, config);
  for (var i = 0; i < sub_paths.length; i++) {
    sub_paths[i].splice(index, 1);
  }
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
  if (midiArray[0] !== 240) return; // If the message isn't a SysEx message
  midiArray = midiArray.slice(7, -1);
  return updateConfig(midiArray, config);
};

const updateConfig = (midiArray, config) => {
  const quantity = midiArray[0];
  const noun_adj = midiArray.slice(1, quantity * 3 + 1);
  const noun = noun_adj[noun_adj.length - 3];
  const verb = midiArray[quantity * 3 + 1];

  const adverb =
    verb === 1 || verb === 2
      ? midiArray
          .slice(quantity * 3 + 2)
          .reduce((acc, cur) => acc + String.fromCharCode(cur), "") // conver the adverb bytes into a string
      : convert_bytes(midiArray.slice(quantity * 3 + 2)) - 1; // convert the bytes to a single int
  VERB_MAP[verb](noun_adj, noun, adverb, config); // Call the functions with verb map

  return config;
};
