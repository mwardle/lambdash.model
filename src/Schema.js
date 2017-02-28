const _ = require('lambdash');
const Either = require('lambdash.either');

const Property = require('./Property');

const Schema = _.Type.product('Schema', {properties: _.Object});

const _properties = _.prop('properties');

Schema.signature = _.compose(_.map(Property.signature), _properties);

Schema.default = _.compose(_.map(Property.default), _properties);

Schema.validate = _.curry(function(model, schema) {
    return _.map(_.prop('value'), _.Object.filter(Either.isLeft, _.mapAssoc(function(prop, key) {
        return Property.validate(_.prop(key, model), prop);
    }, _properties(schema))));
});

Schema.isValid = _.curry(function(model, schema) {
    return _.foldlAssoc(function(accum, prop, key) {
        return accum && Property.isValid(_.prop(key, model), prop);
    }, true, _properties(schema));
});

Schema.load = _.curry(function(data, schema) {
    return _.concat(Schema.default(schema), Schema.update(data, schema));
});

Schema.update = _.curry(function(data, schema) {
    const props = _properties(schema);
    return  _.Obj.mapAssoc(function(value, key) {
        return _.Obj.exists(key, props)
            ? Property.load(value, props[key])
            : value;
    }, data);
});

Schema.unload = _.curry(function(model, schema) {
    return _.mapAssoc(function(prop, key) {
        return Property.unload(_.prop(key, model), prop);
    }, _properties(schema));
});

Object.assign(Schema, require('./props'));

Schema.Property = Property;

module.exports = Schema;
