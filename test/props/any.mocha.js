const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const any = require('../../src/props/any');

describe('any', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(any)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(any._meta).toBeAn(Object);
        expect(any._meta.defaultValue).toBe(null);
        expect(any._meta.required).toBe(true);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(any.meta('defaultValue')).toBe(null);
            expect(any.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('should just return the value', () => {
            expect(any.load(1)).toBe(1);
            expect(any.load(true)).toBe(true);
            expect(any.load('ok')).toBe('ok');
        });
    });

    describe('.unload', () => {
        it('should just return the value', () => {
            expect(any.unload(1)).toBe(1);
            expect(any.unload(true)).toBe(true);
            expect(any.unload('ok')).toBe('ok');
        });
    });

    describe('.signature', () => {
        it('should return _.Any', () => {
            expect(any.signature()).toBe(_.Any);
        });
    });

    describe('.default', () => {
        it('returns the default value set for the property', () => {
            expect(any.default()).toBe(null);
            expect(any.defaultsTo(12).default()).toBe(12);
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(any.validate(1, {})).toBeAn(Either.Right);
            expect(any.validate(null, {})).toBeAn(Either.Right);
        });
    });

    describe('.isValid', () => {
        it('should return true if valid, false if not', () => {
            let even = any.withValidator((value, model, property) => {
                return value % 2 === 0 ? Either.Right(value) : Either.Left('must be even');
            });

            expect(even.isValid(1)).toBe(false);
            expect(even.isValid(2)).toBe(true);
        });
    });

    describe('.withMeta', () => {
        it('adds a key value pair to the properties meta.', () => {
            expect(any.withMeta('k', 'v')).toNotBe(any);
            expect(any.withMeta('happy', 'days')._meta).toEqual({
                defaultValue: null,
                required: true,
                happy: 'days',
            });
        });
    });

    describe('.withValidator', () => {
        it('adds a validator to the property', () => {
            expect(any.withValidator(()=>{})).toNotBe(any);

            let even = any.withValidator((value, model, property) => {
                return value % 2 === 0 ? Either.Right(value) : Either.Left('must be even');
            });

            expect(even.validate(2)).toEqual(Either.Right(2));
            expect(even.validate(1)).toEqual(Either.Left('must be even'));

            let even3 = even.withValidator((value, model, property) => {
                return value % 3 === 0 ? Either.Right(value) : Either.Left('must be a multiple of 3');
            });

            expect(even3.validate(2)).toEqual(Either.Left('must be a multiple of 3'));
            expect(even3.validate(1)).toEqual(Either.Left('must be even'));
            expect(even3.validate(12)).toEqual(Either.Right(12));
        });
    });

    describe('.withMessage', () => {
        it('should ovewrite an error message', () => {
            let even = any.withValidator((value, model, property) => {
                return value % 2 === 0 ? Either.Right(value) : Either.Left(['even', 'must be even']);
            });

            expect(even.validate(1)).toEqual(Either.Left('must be even'));
            even = even.withMessage('even', 'no odds please');
            expect(even.validate(1)).toEqual(Either.Left('no odds please'));
        });
    });

    describe('.withPreloader', () => {
        it('processes an input value before the load happens', () => {
            let numberParser = any.withPreloader((v) => {
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
