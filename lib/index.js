var
    _ = require('lodash')
    ;
var
    serializer = require('./serializer')
    ;

var object = {
    number: 44,
    bool: true,
    string: "foobar",
    obj: {
        A: 'a',
        B: 'b',
        C: 'c',
        toLocket: function(){
            return {
                A: this.A + "a",
                B: this.B,
                UP: this.UP
            }
        }
    },

    toLocket: function(){
        return {
            number: this.number + 1,
            bool: !this.bool,
            obj: this.obj,
            objAlt: this.objAlt
        }
    }
    //buffer: new Buffer("buffer")
};
object.objAlt = object.obj;
object.obj.A += "a";
object.obj.UP = object;


var x = {y: 4};
x.x = x;
var y = _.cloneDeep(x);
y.y = 3;
console.log(x, y);

var serialized = serializer.getSerializableRepresentation(object);

console.log(serialized);