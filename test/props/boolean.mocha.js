const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const boolean = require('../../src/props/boolean');

describe('boolean', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(boolean)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(boolean._meta).toBeAn(Object);
        expect(boolean._meta.defaultValue).toBe(false);
        expect(boolean._meta.required).toBe(true);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(boolean.meta('defaultValue')).toBe(false);
            expect(boolean.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('should return the value if a boolean', () => {
            expect(boolean.load(true)).toBe(true);
            expect(boolean.load(false)).toBe(false);
        });

        it('should convert 1 and "true" to true', () => {
            expect(boolean.load('true')).toBe(true);
            expect(boolean.load(1)).toBe(true);
        });

        it('should convert 0 and "false" to false', () => {
            expect(boolean.load('false')).toBe(false);
            expect(boolean.load(0)).toBe(false);
        });

        it('should not convert other values to a boolean', () => {
            expect(boolean.load('nothing')).toBe('nothing');
            expect(boolean.load([])).toEqual([]);
        });
    });

    describe('.unload', () => {
        it('should just return the value', () => {
            expect(boolean.unload(true)).toBe(true);
            expect(boolean.unload(false)).toBe(false);
        });
    });

    describe('.signature', () => {
        it('should return _.Boolean', () => {
            expect(boolean.signature()).toBe(_.Boolean);
        });
    });

    describe('.default', () => {
        it('returns the default value set for the property', () => {
            expect(boolean.default()).toBe(false);
            expect(boolean.defaultsTo(true).default()).toBe(true);
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(boolean.validate(1)).toBeAn(Either.Left);
            expect(boolean.validate(null)).toBeAn(Either.Left);
            expect(boolean.validate(true)).toBeAn(Either.Right);
            expect(boolean.validate(false)).toBeAn(Either.Right);
        });
    });

    describe('.isValid', () => {
        it('returns true if a value is valid, false otherwise', () => {
            expect(boolean.isValid(true)).toBe(true);
            expect(boolean.isValid(false)).toBe(true);
            expect(boolean.isValid(1)).toBe(false);
        });
    });

    describe('.withMeta', () => {
        it('adds a key value pair to the properties meta.', () => {
            expect(boolean.withMeta('k', 'v')).toNotBe(boolean);
            expect(boolean.withMeta('happy', 'days')._meta).toEqual({
                defaultValue: false,
                required: true,
                happy: 'days',
            });
        });
    });

    describe('.withValidator', () => {
        it('adds a validator to the property', () => {
            expect(boolean.withValidator(()=>{})).toNotBe(boolean);

            let onlyTrue = boolean.withValidator((value, property) => {
                return value === true ? Either.Right(value) : Either.Left('must be true');
            });

            expect(onlyTrue.validate(2)).toEqual(Either.Left('not the correct type.'));
            expect(onlyTrue.validate(false)).toEqual(Either.Left('must be true'));
            expect(onlyTrue.validate(true)).toEqual(Either.Right(true));
        });
    });

    describe('.withMessage', () => {
        it('should ovewrite an error message', () => {
            let onlyTrue = boolean.withValidator((value, model, property) => {
                return value === true ? Either.Right(value) : Either.Left(['true', 'must be true']);
            });

            expect(onlyTrue.validate(false)).toEqual(Either.Left('must be true'));
            onlyTrue = onlyTrue.withMessage('true', 'no false please');
            expect(onlyTrue.validate(false)).toEqual(Either.Left('no false please'));
        });
    });

    describe('.withPreloader', () => {
        it('processes an input value before the load happens', () => {
            let numberParser = boolean.withPreloader((v) => {
                if (_.String.member(v) && !isNaN(v)) {
                    return parseFloat(v);
                }

                return v;
            });

            expect(numberParser.load(12)).toBe(12);
            expect(numberParser.load('notnumber')).toBe('notnumber');
            expect(numberParser.load('14')).toBe(14);
        });
    });


});
