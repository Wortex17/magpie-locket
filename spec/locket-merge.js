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
                assert(_.isArray(diff.historyUntilA), "diff.historyUntilA is array");
                assert(_.isArray(diff.historyUntilB), "diff.historyUntilB is array");
            });
            it('should return a history diff with a hash matching the insertion of the same content', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert.equal(diff.hash, locket.getField(locketA, "test").history[1].hash);
                assert.equal(diff.hash, locket.getField(locketB, "test").history[1].hash);
                assert.equal(diff.historyUntilA.length, 1);
                assert.equal(diff.historyUntilB.length, 1);
                assert.equal(diff.historySinceA.length, 1);
                assert.equal(diff.historySinceB.length, 1);
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
                assert(_.isArray(diff.historyUntilA), "diff.historyUntilA is array");
                assert(_.isArray(diff.historyUntilB), "diff.historyUntilB is array");
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
                assert(_.isArray(diff.historyUntilA), "diff.historyUntilA is array");
                assert(_.isArray(diff.historyUntilB), "diff.historyUntilB is array");
            });
            it('should return an history entry with a hash matching the insertion of the same content', function () {
                var diff = locketMerge.getHistoryDiff(fieldA.history, fieldB.history);
                assert.equal(diff.hash, locket.getField(locketA, "test").history[1].hash);
                assert.equal(diff.hash, locket.getField(locketB, "test").history[0].hash);
            });
        });
    });

    describe('#mergeFields()', function () {

        describe('Scenario 1', function(){
            it('should call onResolve with a clone of the only filled field', function(done){

                var locketA = locket.createNew();
                var locketB = locket.createNew();

                locket.writeContent(locketA, "test", "A");
                locket.writeContent(locketA, "test", "B");
                locket.writeContent(locketA, "test", "C");

                var fieldB = locket.addField(locketB, "test");

                locketMerge.mergeFields(locket.getField(locketA, 'test'), fieldB,
                    function onConflict(fieldA, fieldB, diff, onResolve, scenario, locketA, locketB){
                        assert(false, 'onConflict called');
                        done();
                    }, function onResolve(field){
                        assert(true, 'onResolve called');
                        assert.deepEqual(field, locket.getField(locketA, 'test'));
                        done();
                    }, "test");

            });

            it('should call onResolve with a clone of the only existing field', function(done){

                var locketA = locket.createNew();
                var locketB = locket.createNew();

                locket.writeContent(locketA, "test", "A");
                locket.writeContent(locketA, "test", "B");
                locket.writeContent(locketA, "test", "C");

                locketMerge.mergeFields(locket.getField(locketA, 'test'), locket.getField(locketB, 'test'),
                    function onConflict(fieldA, fieldB, diff, onResolve, scenario){
                        assert(false, 'onConflict called');
                        done();
                    }, function onResolve(field){
                        assert(true, 'onResolve called');
                        assert.deepEqual(field, locket.getField(locketA, 'test'));
                        done();
                    });

            });
        });

        describe('Scenario 2', function() {

            it('should call onResolve with a clone of the field with the newest changes', function(done){

                var locketA = locket.createNew();
                var locketB = locket.createNew();

                locket.writeContent(locketA, "test", "A");
                locket.writeContent(locketA, "test", "B");
                locket.writeContent(locketA, "test", "C");

                locket.writeContent(locketB, "test", "A2");
                locket.writeContent(locketB, "test", "B2");

                setTimeout(function(){
                    locket.writeContent(locketB, "test", "C");

                    locketMerge.mergeFields(locket.getField(locketA, 'test'), locket.getField(locketB, 'test'),
                        function onConflict(fieldA, fieldB, diff, onResolve, scenario){
                            assert(false, 'onConflict called');
                            done();
                        }, function onResolve(field){
                            assert(true, 'onResolve called');
                            assert.deepEqual(field, locket.getField(locketB, 'test'));
                            done();
                        });
                }, 1);

            });

        });

        describe('Scenario 3', function() {

            it('should call onResolve with a clone of the field with the topmost&newer changes', function(done){

                var locketA = locket.createNew();
                var locketB = locket.createNew();

                locket.writeContent(locketA, "test", "A");
                locket.writeContent(locketA, "test", "B");
                locket.writeContent(locketA, "test", "C");

                locket.writeContent(locketB, "test", "A2");
                locket.writeContent(locketB, "test", "B2");
                locket.writeContent(locketB, "test", "C");

                setTimeout(function(){
                    locket.writeContent(locketB, "test", "C2");

                    locketMerge.mergeFields(locket.getField(locketA, 'test'), locket.getField(locketB, 'test'),
                        function onConflict(fieldA, fieldB, diff, onResolve, scenario){
                            assert(false, 'onConflict called');
                            done();
                        }, function onResolve(field){
                            assert(true, 'onResolve called');
                            assert.deepEqual(field, locket.getField(locketB, 'test'));
                            done();
                        });
                }, 1);
            });
        });

        describe('Scenario 4', function() {

            it('should call onConflict', function (done) {

                var locketA = locket.createNew();
                var locketB = locket.createNew();

                locket.writeContent(locketA, "test", "A");
                locket.writeContent(locketA, "test", "B");
                locket.writeContent(locketA, "test", "C");
                locket.writeContent(locketA, "test", "D");


                setTimeout(function () {
                    locket.writeContent(locketB, "test", "A");
                    locket.writeContent(locketB, "test", "B");
                    locket.writeContent(locketB, "test", "C");

                    locketMerge.mergeFields(locket.getField(locketA, 'test'), locket.getField(locketB, 'test'),
                        function onConflict(fieldA, fieldB, diff, onResolve, scenario){
                            assert(true, 'onConflict called');
                            assert.equal(scenario, 4, 'scenario is 4');
                            done();
                        }, function onResolve() {
                            assert(false, 'onResolve called');
                            done();
                        });
                }, 1);
            });
        });

        describe('Scenario 5', function() {

            it('should call onConflict', function (done) {

                var locketA = locket.createNew();
                var locketB = locket.createNew();

                locket.writeContent(locketA, "test", "A");
                locket.writeContent(locketA, "test", "B");
                locket.writeContent(locketA, "test", "C");

                locket.writeContent(locketB, "test", "X");
                locket.writeContent(locketB, "test", "Y");
                locket.writeContent(locketB, "test", "Z");


                locketMerge.mergeFields(locket.getField(locketA, 'test'), locket.getField(locketB, 'test'),
                    function onConflict(fieldA, fieldB, diff, onResolve, scenario){
                        assert(true, 'onConflict called');
                        assert.equal(scenario, 5, 'scenario is 5');
                        done();
                    }, function onResolve() {
                        assert(false, 'onResolve called');
                        done();
                    });
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

        it('should call onConflict when merging (A,X),(B,Y) with correct parameters', function (done) {

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
                    onConflict: function(fieldName, fieldA, fieldB, diff, onResolve, scenario, clocketA, clocketB){
                        onConflictCalled = true;
                        assert.equal(fieldName, "test", "onConflict+fieldName is \"test\"");
                        assert.equal(fieldA, locket.getField(locketA, "test"), "onConflict+fieldA is locketA.fields[test]");
                        assert.equal(fieldB, locket.getField(locketB, "test"), "onConflict+fieldB is locketB.fields[test]");
                        assert(_.isUndefined(diff), "onConflict+diff is undefined in this scenario)");
                        assert(_.isFunction(onResolve), "onConflict+onResolve is function");
                        assert.equal(scenario, 5, "onConflict+scenario is 5");
                        assert.equal(clocketA, locketA, "onConflict+locketA is locketA");
                        assert.equal(clocketB, locketB, "onConflict+locketB is locketB");
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