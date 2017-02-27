const _ = require('lambdash');
const model = require('../src/model');
const Schema = model.Schema;

const assert = require('assert');

const assertEqual = function(left, right) {
    if (!_.eq(left,right)) {
        assert.fail(left, right, undefined, 'eq');
    }
};

const normalProps = {
    i: Schema.integer,
    n: Schema.float,
    s: Schema.string,
};

// const Test = model.create('Test', normalProps);

describe('model', function() {
    describe('#create', function() {
        const Test = model.create('Test', normalProps);
        it('returns a model type', function() {
            assert.equal(typeof Test, 'function');
            assert.equal(Test.length, 3);
            assert.equal(Test.name, 'Test');

            // make sure no exceptions.
            const t = Test(1,1.2,'ok');

            // make sure exception;
            try {
                Test(1.2,1.2,'ok');
                assert(false);
            } catch (e) {
                assert(e instanceof TypeError);
                assert(e.message.indexOf('tag i') !== -1);
            }
        });

        it('creates a type with a schema property', function() {
            assert(Test.schema);
            assertEqual(Test.schema.properties, normalProps);
        });

        it('creates a type with a default property', function() {
            assert(Test.default);
            assertEqual(Test.default, Test.fromObject({i:0,n:0,s:''}));
        });

        it('creates a type with a validate function', function() {
            let t = Test(1,2,'ok');
            assertEqual(Test.validate(t), {});
            assertEqual(t.validate(), {});

            const Constrained = model.create('Constrained', {
                i: Schema.integer.max(5),
            });

            t = Constrained(4);
            assertEqual(Constrained.validate(t), {});
            assertEqual(t.validate(), {});
            t = Constrained(6);

            let v = Constrained.validate(t);
            assert(_.keys(v).length, 1);
            assertEqual(_.keys(v), ['i']);
            assertEqual(typeof v.i, 'string');

            v = t.validate();
            assert(_.keys(v).length, 1);
            assertEqual(_.keys(v), ['i']);
            assertEqual(typeof v.i, 'string');
        });

        it('creates a type with an isValid function', function() {
            let t = Test(1,2,'ok');
            assertEqual(Test.isValid(t), true);
            assertEqual(t.isValid(), true);

            const Constrained = model.create('Constrained', {
                i: Schema.integer.max(5),
            });

            t = Constrained(4);
            assertEqual(Constrained.isValid(t), true);
            assertEqual(t.isValid(), true);

            t = Constrained(6);
            assertEqual(Constrained.isValid(t), false);
            assertEqual(t.isValid(), false);
        });

        it('creates a type with a load function', function() {
            let t = Test.load({n:2.3,i:1,s:'ok'});
            assertEqual(t, Test(1,2.3,'ok'));

            t = Test.load({});
            assertEqual(t, Test.default);

            t = Test.load({n:1.2});
            assertEqual(t, Test(0,1.2,''));
        });

        it('creates a type with an unload function', function() {
            const t = Test(1,2.2,'ok');
            assertEqual(Test.unload(t), {i:1,n:2.2,s:'ok'});
            assertEqual(t.unload(), {i:1,n:2.2,s:'ok'});
        });

        it('creates a type with an update function', function() {
            const t = Test.default;
            assertEqual(Test.update({i:2},t), Test(2,0,''));
            assertEqual(t.update({i:2}), Test(2,0,''));
        });

        it('creates a type with a set function', function() {
            const t = Test.default;
            assertEqual(Test.set('i',2,t), Test(2,0,''));
            assertEqual(t.set('i',2), Test(2,0,''));
        });

        it('creates a type with a patch function', function() {
            const t = Test.default;
            assertEqual(Test.patch({i:2,n:1.2}, t), Test(2,1.2,''));
        });
    });
});
