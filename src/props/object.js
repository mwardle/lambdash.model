const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');
const any = require('./any');

const ObjectProperty = Property._extend('ObjectProperty', {
    defaults: {
        _signature: _.Object,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: Object.freeze({}),
            of: any,
            minKeys: 0,
            maxKeys: Infinity,
            requiredKeys: [],
            bannedKeys: [],
        }),
        _validators: _.concat(Property._defaults._validators, [
            (value, property) => {
                let of = property._meta.of;
                let keys = value && Object.keys(value);

                if (value == null) {
                    return Either.Right(value);
                } else if (keys.length < property._meta.minKeys) {
                    return Either.Left(['minKeys', `must have at least ${property._meta.minKeys} items.`]);
                } else if (keys.length > property._meta.maxKeys) {
                    return Either.Left(['maxKeys', `must have no more than ${property._meta.maxKeys} items.`]);
                }

                if (property._meta.requiredKeys.length) {
                    let missing = _.difference(property._meta.requiredKeys, keys);
                    if (missing.length) {
                        return Either.Left(['requireKeys', `key${missing.length > 1 ? 's' : ''} ${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`]);
                    }
                }

                if (property._meta.bannedKeys.length) {
                    let found = _.intersection(property._meta.bannedKeys, keys);
                    if (found.length) {
                        return Either.Left(['banKeys', `key${found.length > 1 ? 's' : ''} ${found.join(', ')} ${found.length > 1 ? 'are' : 'is'} banned.`]);
                    }
                }

                return _.foldlAssoc((res, v, k) => {
                    return res.chain((_) => {
                        let _res = of.validate(v);
                        if (_res.isLeft()) {
                            return Either.Left(['of', `Invalid item for key ${k}: ${_res.value}`]);
                        }
                        return res;
                    });
                }, Either.Right(value), value);

            },
        ]),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (_.String.member(value) && _.head(value) === '{') {
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

ObjectProperty.minKeys = ObjectProperty.withMeta('minKeys');
ObjectProperty.maxKeys = ObjectProperty.withMeta('maxKeys');
ObjectProperty.of = (ofProperty, property) => {
    if (!Property.member(ofProperty)) {
        ofProperty = Property.typed(ofProperty);
    }

    return ObjectProperty.withMeta('of', ofProperty, property);
};

ObjectProperty.requireKeys = _.curry((keys, property) => {
    return ObjectProperty.withMeta('requiredKeys', _.union(keys, property._meta.requiredKeys), property);
});

ObjectProperty.banKeys = _.curry((keys, property) => {
    return ObjectProperty.withMeta('bannedKeys', _.union(keys, property._meta.bannedKeys), property);
});

const _load = ObjectProperty.load;
ObjectProperty.load = _.curry((value, property) => {
    value = _load(value, property);
    if (_.Object.member(value)) {
        value = _.map((v) => property._meta.of.load(v), value);
        if (property._meta.unique) {
            value = _.unique(value);
        }
    }

    return value;
});

const _unload = ObjectProperty.unload;
ObjectProperty.unload = _.curry((value, property) => {
    if (_.Object.member(value)) {
        value = _.map(property._meta.of.unload, _unload(value, property));
    }

    return value;
});

Object.assign(ObjectProperty.prototype, {
    minKeys: _.thisify(ObjectProperty.minKeys),
    maxKeys: _.thisify(ObjectProperty.maxKeys),
    of: _.thisify(ObjectProperty.of),
    requireKeys: _.thisify(ObjectProperty.requireKeys),
    banKeys: _.thisify(ObjectProperty.banKeys),
    load: _.thisify(ObjectProperty.load),
    unload: _.thisify(ObjectProperty.unload),
});

module.exports = ObjectProperty.empty();
