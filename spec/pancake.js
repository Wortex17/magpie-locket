var
    assert = require('assert')
;

describe('Pancake (Flattening Component)', function() {

    var pancake = require('../lib/flatten');

    describe('#flatten(obj)', function () {
        it('should return empty array when the obj is not given', function () {
            var result = pancake.flatten();
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 0, "Contains no elements");
        });

        it('should return array with given number, if only a number is given', function () {
            var arg = 0;
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });


        it('should return array with given string, if only a string is given', function () {
            var arg = "foobar";
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });


        it('should return array with given boolean, if only a boolean is given', function () {
            var arg = false;
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });

        it('should return array with null, if only a null object is given', function () {
            var arg = null;
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });

        it('should return an array with given object, if an object without any object members is given', function () {
            var arg = {};
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });

        it('should return an array with given object, if an object with only value type members is given', function () {
            var arg = {
                number: 44,
                bool: true,
                string: "foobar"
            };
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });


        it('should return an array with given and another object, if an object with value and one object type members is given', function () {
            var arg = {
                number: 44,
                bool: true,
                string: "foobar",
                object: {child:true}
            };
            var argJson = JSON.stringify(arg);
            var argChild = arg.object;
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], arg, "First element is original object");
            assert.notEqual(JSON.stringify(result[0]), argJson, "First element has been altered");
            assert.equal(result[1], argChild, "Second element is the child of the original object");

            var childReference = result[0].object;
            assert.equal(childReference, 1, "First element contains reference pointing to child");
        });

        it('should return an array with given object and an array, if an object with value and one array type members is given', function () {
            var arg = {
                number: 44,
                bool: true,
                string: "foobar",
                array: ['chi', 'ld']
            };
            var argJson = JSON.stringify(arg);
            var argChild = arg.array;
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], arg, "First element is original object");
            assert.notEqual(JSON.stringify(result[0]), argJson, "First element has been altered");
            assert.equal(result[1], argChild, "Second element is the child of the original object");
            var childReference = result[0].array;
            assert.equal(childReference, 1, "First element contains reference pointing to child");
        });

        it('should return an array with given object and an buffer, if an object with value and one buffer type members is given', function () {
            var arg = {
                number: 44,
                bool: true,
                string: "foobar",
                buffer: new Buffer("buffer")
            };
            var argJson = JSON.stringify(arg);
            var argChild = arg.buffer;
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], arg, "First element is original object");
            assert.notEqual(JSON.stringify(result[0]), argJson, "First element has been altered");
            assert.equal(result[1], argChild, "Second element is the child of the original object");
            var childReference = result[0].buffer;
            assert.equal(childReference, 1, "First element contains reference pointing to child");
        });

        it('should flatten nested objects', function () {
            var arg = {
                a: {
                    b: {
                        c:true
                    }
                }
            };
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 3, "Contains elements equal to the amount of nesting levels");
            assert.equal(result[0].a, 1, "arg.a points to the originally nested element");
            assert.equal(result[1].b, 2, "arg.a.b points to the originally nested element");
            assert.equal(result[2].c, true, "arg.a.b.c is primitively true");
        });

        it('should return an array with given array, if an array with only value type elements is given', function () {
            var arg = [44, true, "foo"];
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 1, "Contains exactly one element");
            assert.equal(result[0], arg, "Contains the input argument");
        });


        it('should return an array with given array and an object, if an array with value and one object type element is given', function () {
            var arg = [44, true, "foo", {child:true}];
            var argChild = arg[3];
            var argJson = JSON.stringify(arg);
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], arg, "First element is original array");
            assert.notEqual(JSON.stringify(result[0]), argJson, "First element has been altered");
            assert.equal(result[1], argChild, "Second element is the fourth element of the original array");
            var childReference = result[0][3];
            assert.equal(childReference, 1, "First element contains reference pointing to child");
        });

        it('should return an array with given array and an object, if an array with value and one array type element is given', function () {
            var arg = [44, true, "foo", [0,1,2]];
            var argChild = arg[3];
            var argJson = JSON.stringify(arg);
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], arg, "First element is original array");
            assert.notEqual(JSON.stringify(result[0]), argJson, "First element has been altered");
            assert.equal(result[1], argChild, "Second element is the fourth element of the original array");
            var childReference = result[0][3];
            assert.equal(childReference, 1, "First element contains reference pointing to child");
        });

        it('should return an array with given array and an object, if an array with value and one buffer type element is given', function () {
            var arg = [44, true, "foo", new Buffer("buffer")];
            var argChild = arg[3];
            var argJson = JSON.stringify(arg);
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], arg, "First element is original array");
            assert.notEqual(JSON.stringify(result[0]), argJson, "First element has been altered");
            assert.equal(result[1], argChild, "Second element is the fourth element of the original array");
            var childReference = result[0][3];
            assert.equal(childReference, 1, "First element contains reference pointing to child");
        });

        it('should be able to flatten circular structures', function () {

            var argA = {};
            var argB = {
                a: argA
            };
            argA.b = argB;

            var result = pancake.flatten(argA);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 2, "Contains exactly two elements");
            assert.equal(result[0], argA, "First element is argA");
            assert.equal(result[1], argB, "Second element is argB");
            assert.doesNotThrow(function(){
                JSON.stringify(result);
            }, "Result can be stringified to JSON");
            assert.equal(argA.b, 1, "argA.b points to argB");
            assert.equal(argB.a, 0, "argB.a points to argA");
        });


        it('should flatten nested arrays', function () {
            var arg = [[[true]]];
            var result = pancake.flatten(arg);
            assert(Array.isArray(result), "Is Array");
            assert.equal(result.length, 3, "Contains elements equal to the amount of nesting levels");
            assert.equal(result[0][0], 1, "arg[0] points to the originally nested arg[0][0]");
            assert.equal(result[1][0], 2, "arg[0][0] points to the originally nested arg[0][0][0]");
            assert.equal(result[2][0], true, "arg[0][0][0] is primitively true");
        });

    });

    describe('#unflatten(obj)', function () {
        it('should throw an exception, if non-arrays are given as input', function () {
            assert.throws(function(){pancake.unflatten(0)});
            assert.throws(function(){pancake.unflatten(true)});
            assert.throws(function(){pancake.unflatten("string")});
            assert.throws(function(){pancake.unflatten({obj:true})});
            assert.throws(function(){pancake.unflatten(null)});
            assert.throws(function(){pancake.unflatten(undefined)});
        });


        it('should return null, if an empty array is given as input', function () {
            assert.deepEqual(pancake.unflatten([]), null);
        });

        it('should return the first primitive in the array, if the first element is not a flattened object', function () {
            assert.deepEqual(pancake.unflatten([0,1,2]), 0);
            assert.deepEqual(pancake.unflatten([true, false]), true);
            assert.deepEqual(pancake.unflatten(["string", "strong"]), "string");
            assert.deepEqual(pancake.unflatten([null, {obj:true}]), null);
            assert.deepEqual(""+pancake.unflatten([{obj:true}, {obj:false}]), ""+{obj:true});
            assert.deepEqual(""+pancake.unflatten([[0,1,2], [2,3,4]]), ""+[0,1,2]);
            assert.deepEqual(pancake.unflatten([undefined]), undefined);
        });


        it('should return return the same structure as before flattening', function () {
            var input;

            //Obj
            input = {
                number: 44,
                bool: true,
                string: "foobar",
                object: {child:true},
                array: ['chi', 'ld'],
                buffer: new Buffer("buffer")
            };
            assert.equal(JSON.stringify(pancake.unflatten(pancake.flatten(input))), JSON.stringify(input));

            //Array
            input = [44,true,"foobar",{child:true},['chi', 'ld'],new Buffer("buffer")];

            assert.equal(JSON.stringify(pancake.unflatten(pancake.flatten(input))), JSON.stringify(input));

            //Deep
            input = {
                a: {
                    b: {
                        c:true
                    }
                }
            };

            assert.equal(JSON.stringify(pancake.unflatten(pancake.flatten(input))), JSON.stringify(input));

            //Multiref
            input = {
                buff: new Buffer("very loong")
            };
            input.a = input.buff;
            input.b = {b: input.buff};

            assert.equal(JSON.stringify(pancake.unflatten(pancake.flatten(input))), JSON.stringify(input));

        });

        it('should cut off any unreferenced (excess) objects', function () {

            assert.equal(JSON.stringify(pancake.unflatten([{a:true},{e:3}])), JSON.stringify({a:true}));

        });

    });

});
