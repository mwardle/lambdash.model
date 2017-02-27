const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const float = require('../../src/props/float');

describe('float', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(float)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(float._meta).toBeAn(Object);
        expect(float._meta.defaultValue).toBe(0);
        expect(float._meta.required).toBe(true);
        expect(float._meta.min).toEqual(-Infinity);
        expect(float._meta.max).toEqual(Infinity);
    });

    it('has a preloader', () => {
        expect(float._preloaders).toBeAn(Array);
        expect(float._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(float.meta('defaultValue')).toBe(0);
            expect(float.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value', () => {
            expect(float.load(1.25)).toEqual(1.25);
        });

        it('returns the value if its not a float', () => {
            expect(float.load({})).toEqual({});
            expect(float.load('not a valid float')).toEqual('not a valid float');
        });

        it('converts a number string to a float', () => {
            expect(float.load('123.5')).toEqual(123.5);
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(float.unload(100.5)).toEqual(100.5);
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(float.validate({})).toBeAn(Either.Left);
            expect(float.validate('not a float')).toBeAn(Either.Left);

            expect(float.validate(1.25)).toBeAn(Either.Right);
        });

        it('enforces a min value', () => {
            expect(float.min(0).validate(0)).toBeAn(Either.Right);
            expect(float.min(0).validate(-1)).toBeAn(Either.Left);
        });

        it('enforces a max value', () => {
            expect(float.max(0).validate(0)).toBeAn(Either.Right);
            expect(float.max(0).validate(1)).toBeAn(Either.Left);
        });
    });
});
