# grunt-node-screenshots

The aim is to put together a simple grunt/node-based boilerplate that will take screenshots of a variety of web pages and run visual diff tests against a baseline in a similar manner to Phantom CSS.

This is inspired by difficulties in installing Phantom CSS, combined with a desire to perform the assertions using a test runner of our choice, allowing better CI server support.

Following a wee spot of investigation, the plan is:

* YAML file contains pages config details: friendly names & URLs of pages to be captured & ID(s) of page regions to capture, & viewport sizes
* grunt task takes screenshots of pages specified in YAML config, using node-webshot
* 2 instances of grunt task: one to take baseline images (only run when needed) and one to take current screenshots (run each time we do a comparison)
* Mocha tests do the diffing assertions using node-resemble-js, saves screenshot diffs only for failing assertions
* The diffing is done inside a custom chai assertion
* May need to use global grunt config variables (yuck!) to specify image difference tolerance, screenshot locations etc. (http://gruntjs.com/frequently-asked-questions#how-can-i-share-parameters-across-multiple-tasks)