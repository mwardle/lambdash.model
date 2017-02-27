const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');

const DateProperty = Property._extend('DateProperty', {
    defaults: {
        _signature: _.Date,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: (property) => new Date(),
            min: new Date(-100000000 * 86400000),
            max: new Date(100000000 * 86400000),
        }),
        _validators: _.concat(Property._defaults._validators, [
            (value, property) => {
                if (value != null && _.lt(value, property._meta.min)) {
                    return Either.Left(['min', `cannot be less than ${property._meta.minLength}.`]);
                } else if (value != null && _.gt(value, property._meta.max)) {
                    return Either.Left(['max', `cannot be more than ${property._meta.maxLength}.`]);
                } else if (_.Date.member(value) && value.toString() === 'Invalid Date') {
                    return Either.Left(['invalid', 'not a valid date']);
                }

                return Either.Right(value);
            },
        ]),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (_.String.member(value) && !isNaN(value) && _.Number.member(parseFloat(value))) {
                    return new Date(parseInt(value));
                } else if (_.String.member(value) && new Date(value).toString() !== 'Invalid Date') {
                    return new Date(value);
                } else if (_.Number.member(value)) {
                    return new Date(value);
                }

                return value;
            },
        ]),
    },
});

DateProperty.min = DateProperty.withMeta('min');
DateProperty.max = DateProperty.withMeta('max');

Object.assign(DateProperty.prototype, {
    min: _.thisify(DateProperty.min),
    max: _.thisify(DateProperty.max),
});

module.exports = DateProperty.empty();
