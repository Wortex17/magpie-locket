/**
 * Component that abstracts the serialization and deserialization of objects
 * so they can be stored in a locket field
 */
"use strict";

var
    _ = require('lodash')
;

var
    pancake = require('./pancake')
;

function serialize(obj)
{
    //STUB, should serialize, then pancake

    var serialized = pancake.flatten(getSerializableRepresentation(obj));
    return serialized;
}

/**
 * Recursively calls representation methods on every object it encounters.
 * If found, it calls toLocket()
 * Otherwise toBSON()
 * Otherwise toJSON()
 *
 * Return any object in toLocket etc. to use that returned value as serialization of your object.
 *
 * Keeps track of any returned complex types, and thus allows cyclic dependencies
 * @param {*} origin - the object to be serialized
 * @returns {*}
 */
function getSerializableRepresentation(origin)
{
    var toDeserialize = [];
    toDeserialize.push(origin);

    var serializedSources = [];
    var serializedData = [];

    return getSerializableRepresentationRecursive(origin, serializedSources, serializedData);
}

function getSerializableRepresentationRecursive(source, serializedSources, serializedData)
{
    var serialIndex = serializedSources.indexOf(source);
    if(serialIndex >= 0)
    {
        return serializedData[serialIndex];
    }

    var currentSerialized = getOneLevelSerialized(source);

    if(!_.isObject(currentSerialized))
    {
        //Early exit for non-reference types
        return currentSerialized;
    }

    serializedSources.push(source);
    serializedData.push(currentSerialized);

    _.forEach(currentSerialized, function(value, key){
        currentSerialized[key] = getSerializableRepresentationRecursive(value, serializedSources, serializedData);
    });

    return currentSerialized;
}

/**
 * Checks if the given obj implements toLocket(), toBSON() or toJSON()
 * @param obj
 * @returns {Boolean}
 */
function hasCustomSerializer(obj)
{
    if(_.isUndefined(obj) || _.isNull(obj))
    {
        return false;
    }
    return (_.isFunction(obj['toLocket']) || _.isFunction(obj['toBSON']) || _.isFunction(obj['toJSON']));
}

function useCustomSerializer(obj)
{
    if(Buffer.isBuffer(obj) && !_.isFunction(obj['toLocket']))
    {
        //Buffer are not to be downgraded to their JSON version by default, (since they implement toJSON())
        return obj;
    } else if(_.isFunction(obj['toLocket']))
    {
        return obj['toLocket'].call(obj);
    } else if(_.isFunction(obj['toBSON'])) {
        return obj['toBSON'].call(obj);
    } else if(_.isFunction(obj['toJSON'])) {
        return obj['toJSON'].call(obj);
    }
}

function getOneLevelSerialized(obj)
{
    if(hasCustomSerializer(obj))
    {
        return useCustomSerializer(obj)
    } else if(_.isObject(obj) && !_.isFunction(obj))
    {
        return _.clone(obj);
    } else return obj;
}

exports.serialize = serialize;
exports.getSerializableRepresentation = getSerializableRepresentation;