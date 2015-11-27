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

console.log(flatten.flatten(objInput));

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