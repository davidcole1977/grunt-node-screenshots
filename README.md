# grunt-node-screenshots

The aim is to put together a simple grunt/node-based proof of concept that will take screenshots of a variety of web pages and run visual diff tests against a baseline in a similar manner to Phantom CSS.

This is inspired by difficulties in installing Phantom CSS, combined with a desire to perform the assertions using a test runner of our choice, allowing better CI server support.

The plan is:

* JSON file contains pages config details: friendly names & URLs of pages to be captured & ID(s) of page regions to capture, & viewport sizes
* grunt task based on webdriverio takes screenshots of pages / regions specified in JSON config – cropping of page region will be done using graphics magick or similar image processing library
* 2 instances of grunt task: one to take baseline images (only run when needed) and one to take current screenshots (run each time we do a comparison)
* Mocha tests do the diffing assertions using graphicsmagick or similar image processing library, saves screenshot diffs only for failing assertions