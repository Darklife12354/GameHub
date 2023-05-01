"use strict";
function GameBoyAdvanceSaves(IOCore) {
    this.cartridge = IOCore.cartridge;
}
GameBoyAdvanceSaves.prototype.initialize = function () {
    this.saveType = 0;
    this.gpioType = 0;
    this.GPIOChip = null;
    this.UNDETERMINED = new GameBoyAdvanceSaveDeterminer(this);
    this.SRAMChip = new GameBoyAdvanceSRAMChip();
    this.FLASHChip = new GameBoyAdvanceFLASHChip(this.cartridge.flash_is128, this.cartridge.flash_isAtmel);
    this.EEPROMChip = new GameBoyAdvanceEEPROMChip(this.cartridge.IOCore);
    this.currentChip = this.UNDETERMINED;
    this.referenceSave(this.saveType);
}
GameBoyAdvanceSaves.prototype.referenceSave = function (saveType) {
    saveType = saveType | 0;
    switch (saveType | 0) {
        case 0:
            this.currentChip = this.UNDETERMINED;
            break;
        case 1:
            this.currentChip = this.SRAMChip;
            break;
        case 2:
            this.currentChip = this.FLASHChip;
            break;
        case 3:
            this.currentChip = this.EEPROMChip;
    }
    this.currentChip.initialize();
    this.saveType = saveType | 0;
}
GameBoyAdvanceSaves.prototype.importSave = function (saves, saveType) {
    this.UNDETERMINED.load(saves);
    this.SRAMChip.load(saves);
    this.FLASHChip.load(saves);
    this.EEPROMChip.load(saves);
    this.referenceSave(saveType | 0);
}
GameBoyAdvanceSaves.prototype.exportSave = function () {
    return this.currentChip.saves;
}
GameBoyAdvanceSaves.prototype.exportSaveType = function () {
    return this.saveType | 0;
}
GameBoyAdvanceSaves.prototype.readGPIO8 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.gpioType | 0) > 0) {
        data = this.GPIOChip.read8(address | 0) | 0;
    }
    else {
        data = this.cartridge.readROMOnly8(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readEEPROM8 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.saveType | 0) == 3) {
        data = this.EEPROMChip.read8() | 0;
    }
    else {
        data = this.UNDETERMINED.readEEPROM8(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readGPIO16 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.gpioType | 0) > 0) {
        data = this.GPIOChip.read16(address | 0) | 0;
    }
    else {
        data = this.cartridge.readROMOnly16(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readEEPROM16 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.saveType | 0) == 3) {
        data = this.EEPROMChip.read16() | 0;
    }
    else {
        data = this.UNDETERMINED.readEEPROM16(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readGPIO32 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.gpioType | 0) > 0) {
        data = this.GPIOChip.read32(address | 0) | 0;
    }
    else {
        data = this.cartridge.readROMOnly32(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readEEPROM32 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.saveType | 0) == 3) {
        data = this.EEPROMChip.read32() | 0;
    }
    else {
        data = this.UNDETERMINED.readEEPROM32(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readSRAM = function (address) {
    address = address | 0;
    var data = 0;
    switch (this.saveType | 0) {
        case 0:
            data = this.UNDETERMINED.readSRAM(address | 0) | 0;
            break;
        case 1:
            data = this.SRAMChip.read(address | 0) | 0;
            break;
        case 2:
            data = this.FLASHChip.read(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.writeGPIO8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.gpioType | 0) > 0) {
        this.GPIOChip.write8(address | 0, data | 0);
    }
    else {
        this.UNDETERMINED.writeGPIO8(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeGPIO16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.gpioType | 0) > 0) {
        this.GPIOChip.write16(address | 0, data | 0);
    }
    else {
        this.UNDETERMINED.writeGPIO16(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeEEPROM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.saveType | 0) == 3) {
        this.EEPROMChip.write16(data | 0);
    }
    else {
        this.UNDETERMINED.writeEEPROM16(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeGPIO32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.gpioType | 0) > 0) {
        this.GPIOChip.write32(address | 0, data | 0);
    }
    else {
        this.UNDETERMINED.writeGPIO32(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeSRAM = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (this.saveType | 0) {
        case 0:
            this.UNDETERMINED.writeSRAM(address | 0, data | 0);
            break;
        case 1:
            this.SRAMChip.write(address | 0, data | 0);
            break;
        case 2:
            this.FLASHChip.write(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeSRAMIfDefined = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (this.saveType | 0) {
        case 0:
            this.SRAMChip.initialize();
        case 1:
            this.SRAMChip.write(address | 0, data | 0);
            break;
        case 2:
            this.FLASHChip.write(address | 0, data | 0);
    }
}