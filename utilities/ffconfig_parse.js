const fs = require('fs');
const path = require('path');

// Path to user.js
const userJsPath = path.join('..', 'firefox-chrome', 'user.js');

// Prepare a prefs object and a user_pref function
var prefs = {};
function user_pref(name, value) {
    prefs[name] = value;
}

// Read and eval the user.js file
try {
    const content = fs.readFileSync(userJsPath, 'utf8');
    eval(content); // This will call user_pref for each pref in the file
} catch (e) {
    // If file doesn't exist, prefs stays empty
}

// Now prefs contains all preferences as JS objects
console.log(JSON.stringify(prefs));