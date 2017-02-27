const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const binary = require('../../src/props/binary');

describe('binary', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(binary)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(binary._meta).toBeAn(Object);
        expect(binary._meta.defaultValue).toEqual(Buffer.alloc(0));
        expect(binary._meta.required).toBe(true);
        expect(binary._meta.minLength).toBe(0);
        expect(binary._meta.maxLength).toBe(Infinity);
    });

    it('has a preloader', () => {
        expect(binary._preloaders).toBeAn(Array);
        expect(binary._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(binary.meta('defaultValue')).toEqual(Buffer.alloc(0));
            expect(binary.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value', () => {
            expect(binary.load(Buffer.from('ok'))).toEqual(Buffer.from('ok'));
        });

        it('returns the value if its not a binary', () => {
            expect(binary.load({})).toEqual({});
        });

        it('converts a string to a buffer', () => {
            expect(binary.load('ok')).toEqual(Buffer.from('ok'));
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(binary.unload(Buffer.alloc(2))).toEqual(Buffer.alloc(2));
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(binary.validate('yup')).toBeAn(Either.Left);
            expect(binary.validate(null)).toBeAn(Either.Left);
            expect(binary.validate(Buffer.alloc(1))).toBeAn(Either.Right);
            expect(binary.validate(Buffer.from('okay'))).toBeAn(Either.Right);
        });

        it('enforces a minLength if given', () => {
            expect(binary.minLength(3).validate(Buffer.from([1,2,3]))).toEqual(Either.Right(Buffer.from([1,2,3])));
            expect(binary.minLength(3).validate(Buffer.from([1,2]))).toEqual(Either.Left('data must be at least 3B.'));
        });

        it('enforces a maxLength if given', () => {
            expect(binary.maxLength(3).validate(Buffer.from([1,2,3]))).toEqual(Either.Right(Buffer.from([1,2,3])));
            expect(binary.maxLength(3).validate(Buffer.from([1,2,3,4]))).toEqual(Either.Left('data cannot be larger than 3B.'));
        });

        it('returns a right if not required and null', () => {
            expect(binary.optional().validate(null)).toEqual(Either.Right(null));
        });

    });
});
