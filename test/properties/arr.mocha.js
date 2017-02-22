var assert = require('assert');

var _ = require('lambdash');
var Either = require('lambdash.either');

var Property = require('../../src/Property');
var arr = require('../../src/properties/arr');
var int = require('../../src/properties/int');


var TestProp = _.Type.product('TestProp', {});

TestProp.definition = function(p){return _.Any};
TestProp.default = function(p){return 'abacus'};
TestProp.validate = function(v,p){return v === 'abacus' || v === 'bird' ? Either.Right(v) : Either.Left('not right')};
TestProp.load = function(v,p){return v === 'a' ? 'abacus' : 'bird'};
TestProp.unload = function(v,p){return v === 'abacus' ? 'a' : 'b'};


var assertEqual = function(left, right){
    if (!_.eq(left,right)){
        assert.fail(left, right, undefined, 'eq');
    }
};

describe('arr', function() {
    it('should implement Property', function(){
        assert(Property.member(arr));
    });

    describe('#definition', function(){
        it('should return _.Arr if not optional', function(){
            assert.equal(Property.definition(arr), _.Arr);
        });

        it('should return an object with a member function if optional', function(){
            var def = Property.definition(arr.optional());

            assert(def);
            assert(def !== _.Arr);
            assert(_.Fun.member(def.member));

            assert(!def.member(1));
            assert(!def.member(1.2));
            assert(!def.member(Infinity));
            assert(!def.member(-Infinity));
            assert(def.member(null));
            assert(def.member(undefined));
            assert(def.member([]));
            assert(!def.member({}));
            assert(!def.member('nope'));
        });
    });

    describe('#default', function(){
        it('should return []', function(){
            assertEqual(Property.default(arr), []);
        });

        it('should return the assigned default if changed', function(){
            assertEqual(Property.default(arr.defaultsTo([1,2,3])), [1,2,3]);
        });
    });

    describe('#optional', function(){
        it('should make the property optional', function(){
            assert(!arr._optional);
            var optArr = arr.optional();
            assert(optArr._optional);
            assert(!arr._optional);
        });
    });

    describe('#required', function(){
        it('should make a property not optional', function(){
            var optArr = arr.optional();
            assert(optArr._optional);
            var notOptArr = optArr.required();
            assert(optArr._optional);
            assert(!notOptArr._optional);
        });
    });

    describe('#defaultsTo', function(){
        it('should change the records _defaultsTo value', function(){
            assertEqual(arr._defaultsTo, []);
            assertEqual(arr.defaultsTo([1,2,3])._defaultsTo, [1,2,3]);
            assertEqual(arr._defaultsTo, []);
        });

        it('should throw an exception if given a value that is not a Integer', function(){
            try {
                arr.defaultsTo("abacus");
                assert(false);
            } catch(e) {
                assert(e instanceof TypeError);
            }
        });
    });

    describe('#load', function(){
        it('should return the value', function(){
            assertEqual(Property.load([], arr), []);
            assertEqual(Property.load([1,2,3], arr), [1,2,3]);
        });

        it('should use the contains type', function(){
            var arrTest = arr.contains(TestProp());
            assertEqual(Property.load(['a','a','b'], arrTest), ['abacus', 'abacus', 'bird']);
        });
    });

    describe('#unload', function(){
        it('should return the value', function(){
            assertEqual(Property.unload([], arr), []);
            assertEqual(Property.unload([1,2,3], arr), [1,2,3]);
        });

        it('should use the contains type', function(){
            var arrTest = arr.contains(TestProp());
            assertEqual(Property.unload(['abacus', 'abacus', 'bird'], arrTest), ['a','a','b']);
        });
    });

    describe('#minLen', function(){
        it('should change the records min length value', function(){
            assert.equal(arr._minLen, 0);
            assert.equal(arr.minLen(3)._minLen, 3);
            assert.equal(arr._minLen, 0);

            assert.equal(_.Type.moduleFor(arr), _.Type.moduleFor(arr.minLen(21)));
        });
    });

    describe('#max', function(){
        it('should change the records min lenth value', function(){
            assert.equal(arr._maxLen, _.Int.maxBound());
            assert.equal(arr.maxLen(3)._maxLen, 3);
            assert.equal(arr._maxLen, _.Int.maxBound());

            assert.equal(_.Type.moduleFor(arr), _.Type.moduleFor(arr.maxLen(21)));
        });
    });

    describe('#validate', function(){
        it('should validate with any array by default', function(){
            assert(Either.isRight(Property.validate([], arr)));
            assert(Either.isRight(Property.validate([1], arr)));
            assert(Either.isRight(Property.validate(['abacus', 1, {a:2}], arr)));
        });

        it('should not validate a non-array', function(){
            assert(Either.isLeft(Property.validate(1.2, arr)));
            assert(Either.isLeft(Property.validate({}, arr)));
            assert(Either.isLeft(Property.validate('', arr)));
            assert(Either.isLeft(Property.validate(null, arr)));
            assert(Either.isLeft(Property.validate(undefined, arr)));
            assert(Either.isLeft(Property.validate(Infinity, arr)));
            assert(Either.isLeft(Property.validate(-Infinity, arr)));
            assert(Either.isLeft(Property.validate(NaN, arr)));
        });

        it('should constrain the max length if the max length is given', function(){
            var maxedArr = arr.maxLen(4)
            assert(Either.isRight(Property.validate([1], maxedArr)));
            assert(Either.isLeft(Property.validate([1,2,3,4,5], maxedArr)));
            assert(Either.isRight(Property.validate([1,2,3,4], maxedArr)));
        });

        it('should constrain the min length if the min length is given', function(){
            var minnedArr = arr.minLen(4)
            assert(Either.isRight(Property.validate([1,2,3,4,5], minnedArr)));
            assert(Either.isLeft(Property.validate([1,2,3], minnedArr)));
            assert(Either.isRight(Property.validate([1,2,3,4], minnedArr)));
        });

        it('should validate with null or undefined if it is optional', function(){
            var optArr = arr.optional();
            assert(Either.isRight(Property.validate(['hello'], optArr)));
            assert(Either.isRight(Property.validate(null, optArr)));
            assert(Either.isRight(Property.validate(undefined, optArr)));
        });

        it('should use the contains if given', function(){
            var intArr = arr.contains(int);

            assert(Either.isRight(Property.validate([], intArr)));
            assert(Either.isRight(Property.validate([1,2,3], intArr)));
            assert(Either.isLeft(Property.validate(['a'], intArr)));
            assert(Either.isLeft(Property.validate([1,2,3,'4'], intArr)));
            assert(Either.isLeft(Property.validate(['1',2,3,4], intArr)));
        });
    });

});
