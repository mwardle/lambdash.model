const _ = require('lambdash');
const typedProperty = require('./helpers').typedProperty;

const Bool = typedProperty(_.Bool);


// Int minbound and maxbound is broken
module.exports = Bool(null, false, {});
