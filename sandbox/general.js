var
    _ = require('lodash'),
    objecthash = require('object-hash'),
    bson = require('bson')
    ;
var
    serializer = require('../lib/serializer')
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
    buffer: new Buffer("buffer")
};
object.objAlt = object.obj;
object.obj.A += "a";
object.obj.UP = object;

var x = {y: 4};
x.x = x;
var y = _.cloneDeep(x);
y.y = 3;
console.log(x, y);

var serialized = serializer.serialize(object);

console.log(serialized);
//Hash that represents the state of this object (easy comparison)
console.log(objecthash(serialized));

var BSON = new bson.BSONPure.BSON();
var db = {"serializedField":serialized};
var dbserialized = BSON.serialize(db);
console.log(dbserialized);
var dbdeserialized = BSON.deserialize(dbserialized);
console.log("======");
//console.log(dbdeserialized.serializedField);
//Needs sanitation from the BSON format
_.forEach(dbdeserialized.serializedField, function(value, key, collection){
    if(value._bsontype == 'Binary')
    {
        collection[key] = value.buffer;
    }
});
console.log(dbdeserialized.serializedField);
