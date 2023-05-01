"use strict";
function ImportSaveCallback(name) {
    try {
        var save = findValue("SAVE_" + name);
        if (save != null) {
            writeRedTemporaryText("Loaded save.");
            return base64ToArray(save);
        }
    }
    catch (error) {
        alert("Could not read save: " + error.message);
    }
    return null;
}
function ExportSave() {
    Iodine.exportSave();
}
function ExportSaveCallback(name, save) {
    if (name != "") {
        try {
            setValue("SAVE_" + name, arrayToBase64(save));
        }
        catch (error) {
            alert("Could not store save: " + error.message);
        }
    }
}
function registerSaveHandlers() {
    Iodine.attachSaveExportHandler(ExportSaveCallback);
    Iodine.attachSaveImportHandler(ImportSaveCallback);
}
function findValue(key) {
    try {
        if (window.localStorage.getItem(key) != null) {
            return JSON.parse(window.localStorage.getItem(key));
        }
    }
    catch (error) {
        if (window.globalStorage[location.hostname].getItem(key) != null) {
            return JSON.parse(window.globalStorage[location.hostname].getItem(key));
        }
    }
    return null;
}
function setValue(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        window.globalStorage[location.hostname].setItem(key, JSON.stringify(value));
    }
}
function deleteValue(key) {
    try {
        window.localStorage.removeItem(key);
    }
    catch (error) {
        window.globalStorage[location.hostname].removeItem(key);
    }
}