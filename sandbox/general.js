var
    _ = require('lodash'),
    objecthash = require('object-hash'),
    bson = require('bson'),
    NodeRSA = require('node-rsa')
    ;
var
    locket = require('../lib/locket')
    ;

var object = {
    number: 44,
    bool: true,
    string: "foobar",
    obj: {
        A: 'a',
        B: 'b',
        C: 'c'
    },
    buffer: new Buffer("buffer"),
    dupl: {

        number: 44,
        bool: true,
        string: "foobar",
        obj: {
            A: 'a',
            B: 'b',
            C: 'c'
        },
        buffer: new Buffer("buffer")
    }
};
object.objAlt = object.obj;
object.obj.A += "a";
object.obj.UP = object;

var locketObj = locket.createNew();
locket.writeContent(locketObj, "test", object);

var keypair = new NodeRSA({b: 512});

console.log(locketObj);
//console.log(locket.convertBSONToLocket(locket.convertLocketToBSON(locketObj)));
var lockedLocket = locket.lock(locketObj, keypair);
console.log(lockedLocket);
var unlockedLocket = locket.unlock(lockedLocket, keypair);
console.log(unlockedLocket);