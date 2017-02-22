const _ = require('lambdash');
const Either = require('lambdash.either');
const Property = require('../Property');

const basicDef = {
    _defaultsTo: _.Any,
    _optional: _.Bool,
    _meta: _.Obj,
};

function addBasicFunctions(T, Property) {

    Property.definition = _.curry(function(property) {
        if (property._optional) {
            return _.Type.union([_.Unit, T]);
        }
        return T;
    });

    Property.default = _.prop('_defaultsTo');

    Property.defaultsTo = _.curry(function(value, property) {
        if (value != null && !T.member(value)) {
            throw new TypeError('Invalid default assigned.');
        }
        return Property.set('_defaultsTo', value, property);
    });

    Property.optional = Property.set('_optional', true);
    Property.required = Property.set('_optional', false);

    Property.validate = _.curry(function(value, property) {
        if (property._optional && value == null) {
            return Either.Right(value);
        }

        if (!T.member(value)) {
            return Either.Left('value does not have the right type');
        }

        return Either.Right(value);
    });

    Property.load = _.curry(function(value, property) {
        if (value == null) {
            return value;
        }
        if (_.Fun.member(T.fromJSON)) {
            return T.fromJSON(value);
        }
        return value;
    });

    Property.unload = _.curry(function(value, property) {
        if (value == null) {
            return value;
        }
        if (_.Fun.member(T.toJSON)) {
            return T.toJSON(value);
        }
        return value;
    });

    Property.meta = _.curry(function(meta, prop) {
        let _meta = prop._meta;
        const M = _.Type.moduleFor(_meta);
        _meta = _.Obj.concat(_meta, meta);
        if (_.Fun.member(M.fromObject)) {
            _meta = M.fromObject(_meta);
        }
        return Property.set('_meta', _meta);
    });

    Property.getMeta = _.curry(function(key, prop) {
        return _.prop(key, prop._meta);
    });

    Property.prototype.optional = _.thisify(Property.optional);
    Property.prototype.required = _.thisify(Property.required);
    Property.prototype.defaultsTo = _.thisify(Property.defaultsTo);
    Property.prototype.meta = _.thisify(Property.meta);

    return Property;
}

const defaultValidate = _.curry(function(value,prop) {
    return Either.Right(value);
});

function typedProperty(T, extraProperties, extraValidation) {
    extraValidation = _.Fun.member(extraValidation) ? extraValidation : defaultValidate;
    let def = basicDef;
    if (_.Object.member(extraProperties)) {
        def = _.concat(def, extraProperties);
    }

    const TypedProperty = _.Type.product((T.name || 'Typed') + 'Property', def);

    addBasicFunctions(T, TypedProperty);

    const _validate = TypedProperty.validate;
    TypedProperty.validate = _.curry(function(value,prop) {
        return _.chain(extraValidation(_,prop), _validate(value,prop));
    });

    return TypedProperty;
}
exports.typedProperty = typedProperty;

function addNumericFunctions(T, Property) {
    Property.min = Property.set('_min');
    Property.max = Property.set('_max');
    Property.prototype.min = _.thisify(Property.min);
    Property.prototype.max = _.thisify(Property.max);
}

function numericProperty(T, extraProperties, extraValidation) {
    extraValidation = _.Fun.member(extraValidation) ? extraValidation : defaultValidate;
    const numericDef = {
        _min: T,
        _max: T,
    };

    let def = _.concat(basicDef, numericDef);
    if (_.Obj.member(extraProperties)) {
        def = _.concat(def, extraProperties);
    }

    const NumericProperty = _.Type.product((T.name || 'Numeric') + 'Property', def);

    addBasicFunctions(T, NumericProperty);
    addNumericFunctions(T, NumericProperty);

    const _validate = NumericProperty.validate;

    NumericProperty.validate = _.curry(function(value,prop) {
        function numericValidation(value) {
            if (_.Unit.member(value)) {
                return Either.Right(value);
            }
            if (_.lt(value, prop._min) || _.gt(value, prop._max)) {
                return Either.Left('value is out of bounds');
            }
            return Either.Right(value);
        }
        return _.chain(extraValidation(_,prop), _.chain(numericValidation, _validate(value,prop)));
    });

    return NumericProperty;
}
exports.numericProperty = numericProperty;

function sequentialProperty(T, extraProperties, extraValidation) {

    extraValidation = _.Fun.member(extraValidation) ? extraValidation : defaultValidate;

    const sequentialDef = {
        _minLen: _.Int,
        _maxLen: _.Int,
        _contains: Property,
    };
    let def = _.concat(basicDef, sequentialDef);
    if (_.Obj.member(extraProperties)) {
        def = _.concat(def, extraProperties);
    }

    const SequentialProperty = _.Type.product((T.name || 'Sequential') + 'Property', def);
    addBasicFunctions(T, SequentialProperty);

    const _validate = SequentialProperty.validate;
    SequentialProperty.validate = _.curry(function(value, prop) {
        const sequentialValidate = function(value) {
            if (_.Unit.member(value)) {
                return Either.Right(value);
            }
            if (value.length < prop._minLen || value.length > prop._maxLen) {
                return Either.Left("value's length is out of bounds");
            }
            const contentsValidate = _.foldl(function(accum, value) {
                return Either.isLeft(accum) ? accum : Property.validate(value, prop._contains);
            }, Either.Right(value), value);

            if (Either.isLeft(contentsValidate)) {
                return Either.Left('invalid item: ' + contentsValidate.value);
            }
            return Either.Right(value);
        };

        return _.chain(extraValidation(_,prop), _.chain(sequentialValidate, _validate(value, prop)));
    });

    SequentialProperty.load = _.curry(function(value, prop) {
        if (_.Unit.member(value)) {
            return null;
        }
        return _.map(Property.load(_,prop._contains), value);
    });

    SequentialProperty.unload = _.curry(function(value, prop) {
        if (_.Unit.member(value)) {
            return null;
        }
        return _.map(Property.unload(_,prop._contains), value);
    });

    SequentialProperty.minLen = SequentialProperty.set('_minLen');
    SequentialProperty.maxLen = SequentialProperty.set('_maxLen');
    SequentialProperty.contains = SequentialProperty.set('_contains');

    SequentialProperty.prototype.minLen = _.thisify(SequentialProperty.minLen);
    SequentialProperty.prototype.maxLen = _.thisify(SequentialProperty.maxLen);
    SequentialProperty.prototype.contains = _.thisify(SequentialProperty.contains);

    return SequentialProperty;
}
exports.sequentialProperty = sequentialProperty;
