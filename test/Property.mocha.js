const expect = require('expect');
const _ = require('lambdash');

const Property = require('../src/Property');

describe('Property', () => {
    describe('Typed', () => {
        it('creates a typed property', () => {
            const P = Property.Typed(_.RegExp);

            expect(P).toBeA(Function);
        });

        it('returns the same value (referentially) if called twice with the same type', () => {
            const P1 = Property.Typed(_.RegExp);
            const P2 = Property.Typed(_.RegExp);

            expect(P1).toBe(P2);
        });

        it('creates a type that is only validated by the provided type', () => {
            expect(_.RegExp).toBeA(Function);

            const P = Property.Typed(_.RegExp);
            const p = P.empty();

            expect(p._signature).toBe(_.RegExp);

            expect(p.isValid(false)).toBe(false);
            expect(p.isValid({})).toBe(false);
            expect(p.isValid(/abc/)).toBe(true);
        });

        it('will defer to the type\'s load function if it exists', () => {
            const model = require('../src/model');

            const M = model.create('M', {i: model.Schema.integer,b: model.Schema.boolean});
            expect(M.load).toBeA(Function);

            const P = Property.Typed(M);
            const p = P.empty();

            expect(p._signature).toBe(M);

            expect(p.load(M(1,true))).toEqual(M(1,true));
            expect(p.load({i: 1, b: true})).toBeA(M);
            expect(p.load({i: 1, b: true})).toEqual(M(1, true));
            expect(p.load({i: '2', b: 'true'})).toEqual(M(2, true));
        });

        it('will defer to the type\'s unload function if it exists', () => {
            const model = require('../src/model');

            const M = model.create('M', {i: model.Schema.integer,b: model.Schema.boolean});
            expect(M.load).toBeA(Function);

            const P = Property.Typed(M);
            const p = P.empty();

            expect(p._signature).toBe(M);

            expect(p.unload(M(1,true))).toNotBeA(M);
            expect(p.unload(M(1,true))).toEqual({i:1,b:true});
        });
    });
});
