var
    serializer = require('../lib/serializer')
    ;

var _ = require('lodash');

function Human(data)
{
    this.name = data.name || this.name;
    this.birthday = data.birthday || this.birthday;
    this.currentPosition = Math.random();
}
Human.prototype["!type"] = "Sandbox.Human";
Human.prototype.typus = "Sandbox.Human";
Human.prototype.name = "Unnamed";
Human.prototype.birthday = new Date("October 13, 2014 11:13:00");
Human.prototype.currentPosition = 0;
/*
Human.prototype.toLocket = function(){
    return {
        name: this.name,
        birthday: this.birthday,
        "!type": "Sandbox.Human"
    };
};
*/

var fred = new Human({
    name: "Fred"
});
console.log(fred.constructor, fred, fred.birthday.constructor);

fred = serializer.deserialize(serializer.serialize(fred), {
    "Sandbox.Human": Human
});

console.log(fred.constructor, fred, fred.birthday.constructor);

/* */