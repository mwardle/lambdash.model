const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');
const any = require('./any');

const ArrayProperty = Property._extend('ArrayProperty', {
    defaults: {
        _signature: _.Array,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: Object.freeze([]),
            of: any,
            minLength: 0,
            maxLength: Infinity,
            unique: false,
        }),
        _validators: _.concat(Property._defaults._validators, [
            (value, property) => {
                let of = property._meta.of;

                if (value == null) {
                    return Either.Right(value);
                } else if (value.length < property._meta.minLength) {
                    return Either.Left(['minLength', `must contain at least ${property._meta.minLength} items.`]);
                } else if (value.length > property._meta.maxLength) {
                    return Either.Left(['maxLength', `must contain no more than ${property._meta.maxLength} items.`]);
                }

                let index = -1;
                let result = _.foldl((res, v) => {
                    index += 1;
                    return res.chain((_) => {
                        let _res = of.validate(v);
                        if (_res.isLeft()) {
                            return Either.Left(['of', `Invalid item at position ${index}: ${_res.value}`])
                        }
                        return res;
                    });
                }, Either.Right(value), value);

                return result;
            },
        ]),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (_.String.member(value) && value[0] === '[') {
                    // could be json
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        // fail silently
                    }
                }
                return value;
            },
        ]),
    },
});

ArrayProperty.minLength = ArrayProperty.withMeta('minLength');
ArrayProperty.maxLength = ArrayProperty.withMeta('maxLength');
ArrayProperty.of = (ofProperty, property) => {
    if (!Property.member(ofProperty)) {
        ofProperty = Property.typed(ofProperty);
    }

    return ArrayProperty.withMeta('of', ofProperty, property);
};
ArrayProperty.unique = ArrayProperty.withMeta('unique', true);
ArrayProperty.notUnique = ArrayProperty.withMeta('unique', false);

const _load = ArrayProperty.load;
ArrayProperty.load = _.curry((value, property) => {
    value = _load(value, property);
    if (_.Array.member(value)) {
        value = _.map((v) => property._meta.of.load(v), value);
        if (property._meta.unique) {
            value = _.unique(value);
        }
    }

    return value;
});

const _unload = ArrayProperty.unload;
ArrayProperty.unload = _.curry((value, property) => {
    if (_.Array.member(value)) {
        value = _.map(property._meta.of.unload, _unload(value, property));
    }

    return value;
});

Object.assign(ArrayProperty.prototype, {
    minLength: _.thisify(ArrayProperty.minLength),
    maxLength: _.thisify(ArrayProperty.maxLength),
    of: _.thisify(ArrayProperty.of),
    unique: _.thisify(ArrayProperty.unique),
    notUnique: _.thisify(ArrayProperty.notUnique),
    load: _.thisify(ArrayProperty.load),
    unload: _.thisify(ArrayProperty.unload),
});

module.exports = ArrayProperty.empty();
