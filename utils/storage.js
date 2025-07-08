const fs = require("fs");

const DATA_FILE = "data.json";

function loadPending() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  }
  return {};
}

function savePending(pending) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(pending, null, 2));
}

module.exports = { loadPending, savePending };
