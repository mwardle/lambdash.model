const _ = require('lambdash');

const _useModuleMethod = _.Type.useModuleMethod;

const Property = exports;

Property.name = 'Property';
Property.definition = _.curryN(1, _useModuleMethod('definition'));
Property.default = _.curryN(1, _useModuleMethod('default'));
Property.validate = _.curryN(2, _useModuleMethod('validate'));
Property.load = _.curryN(2, _useModuleMethod('load'));
Property.unload = _.curryN(2, _useModuleMethod('unload'));

Property.member = function(property) {
    const M = _.Type.moduleFor(property);
    return _.Fun.member(M.definition)
        && _.Fun.member(M.default)
        && _.Fun.member(M.validate)
        && _.Fun.member(M.load)
        && _.Fun.member(M.unload);
};
