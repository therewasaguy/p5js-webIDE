(function() {
  
  var original = window.console;
  window.console = {};

  ["log", "warn", "error"].forEach(function(func){
    window.console[func] = function(msg) {
      var style = null;
      if (arguments[2] && arguments[0].indexOf('%c') > -1) {
        style = arguments[1];
      }

      var data = {msg: msg, style: style, type: func };
      parent.postMessage(JSON.stringify(data), window.location.origin);
      original[func].apply(original, arguments);
    };
  });


  window.onerror = function (msg, url, num, column, errorObj) {
    var data = { num: num, msg: msg, type: 'error' };
    parent.postMessage(JSON.stringify(data), window.location.origin);
    return false;
  };

  function trace() {
    var stack = Error().stack;
    var line = stack.split('\n')[3];
    line = (line.indexOf(' (') >= 0 ? line.split(' (')[1].substring(0, line.length - 1) : line.split('at ')[1]);
    return line;
  }

  // message input
  parent.addEventListener('message', outputReceiveMessage, false);

  function outputReceiveMessage(e) {
    var data = JSON.parse(e.data);
    var msg = data.msg;

    switch(msg) {
      case 'pause':
        window.noLoop();
        break;
      case 'stop':
        window.remove();
        break;
    }
  }

})();
