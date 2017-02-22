const _ = require('lambdash');
const Either = require('lambdash.either');
const typedProperty = require('./helpers').typedProperty;
const unionType = _.Type.union;

const Str = typedProperty(_.Str, {
    _minLen: _.Int,
    _maxLen: _.Int,
    _pattern: unionType([_.Unit, _.Regex]),
}, _.curry(function(value, prop) {
    if (_.Str.member(value) && (value.length < prop._minLen || value.length > prop._maxLen)) {
        return Either.Left("value's length is out of bounds");
    }
    if (_.Str.member(value) && prop._pattern != null && !_.test(value, prop._pattern)) {
        return Either.Left('value does not match the required pattern');
    }
    return Either.Right(prop);
}));

Str.minLen = Str.set('_minLen');
Str.maxLen = Str.set('_maxLen');
Str.pattern = Str.set('_pattern');

Str.prototype.minLen = _.thisify(Str.minLen);
Str.prototype.maxLen = _.thisify(Str.maxLen);
Str.prototype.pattern = _.thisify(Str.pattern);

module.exports = Str('', false, {}, 0, _.Int.maxBound(), null);
