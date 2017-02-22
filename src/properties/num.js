const _ = require('lambdash');
const numericProperty = require('./helpers').numericProperty;

const Num = numericProperty(_.Num);

module.exports = Num(0, false, {}, -Infinity, Infinity);
