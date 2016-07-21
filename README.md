# p5.js web ide

### This repo is not in active development. Check out the new iteration of the project [here](https://github.com/catarak/p5.js-web-editor).

This was a prototype for a Web IDE designed specifically for the [p5.js](http://p5js.org) community. It adapts the [p5.js Desktop IDE](https://github.com/processing/p5.js-editor) (originally by Sam Lavigne, GSOC '14) for the web, with inspiration from [Gene Kogan's p5 Sandbox](https://github.com/genekogan/p5js-sandbox) and many other projects. The goal is to make it easy to create, browse, share, and remix creative code sketches directly from the browser. Create an account and start sketching!

Github Repo: https://github.com/therewasaguy/p5js-webIDE

Website (demo): http://p5ide.herokuapp.com/

### Run it:
- fork the repo
- Run a local MongoDB and set the address / database name in ``app-server/settings.js`` or in a .env file
- Register an application with GitHub and set the GHSECRET and GHCLIENT variables in ``app-server/settings.js`` or in a .env file (this is required in order to login with GitHub)
- In the console:
  - ``git clone <your fork>``
  - Install all dependencies: ``npm install``
  - Install gulp globally: ``sudo npm install --global gulp``
  - Run ``gulp`` to compile all of the modules from /app into /public
  - Run the server: ``node server.js``

### Development is taking place on the dev branch. 


## Contributors
Initiated by Jason Sigal for Google Summer of Code 2015, with mentorship from Daniel Shiffman and contributions from Craig Pickard, Boram Kim, Sam Lavigne, Gene Kogan, Leslie Lin, Pamela Liou, Eozin Che, Sepand Ansari, Jerel Johnson, Lauren McCarthy and many others in the p5/Processing community. Check out the [Web IDE Brainstorm on Hackpad](https://p5jscon.hackpad.com/Web-IDE-Brainstorm-d74TxVTnU4H) and feel free to join in on this open source project.
