const _ = require('lambdash');

const Schema = require('./Schema');
const props = require('./properties');

const createModel = (name, propDefs) => {
    const schema = Schema(propDefs);
    const definition = Schema.definition(schema);
    const defaults = Schema.default(schema);

    const Model = _.Type.product(name, definition);

    Object.defineProperty(Model, 'schema', {
        configurable: false,
        enumerable: true,
        get: () => schema,
    });

    Object.defineProperty(Model, 'default', {
        configurable: false,
        enumerable: true,
        get: _.thunk(Model.fromObject, defaults),
    });

    Model.validate = Schema.validate(_, schema);
    Model.isValid = Schema.isValid(_, schema);
    Model.load = _.pipe(Schema.load(_, schema), Model.fromObject);
    Model.unload = Schema.unload(_, schema);

    return Model;
};

const extend = _.curry((old, extension) => {
    const {
        props = {},
    } = extension;

    const model = {};

    model.extend = extend(model);
    model.Schema = Schema;
    model.props = _.concat(old.props, props);
    model.create = createModel;

    return model;
});

const defaults = {
    props,
};

module.exports = extend(defaults, {});
