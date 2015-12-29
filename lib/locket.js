/**
 * Component that creates and modifies locket objects & data.
 */
"use strict";

var
    crypto = require('crypto')
;

var
    _ = require('lodash'),
    objecthash = require('object-hash'),
    bson = require('bson'),
    NodeRSA = require('node-rsa')
;

var
    serializer = require('./serializer'),
    pancake = require('./pancake')
;

/**
 * @typedef {{hash: String, date: Date}} MagpieLocketFieldHistoryEntry
 */

/**
 * @typedef {{serializedContent: Array, history: [MagpieLocketFieldHistoryEntry]}} MagpieLocketField
 */

/**
 * @typedef {{fields: Object.<String, MagpieLocketField>}} MagpieLocket
 */

/**
 * @typedef {{a: String, c: String, l: String}} MagpieLocketLocked
 */

/**
 *
 * @return {MagpieLocket}
 */
function createNewLocket()
{
    return {
        fields: {}
    }
}

/**
 * Returns if this locket contains the given field, and that field is not empty (has a history)
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @returns {boolean}
 */
function hasField(locket, fieldName)
{
    return (!_.isUndefined(locket.fields[fieldName]) && locket.fields[fieldName].history.length > 0);
}

/**
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @returns {MagpieLocketField, undefined}
 */
function getField(locket, fieldName)
{
    if(hasField(locket, fieldName))
    {
        return locket.fields[fieldName];
    }
}

/**
 * Returns a dictionary containing all fields in the locket (that are not empty / have a history)
 * @param locket
 * @return {Object.<String, MagpieLocketField>}
 */
function getAllFields(locket)
{
    var fields = {};
    _.forEach(Object.keys(locket.fields), function(fieldName){
        var field = getField(locket, fieldName);
        if(!_.isUndefined(field))
        {
            fields[fieldName] = field;
        }
    });
    return fields;
}

/**
 * Adds a new field, if it does not exists
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @returns {MagpieLocketField}
 */
function addField(locket, fieldName)
{
    if(!hasField(locket, fieldName))
    {
        locket.fields[fieldName] = {
            history: [],
            serializedContent: []
        };
    }

    return locket.fields[fieldName];
}

/**
 * Get the (serialized) content of the field
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @returns {Array, undefined}
 */
function getSerializedContent(locket, fieldName)
{
    var field = getField(locket, fieldName);
    if(!_.isUndefined(field))
    {
        return field.serializedContent;
    }
}

/**
 * Updates the serialized content in the field and adds the has and date to the history.
 * @param {MagpieLocketField} field
 * @param {Array} serializedContent
 */
function updateSerializedContentOfField(field, serializedContent)
{
    if(!_.isUndefined(field))
    {
        field.serializedContent = serializedContent;
        field.history.push(generateHistoryEntry(serializedContent));
    }
}

/**
 * Updates the serialized content in the field and updates the history.
 * Will do nothing if the field does not exist.
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @param {Array} serializedContent
 */
function updateSerializedContent(locket, fieldName, serializedContent)
{
    updateSerializedContentOfField(getField(locket, fieldName), serializedContent);
}

/**
 * Sets the serialized content in the field and updates the history.
 * Will create the field first, if it does not exist.
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @param {Array} serializedContent
 */
function setSerializedContent(locket, fieldName, serializedContent)
{
    updateSerializedContentOfField(addField(locket, fieldName), serializedContent);
}

/**
 * Generates a historyEntry for the given serialized content, marked with the current datetime
 * @param serializedContent
 * @return {MagpieLocketFieldHistoryEntry}
 */
function generateHistoryEntry(serializedContent)
{
    return {
        hash: objecthash(serializedContent),
        date: new Date()
    };
}

/**
 * Deserialize the content of the field
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @param {Object} [config] - Configure the reading operation
 * @returns {*, undefined}
 */
function readContent(locket, fieldName, config)
{
    config = _.extend({
        constructors: {},
        relinkers: {}
    }, config);

    var serializedContent = getSerializedContent(locket, fieldName);
    if(!_.isUndefined(serializedContent))
    {
        return serializer.deserialize(serializedContent, config.constructors, config.relinkers);
    }
}

/**
 * Serializes the given content and sets it as content of the designated field.
 * Updates the fields history.
 * If the field does not exist, the field will be created first
 * @param {MagpieLocket} locket
 * @param {String} fieldName
 * @param {Object} [config] - Configure the writing operation
 * @param {Boolean} [config.updateOnly = false] - True if no new field should be created and only old fields should be updated
 * @param {*} content
 */
function writeContent(locket, fieldName, content, config)
{
    config = _.extend({
        updateOnly: false
    }, config);

    var serializedContent = serializer.serialize(content);
    var writerFunc = (config.updateOnly) ? updateSerializedContent : setSerializedContent;

    writerFunc.call(this, locket, fieldName, serializedContent);
}

var BSONLibs = {
    Native: undefined,
    Pure: undefined
};
function useBSON(pure)
{
    if(pure)
    {
        if(_.isUndefined(BSONLibs.Pure))
        {
            BSONLibs.Pure = new bson.BSONPure.BSON();
        }
        return BSONLibs.Pure;
    } else {

        if(_.isUndefined(BSONLibs.Native))
        {
            BSONLibs.Native = new bson.BSONNative.BSON();
        }
        return BSONLibs.Native;
    }
}

function convertLocketToBSON(locket, bsonPure)
{
    return useBSON(bsonPure).serialize(locket);
}
function convertBSONToLocket(locketBSON, bsonPure)
{
    var deserialized = useBSON(bsonPure).deserialize(locketBSON);
    var locket = createNewLocket();
    locket.fields = deserialized.fields;

    //Needs sanitation from the BSON format
    _.forEach(locket.fields, function(field){
        pancake.sanitizeFromBSON(field.serializedContent);
    });

    return locket;
}

/**
 *
 * @param {MagpieLocket} locket
 * @param {NodeRSA} keypair - The key to lock this file. It will not be used as direct cipherKey, but merely encrypts a generated cipherKey
 * @param [config]
 * @return {MagpieLocketLocked}
 */
function lock(locket, keypair, config)
{
    config = _.extend({
        algorithm: 'aes-256-cbc',
        useBSONPure: false
    }, config);
    var locketBSON = convertLocketToBSON(locket, config.useBSONPure);

    var type = 'binary';
    var shiftingLock = generateShiftingLock(keypair);
    var cipherKey = shiftingLock[0];

    var cipher = crypto.createCipher(config.algorithm, cipherKey);

    var encryptedLocket = cipher.update(locketBSON, '', type);
    encryptedLocket += cipher.final(type);

    return {
        a: config.algorithm,
        c: shiftingLock[1],
        l: encryptedLocket
    };
}

/**
 * Unlocks a MagpieLocketLocked
 * @param {MagpieLocketLocked} lockedLocket
 * @param {NodeRSA} keypair
 * @param [config]
 */
function unlock(lockedLocket, keypair, config)
{
    config = _.extend({
        algorithm: lockedLocket.a || 'aes-256-cbc',
        useBSONPure: false
    }, config);

    var type = 'binary';
    var cipherKey = unlockShiftingLock(lockedLocket.c, keypair);
    var encryptedLocket = lockedLocket.l;

    var decipher = crypto.createDecipher(config.algorithm, cipherKey);

    var decryptedLocket = decipher.update(encryptedLocket, '', type);
    decryptedLocket += decipher.final(type);

    return convertBSONToLocket(new Buffer(decryptedLocket, 'binary'));
}

function generateShiftingLock(keypair)
{
    var lock = [];
    //Generate a new (shifting) cipherKey
    lock[0] = crypto.randomBytes(1024);

    //Encrypt the cipherKey with given keypair
    lock[1] = keypair.encrypt(lock[0], 'binary');

    return lock;
}

//Returns the cipherKey protected by the shifting lock, given the key fits the shifting lock
function unlockShiftingLock(shiftingLock, keypair)
{
    return keypair.decrypt(new Buffer(shiftingLock, 'binary'));
}


exports.createNew = createNewLocket;
exports.addField = addField;
exports.generateHistoryEntry = generateHistoryEntry;
exports.hasField = hasField;
exports.getField = getField;
exports.getAllFields = getAllFields;
exports.updateSerializedContentOfField = updateSerializedContentOfField;
exports.setSerializedContent = setSerializedContent;
exports.updateSerializedContent = updateSerializedContent;
exports.getSerializedContent = getSerializedContent;
exports.writeContent = writeContent;
exports.readContent = readContent;
exports.convertLocketToBSON = convertLocketToBSON;
exports.convertBSONToLocket = convertBSONToLocket;
exports.lock = lock;
exports.unlock = unlock;