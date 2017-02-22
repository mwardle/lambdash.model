const _ = require('lambdash');
const typedProperty = require('./helpers').typedProperty;

const Any = typedProperty(_.Any);


// Int minbound and maxbound is broken
module.exports = Any(null, false, {});
