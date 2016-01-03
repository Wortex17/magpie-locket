"use strict";

var
    assert = require('assert'),
    _ = require('lodash'),
    NodeRSA = require('node-rsa')
    ;
var
    superobject = require('../spec-tools/superobject')
    ;

describe('Locket Merger', function() {

    var locket = require('../lib/locket');
    var locketMerge = require('../lib/locket-merge');


    describe('#getHistoryDiff()', function () {

        describe('(A,B,C), (X,Y,Z)', function () {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "B");
            locket.writeContent(locketA, "test", "C");

            locket.writeContent(locketB, "test", "X");
            locket.writeContent(locketB, "test", "Y");
            locket.writeContent(locketB, "test", "Z");

            var fieldA = locket.getField(locketA, "test");
            var fieldB = locket.getField(locketB, "test");

            it('should return undefined', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(_.isUndefined(diff), "is undefined");
            });
        });

        describe('(A,B,C), (X,B,Z)', function () {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "B");
            locket.writeContent(locketA, "test", "C");

            locket.writeContent(locketB, "test", "X");
            locket.writeContent(locketB, "test", "B");
            locket.writeContent(locketB, "test", "Z");

            var fieldA = locket.getField(locketA, "test");
            var fieldB = locket.getField(locketB, "test");

            it('should not return null', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(!_.isUndefined(diff), "is not undefined");
            });
            it('should return a history diff object with the correct properties', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(_.isPlainObject(diff), "diff is plain object");
                assert(_.isString(diff.hash), "diff.hash is string");
                assert(_.isPlainObject(diff.latestCommonA), "diff.latestCommonA is plain object");
                assert(_.isPlainObject(diff.latestCommonB), "diff.latestCommonA is plain object");
                assert(_.isArray(diff.historySinceA), "diff.historySinceA is array");
                assert(_.isArray(diff.historySinceB), "diff.historySinceB is array");
            });
            it('should return a history diff with a hash matching the insertion of the same content', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert.equal(diff.hash, locket.getField(locketA, "test").history[1].hash);
                assert.equal(diff.hash, locket.getField(locketB, "test").history[1].hash);
            });
        });

        describe('(A,B,C), (B,Y,Z)', function () {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "B");
            locket.writeContent(locketA, "test", "C");

            locket.writeContent(locketB, "test", "B");
            locket.writeContent(locketB, "test", "Y");
            locket.writeContent(locketB, "test", "Z");

            var fieldA = locket.getField(locketA, "test");
            var fieldB = locket.getField(locketB, "test");

            it('should not return null', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(!_.isUndefined(diff), "is not undefined");
            });
            it('should return a history diff object with the correct properties', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(_.isPlainObject(diff), "diff is plain object");
                assert(_.isString(diff.hash), "diff.hash is string");
                assert(_.isPlainObject(diff.latestCommonA), "diff.latestCommonA is plain object");
                assert(_.isPlainObject(diff.latestCommonB), "diff.latestCommonA is plain object");
                assert(_.isArray(diff.historySinceA), "diff.historySinceA is array");
                assert(_.isArray(diff.historySinceB), "diff.historySinceB is array");
            });
            it('should return an history entry with a hash matching the insertion of the same content', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert.equal(diff.hash, locket.getField(locketA, "test").history[1].hash);
                assert.equal(diff.hash, locket.getField(locketB, "test").history[0].hash);
            });
        });

        describe('(A,B,C), (B,Y,Z)', function () {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "B");
            locket.writeContent(locketA, "test", "C");

            locket.writeContent(locketB, "test", "B");
            locket.writeContent(locketB, "test", "Y");
            locket.writeContent(locketB, "test", "Z");

            var fieldA = locket.getField(locketA, "test");
            var fieldB = locket.getField(locketB, "test");

            it('should not return null', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(!_.isUndefined(diff), "is not undefined");
            });
            it('should return a history diff object with the correct properties', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert(_.isPlainObject(diff), "diff is plain object");
                assert(_.isString(diff.hash), "diff.hash is string");
                assert(_.isPlainObject(diff.latestCommonA), "diff.latestCommonA is plain object");
                assert(_.isPlainObject(diff.latestCommonB), "diff.latestCommonA is plain object");
                assert(_.isArray(diff.historySinceA), "diff.historySinceA is array");
                assert(_.isArray(diff.historySinceB), "diff.historySinceB is array");
            });
            it('should return an history entry with a hash matching the insertion of the same content', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert.equal(diff.hash, locket.getField(locketA, "test").history[1].hash);
                assert.equal(diff.hash, locket.getField(locketB, "test").history[0].hash);
            });
        });
    });


    describe('#mergeLockets()', function () {

        it('should throw a TypeError if doneCallback is no function', function () {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            assert.throws(function(){
                locketMerge.mergeLockets(locketA, locketB, undefined);
            }, TypeError);

        });

        it('should call the doneCallback with a locket as first parameter', function (done) {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locketMerge.mergeLockets(locketA, locketB, function(mergedLocket){
                assert(_.isPlainObject(mergedLocket), "mergedLocket is plain object");
                assert(_.isPlainObject(mergedLocket.fields), "mergedLocket.fields is plain object");
                done();
            });

        });

        it('should call onConflict when merging (A,X),(B,Y)', function (done) {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "X");

            //Delay so the changes are definitively later in locketB
            setTimeout(function(){

                locket.writeContent(locketB, "test", "B");
                locket.writeContent(locketB, "test", "Y");

                var onConflictCalled = false;

                locketMerge.mergeLockets(locketA, locketB, function(mergedLocket){
                    assert(onConflictCalled, "onConflict called");
                }, {
                    onConflict: function(){
                        onConflictCalled = true;
                        assert(onConflictCalled, "onConflict called");
                        done();
                    }
                });

            }, 2);

        });

        it('should merge (A,X),(B,X) without conflicts', function (done) {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "X");

            //Delay so the changes are definitively later in locketB
            setTimeout(function(){

                locket.writeContent(locketB, "test", "B");
                locket.writeContent(locketB, "test", "X");

                locketMerge.mergeLockets(locketA, locketB, function(mergedLocket){
                    assert(_.isPlainObject(mergedLocket), "mergedLocket is plain object");
                    assert(_.isPlainObject(mergedLocket.fields), "mergedLocket.fields is plain object");
                    assert.deepEqual(
                        locket.getField(mergedLocket, "test").history,
                        locket.getField(locketB, "test").history,
                        "mergedLocket.fields[t].history is the history of locketB[t], as it is newer"
                    );
                    done();
                }, {
                    onConflict: function(){
                        assert(false, "onConflict not called");
                    }
                });

            }, 2);

        });

        it('should merge (A,X),(B,X,Y) without conflicts', function (done) {

            var locketA = locket.createNew();
            var locketB = locket.createNew();

            locket.writeContent(locketA, "test", "A");
            locket.writeContent(locketA, "test", "X");

            //Delay so the changes are definitively later in locketB
            setTimeout(function(){

                locket.writeContent(locketB, "test", "B");
                locket.writeContent(locketB, "test", "X");
                locket.writeContent(locketB, "test", "Y");

                locketMerge.mergeLockets(locketA, locketB, function(mergedLocket){
                    assert(_.isPlainObject(mergedLocket), "mergedLocket is plain object");
                    assert(_.isPlainObject(mergedLocket.fields), "mergedLocket.fields is plain object");
                    assert.deepEqual(
                        locket.getField(mergedLocket, "test"),
                        locket.getField(locketB, "test"),
                        "mergedLocket.fields[t] is equal to locketB[t], as it is newer"
                    );
                    done();
                }, {
                    onConflict: function(){
                        assert(false, "onConflict not called");
                    }
                });

            }, 2);

        });


    });
});