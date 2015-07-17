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


  // catch key and mouse events, inspired by http://stackoverflow.com/a/16914658/2994108
  var eventsToCatch = ['keyup', 'keydown', 'keypress',
  'mouseup', 'mousedown', 'mousemove', 'click', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout',
  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'];

  for (var i = 0; i < eventsToCatch.length; i++) {
    var evt = eventsToCatch[i];
    parent.document.body.addEventListener(evt, catchEvent);
  }

  function catchEvent(e) {
    var ev = document.createEvent('Event');
    ev.initEvent(e.type, true, false);
    for (var key in e) {
        // we dont wanna clone target and we are not able to access "private members" of the cloned event.
        if (key[0] == key[0].toLowerCase() && ['__proto__', 'srcElement', 'target', 'toElement'].indexOf(key) == -1) {
            ev[key] = e[key];
        }
    }
    document.dispatchEvent(ev);
  }

})();
