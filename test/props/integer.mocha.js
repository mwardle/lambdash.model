const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const integer = require('../../src/props/integer');

describe('integer', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(integer)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(integer._meta).toBeAn(Object);
        expect(integer._meta.defaultValue).toBe(0);
        expect(integer._meta.required).toBe(true);
        expect(integer._meta.min).toEqual(-Infinity);
        expect(integer._meta.max).toEqual(Infinity);
    });

    it('has a preloader', () => {
        expect(integer._preloaders).toBeAn(Array);
        expect(integer._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(integer.meta('defaultValue')).toBe(0);
            expect(integer.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value', () => {
            expect(integer.load(1.25)).toEqual(1.25);
        });

        it('returns the value if its not a integer', () => {
            expect(integer.load({})).toEqual({});
            expect(integer.load('not a valid integer')).toEqual('not a valid integer');
            expect(integer.load('123.5')).toBe('123.5');
        });

        it('converts a number string to an integer', () => {
            expect(integer.load('123')).toBe(123);
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(integer.unload(100.5)).toEqual(100.5);
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(integer.validate({})).toBeAn(Either.Left);
            expect(integer.validate('not a integer')).toBeAn(Either.Left);
            expect(integer.validate(1.25)).toBeAn(Either.Left);

            expect(integer.validate(12)).toBeAn(Either.Right);
        });

        it('enforces a min value', () => {
            expect(integer.min(0).validate(0)).toBeAn(Either.Right);
            expect(integer.min(0).validate(-1)).toBeAn(Either.Left);
        });

        it('enforces a max value', () => {
            expect(integer.max(0).validate(0)).toBeAn(Either.Right);
            expect(integer.max(0).validate(1)).toBeAn(Either.Left);
        });
    });
});
