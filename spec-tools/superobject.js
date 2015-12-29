/**
 * @return {{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array}}
 */
function createComparable()
{
    return {
        number: 44,
        bool: true,
        string: "foobar",
        obj: {
            A: 'a',
            B: 'b',
            C: 'c'
        },
        buffer: new Buffer("buffer"),
        date: new Date(99,5,24,11,33,30,0),
        regex: /magpie/i,
        null: null,
        inf: Infinity,
        ninf: -Infinity,
        typedArray: new Uint8Array()
    };
}
/**
 * @return {{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array}|{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array}}
 */
function createUncomparable()
{
    var object = createComparable();
    object.func = function add(a,b){return a+b};
    object.nan = NaN;
    return object;
}

/**
 * Creates an object with various types of members
 * @param {Boolean} [comparableOnly = false]
 * @return {{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array}|{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array}}
 */
exports.create = function(comparableOnly){
    if(comparableOnly)
    {
        return createComparable();
    } else {
        return createUncomparable();
    }
};
/**
 * Creates an object with various types of members and a nested circular references
 * @param {Boolean} [comparableOnly = false]
 * @return {{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array, child: {parent: Object}}|{number: number, bool: boolean, string: string, obj: {A: string, B: string, C: string}, buffer: Buffer, date: Date, regex: RegExp, null: null, inf: Number, ninf: number, typedArray: Uint8Array, child: {parent: Object}}}
 */
exports.createWithCircRefs = function(comparableOnly){
    var object = exports.create(comparableOnly);
    object.child = {
        parent: object
    };
    return object;
};