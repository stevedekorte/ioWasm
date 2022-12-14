"use strict";

// StableStringify

JSON.stable_stringify = function (value) {
  if (typeof(value) !== "object" ) {
    return JSON.stringify(value)
  } else if (Array.isArray(value)) {
    return "[" + value.map(v => JSON.stable_stringify(v)).join(',') + "]"
  } else if (!value) {
    return value
  } else {
    return "{" + Object.keys(value).sort().map(v => {
      return "\"" + v + "\":" + JSON.stable_stringify(value[v]);
    }).join(",") + "}"
  }
};
