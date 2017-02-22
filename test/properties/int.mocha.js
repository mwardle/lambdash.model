var assert = require('assert');

var _ = require('lambdash');
var Either = require('lambdash.either');

var Property = require('../../src/Property');
var Int = require('../../src/properties/int');

describe('Int', function(){
    it('should implement Property', function(){
        assert(Property.member(Int));
    });

    describe('#definition', function(){
        it('should return _.Int if not optional', function(){
            assert.equal(Property.definition(Int), _.Int);
        });

        it('should return an object with a member function if optional', function(){
            var def = Property.definition(Int.optional());

            assert(def);
            assert(def !== _.Int);
            assert(_.Fun.member(def.member));

            assert(def.member(1));
            assert(!def.member(1.2));
            assert(!def.member(Infinity));
            assert(!def.member(-Infinity));
            assert(def.member(null));
            assert(def.member(undefined));
            assert(!def.member({}));
            assert(!def.member('nope'));
        });
    });

    describe('#default', function(){
        it('should return 0', function(){
            assert.equal(Property.default(Int), 0);
        });

        it('should return the assigned default if changed', function(){
            assert.equal(Property.default(Int.defaultsTo(2)), 2);
        });
    });

    describe('#optional', function(){
        it('should make the property optional', function(){
            assert(!Int._optional);
            var OptInt = Int.optional();
            assert(OptInt._optional);
            assert(!Int._optional);
        });
    });

    describe('#required', function(){
        it('should make a property not optional', function(){
            var OptInt = Int.optional();
            assert(OptInt._optional);
            var NotOptInt = OptInt.required();
            assert(OptInt._optional);
            assert(!NotOptInt._optional);
        });

    });

    describe('#defaultsTo', function(){
        it('should change the records _defaultsTo value', function(){
            assert.equal(Int._defaultsTo, 0);
            assert.equal(Int.defaultsTo(2)._defaultsTo, 2);
            assert.equal(Int._defaultsTo, 0);
        });

        it('should throw an exception if given a value that is not a Integer', function(){
            try {
                Int.defaultsTo("abacus");
                assert(false);
            } catch(e) {
                assert(e instanceof TypeError);
            }
        });
    });

    describe('#load', function(){
        it('should return the value', function(){
            assert.equal(Property.load(1, Int), 1);
            assert.equal(Property.load(null, Int), null);

        });
    });

    describe('#unload', function(){
        it('should return the value', function(){
            assert.equal(Property.unload(1, Int), 1);
            assert.equal(Property.unload(null, Int), null);
        });
    });

    describe('#min', function(){
        it('should change the records min value', function(){
            assert.equal(Int._min, _.Int.minBound());
            assert.equal(Int.min(-32)._min, -32);
            assert.equal(Int._min, _.Int.minBound());

            assert.equal(_.Type.moduleFor(Int), _.Type.moduleFor(Int.min(21)));
        });
    });

    describe('#max', function(){
        it('should change the records min value', function(){
            assert.equal(Int._max, _.Int.maxBound());
            assert.equal(Int.max(-32)._max, -32);
            assert.equal(Int._max, _.Int.maxBound());

            assert.equal(_.Type.moduleFor(Int), _.Type.moduleFor(Int.max(21)));
        });
    });

    describe('#validate', function(){
        assert.equal(typeof Int.constructor.validate, 'function');
        assert(Int.constructor.validate.length === 2);
        it('should validate with any integer by default', function(){
            assert(Either.isRight(Property.validate(0, Int)));
            assert(Either.isRight(Property.validate(-567, Int)));
            assert(Either.isRight(Property.validate(10000000, Int)));
        });

        it('should not validate a non-integer', function(){
            assert(Either.isLeft(Property.validate(1.2, Int)));
            assert(Either.isLeft(Property.validate('', Int)));
            assert(Either.isLeft(Property.validate({}, Int)));
            assert(Either.isLeft(Property.validate([], Int)));
            assert(Either.isLeft(Property.validate(null, Int)));
            assert(Either.isLeft(Property.validate(undefined, Int)));
            assert(Either.isLeft(Property.validate(Infinity, Int)));
            assert(Either.isLeft(Property.validate(-Infinity, Int)));
            assert(Either.isLeft(Property.validate(NaN, Int)));
        });

        it('should constrain the max value if the max is given', function(){
            var MaxedInt = Int.max(32)
            assert(Either.isRight(Property.validate(12, MaxedInt)));
            assert(Either.isLeft(Property.validate(33, MaxedInt)));
            assert(Either.isRight(Property.validate(32, MaxedInt)));
        });

        it('should constrain the min value if the max is given', function(){
            var MinnedInt = Int.min(32)
            assert(Either.isRight(Property.validate(36, MinnedInt)));
            assert(Either.isLeft(Property.validate(31, MinnedInt)));
            assert(Either.isRight(Property.validate(32, MinnedInt)));
        });

        it('should validate with null or undefined if it is optional', function(){
            var OptInt = Int.optional();
            assert(Either.isRight(Property.validate(1, OptInt)));
            assert(Either.isRight(Property.validate(null, OptInt)));
            assert(Either.isRight(Property.validate(undefined, OptInt)));
        });
    });
});
