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
 * @param {MagpieLocketMergeHistoryDiff} historyDiff
 * @param {MagpieLocketMergeConflictResolveCallback} resolve - the callback to call once the conflict is resolved
 * @param {Number} [scenario] - Scenario that led to this conflict (e.g. #5 - Divergent or #4 - Older on Top)
 * @param {MagpieLocket} [locketA]
 * @param {MagpieLocket} [locketB]
 */

/**
 * @callback MagpieLocketMergeConflictResolveCallback
 * @param {MagpieLocketField} resolvedField - the field that should be used in the merged locked
 */


/**
 * @typedef {{hash: String, latestCommonA: {MagpieLocketFieldHistoryEntry, undefined}, latestCommonB: {MagpieLocketFieldHistoryEntry, undefined}, historySinceA: [MagpieLocketFieldHistoryEntry], historySinceB: [MagpieLocketFieldHistoryEntry], historyUntilA: [MagpieLocketFieldHistoryEntry], historyUntilB: [MagpieLocketFieldHistoryEntry]}} MagpieLocketMergeHistoryDiff
 */

exports.defaultFieldMergers = {
    /**
     * @param {MagpieLocketField} fieldA
     * @param {MagpieLocketField} fieldB
     * @returns {MagpieLocketField}
     */
    useA: function(fieldA, fieldB)
    {
        return _.cloneDeep(fieldA);
    },
    /**
     * @param {MagpieLocketField} fieldA
     * @param {MagpieLocketField} fieldB
     * @returns {MagpieLocketField}
     */
    useB: function(fieldA, fieldB)
    {
        return _.cloneDeep(fieldB);
    },
    /**
     * @param {MagpieLocketField} fieldA
     * @param {MagpieLocketField} fieldB
     * @param {MagpieLocketMergeHistoryDiff} diff
     * @returns {MagpieLocketField}
     */
    useOnTop: function(fieldA, fieldB, diff)
    {
        if(diff.historySinceA.length > 0)
        {
            return _.cloneDeep(fieldA);
        } else {
            return _.cloneDeep(fieldB);
        }
    },
    /**
     * Used to discard in scenario 4
     * @param {MagpieLocketField} fieldA
     * @param {MagpieLocketField} fieldB
     * @returns {MagpieLocketField}
     */
    useNewer: function(fieldA, fieldB)
    {
        if(fieldA.history[fieldA.history.length-1].date.getTime() >= fieldB.history[fieldB.history.length-1].date.getTime())
        {
            return _.cloneDeep(fieldA);
        } else {
            return _.cloneDeep(fieldB);
        }
    },
    /**
     * Used to restore in scenario 4
     * @param {MagpieLocketField} fieldA
     * @param {MagpieLocketField} fieldB
     * @param {MagpieLocketMergeHistoryDiff} diff
     * @returns {MagpieLocketField}
     */
    useNewerPlusTop: function(fieldA, fieldB, diff)
    {
        var field = exports.defaultFieldMergers.useNewer(fieldA, fieldB);

        var now = new Date();
        var toRestore = (diff.historySinceA.length > 0) ? diff.historySinceA : diff.historySinceB;
        _.forEach(toRestore, function(entry){
            var nEntry = _.cloneDeep(entry);
            nEntry.date = now;
            field.history.push(nEntry);
        });

        return field;
    }
};


/**
 * @param {MagpieLocket} locketA
 * @param {MagpieLocket} locketB
 * @param {MagpieLocketMergeDoneCallback} doneCallback
 * @param {Object} [config]
 * @param {MagpieLocketMergeConflictCallback} [config.onConflict] - if not provided, conflicts will be resolved with takeNewer
 *
 *
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
        /**
         * @type {MagpieLocketMergeConflictCallback}
         */
        onConflict: function(fieldName, locketAField, locketBField, historyDiff, resolve, scenario, locketA, locketB){
            resolve(exports.defaultFieldMergers.useNewer(locketAField, locketBField));
        }
    }, config);

    var mergedLocket = locket.createNew();

    //Contains all fieldNames of both lockets that are going to be inserted into the mergedLocket
    var fieldNames = Object.keys(locket.getAllFields(locketA)); //Add fieldNames of locketA
    fieldNames = fieldNames.concat(Object.keys(locket.getAllFields(locketA))); //Add fieldNames of locketB
    fieldNames.sort();//Sort alphabetically
    fieldNames = _.uniq(fieldNames, true); //Filter duplicates

    var fields = {};
    _.forEach(fieldNames, function(fieldName){
        fields[fieldName] = null;
    });


    async.each(fieldNames, function(fieldName, next){
        var fieldA = locket.getField(locketA, fieldName);
        var fieldB = locket.getField(locketB, fieldName);
        /**
         * @type {MagpieLocketMergeConflictResolveCallback}
         */
        function resolve(resolvedField){
            if(_.isPlainObject(resolvedField) && resolvedField != null)
            {
                fields[fieldName] = resolvedField;
            } else {
                delete fields[fieldName];
            }
            next();
        }

        exports.mergeFields(fieldA, fieldB,
            function(fieldA, fieldB, diff, onResolve, scenario){
                config.onConflict(fieldName, fieldA, fieldB, diff, onResolve, scenario, locketA, locketB);
            },
            resolve
        );

    }, function(err){
        mergedLocket.fields = fields;
        doneCallback(mergedLocket);
    });

};

/**
 * @param {MagpieLocketField} fieldA
 * @param {MagpieLocketField} fieldB
 * @param {Function} onConflict
 * @param {MagpieLocketMergeConflictResolveCallback} onResolve
 * @return {MagpieLocketField} output
 *
 * The latest common ancestor / history entry (lca) is detected by using #getHistoryDiff.
 * Dependent on the lca, the fields are merged in one of these scenarios:
 *
 * Scenario #1 - New Copy
 * Case: One field does not contain any history
 * Action: The other field is copied to the output.
 *
 * Scenario #2 - Sync
 * Case: Both fields latest history entry is the lca.
 * Action: The history of the field with the newest date on the lca is copied to the output.
 *
 * Scenario #3 - Newer on Top
 * Case: One fields latest entry is the lca, while the others latest entry has a newer date.
 * Action: The field with history on top is copied to the output.
 *
 * Scenario #4 - Older on Top
 * Case: One fields latest entry is the lca, while the others latest entry has an older date.
 * Conflict: Entries in the former field seem to revert changes made in the later.
 * Action: onConflict is called.
 *     Typically, copy the history of the former field (Discard). To restore the changes made in the later,
 *     copy its history since the lca and update each entries date to the current moment, before
 *     putting them on top of the history in the output (Restore).
 *
 * Scenario #5 - Divergent
 * Case: Both fields have history since the lca or there is no lca.
 * Conflict: Histories diverge from each other.
 * Action: onConflict is called.
 *     Typically, copy the history of the former field or the later field to the output.
 *
 */
exports.mergeFields = function(fieldA, fieldB, onConflict, onResolve)
{
    if((_.isUndefined(fieldA) || fieldA.history.length == 0) && (_.isUndefined(fieldB) || fieldB.history.length == 0))
    {
        //Special case, should never be the case actually..
        onResolve(locket.createFieldObject());
    } else if(_.isUndefined(fieldA) || fieldA.history.length == 0) {
        //Scenario #1 - New Copy
        onResolve(exports.defaultFieldMergers.useB(fieldA, fieldB));
    } else if(_.isUndefined(fieldB) || fieldB.history.length == 0) {
        //Scenario #1 - New Copy
        onResolve(exports.defaultFieldMergers.useA(fieldA, fieldB));
    } else {
        var diff = exports.getHistoryDiff(fieldA.history, fieldB.history);
        if(_.isUndefined(diff) || (diff.historySinceA.length > 0 && diff.historySinceB.length > 0))
        {
            //Scenario #5 - Divergent
            onConflict(fieldA, fieldB, diff, onResolve, 5);
        }
        else if(diff.historySinceA.length == 0 && diff.historySinceB.length == 0)
        {
            //Scenario #2 - Sync
            if(diff.latestCommonA.date.getTime() >= diff.latestCommonB.date.getTime())
            {
                onResolve(exports.defaultFieldMergers.useA(fieldA, fieldB));
            } else {
                onResolve(exports.defaultFieldMergers.useB(fieldA, fieldB));
            }
        } else if(diff.historySinceA.length > 0)
        {
            //A is on top
            if(fieldA.history[fieldA.history.length-1].date.getTime() >= fieldB.history[fieldB.history.length-1].date.getTime())
            {
                //Scenario #3 - Newer on Top
                onResolve(exports.defaultFieldMergers.useA(fieldA, fieldB));
            } else {
                //Scenario #4 - Older on Top
                onConflict(fieldA, fieldB, diff, onResolve, 4);
            }
        } else
        {
            //B is on top
            if(fieldA.history[fieldA.history.length-1].date.getTime() >= fieldB.history[fieldB.history.length-1].date.getTime())
            {
                //Scenario #4 - Older on Top
                onConflict(fieldA, fieldB, diff, onResolve, 4);
            } else {
                //Scenario #3 - Newer on Top
                onResolve(exports.defaultFieldMergers.useB(fieldA, fieldB));
            }
        }
    }
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
        historySinceB: [],
        historyUntilA: [],
        historyUntilB: []
    };

    //TODO: How should (A,B,C) compared with (B,A,C) be handled?
    //TODO: convert/wrap history hash arrays in objects/hashsets to fasten search
    for(var a = historyA.length-1; a >= 0 && historyB.length > 0 && !foundLatestCommonHash; a--)
    {
        /**
         * @type {MagpieLocketFieldHistoryEntry}
         */
        var entryA = historyA[a];

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
                diff.historySinceA = historyA.slice(a+1);
                diff.historySinceB = historyB.slice(b+1);
                diff.historyUntilA = historyA.slice(0, a);
                diff.historyUntilB = historyB.slice(0, b);
            }
        }
    }

    return (foundLatestCommonHash) ? diff : undefined;
};