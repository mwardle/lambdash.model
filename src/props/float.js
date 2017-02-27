const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');

const FloatProperty = Property._extend('FloatProperty', {
    defaults: {
        _signature: _.Number,
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
                if (_.String.member(value) && !isNaN(value)) {
                    return parseFloat(value);
                }

                return value;
            },
        ]),
    },
});

FloatProperty.min = FloatProperty.withMeta('min');
FloatProperty.max = FloatProperty.withMeta('max');

Object.assign(FloatProperty.prototype, {
    min: _.thisify(FloatProperty.min),
    max: _.thisify(FloatProperty.max),
});

module.exports = FloatProperty.empty();
