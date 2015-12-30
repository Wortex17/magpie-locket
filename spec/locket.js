"use strict";

var
    assert = require('assert'),
    _ = require('lodash'),
    NodeRSA = require('node-rsa')
    ;
var
    superobject = require('../spec-tools/superobject')
    ;

describe('Locket', function() {

    var locket = require('../lib/locket');

    describe('#createNew()', function () {

        it('should return a plain object with the correct properties', function () {
            var result = locket.createNew();
            assert(_.isPlainObject(result), "result is plain object");
            assert(_.isPlainObject(result.fields), "result.fields is plain object");
            assert.equal(Object.keys(result.fields).length, 0, "result.fields has no elements");
        });

    });

    describe('#addField()', function () {

        var result = locket.createNew();
        var field = locket.addField(result, "test");

        it('should increase the number of fields on the locket', function () {
            assert.equal(Object.keys(result.fields).length, 1);
        });

        it('should return the newly created field object', function () {
            assert(_.isPlainObject(field), "returned field is a plain object");
            assert.equal(field, result.fields["test"], "returned field is the newly created field");
        });

        it('should create a field object with the correct properties', function () {
            assert(_.isPlainObject(field), "field is plain object");
            assert(_.isArray(field.serializedContent), "field.serializedContent is array");
            assert.equal(field.serializedContent.length, 0, "field.serializedContent is empty");
            assert(_.isArray(field.history), "field.history is array");
            assert.equal(field.history.length, 0, "field.history is empty");
        });

    });

    describe('#generateHistoryEntry()', function () {

        it('should return an object with the correct properties', function () {
            var entry = locket.generateHistoryEntry([]);
            assert(_.isPlainObject(locket.generateHistoryEntry([])), "entry is plain object");
            assert(_.isDate(entry.date), "entry.date is Date");
            assert(_.isString(entry.hash), "entry.hash is String");
        });

        it('should contain a hash that depends on the input', function () {
            var entry1 = locket.generateHistoryEntry(["a"]);
            var entry2 = locket.generateHistoryEntry(["b"]);
            assert.notEqual(entry1.hash, entry2.hash);
        });

    });


    describe('#hasField()', function () {

        var result = locket.createNew();
        var addedField = locket.addField(result, "test");

        it('should return false if field does not exist', function () {
            assert.equal(locket.hasField(result, "test2"), false);
        });
        it('should return false if field does not contain history', function () {
            assert.equal(locket.hasField(result, "test"), false);
        });
        it('should return true once the field contains history', function () {
            addedField.history = [locket.generateHistoryEntry([])];
            assert.equal(locket.hasField(result, "test"), true);
        });
    });

    describe('#getField()', function () {

        var result = locket.createNew();
        var addedField = locket.addField(result, "test");

        it('should return undefined if field does not exist', function () {
            assert.equal(locket.getField(result, "test2"), undefined);
        });
        it('should return undefined if field does not contain history', function () {
            assert.equal(locket.getField(result, "test"), undefined);
        });

        it('should return a plain object once the field contains history', function () {
            addedField.history = [locket.generateHistoryEntry([])];

            assert(_.isPlainObject(locket.getField(result, "test")), "is plain object");
        });
        it('should return the field that was added before under the same fieldName', function () {
            addedField.history = [locket.generateHistoryEntry([])];

            assert.equal(locket.getField(result, "test"), addedField);
        });

    });

    describe('#getAllFields()', function () {

        var result = locket.createNew();
        locket.addField(result, "test");
        var fooField = locket.addField(result, "foo");
        fooField.history = [locket.generateHistoryEntry([])];
        var barField = locket.addField(result, "bar");
        barField.history = [locket.generateHistoryEntry([])];

        it('should return a plain object', function () {
            assert(_.isPlainObject(locket.getAllFields(result)), "is plain object");
        });
        it('should return an object with all fields that have a history', function () {
            var fields = locket.getAllFields(result);
            assert.deepEqual(fields, {
                "foo": fooField,
                "bar": barField
            });
        });

    });

    describe('#updateSerializedContentOfField()', function () {
        var locketObj = locket.createNew();
        var field = locket.addField(locketObj, "test");
        var historyPrevLength = field.history.length;
        locket.updateSerializedContentOfField(field, ["a"]);
        var field = locket.getField(locketObj, "test");

        it('should set the serializedContent of the field', function () {
            assert.deepEqual(field.serializedContent, ["a"]);
        });
        it('should extend the history of the field', function () {
            assert(field.history.length > historyPrevLength, "history.length > historyPrevLength");
        });
    });

    describe('#setSerializedContent()', function () {
        var locketObj = locket.createNew();
        var serContent = ["a"];
        locket.setSerializedContent(locketObj, "test", serContent);
        var field = locket.getField(locketObj, "test");

        it('should create the field if it does not exist', function () {
            assert(locket.hasField(locketObj, "test"), "locket.hasField");
        });
        it('should set the serializedContent of the field', function () {
            assert.equal(locket.getField(locketObj, "test").serializedContent, serContent);
        });
        it('should extend the history of the field', function () {
            assert(field.history.length > 0, "history.length > 0");
        });
    });

    describe('#updateSerializedContent()', function () {
        var locketObj = locket.createNew();
        var serContent = ["a"];
        locket.setSerializedContent(locketObj, "test", []);
        var field = locket.getField(locketObj, "test");
        var historyPrevLength = field.history.length;
        locket.updateSerializedContent(locketObj, "test", serContent);
        locket.updateSerializedContent(locketObj, "test2", serContent);

        it('should NOT create the field if it does not exist', function () {
            assert(!locket.hasField(locketObj, "test2"), "!locket.hasField");
        });
        it('should set the serializedContent of the field', function () {
            assert.equal(locket.getField(locketObj, "test").serializedContent, serContent);
        });
        it('should extend the history of the field', function () {
            assert(field.history.length > historyPrevLength, "history.length > historyPrevLength");
        });
    });

    describe('#getSerializedContent()', function () {
        var locketObj = locket.createNew();
        var serContent = ["a"];
        locket.setSerializedContent(locketObj, "test", serContent);

        it('should return undefined if the field does not exist', function () {
            var serializedContent = locket.getSerializedContent(locketObj, "test2");
            assert.equal(serializedContent, undefined);
        });

        it('should return an array (serialized content as pancake) if the field exists', function () {
            var serializedContent = locket.getSerializedContent(locketObj, "test");
            assert(_.isArray(serializedContent), "is Array");
        });
    });

    describe('#writeContent()', function () {
        it('should write a complex object without exceptions', function () {
            var locketObj = locket.createNew();
            assert.doesNotThrow(function(){
                locket.writeContent(locketObj, "test", superobject.create());
            });
        });
        it('should write a complex object with circular references without exceptions', function () {
            var locketObj = locket.createNew();
            assert.doesNotThrow(function(){
                locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            });
        });
        it('should extend the history of the field', function () {
            var locketObj = locket.createNew();

            locket.writeContent(locketObj, "test", "a");
            var field = locket.getField(locketObj, "test");

            assert(field.history.length > 0, "history.length > 0");
        });
    });

    describe('#readContent()', function () {
        it('should reconstruct a complex object without exceptions', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.create());
            assert.doesNotThrow(function(){
                locket.readContent(locketObj, "test");
            });
        });
        it('should reconstruct a complex object with circular dependencies without exceptions', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            assert.doesNotThrow(function(){
                locket.readContent(locketObj, "test");
            });
        });

        it('should reconstruct a complex object as it was before', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.create(true));
            var readObj = locket.readContent(locketObj, "test");
            assert.deepEqual(readObj, superobject.create(true));
        });

        it('should reconstruct circular dependencies as they were before', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            var readObj = locket.readContent(locketObj, "test");
            assert.equal(readObj.child.parent, readObj);
        });
    });

    describe('#convertLocketToBSON()', function () {
        it('should return buffer', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            var bson = locket.convertLocketToBSON(locketObj);
            assert(Buffer.isBuffer(bson), "is buffer");
        });
    });

    describe('#convertLocketToBSON(, bsonPure:true)', function () {
        it('should return buffer', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            var bson = locket.convertLocketToBSON(locketObj, true);
            assert(Buffer.isBuffer(bson), "is buffer");
        });
    });

    describe('#convertBSONToLocket()', function () {

        it('should return a plain object with the correct properties', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            var result = locket.convertBSONToLocket(locket.convertLocketToBSON(locketObj));
            assert(_.isPlainObject(result), "result is plain object");
            assert(_.isPlainObject(result.fields), "result.fields is plain object");
        });

        it('should return a locket that has the same fields as before', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.create(true));
            var result = locket.convertBSONToLocket(locket.convertLocketToBSON(locketObj));
            assert.deepEqual(result, locketObj);
        });
    });

    describe('#convertBSONToLocket( ,bsonPure:true)', function () {

        it('should return a plain object with the correct properties', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
            var result = locket.convertBSONToLocket(locket.convertLocketToBSON(locketObj, true));
            assert(_.isPlainObject(result), "result is plain object");
            assert(_.isPlainObject(result.fields), "result.fields is plain object");
        });

        it('should return a locket that has the same fields as before', function () {
            var locketObj = locket.createNew();
            locket.writeContent(locketObj, "test", superobject.create(true));
            var result = locket.convertBSONToLocket(locket.convertLocketToBSON(locketObj, true));
            assert.deepEqual(result, locketObj);
        });
    });

    describe('#lock', function () {

        var locketObj = locket.createNew();
        locket.writeContent(locketObj, "test", superobject.createWithCircRefs());
        var keypair = new NodeRSA({b: 512});


        it('should encrypt the locket without problems', function () {
            assert.doesNotThrow(function(){
                locket.lock(locketObj, keypair);
            });
        });

        it('should return a plain object with the correct properties', function () {
            var lockedLocket = locket.lock(locketObj, keypair);
            assert(_.isPlainObject(lockedLocket), "lockedLocket is plain object");
            assert(_.isString(lockedLocket.a), "lockedLocket.a is String");
            assert(_.isString(lockedLocket.c), "lockedLocket.c is String");
            assert(_.isString(lockedLocket.l), "lockedLocket.l is String");
        });
    });


    describe('#testLock', function () {

        var locketObj = locket.createNew();
        locket.writeContent(locketObj, "test", superobject.create(true));
        var keypair = new NodeRSA({b: 512});
        var keypair2 = new NodeRSA({b: 512});
        var lockedLocket = locket.lock(locketObj, keypair);


        it('should return true when testing the correct keypair', function () {
            assert.equal(locket.testLock(lockedLocket, keypair), true);
        });
        it('should return false when testing a different keypair', function () {
            assert.equal(locket.testLock(lockedLocket, keypair2), false);
        });
    });

    describe('#unlock', function () {

        var locketObj = locket.createNew();
        locket.writeContent(locketObj, "test", superobject.create(true));
        var keypair = new NodeRSA({b: 512});
        var keypair2 = new NodeRSA({b: 512});
        var lockedLocket = locket.lock(locketObj, keypair);


        it('should decrypt the locket without problems', function () {
            assert.doesNotThrow(function(){
                locket.unlock(lockedLocket, keypair);
            });
        });
        it('should throw exception when unlocking with wrong keypair', function () {
            assert.throws(function(){
                locket.unlock(lockedLocket, keypair2);
            });
        });

        it('should return the same locket as before locking', function () {
            var unlockedLocket = locket.unlock(lockedLocket, keypair);
            assert.deepEqual(unlockedLocket, locketObj);
        });
    });

});