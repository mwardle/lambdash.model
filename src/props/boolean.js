const _ = require('lambdash');
const Property = require('../Property');

const BooleanProperty = Property._extend('BooleanProperty', {
    defaults: {
        _signature: _.Boolean,
        _meta: _.concat(Property._defaults._meta, {
            defaultValue: false,
        }),
        _preloaders: _.concat(Property._defaults._preloaders, [
            (value, property) => {
                if (_.String.member(value)) {
                    if (value === 'true') {
                        return true;
                    } else if (value === 'false') {
                        return false;
                    }
                } else if (_.Integer.member(value)) {
                    if (value === 1) {
                        return true;
                    } else if (value === 0) {
                        return false;
                    }
                }

                return value;
            },
        ]),
    },
});

module.exports = BooleanProperty.empty();
