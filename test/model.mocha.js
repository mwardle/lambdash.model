var _ = require('lambdash');
var model = require('../src/model');
var Schema = model.Schema;

var assert = require('assert');

var assertEqual = function(left, right){
    if (!_.eq(left,right)){
        assert.fail(left, right, undefined, 'eq');
    }
};

var normalProps = {
    i: Schema.int,
    n: Schema.num,
    s: Schema.str
}

// var Test = model.create('Test', normalProps);

describe('model', function(){
    describe('#create', function(){
        var Test = model.create('Test', normalProps);
        it('should return a model type', function(){
            assert.equal(typeof Test, 'function');
            assert.equal(Test.length, 3);
            assert.equal(Test.name, 'Test');

            // make sure no acceptions.
            var t = Test(1,1.2,'ok');

            // make sure exception;
            try {
                Test(1.2,1.2,'ok');
                assert(false);
            } catch (e) {
                assert(e instanceof TypeError);
                assert(e.message.indexOf('tag i') !== -1);
            }
        });

        it('should create a type with a schema property', function(){
            assert(Test.schema);
            assertEqual(Test.schema.properties, normalProps);
        });

        it('should create a type with a default property', function(){
            assert(Test.default);
            assertEqual(Test.default, Test.fromObject({i:0,n:0,s:''}));
        });

        it('should create a type with a validate function', function(){
            var t = Test(1,2,'ok');
            assertEqual(Test.validate(t), {});

            var Constrained = model.create('Constrained', {
                i: Schema.int.max(5)
            });

            t = Constrained(4);
            assertEqual(Constrained.validate(t), {});
            t = Constrained(6);
            var v = Constrained.validate(t);
            assert (_.keys(v).length, 1);
            assertEqual(_.keys(v), ['i']);
            assertEqual(typeof v.i, 'string');
        });

        it('should create a type with an isValid function', function(){
            var t = Test(1,2,'ok');
            assertEqual(Test.isValid(t), true);

            var Constrained = model.create('Constrained', {
                i: Schema.int.max(5)
            });

            t = Constrained(4);
            assertEqual(Constrained.isValid(t), true);
            t = Constrained(6);
            assertEqual(Constrained.isValid(t), false);
        });

        it('should create a type with a load function', function(){
            var t = Test.load({n:2.3,i:1,s:'ok'});
            assertEqual(t, Test(1,2.3,'ok'));

            t = Test.load({});
            assertEqual(t, Test.default);

            t = Test.load({n:1.2});
            assertEqual(t, Test(0,1.2,''));
        });

        it('should create a type with an unload function', function(){
            var t = Test(1,2.2,'ok');
            assertEqual(Test.unload(t), {i:1,n:2.2,s:'ok'});
        });

        it('should create a type with a set function', function(){
            var t = Test.default;
            assertEqual(Test.set('i',2,t), Test(2,0,''));
        });

        it('should create a type with a patch function', function(){
            var t = Test.default;
            assertEqual(Test.patch({i:2,n:1.2}, t), Test(2,1.2,''));
        });
    });
});
