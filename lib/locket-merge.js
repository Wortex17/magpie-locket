/**
 * Component that handles the merging of lockets
 */
"use strict";

var
    _ = require('lodash'),
    async = require('async')
    ;
var
    locket = require('./locket')
    ;


/**
 * @callback MagpieLocketMergeDoneCallback
 * @param {MagpieLocket} resultLocket - the locket that has been merged
 */

/**
 * @callback MagpieLocketMergeConflictCallback
 * @param {String} fieldName
 * @param {MagpieLocketField} locketAField - the conflicting field in locketA
 * @param {MagpieLocketField} locketBField - the conflicting field in locketB
 * @param {String} latestCommonHistory - the hash of the latest common history entry the two fields have
 * @param {MagpieLocketMergeConflictResolveCallback} resolve - the callback to call once the conflict is resolved
 * @param {MagpieLocket} [locketA]
 * @param {MagpieLocket} [locketB]
 */

/**
 * @callback MagpieLocketMergeConflictResolveCallback
 * @param {MagpieLocketField} resolvedField - the field that should be used in the merged locked
 */


/**
 * @typedef {{hash: String, latestCommonA: {MagpieLocketFieldHistoryEntry, undefined}, latestCommonB: {MagpieLocketFieldHistoryEntry, undefined}, historySinceA: [MagpieLocketFieldHistoryEntry], historySinceB: [MagpieLocketFieldHistoryEntry]}} MagpieLocketMergeHistoryDiff
 */

exports.defaultMergers = {

};


/**
 * @param {MagpieLocket} locketA
 * @param {MagpieLocket} locketB
 * @param {MagpieLocketMergeDoneCallback} doneCallback
 * @param {Object} [config]
 * @param {MagpieLocketMergeConflictCallback} [config.onConflict]
 *
 * @throws {TypeError} - if doneCallback is not a function
 */
exports.mergeLockets = function(locketA, locketB, doneCallback, config)
{
    if(!_.isFunction(doneCallback))
    {
        throw new TypeError("parameter doneCallback is not a function");
    }

    config = _.extend({
        onConflict: function(){

        }
    }, config);

    var mergedLocket = locket.createNew();

    //Contains all fieldNames of both lockets that are going to be inserted into the mergedLocket
    var fieldNames = Object.keys(locket.getAllFields(locketA)); //Add fieldNames of locketA
    fieldNames = fieldNames.concat(Object.keys(locket.getAllFields(locketA))); //Add fieldNames of locketB
    fieldNames.sort();//Sort alphabetically
    fieldNames = _.uniq(fieldNames, true); //Filter duplicates

    var fields = {};

    async.each(fieldNames, function(fieldName, next){
        var fieldA = locket.getField(locketA, fieldName);
        var fieldB = locket.getField(locketB, fieldName);
        /**
         * @type {MagpieLocketMergeConflictResolveCallback}
         */
        function resolve(resolvedField){
            fields[fieldName] = resolvedField;
            next();
        }

        if(!_.isUndefined(fieldA) && !_.isUndefined(fieldB))
        {
            //Merge
            var newField = locket.createFieldObject();
            var historyDiff = exports.getHistoryDiff(fieldA.history, fieldB.history);

            if(_.isUndefined(historyDiff))
            {
                //Conflict, nothing in common
                config.onConflict();
            } else {
                //both have the same latest common hash, take values is and update history entry date
                if(historyDiff.historySinceA.length == 0 && historyDiff.historySinceB.length == 0)
                {
                    newField.serializedContent = _.cloneDeep(fieldA.serializedContent);

                    if(historyDiff.latestCommonA.date.getTime() >= historyDiff.latestCommonB.date.getTime())
                    {
                        //A has the newer changes
                        newField.history = _.cloneDeep(fieldA.history);
                    } else {
                        //B has the newer changes
                        newField.history = _.cloneDeep(fieldB.history);
                    }

                    return resolve(newField);
                }

                //there are just on-top changes in A
                if(historyDiff.historySinceB.length == 0)
                {
                    var newestChangeInA = historyDiff.historySinceA[historyDiff.historySinceA.length-1].date.getTime();
                    //Changes are newer than in B
                    if(newestChangeInA >= historyDiff.latestCommonB.date.getTime())
                    {
                        return resolve(_.cloneDeep(fieldA));
                    }
                }
                //there are just on-top changes in A
                if(historyDiff.historySinceA.length == 0)
                {
                    var newestChangeInB = historyDiff.historySinceB[historyDiff.historySinceB.length-1].date.getTime();
                    //Changes are newer than in B
                    if(newestChangeInB >= historyDiff.latestCommonA.date.getTime())
                    {
                        return resolve(_.cloneDeep(fieldB));
                    }
                }
            }

        } else if(!_.isUndefined(fieldA)) {
            return resolve(_.cloneDeep(fieldA));
        } else if(!_.isUndefined(fieldB)) {
            return resolve(_.cloneDeep(fieldB));
        } else {
            //Should not be the case, actually..
        }

    }, function(err){
        _.forEach(fieldNames, function(fieldName) {
            if(!_.isUndefined(fields[fieldName]))
            {
                mergedLocket.fields[fieldName] = fields[fieldName];
            }
        });
        doneCallback(mergedLocket);
    });

};

/**
 * Searches for the latest common hash in the history.
 * Returns the differing history since then, and the previous history until then
 * @param {[MagpieLocketFieldHistoryEntry]} historyA
 * @param {[MagpieLocketFieldHistoryEntry]} historyB
 * @return {MagpieLocketMergeHistoryDiff, undefined}
 */
exports.getHistoryDiff = function(historyA, historyB)
{
    var foundLatestCommonHash = false;
    /**
     * @type MagpieLocketMergeHistoryDiff
     */
    var diff = {
        hash: "",
        latestCommonA: undefined,
        latestCommonB: undefined,
        historySinceA: [],
        historySinceB: []
    };

    //TODO: How should (A,B,C) compared with (B,A,C) be handled?
    //TODO: convert/wrap history hash arrays in objects/hashsets to fasten search
    for(var a = historyA.length-1; a >= 0 && historyB.length > 0 && !foundLatestCommonHash; a--)
    {
        /**
         * @type {MagpieLocketFieldHistoryEntry}
         */
        var entryA = historyA[a];

        var historySinceB = [];
        for(var b = historyB.length-1; b >= 0 && !foundLatestCommonHash; b--)
        {
            /**
             * @type {MagpieLocketFieldHistoryEntry}
             */
            var entryB = historyB[b];

            if(entryA.hash == entryB.hash)
            {
                //Latest common history entry found
                foundLatestCommonHash = true;

                diff.hash = entryA.hash;

                diff.latestCommonA = entryA;
                diff.latestCommonB = entryB;
                diff.historySinceB = historySinceB;

                diff.historySinceA.reverse();
                diff.historySinceB.reverse();
            } else {
                historySinceB.push(entryB);
            }
        }

        if(!foundLatestCommonHash)
        {
            diff.historySinceA.push(entryA);
        }
    }

    return (foundLatestCommonHash) ? diff : undefined;
};