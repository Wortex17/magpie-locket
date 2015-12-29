var
    assert = require('assert'),
    _ = require('lodash')
    ;

describe('superobject', function() {
    var superobject = require('../spec-tools/superobject');

    describe('#create(true)', function () {

        it('should return objects comparable with assert.deepEqual', function () {
            assert.deepEqual(superobject.create(true), superobject.create(true));
        });

    });

    describe('#create()', function () {

        it('should return objects comparable with assert.deepEqual', function () {
            assert.notDeepEqual(superobject.create(), superobject.create());
        });

    });
});