var assert = require('assert');

var _ = require('lambdash');
var Either = require('lambdash.either');

var Property = require('../../src/Property');
var Str = require('../../src/properties/str');

describe('Str', function(){
    it('should implement Property', function(){
        assert(Property.member(Str));
    });

    describe('#definition', function(){
        it('should return _.Str if not optional', function(){
            assert.equal(Property.definition(Str), _.Str);
        });

        it('should return an object with a member function if optional', function(){
            var def = Property.definition(Str.optional());

            assert(def);
            assert(def !== _.Str);
            assert(_.Fun.member(def.member));

            assert(!def.member(1));
            assert(!def.member(1.2));
            assert(!def.member(Infinity));
            assert(!def.member(-Infinity));
            assert(def.member(null));
            assert(def.member(undefined));
            assert(!def.member({}));
            assert(def.member('nope'));
        });
    });

    describe('#default', function(){
        it('should return an empty string', function(){
            assert.equal(Property.default(Str), '');
        });

        it('should return the assigned default if changed', function(){
            assert.equal(Property.default(Str.defaultsTo('apple')), 'apple');
        });
    });

    describe('#optional', function(){
        it('should make the property optional', function(){
            assert(!Str._optional);
            var OptStr = Str.optional();
            assert(OptStr._optional);
            assert(!Str._optional);
        });
    });

    describe('#required', function(){
        it('should make a property not optional', function(){
            var OptStr = Str.optional();
            assert(OptStr._optional);
            var NotOptStr = OptStr.required();
            assert(OptStr._optional);
            assert(!NotOptStr._optional);
        });

    });

    describe('#defaultsTo', function(){
        it('should change the records _defaultsTo value', function(){
            assert.equal(Str._defaultsTo, '');
            assert.equal(Str.defaultsTo('orange')._defaultsTo, 'orange');
            assert.equal(Str._defaultsTo, '');
        });

        it('should throw an exception if given a value that is not a Streger', function(){
            try {
                Str.defaultsTo(1);
                assert(false);
            } catch(e) {
                assert(e instanceof TypeError);
            }
        });
    });

    describe('#load', function(){
        it('should return the value', function(){
            assert.equal(Property.load('berry', Str), 'berry');
            assert.equal(Property.load(null, Str), null);
        });
    });

    describe('#unload', function(){
        it('should return the value', function(){
            assert.equal(Property.unload('watermelon', Str), 'watermelon');
            assert.equal(Property.unload(null, Str), null);
        });
    });

    describe('#minLen', function(){
        it('should change the records min length value', function(){
            assert.equal(Str._minLen, 0);
            assert.equal(Str.minLen(3)._minLen, 3);
            assert.equal(Str._minLen, 0);

            assert.equal(_.Type.moduleFor(Str), _.Type.moduleFor(Str.minLen(21)));
        });
    });

    describe('#max', function(){
        it('should change the records min lenth value', function(){
            assert.equal(Str._maxLen, _.Int.maxBound());
            assert.equal(Str.maxLen(3)._maxLen, 3);
            assert.equal(Str._maxLen, _.Int.maxBound());

            assert.equal(_.Type.moduleFor(Str), _.Type.moduleFor(Str.maxLen(21)));
        });
    });

    describe('#validate', function(){
        it('should validate with any string by default', function(){
            assert(Either.isRight(Property.validate('', Str)));
            assert(Either.isRight(Property.validate('\0', Str)));
            assert(Either.isRight(Property.validate('abacus', Str)));
        });

        it('should not validate a non-string', function(){
            assert(Either.isLeft(Property.validate(1.2, Str)));
            assert(Either.isLeft(Property.validate({}, Str)));
            assert(Either.isLeft(Property.validate([], Str)));
            assert(Either.isLeft(Property.validate(null, Str)));
            assert(Either.isLeft(Property.validate(undefined, Str)));
            assert(Either.isLeft(Property.validate(Infinity, Str)));
            assert(Either.isLeft(Property.validate(-Infinity, Str)));
            assert(Either.isLeft(Property.validate(NaN, Str)));
        });

        it('should constrain the max length if the max length is given', function(){
            var MaxedStr = Str.maxLen(4)
            assert(Either.isRight(Property.validate('a', MaxedStr)));
            assert(Either.isLeft(Property.validate('abcde', MaxedStr)));
            assert(Either.isRight(Property.validate('abcd', MaxedStr)));
        });

        it('should constrain the min length if the min length is given', function(){
            var MinnedStr = Str.minLen(4)
            assert(Either.isRight(Property.validate('abcde', MinnedStr)));
            assert(Either.isLeft(Property.validate('abc', MinnedStr)));
            assert(Either.isRight(Property.validate('abcd', MinnedStr)));
        });

        it('should validate with null or undefined if it is optional', function(){
            var OptStr = Str.optional();
            assert(Either.isRight(Property.validate('hello', OptStr)));
            assert(Either.isRight(Property.validate(null, OptStr)));
            assert(Either.isRight(Property.validate(undefined, OptStr)));
        });
    });
});
