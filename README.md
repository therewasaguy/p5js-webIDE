# p5.js web ide prototype

A prototype adapting the [p5.js Desktop IDE](https://github.com/processing/p5.js-editor) for the web.

## Goal:
There will be two repos. One for the client-side code. One for the server-side code. Client-side will be a submodule of the server-side repo. This way, the Desktop editor can easily share the same client-side module if we make the switch to Electron.

## >> [Web IDE Brainstorm on Hackpad](https://p5jscon.hackpad.com/Web-IDE-Brainstorm-d74TxVTnU4H)

## Run it:
- fork the repo
- In the console:
  - ``git clone <your fork>``
  - Install all dependencies: ``npm install``
  - Install gulp globally: ``npm install --global gulp``
  - Run ``gulp`` to compile all of the modules from /app into /public
  - Run the server: ``node server.js``


## Priorities:
- ux / design
- figure out how to handle multiple files
- print to virtual console
- connect with reference / autocomplete

and then...
- save image --> save gif (inspiration: http://tributary.io/inlet/6479360/ / [resize in offscreen canvas?](https://github.com/Khan/live-editor/blob/c6ba1e4e1294b67322a04ab842d138c1edd93ea3/js/output/pjs/pjs-output.js#L374)) [on server with phantom.js?](https://blog.animatron.com/2014/01/22/how-we-render-animated-content-from-html5-canvas/)
- user accounts ( login w/ github ?)
- fork/remix
- easy embed code for sketch*

fun things to look into / experiment with:
- live collaborative sessions using sockets and Teacher / Student mode
- live coding and/or make the console interactive
- save the state of a sketch every time a change is made, so that the sketch can be "replayed" on a timeline in sync to a video lesson. For example, this is something Dan Shiffman would use for online lessons. [Here's Khan's approach](https://github.com/Khan/live-editor/blob/a43ec180b91256eb7b20eb530e8b5d4a589c7901/js/editors/ace/editor-ace.js#L153). Inspiration: [CodePlayer](http://engineering.hackerearth.com/2014/01/21/introducing-codeplayer/).
- some kind of Tutorial Mode, where you could save "Step 1" "Step 2" and go through them in sequence, rather than as separate files.
- how to browse / discover sketches once there are lots of 'em? Tags, Classrooms/Collections, "favorite", views...
*and possibly also the ability to embed the editor, so that it could be used on p5 examples, interactive lessons, on student's websites etc...something to experiment with
