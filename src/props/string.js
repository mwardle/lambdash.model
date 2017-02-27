const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');

const Case = _.Type.enumerated('Case', ['Keep', 'Lower', 'Upper']);

Case.process = (v, _case) => Case.case({
    Keep: v,
    Lower: () => v.toLowerCase(),
    Upper: () => v.toUpperCase(),
}, _case);

const StringProperty = Property._extend('StringProperty', {
    defaults: {
        _signature: _.String,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: '',
            minLength: 0,
            maxLength: Infinity,
            match: null,
            trim: false,
            'case': Case.Keep,
        }),
        _validators: _.concat(Property._defaults._validators, [
            (value, property) => {
                let match = property._meta.match;
                let selection = property._meta.selection;
                if (value != null && value.length < property._meta.minLength) {
                    return Either.Left(['minLength', `must be at least ${property._meta.minLength} characters long.`]);
                } else if (value != null && value.length > property._meta.maxLength) {
                    return Either.Left(['maxLength', `must be no more than ${property._meta.maxLength} characters long.`]);
                } else if (value != null && match != null && _.RegExp.member(match) && !_.test(value, match)) {
                    return Either.Left(['match', 'does not match the required format.']);
                } else if (value != null && _.SetKind.member(selection) && !_.exists(value, selection)) {
                    return Either.Left(['selection', 'is not one of the allowed values.']);
                }

                return Either.Right(value);
            },
        ]),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (!_.String.member(value)) {
                    return value;
                }
                if (property._meta.trim) {
                    value = value.trim();
                }


                return Case.process(value, property._meta.case);
            },
        ]),
    },
});

StringProperty.minLength = StringProperty.withMeta('minLength');
StringProperty.maxLength = StringProperty.withMeta('maxLength');
StringProperty.match = StringProperty.withMeta('match');
StringProperty.selection = StringProperty.withMeta('selection');
StringProperty.trim = StringProperty.withMeta('trim', true);
StringProperty.lowercase = StringProperty.withMeta('case', Case.Lower);
StringProperty.uppercase = StringProperty.withMeta('case', Case.Upper);

Object.assign(StringProperty.prototype, {
    minLength: _.thisify(StringProperty.minLength),
    maxLength: _.thisify(StringProperty.maxLength),
    match: _.thisify(StringProperty.match),
    selection: _.thisify(StringProperty.selection),
    trim: _.thisify(StringProperty.trim),
    lowercase: _.thisify(StringProperty.lowercase),
    uppercase: _.thisify(StringProperty.uppercase),
});

module.exports = StringProperty.empty();
