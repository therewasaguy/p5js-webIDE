# p5.js web ide brainstorm


Priorities:
- get design wheels in motion
- figure out how to handle multiple files
- figure out how to handle console / errors
- connect with reference / autocomplete

and then...
- save image --> save gif (inspiration: http://tributary.io/inlet/6479360/ / [resize in offscreen canvas?](https://github.com/Khan/live-editor/blob/c6ba1e4e1294b67322a04ab842d138c1edd93ea3/js/output/pjs/pjs-output.js#L374))
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
