var
    _ = require('lodash')
    ;

var
    flatten = require('./flatten')
    ;


//Some structural examples

var objInput = {
    number: 44,
    bool: true,
    string: "foobar",
    object: {child:true},
    array: ['chi', 'ld'],
    buffer: new Buffer("buffer")
};
var objInputFlat = flatten.flatten(objInput);
console.log(objInputFlat);

var arrInput = [44,true,"foobar",{child:true},['chi', 'ld'],new Buffer("buffer")];

console.log(flatten.flatten(arrInput));

var deep = {
    a: {
        b: {
            c:true
        }
    }
};

console.log(flatten.flatten(deep));


var circular = {
    child: {
    }
};
circular.child.parent = circular;

console.log(flatten.flatten(circular));

var multiref = {
    buff: new Buffer("very loong")
};
multiref.a = multiref.buff;
multiref.b = {b: multiref.buff};

console.log(flatten.flatten(multiref));

console.log("================");
console.log(flatten.unflatten(flatten.flatten(objInputFlat)));