const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const array = require('../../src/props/array');

describe('array', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(array)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(array._meta).toBeAn(Object);
        expect(array._meta.defaultValue).toEqual([]);
        expect(array._meta.required).toBe(true);
        expect(array._meta.of).toBe(require('../../src/props/any'));
        expect(array._meta.minLength).toBe(0);
        expect(array._meta.maxLength).toBe(Infinity);
        expect(array._meta.unique).toBe(false);
    });

    it('has a preloader', () => {
        expect(array._preloaders).toBeAn(Array);
        expect(array._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(array.meta('defaultValue')).toEqual([]);
            expect(array.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value if no of property is specified', () => {
            expect(array.load([])).toEqual([]);
            expect(array.load(['a',1,{}])).toEqual(['a',1,{}]);
        });

        it('returns the value if its not an array', () => {
            expect(array.load({})).toEqual({});
        });

        it('attempts to parse a string as JSON if it looks like a stringified array', () => {
            expect(array.load('[]')).toEqual([]);
            expect(array.load('[1,2,3]')).toEqual([1,2,3]);
            expect(array.load('[}')).toBe('[}');
        });

        it('calls its of loader if specified', () => {
            let arrayOfArrays = array.of(array);

            expect(arrayOfArrays.load([])).toEqual([]);
            expect(arrayOfArrays.load([[],[1,2,3]])).toEqual([[],[1,2,3]]);
            expect(arrayOfArrays.load(['[]', '[1,2,3]'])).toEqual([[],[1,2,3]]);
        });

        it('enforces unique values if specified as unique', () => {
            expect(array.unique().load([])).toEqual([]);
            expect(array.unique().load([11,5,3,11,11,3,2])).toEqual([11,5,3,2]);
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(array.unload([])).toEqual([]);
        });

        it('calls its of\'s unload if specified', () => {
            let JsonifyArray = array.constructor._extend('JsonifyArray', {});

            JsonifyArray.unload = (v, property) => JSON.stringify(v);
            JsonifyArray.prototype.unload = _.thisify(JsonifyArray.unload);


            let jsonifyArray = JsonifyArray.empty();

            expect(array.of(jsonifyArray).unload([[1],[2]])).toEqual(['[1]','[2]']);

        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(array.validate(1)).toBeAn(Either.Left);
            expect(array.validate(null)).toBeAn(Either.Left);
            expect(array.validate([])).toBeAn(Either.Right);
            expect(array.validate([1,2,3])).toBeAn(Either.Right);
        });

        it('enforces a minLength if given', () => {
            expect(array.minLength(3).validate([1,2,3])).toEqual(Either.Right([1,2,3]));
            expect(array.minLength(3).validate([1,2])).toEqual(Either.Left('must contain at least 3 items.'));
        });

        it('enforces a maxLength if given', () => {
            expect(array.maxLength(3).validate([1,2,3])).toEqual(Either.Right([1,2,3]));
            expect(array.maxLength(3).validate([1,2,3,4])).toEqual(Either.Left('must contain no more than 3 items.'));
        });

        it('returns a right if not required and null', () => {
            expect(array.optional().validate(null)).toEqual(Either.Right(null));
        });

        it('returns a left if an item is not valid', () => {
            const boolean = require('../../src/props/boolean');
            let arrayOfBools = array.of(boolean);

            expect(arrayOfBools._meta.of).toBe(boolean);

            expect(arrayOfBools.validate([false, true])).toEqual(Either.Right([false, true]));
            expect(arrayOfBools.validate([false, 'nope'])).toEqual(Either.Left('Invalid item at position 1: not the correct type.'));
        });
    });
});
