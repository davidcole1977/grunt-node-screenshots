# grunt-node-screenshots

The aim is to put together a simple grunt/node-based proof of concept that will take screenshots of a variety of web pages and run visual diff tests against a baseline in a similar manner to Phantom CSS.

This is inspired by difficulties in installing Phantom CSS, combined with a desire to perform the assertions using a test runner of our choice, allowing better CI server support.

Following a wee spot of investigation, the plan is:

* JSON file contains pages config details: friendly names & URLs of pages to be captured & ID(s) of page regions to capture, & viewport sizes
* grunt task takes screenshots of pages specified in JSON config, using node-webshot
* 2 instances of grunt task: one to take baseline images (only run when needed) and one to take current screenshots (run each time we do a comparison)
* Mocha tests do the diffing assertions using node-resemble-js, saves screenshot diffs only for failing assertions

## Issues encountered so far:
* Does not seem possible to capture a specific page region based on HTML selector using node-webshot, as it seems we there's no way to ask phantomJS to provide information about the page (it seems to be a one-way thing – we can run javascript on phantomJS, but can't access any javascript variables etc.)
* Taking screenshots with node-webshot occasionally fails for no known reason and hangs without providing error
* Using node-resemble-js to diff screenshots can sometimes be slow – have experienced timeouts in mocha (>2000ms) a couple of times, but other factors may have contributed

### Thoughts on solution
* webdriverIO with webdriverCSS plugin is worth a look. It'll likely be stable enough, and seems to be able to provide the ability to take a screenshot based on HTML selector, BUT...
* the code could end up being a callback spaghetti. Could promises help?
* WebdriverIS/CSS has screendiffing capability, but will this provide the reporting needed? Can we use webdriverIO with Mocha?