var defaults = {
  fontSize: 18,
  tabSize: 2,
  tabType: "spaces",
  consoleOrientation: "horizontal",
  showSidebar: false,
  showEditor: true,
  wordWrap: false,
  runInFrame: false, // determines whether to run in iframe, or in newWindow
  editorTheme: 'light-theme',
  fullCanvas: false, // automatically make canvas full width/height of screen
};

var userSettings = {};

module.exports.load = function() {

  // get settings from local storage if they exist
  var settings = localStorage.userSettings;
  if (!settings) {
    settings = defaults;
  } else {
    try {
      settings = JSON.parse(settings);
    } catch(err) {
      settings = defaults;
    }
  }

  userSettings = settings;
  return settings;
};

module.exports.save = function(settings) {
  localStorage.userSettings = JSON.stringify(userSettings);
};

// module.exports.write = function() {
//   localStorage.userSettings = JSON.stringify(userSettings);
// };

module.exports.defaults = defaults;