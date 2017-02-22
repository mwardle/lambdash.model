var assert = require('assert');

var _ = require('lambdash');
var Either = require('lambdash.either');

var Property = require('../../src/Property');
var Num = require('../../src/properties/num');

describe('Num', function(){
    it('should implement Property', function(){
        assert(Property.member(Num));
    });

    describe('#definition', function(){
        it('should return _.Num if not optional', function(){
            assert.equal(Property.definition(Num), _.Num);
        });

        it('should return an object with a member function if optional', function(){
            var def = Property.definition(Num.optional());

            assert(def);
            assert(def !== _.Num);
            assert(_.Fun.member(def.member));

            assert(def.member(1));
            assert(def.member(1.2));
            assert(def.member(Infinity));
            assert(def.member(-Infinity));
            assert(def.member(null));
            assert(def.member(undefined));
            assert(!def.member({}));
            assert(!def.member('nope'));
        });
    });

    describe('#default', function(){
        it('should return 0', function(){
            assert.equal(Property.default(Num), 0);
        });

        it('should return the assigned default if changed', function(){
            assert.equal(Property.default(Num.defaultsTo(2)), 2);
        });
    });

    describe('#optional', function(){
        it('should make the property optional', function(){
            assert(!Num._optional);
            var OptNum = Num.optional();
            assert(OptNum._optional);
            assert(!Num._optional);
        });
    });

    describe('#required', function(){
        it('should make a property not optional', function(){
            var OptNum = Num.optional();
            assert(OptNum._optional);
            var NotOptNum = OptNum.required();
            assert(OptNum._optional);
            assert(!NotOptNum._optional);
        });

    });

    describe('#defaultsTo', function(){
        it('should change the records _defaultsTo value', function(){
            assert.equal(Num._defaultsTo, 0);
            assert.equal(Num.defaultsTo(2.3)._defaultsTo, 2.3);
            assert.equal(Num._defaultsTo, 0);
        });

        it('should throw an exception if given a value that is not a number', function(){
            try {
                Num.defaultsTo("abacus");
                assert(false);
            } catch(e) {
                assert(e instanceof TypeError);
            }
        });
    });

    describe('#load', function(){
        it('should return the value', function(){
            assert.equal(Property.load(1.2, Num), 1.2);
            assert.equal(Property.load(null, Num), null);

        });
    });

    describe('#unload', function(){
        it('should return the value', function(){
            assert.equal(Property.unload(1.2, Num), 1.2);
            assert.equal(Property.unload(null, Num), null);
        });
    });

    describe('#min', function(){
        it('should change the records min value', function(){
            assert.equal(Num._min, -Infinity);
            assert.equal(Num.min(-32)._min, -32);
            assert.equal(Num._min, -Infinity);

            assert.equal(_.Type.moduleFor(Num), _.Type.moduleFor(Num.min(21)));
        });
    });

    describe('#max', function(){
        it('should change the records min value', function(){
            assert.equal(Num._max, Infinity);
            assert.equal(Num.max(-32)._max, -32);
            assert.equal(Num._max, Infinity);

            assert.equal(_.Type.moduleFor(Num), _.Type.moduleFor(Num.max(21)));
        });
    });

    describe('#validate', function(){
        it('should validate with any number by default', function(){
            assert(Either.isRight(Property.validate(0, Num)));
            assert(Either.isRight(Property.validate(-567.32, Num)));
            assert(Either.isRight(Property.validate(10000000, Num)));
            assert(Either.isRight(Property.validate(Infinity, Num)));
            assert(Either.isRight(Property.validate(-Infinity, Num)));
            assert(Either.isRight(Property.validate(NaN, Num)));
        });

        it('should not validate a non-number', function(){
            assert(Either.isLeft(Property.validate('', Num)));
            assert(Either.isLeft(Property.validate({}, Num)));
            assert(Either.isLeft(Property.validate([], Num)));
            assert(Either.isLeft(Property.validate(null, Num)));
            assert(Either.isLeft(Property.validate(undefined, Num)));
        });

        it('should constrain the max value if the max is given', function(){
            var MaxedNum = Num.max(32)
            assert(Either.isRight(Property.validate(12, MaxedNum)));
            assert(Either.isLeft(Property.validate(33, MaxedNum)));
            assert(Either.isRight(Property.validate(32, MaxedNum)));
        });

        it('should constrain the min value if the max is given', function(){
            var MinnedNum = Num.min(32)
            assert(Either.isRight(Property.validate(36, MinnedNum)));
            assert(Either.isLeft(Property.validate(31, MinnedNum)));
            assert(Either.isRight(Property.validate(32, MinnedNum)));
        });

        it('should validate with null or undefined if it is optional', function(){
            var OptNum = Num.optional();
            assert(Either.isRight(Property.validate(1, OptNum)));
            assert(Either.isRight(Property.validate(null, OptNum)));
            assert(Either.isRight(Property.validate(undefined, OptNum)));
        });
    });
});
