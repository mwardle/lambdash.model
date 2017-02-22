const _ = require('lambdash');
const numericProperty = require('./helpers').numericProperty;

const Int = numericProperty(_.Int);

module.exports = Int(0, false, {}, _.Int.minBound(), _.Int.maxBound());
