const _ = require('lambdash');
const Either = require('lambdash.either');
const bytes = require('bytes');
const Property = require('../Property');

const BinaryProperty = Property._extend('BinaryProperty', {
    defaults: {
        _signature: _.Uint8Array,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: Buffer.alloc(0),
            minLength: 0,
            maxLength: Infinity,
        }),
        _validators: _.concat(Property._defaults._validators, [
            (value, property) => {
                let minLength = property._meta.minLength;
                let maxLength = property._meta.maxLength;
                if (_.String.member(minLength)) {
                    minLength = bytes(minLength);
                }
                if (_.String.member(maxLength)) {
                    maxLength = bytes(maxLength);
                }
                if (value != null && value.length < minLength) {
                    return Either.Left(['minLength', `data must be at least ${bytes(minLength)}.`]);
                } else if (value != null && value.length > maxLength) {
                    return Either.Left(['maxLength', `data cannot be larger than ${bytes(maxLength)}.`]);
                }

                return Either.Right(value);
            },
        ]),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (_.String.member(value)) {
                    return Buffer.from(value);
                }

                return value;
            },
        ]),
    },
});

BinaryProperty.minLength = BinaryProperty.withMeta('minLength');
BinaryProperty.maxLength = BinaryProperty.withMeta('maxLength');

Object.assign(BinaryProperty.prototype, {
    minLength: _.thisify(BinaryProperty.minLength),
    maxLength: _.thisify(BinaryProperty.maxLength),
});

module.exports = BinaryProperty.empty();
