const expect = require('expect');

const _ = require('lambdash');

const Schema = require('../src/Schema');

const simpleSchema = Schema({
    i: Schema.integer,
    s: Schema.string,
    b: Schema.boolean,
});

const secondSchema = Schema({
    i: Schema.integer.optional(),
    s: Schema.string,
    b: Schema.boolean,
});

describe('Schema', () => {
    it('has predefined types attached to it', () => {
        expect(Schema.any).toExist();
        expect(Schema.array).toExist();
        expect(Schema.binary).toExist();
        expect(Schema.boolean).toExist();
        expect(Schema.date).toExist();
        expect(Schema.float).toExist();
        expect(Schema.integer).toExist();
        expect(Schema.object).toExist();
        expect(Schema.string).toExist();
    });

    describe('#signature', () => {
        it('returns the signature for the model', () => {
            expect(Schema.signature(simpleSchema)).toEqual({
                i: _.Integer,
                s: _.String,
                b: _.Boolean,
            });
        });

        it('returns a nullable (union) type if a property is optional', () => {
            let secondSig = Schema.signature(secondSchema);
            expect(secondSig.i.name).toBe('_IntegerOrUnit');
            expect(secondSig.i.member(null)).toBe(true);
            expect(secondSig.i.member(8)).toBe(true);
            expect(secondSig.i.member('8')).toBe(false);


        });
    });

    describe('#default', () => {
        it('returns the defaults for each property', () => {
            expect(Schema.default(simpleSchema)).toEqual({
                i: 0,
                s: '',
                b: false,
            });
        });
    });

    describe('#validate', () => {
        it('returns an array of validation failures', () => {
            expect(Schema.validate({i:0, s:'', b:false}, simpleSchema)).toEqual({});
            expect(Schema.validate({i: 'zero', s:0, b:{}}, simpleSchema)).toEqual({
                i: 'not the correct type.',
                s: 'not the correct type.',
                b: 'not the correct type.',
            });
        });
    });

    describe('#isValid', () => {
        it('returns true if a model is valid, false otherwise', () => {
            expect(Schema.isValid({i:0, s:'', b:false}, simpleSchema)).toEqual(true);
            expect(Schema.isValid({i: 'zero', s:0, b:{}}, simpleSchema)).toEqual(false);
        });
    });

    describe('#load', () => {
        it('loads all the values using the propertis, using defaults where values are missing', () => {
            expect(Schema.load({},simpleSchema)).toEqual({
                i: 0,
                s: '',
                b: false,
            });
            expect(Schema.load({i:5}, simpleSchema)).toEqual({
                i: 5,
                s: '',
                b: false,
            });
            expect(Schema.load({i:5,s:'bird',b:true}, simpleSchema)).toEqual({
                i: 5,
                s: 'bird',
                b: true,
            });
            expect(Schema.load({i:'5',s:'bird',b:'true'}, simpleSchema)).toEqual({
                i: 5,
                s: 'bird',
                b: true,
            });
        });
    });

    describe('#update', () => {
        it('returns updated values using the properties', () => {
            expect(Schema.update({}, simpleSchema)).toEqual({});
            expect(Schema.update({i:5}, simpleSchema)).toEqual({i:5});
            expect(Schema.update({i:'5'}, simpleSchema)).toEqual({i:5});
            expect(Schema.update({i:'5'}, simpleSchema).i).toBe(5);
        });
    });

    describe('#unload', () => {
        it('returns a storage ready representation of a model', () => {
            expect(Schema.unload({i:5,s:'bird',b:true}, simpleSchema)).toEqual({i:5,s:'bird',b:true});
        });
    });
});
