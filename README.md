# grunt-node-screenshots

The aim is to put together a simple node/grunt-based proof of concept that will take screenshots of a variety of specific regions of a number of web pages at various viewport sizes and run visual diff tests against a baseline in a similar manner to Phantom CSS.

This is inspired by difficulties in installing Phantom CSS, combined with a desire to perform the assertions using a test runner of our choice, allowing better CI server support. Various grunt plugins and node modules have been investigated and were found lacking in essential features, performance, reliability and support, making a custom solution an attractive option

Current state:

* Proof of concept of taking screenshots of specific regions of web pages at various viewport sizes using webdriverio and gm (graphics magick)
* Proof of concept of testing for differences between baseline screenshots and latest screenshots using mocha and gm (graphics magick) and saving a diff image
* LOTS of known issues that will be resolved (definitely not ready for real world use yet)
* That said, it clearly proves the concept and seems set to be a robust and performant solution