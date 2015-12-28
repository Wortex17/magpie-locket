var
    assert = require('assert')
    ;
describe('Field Serializer', function() {

    var
        serializer = require('../lib/serializer')
        ;

    describe('#getSerializableRepresentation(obj)', function () {
        it('should call the object\'s toLocket() function if it is defined', function (done) {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toLocket = function(){
                done();
            };

            serializer.getSerializableRepresentation(toBeSerialized);
        });

        it('should call the object\'s toJSON() function if it is defined', function (done) {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toJSON = function(){
                done();
            };

            serializer.getSerializableRepresentation(toBeSerialized);
        });

        it('should call the object\'s toJSON() function if it is defined', function (done) {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toJSON = function(){
                done();
            };

            serializer.getSerializableRepresentation(toBeSerialized);
        });
        it('should call the object\'s toLocket() function in preference over toBSON() and toJSON()', function (done) {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toLocket = function(){
                done();
            };
            toBeSerialized.toBSON = function(){
                throw new Error("toBSON called");
            };
            toBeSerialized.toJSON = function(){
                throw new Error("toJSON called");
            };

            serializer.getSerializableRepresentation(toBeSerialized);
        });
        it('should call the object\'s toBSON() function in preference over toJSON()', function (done) {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toBSON = function(){
                done();
            };
            toBeSerialized.toJSON = function(){
                throw new Error("toJSON called");
            };

            serializer.getSerializableRepresentation(toBeSerialized);
        });
        it('should return what the object\'s toLocket() function returns', function () {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toLocket = function(){
                return {"form":"serialized"};
            };

            var serializableRepresentation = serializer.getSerializableRepresentation(toBeSerialized);

            assert.equal(JSON.stringify({"form":"serialized"}), JSON.stringify(serializableRepresentation));
        });
        it('should return what the object\'s toBSON() function returns', function () {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toBSON = function(){
                return {"form":"serialized"};
            };

            var serializableRepresentation = serializer.getSerializableRepresentation(toBeSerialized);

            assert.equal(JSON.stringify({"form":"serialized"}), JSON.stringify(serializableRepresentation));
        });
        it('should return what the object\'s toJSON() function returns', function () {
            this.timeout(500);

            var toBeSerialized = {};
            toBeSerialized.toJSON = function(){
                return {"form":"serialized"};
            };

            var serializableRepresentation = serializer.getSerializableRepresentation(toBeSerialized);

            assert.equal(JSON.stringify({"form":"serialized"}), JSON.stringify(serializableRepresentation));
        });
    });
    describe('#serialize(serialized)', function () {
        it('should serialize object without throwing exception', function () {
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
            assert.doesNotThrow(function(){
                serializer.serialize(object);
            });
        });
        it('should serialize object with circular dependencies without throwing exception', function () {
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
            object.obj.parent = object;

            assert.doesNotThrow(function(){
                serializer.serialize(object);
            });
        });
    });
    describe('#deserialize(serialized)', function () {
        it('should return an object structured the same as before serialization', function () {
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
            var serialized = serializer.serialize(object);
            var deserialized = serializer.deserialize(serialized);
            assert.equal(JSON.stringify(object), JSON.stringify(deserialized));
        });
    });

});