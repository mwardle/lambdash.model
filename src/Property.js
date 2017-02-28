const _ = require('lambdash');
const Either = require('lambdash.either');
const _useModuleMethod = _.Type.useModuleMethod;

_.Any.name = 'Any';

const _signature = {
    _validators: _.Sequential,
    _preloaders: _.Sequential,
    _messages: _.Associative,
    _meta: _.Associative,
    _signature: _.Type,
};

const extendProperty = (parent) => (name, options = {}) => {
    const {
        properties = {},
        defaults = {},
    } = options;

    const _sig = Object.freeze(_.concat(parent ? parent._signature : _signature, properties));
    const _Property = _.Type.product(name, _sig, parent ? parent.prototype : null);

    _Property._signature = _signature;

    _Property.withValidator = _.curry((fn, property) => property.patch({
        _validators: _.append(fn, property._validators),
    }));

    _Property.withMessage = _.curry((key, message, property) => property.patch({
        _messages: _.assoc(key, message, property._messages),
    }));

    _Property.withMeta = _.curry((key, value, property) => property.patch({
        _meta: _.assoc(key, value, property._meta),
    }));

    _Property.withPreloader = _.curry((preloader, property) => property.patch({
        _preloaders: _.append(preloader, property._preloaders),
    }));

    _Property.meta = _.curry((key, property) => property._meta[key]);

    _Property.defaultsTo = _Property.withMeta('defaultValue');
    _Property.optional = _Property.withMeta('required', false);
    _Property.required = _Property.withMeta('required', true);
    _Property.isRequired = _.compose(_.prop('value'), _Property.meta('required'));
    _Property.isOptional = _.not(_Property.isRequired);


    const _getValidation = (value, property) => _.foldl((either, validator) => either.chain((value) => {
        return validator(value, property);
    }), Either.Right(value), property._validators);

    _Property.validate = (value, property) => {
        const validation = _getValidation(value, property);

        if (validation.isLeft() && _.Array.member(validation.value)) {
            let [key, message] = validation.value;
            return _.String.member(property._messages[key])
                ? Either.Left(property._messages[key])
                : Either.Left(message)
            ;
        }

        return validation;
    };

    _Property.isValid = (value, property) => {
        const validation = _getValidation(value, property);

        return validation.isRight();
    };

    _Property.default = (property) => {
        let _default = _Property.meta('defaultValue', property);
        return _.Function.member(_default) ? _default(property) : _default;
    };

    _Property.signature = (property) => _.prop('_signature', property);

    _Property.load = parent ? parent.load : _.curry((value, property) => {
        if (value == null) {
            return value;
        }

        value = _.foldl((v, fn) => fn(v, property), value, property._preloaders);

        return value;
    });

    _Property.unload = parent ? parent.unload : _.curry((value, property) => {
        if (value == null) {
            return value;
        }

        return value;
    });

    const _defaults = _.concat({
        _validators: parent ? _.drop(0, parent._defaults._validators) : Object.freeze([(value, property) => {
            if (!property._signature.member(value)) {
                if (_.Unit.member(value) && property._meta.required) {
                    return Either.Left(['required', 'a value must be provided.']);
                } else if (!_.Unit.member(value)) {
                    return Either.Left(['signature', 'not the correct type.']);
                }
            }

            return Either.Right(value);
        }]),
        _preloaders: parent ? _.drop(0, parent._defaults._preloaders) : [],
        _messages: parent ? _.copy(parent._defaults._messages) : {},
        _meta: parent ? parent._defaults._meta : {
            required: true,
            defaultValue: null,
        },
        _signature: parent ? parent._defaults._signature : _.Any,
    }, defaults);

    _Property._defaults = _defaults;

    _Property.empty = _.compose(_Property.fromObject, _.thunk(_.prop, '_defaults', _Property));

    Object.assign(_Property.prototype, {
        withValidator: _.thisify(_Property.withValidator),
        withMessage: _.thisify(_Property.withMessage),
        withMeta: _.thisify(_Property.withMeta),
        withPreloader: _.thisify(_Property.withPreloader),
        meta: _.thisify(_Property.meta),
        defaultsTo: _.thisify(_Property.defaultsTo),
        optional: _.thisify(_Property.optional),
        required: _.thisify(_Property.required),
        isOptional: _.thisify(_Property.isOptional),
        isRequired: _.thisify(_Property.isRequired),
        validate: _.thisify(_Property.validate),
        isValid: _.thisify(_Property.isValid),
        'default': _.thisify(_Property.default),
        signature: _.thisify(_Property.signature),
        load: _.thisify(_Property.load),
        unload: _.thisify(_Property.unload),
    });

    _Property._extend = extendProperty(_Property);

    return _Property;
};

const Property = module.exports;
const BaseProperty = extendProperty(null)('Property');

Property._defaults = BaseProperty._defaults;
Property._extend = BaseProperty._extend;
Property.empty = BaseProperty.empty;
Property.member = BaseProperty.member;

Property.signature = _.curryN(1, _useModuleMethod('signature'));
Property.default = _.curryN(1, _useModuleMethod('default'));
Property.validate = _.curryN(2, _useModuleMethod('validate'));
Property.isValid = _.curryN(2, _useModuleMethod('isValid'));
Property.load = _.curryN(2, _useModuleMethod('load'));
Property.unload = _.curryN(2, _useModuleMethod('unload'));

Property.Typed = _.typecached((T) => {
    const _Property = Property._extend(`${T.name}Property`, {defaults: {_signature: T}});
    _Property.load = _.curry((value, property) => {
        if (value == null) {
            return value;
        }

        value = _.foldl((v, fn) => fn(v, property), value, property._preloaders);

        if (_.Function.member(T.load)) {
            value = T.load(value);
        } if (_.Function.member(T.fromObject)) {
            value = T.fromObject(value);
        }

        return value;
    });

    _Property.unload =  _.curry((value, property) => {
        if (value == null) {
            return value;
        }

        if (_.Function.member(T.unload)) {
            value = T.unload(value);
        } else if (_.Function.member(T.toObject)) {
            value = T.toObject(value);
        }

        return value;
    });

    Object.assign(_Property.prototype, {
        load: _.thisify(_Property.load),
        unload: _.thisify(_Property.unload),
    });

    return _Property;
});
