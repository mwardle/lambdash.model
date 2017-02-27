const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const date = require('../../src/props/date');

describe('date', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(date)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(date._meta).toBeAn(Object);
        expect(date._meta.defaultValue).toBeA(Function);
        expect(date._meta.defaultValue(date)).toBeA(Date);
        expect(date._meta.required).toBe(true);
        expect(date._meta.min).toEqual(new Date(-100000000 * 86400000));
        expect(date._meta.max).toEqual(new Date(100000000 * 86400000));
    });

    it('has a preloader', () => {
        expect(date._preloaders).toBeAn(Array);
        expect(date._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(date.meta('defaultValue')).toBeA(Function);
            expect(date.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value', () => {
            expect(date.load(new Date(1488143562453))).toEqual(new Date(1488143562453));
        });

        it('returns the value if its not a date', () => {
            expect(date.load({})).toEqual({});
            expect(date.load('not a valid date')).toEqual('not a valid date');
        });

        it('converts a timestamp string to a date', () => {
            expect(date.load('123')).toEqual(new Date(123));
        });

        it('converts a valid date string to a date', () => {
            expect(date.load('Sun Feb 26 2017 14:10:28 GMT-0700 (MST)')).toEqual(new Date('Sun Feb 26 2017 14:10:28 GMT-0700 (MST)'));
        });

        it('converts an integer to a date', () => {
            expect(date.load(1488143562453)).toEqual(new Date(1488143562453));
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(date.unload(new Date(1488143562453))).toEqual(new Date(1488143562453));
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(date.validate(0)).toBeAn(Either.Left);
            expect(date.validate('not a date')).toBeAn(Either.Left);
            expect(date.validate(new Date('INVALID DATE'))).toBeAn(Either.Left);

            expect(date.validate(new Date(0))).toBeAn(Either.Right);
        });

        it('enforces a min value', () => {
            expect(date.min(new Date(0)).validate(new Date(0))).toBeAn(Either.Right);
            expect(date.min(new Date(0)).validate(new Date(-1))).toBeAn(Either.Left);
        });

        it('enforces a max value', () => {
            expect(date.max(new Date(0)).validate(new Date(0))).toBeAn(Either.Right);
            expect(date.max(new Date(0)).validate(new Date(1))).toBeAn(Either.Left);
        });
    });
});
