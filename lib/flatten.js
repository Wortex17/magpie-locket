/**
 * Component that flattens an object into a reference list instead of a nested hierarchy
 * It can also expand these flattened structures again.
 *
 * As a notice, this is supposed to be used on plain objects and arrays.
 * e.g. as a middle step between toJSON() and the actual string formatting
 */

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

exports.unflatten = function(pancake)
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

            //TODO: start unflattening by resolving references

        }

        return expanded;
    } else {
        return null;
    }
};
