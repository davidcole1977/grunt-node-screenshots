function Looper (array) {
  this.loopArray = array;
  this.data = null;
  this.finishedAction = function () {
    console.log('Looper finished action has not been specified');
  };
  this.loopAction = function () {
    console.log('Looper loop action has not been specified');
    this.finishedAction();
  };
}

Looper.prototype.andDo = function (loopAction) {
  this.loopAction = loopAction;
  return this;
};

Looper.prototype.withData = function (data) {
  this.data = data;
  return this;
};

Looper.prototype.andWhenFinished = function (finishedAction) {
  this.finishedAction = finishedAction;
  return this;
};

Looper.prototype.start = function () {
  Looper.loopWithCallback(this.loopArray, this.loopAction, this.data, this.finishedAction);
};

Looper.prototype.foo = function () {
  console.log(this.loopArray);
}

Looper.loopWithCallback = function (array, action, data, finished) {
  var entry;

  if (array.length === 0) {
    finished();
  } else {
    entry = array[0];

    action(entry, data, function () {
      Looper.loopWithCallback(array.slice(1), action, data, finished);
    });
  }
}

Looper.loop = function (array) {
  return new Looper(array);
}

module.exports = {
  loop: Looper.loop
}