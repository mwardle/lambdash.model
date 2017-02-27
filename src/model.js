const _ = require('lambdash');

const Schema = require('./Schema');
const props = require('./props');

const createModel = (name, propDefs) => {
    const schema = Schema(propDefs);
    const signature = Schema.signature(schema);

    const Model = _.Type.product(name, signature);

    Object.defineProperty(Model, 'schema', {
        configurable: false,
        enumerable: true,
        get: () => schema,
    });

    Object.defineProperty(Model, 'default', {
        configurable: false,
        enumerable: true,
        get: _.compose(Model.fromObject, _.thunk(Schema.default, schema)),
    });

    Model.validate = Schema.validate(_, schema);
    Model.isValid = Schema.isValid(_, schema);
    Model.load = _.compose(Model.fromObject, Schema.load(_, schema));
    Model.update = _.curry((values, model) => {
        return Model.patch(Schema.update(values, schema), model);
    });
    Model.set = _.curry((key, value, model) => Model.update({[key]:value}, model));
    Model.unload = Schema.unload(_, schema);

    Object.assign(Model.prototype, {
        validate() { return Model.validate(this); },
        isValid() { return Model.isValid(this); },
        update(values) { return Model.update(values, this); },
        set(key, value) { return Model.set(key, value, this); },
        unload() { return Model.unload(this); },
    });

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
