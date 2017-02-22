const _ = require('lambdash');
const Either = require('lambdash.either');

const Property = require('./Property');

const Schema = _.Type.product('Schema', {properties: _.Object});

const _properties = _.prop('properties');

Schema.definition = _.compose(_.map(Property.definition), (p) => {console.log('P',p); return p; }, _properties);

Schema.default = _.compose(_.map(Property.default), _properties);

Schema.validate = _.curry(function(model, schema) {
    return _.map(_.prop('value'), _.filterAssoc(Either.isLeft, _.mapAssoc(function(prop, key) {
        return Property.validate(_.prop(key, model), prop);
    }, _properties(schema))));
});

Schema.isValid = _.curry(function(model, schema) {
    return _.foldlAssoc(function(accum, prop, key) {
        return accum && Either.isRight(Property.validate(_.prop(key, model), prop));
    }, true, _properties(schema));
});

Schema.load = _.curry(function(data, schema) {
    const props = _properties(schema);
    return _.concat(Schema.default(schema), _.mapAssoc(function(value, key) {
        return _.Associative.exists(key, props)
            ? Property.load(value, props[key])
            : value;
    }, data));
});

Schema.unload = _.curry(function(model, schema) {
    return _.mapAssoc(function(prop, key) {
        return Property.unload(_.prop(key, model), prop);
    }, _properties(schema));
});

Object.assign(Schema, require('./properties'));

Schema.Property = Property;

module.exports = Schema;
