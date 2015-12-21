/**
 * Component that flattens an object into a reference list instead of a nested hierarchy
 * It can also expand these flattened structures again.
 *
 * As a notice, this is supposed to be used on plain objects and arrays.
 * e.g. as a middle step between toJSON() and the actual string formatting
 *
 * Be warned that, as of now, these methods are pretty destructive, altering their given objects
 */
"use strict";

var
    _ = require('lodash')
;

//Pull all arrays, buffers and objects, find or put them into the pancake
function rollObjectIntoPancake(obj, pancake)
{
    _.forIn(obj, function(mValue, mKey) {
        if(_.isPlainObject(mValue) || _.isArray(mValue) || Buffer.isBuffer(mValue)) {

            var referenceIdx = _.findIndex(pancake, function(stored){
                return stored == mValue;
            });

            if(referenceIdx < 0)
            {
                //Put the object into the pancake an retrieve new reference index
                pancake.push(mValue);
                referenceIdx = pancake.length - 1;
            }

            //Create an array object that acts as reference (instead of any complex object to save size
            obj[mKey] = [referenceIdx];
        }
    });
}

//Pull all arrays and objects, find or put them into the pancake
function rollArrayIntoPancake(array, pancake)
{
    _.forEach(array, function(mValue, mKey) {
        if(_.isPlainObject(mValue) || _.isArray(mValue) || Buffer.isBuffer(mValue)) {

            var referenceIdx = _.findIndex(pancake, function(stored){
                return stored == mValue;
            });

            if(referenceIdx < 0)
            {
                //Put the object into the pancake an retrieve new reference index
                pancake.push(mValue);
                referenceIdx = pancake.length - 1;
            }

            //Create an array object that acts as reference (instead of any complex object to save size
            array[mKey] = [referenceIdx];
        }
    });
}

function flattenObjectOrArray(obj, pancake)
{
    pancake.push(obj);

    for(var i = 0; i < pancake.length; i++)
    {
        var unrolledElement = pancake[i];
        if(_.isArray(unrolledElement))
        {
            rollArrayIntoPancake(pancake[i], pancake);
        } else {
            rollObjectIntoPancake(pancake[i], pancake);
        }
    }
}

function defaultOnConstruct(objectData){
    return _.identity(objectData);
}
function defaultOnRelink(object, links){
    _.extend(object, links);
}

function reconstructObjectOrArray(pancake, indexOfStartObj, onConstruct, onRelink)
{
    //[pancakeIndex]
    var indicesToConstruct = [];
    indicesToConstruct.push(indexOfStartObj);

    //{pancakeIndex:constructedObj}
    var constructedObjects = {};
    //{pancakeIndex:{membername:pancakeIndex||-1}}
    var objectsLinks = {};

    if(!_.isFunction(onConstruct))
    {
        onConstruct = defaultOnConstruct;
    }

    if(!_.isFunction(onRelink))
    {
        onRelink = defaultOnRelink;
    }

    for(var i = 0; i < indicesToConstruct.length; i++) {
        var pancakeIndexToConstruct = indicesToConstruct[i];

        if(constructedObjects.hasOwnProperty(pancakeIndexToConstruct))
        {
            //Already constructed
            continue;
        }

        var flatObject = pancake[pancakeIndexToConstruct];

        var reconstructionObject = _.isArray(flatObject) ? [] : {};
        var links = {};
        if(Buffer.isBuffer(flatObject))
        {
            //Take buffer as-is
            reconstructionObject = flatObject;
        } else {
            //Create reconstruction object and store links
            _.forEach(flatObject, function (mValue, mKey) {
                //Check if it is a reference/link to another object type in the pancake
                if(_.isArray(mValue)) {
                    if(mValue.length == 1 && mValue[0] < pancake.length)
                    {
                        links[mKey] = [mValue[0]];
                    } else {
                        //Warn?
                    }
                } else {
                    reconstructionObject[mKey] = mValue;
                }
            });
        }

        var reconstructedObject = onConstruct(reconstructionObject, defaultOnConstruct);

        if(!_.isUndefined(reconstructedObject))
        {
            constructedObjects[pancakeIndexToConstruct] = reconstructedObject;

            if(_.size(links) > 0)
            {
                Array.prototype.push.apply(indicesToConstruct, _.values(links));
                objectsLinks[pancakeIndexToConstruct] = links;
            }
        }
    }

    //Now that all objects have been constructed, possibly with specialized constructors, we can restore references
    _.forEach(objectsLinks, function (links, pancakeIndex) {
        var resolvedLinks = {};
        _.forEach(links, function(referencedPancakeIndex, fieldname){
            if(referencedPancakeIndex >= 0)
            {
                resolvedLinks[fieldname] = constructedObjects[referencedPancakeIndex];
            }
        });
        onRelink(constructedObjects[pancakeIndex], resolvedLinks, defaultOnRelink);
    });


    return constructedObjects[indexOfStartObj];
}

/**
 * Creates a pancake, a flattened version of an object.
 * Te resulting version can be converted to JSON etc. easily and support circular references
 * @param obj
 * @returns {Array}
 */
exports.flatten = function(obj)
{
    //We wil flatten this into a electronic pancake
    var pancake = [];

    if(_.isUndefined(obj))
    {
        //Nothing to do, undefined things result in an empty pancake
    } else if(_.isPlainObject(obj) || _.isArray(obj)) {
        //It is an object or array, time to roll it flat!
        flattenObjectOrArray(obj, pancake);
    } else {
        //Primitive that can be flattened as-is
        pancake.push(obj);
    }

    return pancake;
};

/**
 * Reconstructs an object as it was before flattening.
 * To correctly reconstruct types, callbacks have to be utilized to replace constructors when needed
 * @param {Array} pancake - the flattened object
 * @param onConstruct - callback called for each reconstructed object, before the links have been reconstructed. Has to return the object that will be further used.
 * @param onRelink - callback called for each reconstructed object, after all links have been reconstructed. Should fill in member fields with the given links.
 * @returns {*}
 */
exports.unflatten = function(pancake, onConstruct, onRelink)
{
    if(!_.isArray(pancake))
    {
        throw new TypeError("Cannot unflatten non-array");
    }


    if(pancake.length > 0)
    {
        //Let the pancake expand to become fluffy and thick
        var expanded = pancake[0];
        //if the root element is an object, we have to expand it
        if(_.isPlainObject(expanded) || _.isArray(expanded)) {
            expanded = reconstructObjectOrArray(pancake, 0, onConstruct, onRelink);
        }

        return expanded;
    } else {
        return undefined;
    }
};
