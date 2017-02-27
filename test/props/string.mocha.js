const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const string = require('../../src/props/string');

describe('string', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(string)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(string._meta).toBeAn(Object);
        expect(string._meta.defaultValue).toBe('');
        expect(string._meta.required).toBe(true);
        expect(string._meta.minLength).toBe(0);
        expect(string._meta.maxLength).toBe(Infinity);
    });

    it('has a preloader', () => {
        expect(string._preloaders).toBeAn(Array);
        expect(string._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(string.meta('defaultValue')).toBe('');
            expect(string.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value', () => {
            expect(string.load('ok')).toBe('ok');
        });

        it('returns the value if its not a string', () => {
            expect(string.load({})).toEqual({});
        });

        it('trims text if specified to', () => {
            expect(string.load('   apple   ')).toEqual('   apple   ');
            expect(string.trim().load('   apple   ')).toEqual('apple');
        });

        it('converts a value to lowercase if set to do so', () => {
            expect(string.load('APPLE')).toEqual('APPLE');
            expect(string.lowercase().load('APPLE')).toEqual('apple');
        });

        it('converts a value to uppercase if set to do so', () => {
            expect(string.load('apple')).toEqual('apple');
            expect(string.uppercase().load('apple')).toEqual('APPLE');
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(string.unload('ok')).toEqual('ok');
        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid, a right if it is', () => {
            expect(string.validate(1)).toBeAn(Either.Left);
            expect(string.validate({})).toBeAn(Either.Left);
            expect(string.validate('')).toBeAn(Either.Right);
            expect(string.validate('ok')).toBeAn(Either.Right);
        });

        it('enforces a minLength', () => {
            expect(string.minLength(3).validate('123')).toEqual(Either.Right('123'));
            expect(string.minLength(3).validate('12')).toEqual(Either.Left('must be at least 3 characters long.'));
        });

        it('enforces a maxLength', () => {
            expect(string.maxLength(3).validate('123')).toEqual(Either.Right('123'));
            expect(string.maxLength(3).validate('1234')).toEqual(Either.Left('must be no more than 3 characters long.'));
        });

        it('enforces a match regexp', () => {
            expect(string.match(/^a.*/).validate('apple')).toEqual(Either.Right('apple'));
            expect(string.match(/^a.*/).validate('orange')).toEqual(Either.Left('does not match the required format.'));
        });

        it('enforces an enumeratd selection if provided', () => {
            expect(string.selection(['apple', 'orange']).validate('apple')).toEqual(Either.Right('apple'));
            expect(string.selection(['apple', 'orange']).validate('orange')).toEqual(Either.Right('orange'));
            expect(string.selection(['apple', 'orange']).validate('cherry')).toEqual(Either.Left('is not one of the allowed values.'));
        });
    });
});
