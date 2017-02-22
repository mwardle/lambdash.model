const _ = require('lambdash');
const sequentialProperty = require('./helpers').sequentialProperty;
const any = require('./any');

const Arr = sequentialProperty(_.Arr);

module.exports = Arr(Object.freeze([]), false, {}, 0, _.Int.maxBound(), any);
