const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');

const IntegerProperty = Property._extend('IntegerProperty', {
    defaults: {
        _signature: _.Integer,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: 0,
            min: -Infinity,
            max: Infinity,
        }),
        _validators: _.concat(Property._defaults._validators, [
            (value, property) => {
                if (value != null && value < property._meta.min) {
                    return Either.Left(['min', `cannot be less than ${property._meta.minLength}.`]);
                } else if (value != null && value > property._meta.max) {
                    return Either.Left(['max', `cannot be more than ${property._meta.maxLength}.`]);
                }

                return Either.Right(value);
            },
        ]),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (_.String.member(value) && !isNaN(value) && _.Integer.member(parseFloat(value))) {
                    return parseInt(value);
                }

                return value;
            },
        ]),
    },
});

IntegerProperty.min = IntegerProperty.withMeta('min');
IntegerProperty.max = IntegerProperty.withMeta('max');

Object.assign(IntegerProperty.prototype, {
    min: _.thisify(IntegerProperty.min),
    max: _.thisify(IntegerProperty.max),
});

module.exports = IntegerProperty.empty();
