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


/**
 * Serializes any complex object, via the hooks of toLocket(), toBSON() or toJSON()
 * and allows for circular dependencies in the serialized structure.
 * Returns a pancake array, which contains a representation of the object ready to be further processed
 * through stringification or binary encoding.
 * @param obj
 * @return {Array}
 */
function serialize(obj)
{
    return pancake.flatten(getSerializableRepresentation(obj));
}

/**
 * Deserialize an object previously serialized with #serialize(obj).
 * Can reconstruct types, if the serialized representation contains a "!type" field:
 * For this, constructors needs to contain a key which is eual to the value of the !type field.
 * This property needs to contain a function as value, which will be used as constructor. (Via pancakes onConstruct hook)
 * Be aware that this constructor does not receive the full data of the obejct, as references are reconstructed later.
 * To reconstruct references and links to other complex types, add a relinker. (Implemented via pancakes onRelink hook)
 * Relinkers are identified the same way as constructors, by reading the !type field.
 * @param serialized
 * @param {{}} [constructors]
 * @param {{}} [relinkers]
 * @return {*}
 */
function deserialize(serialized, constructors, relinkers)
{
    constructors = _.extend({}, constructors);
    relinkers = _.extend({}, relinkers);

    //[reconstructed object : !type]
    var memorizedTypes = [];

    function onConstruct(reconstructionObject, defaultOnConstruct)
    {
        var constructed;
        var type = _.isObject(reconstructionObject) ? reconstructionObject["!type"] : undefined;
        if(_.isString(type))
        {
            //There is an explicit type declaration
            var constructor = constructors[type];
            if(_.isFunction(constructor))
            {
                //There is a registered constructor for this type
                constructed = new constructor(reconstructionObject);
            } else {
                constructed = defaultOnConstruct(reconstructionObject);
            }
            memorizedTypes.push([constructed, type]);
        } else {
            constructed = defaultOnConstruct(reconstructionObject);
        }
        return constructed;
    }


    function onRelink(object, links, defaultOnRelink)
    {
        var type;
        //Search for the type of this object
        for(var i = 0; i < memorizedTypes.length; i++)
        {
            var pair = memorizedTypes[i];
            if(pair[0] == object)
            {
                type = pair[1];
                break;
            }
        }
        if(_.isString(type))
        {
            //There is an explicit type declaration
            var relinker = relinkers[type];
            if(_.isFunction(relinker))
            {
                //There is a registered relinker for this type
                return relinker.call(object, object, links, defaultOnRelink);
            }
        }
        return defaultOnRelink(object, links);
    }

    return pancake.unflatten(serialized, onConstruct, onRelink);
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
    if(_.isString(source["!type"]))
    {
        currentSerialized["!type"] = source["!type"];
    }

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

function isLeafWithToJSON(obj)
{
    return (
        Buffer.isBuffer(obj) ||
        _.isDate(obj) ||
        _.isRegExp(obj) ||
        _.isNaN(obj) ||
        _.isNull(obj) ||
        _.isTypedArray(obj) ||
        obj == Number.POSITIVE_INFINITY ||
        obj == Number.NEGATIVE_INFINITY
    );
}

function useCustomSerializer(obj)
{
    if(isLeafWithToJSON(obj) && !_.isFunction(obj['toLocket']))
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
        return useCustomSerializer(obj);
    } else if(_.isObject(obj) && !_.isFunction(obj))
    {
        return _.clone(obj);
    } else return obj;
}

exports.serialize = serialize;
exports.deserialize = deserialize;
exports.getSerializableRepresentation = getSerializableRepresentation;