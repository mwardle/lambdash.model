var _ = require('lambdash');
var Schema = require('../src/Schema');

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

describe('Schema', function(){
    describe('#definition', function(){
        it('should return a definition for each schema property', function(){
            var s = Schema(normalProps);
            assertEqual(_.prop('properties', s), normalProps);
            assert.equal(Schema.definition.length, 1);
            assertEqual(Schema.definition(s), {i: _.Int, n: _.Num, s: _.Str});
        });
    });

    describe('#default', function(){
        it('should return the defaults for each schema property', function(){
            var s = Schema(normalProps);
            assertEqual(Schema.default(s), {i: 0, n: 0, s: ''});

        });
    });

    describe('#unload', function(){
        it('should convert values to jsonable format', function(){
            var s = Schema(normalProps);
            var m = {i:1,n:2,s:'3'};
            assertEqual(Schema.unload(m, s), {i:1,n:2,s:'3'})
        });
    });

    describe('#load', function(){
        it('should convert values from json format', function(){
            var s = Schema(normalProps);
            var m = {i:1,n:2,s:'3'};
            assertEqual(Schema.load(m, s), {i:1,n:2,s:'3'})
        });
    });

    describe('#validate', function(){
        it('should return an empty object if all properties are valid', function(){
            var s = Schema(normalProps);
            var m = {i:1,n:2,s:'3'};
            var v = Schema.validate(m, s);

            assertEqual(v, {});
        });

        it('should return an object of errors if any properties are not valid', function(){
            var s = Schema(normalProps);
            var m = {i:1.2,n:'n',s:null};
            var v = Schema.validate(m, s);

            assert.equal(_.keys(v).length, 3);
            assertEqual(_.keys(v), ['i','n','s']);
            assert(typeof v.i === 'string');
            assert(typeof v.n === 'string');
            assert(typeof v.s === 'string');
        });
    });

    describe('#isValid', function(){
        it('should return true if all properties are valid', function(){
            var s = Schema(normalProps);
            var m = {i:1,n:2,s:'3'};
            var v = Schema.isValid(m, s);

            assertEqual(v, true);
        });

        it('should return an object of errors if any properties are not valid', function(){
            var s = Schema(normalProps);
            var m = {i:1.2,n:'n',s:null};
            var v = Schema.isValid(m, s);

            assertEqual(v, false);
        });
    });
});
