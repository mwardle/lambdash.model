const expect = require('expect');

const _ = require('lambdash');
const Either = require('lambdash.either');

const object = require('../../src/props/object');

describe('object', () => {
    it('is an instance of Property', () => {
        const Property = require('../../src/Property');

        expect(Property.member(object)).toBe(true);
    });

    it('has a _meta property', () => {
        expect(object._meta).toBeAn(Object);
        expect(object._meta.defaultValue).toEqual({});
        expect(object._meta.required).toBe(true);
        expect(object._meta.of).toBe(require('../../src/props/any'));
        expect(object._meta.minKeys).toBe(0);
        expect(object._meta.maxKeys).toBe(Infinity);
        expect(object._meta.requiredKeys).toEqual([]);
        expect(object._meta.bannedKeys).toEqual([]);
    });

    it('has a preloader', () => {
        expect(object._preloaders).toBeAn(Array);
        expect(object._preloaders.length).toBe(1);
    });

    describe('.meta', () => {
        it('returns the meta value for the property at a given key', () => {
            expect(object.meta('defaultValue')).toEqual({});
            expect(object.meta('required')).toBe(true);
        });
    });

    describe('.load', () => {
        it('returns the value if no of property is specified', () => {
            expect(object.load({})).toEqual({});
            expect(object.load({whatever: 1, other: 'thing'})).toEqual({whatever: 1, other: 'thing'});
        });

        it('returns the value if its not an object', () => {
            expect(object.load('yes')).toEqual('yes');
        });

        it('attempts to parse a string as JSON if it looks like a stringified object', () => {
            expect(object.load('{}')).toEqual({});
            expect(object.load('{"a":1,"b":2,"c":3}')).toEqual({a:1,b:2,c:3});
            expect(object.load('{]')).toBe('{]');
        });

        it('calls its of loader if specified', () => {
            let objectOfObjects = object.of(object);

            expect(objectOfObjects.load({})).toEqual({});
            expect(objectOfObjects.load({a: {}, b: {a:1,b:2,c:3}})).toEqual({a:{},b: {a:1,b:2,c:3}});
            expect(objectOfObjects.load({a: '{}', b: '{"a":1,"b":2,"c":3}'})).toEqual({a:{},b: {a:1,b:2,c:3}});
        });
    });

    describe('.unload', () => {
        it('returns the value', () => {
            expect(object.unload([])).toEqual([]);
        });

        it('calls its of\'s unload if specified', () => {
            let JsonifyObject = object.constructor._extend('JsonifyArray', {});

            JsonifyObject.unload = (v, property) => JSON.stringify(v);
            JsonifyObject.prototype.unload = _.thisify(JsonifyObject.unload);


            let jsonifyObject = JsonifyObject.empty();

            expect(object.of(jsonifyObject).unload({a: {a:1}, b: {b:2}})).toEqual({a: '{"a":1}', b: '{"b":2}'});

        });
    });

    describe('.validate', () => {
        it('returns a left if the property is not valid and a right if it is', () => {
            expect(object.validate(1)).toBeAn(Either.Left);
            expect(object.validate(null)).toBeAn(Either.Left);
            expect(object.validate({})).toBeAn(Either.Right);
            expect(object.validate({a:1,b:2})).toBeAn(Either.Right);
        });

        it('enforces a minKeys if given', () => {
            expect(object.minKeys(3).validate({a:1,b:2,c:3})).toEqual(Either.Right({a:1,b:2,c:3}));
            expect(object.minKeys(3).validate({a:1,b:2})).toEqual(Either.Left('must have at least 3 items.'));
        });

        it('enforces a maxKeys if given', () => {
            expect(object.maxKeys(3).validate({a:1,b:2,c:3})).toEqual(Either.Right({a:1,b:2,c:3}));
            expect(object.maxKeys(3).validate({a:1,b:2,c:3,d:4})).toEqual(Either.Left('must have no more than 3 items.'));
        });

        it('returns a right if not required and null', () => {
            expect(object.optional().validate(null)).toEqual(Either.Right(null));
        });

        it('returns a left if an item is not valid', () => {
            const boolean = require('../../src/props/boolean');
            let arrayOfBools = object.of(boolean);

            expect(arrayOfBools._meta.of).toBe(boolean);

            expect(arrayOfBools.validate({a: false, b: true})).toEqual(Either.Right({a: false, b: true}));
            expect(arrayOfBools.validate({a: false, b: 'nope'})).toEqual(Either.Left('Invalid item for key b: not the correct type.'));
        });

        it('enforces required keys if specified', () => {
            let requireApple = object.requireKeys(['apple']);

            expect(requireApple.validate({apple:1})).toEqual(Either.Right({apple:1}));
            expect(requireApple.validate({orange:2})).toEqual(Either.Left('key apple is required.'));
        });

        it('enforces banned keys if specified', () => {
            let banApple = object.banKeys(['orange']);

            expect(banApple.validate({apple:1})).toEqual(Either.Right({apple:1}));
            expect(banApple.validate({orange:2})).toEqual(Either.Left('key orange is banned.'));
        });
    });
});
