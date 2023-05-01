"use strict";
function GameBoyAdvanceEEPROMChip(IOCore) {
    this.saves = null;
    this.largestSizePossible = 0x200;
    this.mode = 0;
    this.bitsProcessed = 0;
    this.address = 0;
    this.buffer = getUint8Array(8);
    this.IOCore = IOCore;
}
GameBoyAdvanceEEPROMChip.prototype.initialize = function () {
    this.allocate();
}
GameBoyAdvanceEEPROMChip.prototype.allocate = function () {
    if (this.saves == null || (this.saves.length | 0) < (this.largestSizePossible | 0)) {
        var newSave = getUint8Array(this.largestSizePossible | 0);
        for (var index = 0; (index | 0) < (this.largestSizePossible | 0); index = ((index | 0) + 1) | 0) {
            newSave[index | 0] = 0xFF;
        }
        if (this.saves != null) {
            for (var index = 0; (index | 0) < (this.saves.length | 0); index = ((index | 0) + 1) | 0) {
                newSave[index | 0] = this.saves[index | 0] | 0;
            }
        }
        this.saves = newSave;
    }
}
GameBoyAdvanceEEPROMChip.prototype.load = function (save) {
    if ((save.length | 0) == 0x200 || (save.length | 0) == 0x2000) {
        this.saves = save;
    }
}
GameBoyAdvanceEEPROMChip.prototype.read8 = function () {
    return 0x1;
}
GameBoyAdvanceEEPROMChip.prototype.read16 = function () {
    var data = 1;
    switch (this.mode | 0) {
        case 0x7:
            data = 0;
            if ((this.bitsProcessed | 0) < 3) {
                this.bitsProcessed = ((this.bitsProcessed | 0) + 1) | 0;
            }
            else {
                this.bitsProcessed = 0;
                this.mode = 8;
            }
            break;
        case 0x8:
            var address = ((this.bitsProcessed >> 3) + (this.address | 0)) | 0;
            data = (this.saves[address | 0] >> ((0x7 - (this.bitsProcessed & 0x7)) | 0)) & 0x1;
            if ((this.bitsProcessed | 0) < 0x3F) {
                this.bitsProcessed = ((this.bitsProcessed | 0) + 1) | 0;
            }
            else {
                this.resetMode();
            }
    }
    return data | 0;
}
GameBoyAdvanceEEPROMChip.prototype.read32 = function () {
    return 0x10001;
}
GameBoyAdvanceEEPROMChip.prototype.write16 = function (data) {
    data = data | 0;
    data = data & 0x1;
    switch (this.mode | 0) {
        case 0:
            this.mode = data | 0;
            break;
        case 0x1:
            this.selectMode(data | 0);
            break;
        case 0x2:
        case 0x3:
            this.addressMode(data | 0);
            break;
        case 0x4:
            this.writeMode(data | 0);
            break;
        case 0x5:
        case 0x6:
            this.endAddressing();
            break;
        default:
            this.resetMode();
    }
}
GameBoyAdvanceEEPROMChip.prototype.selectMode = function (data) {
    data = data | 0;
    this.address = 0;
    this.bitsProcessed = 0;
    this.mode = 0x2 | data;
}
GameBoyAdvanceEEPROMChip.prototype.addressMode = function (data) {
    data = data | 0;
    this.address = (this.address << 1) | data;
    this.bitsProcessed = ((this.bitsProcessed | 0) + 1) | 0;
    switch (this.bitsProcessed | 0) {
        case 0x6:
            if ((this.IOCore.dmaChannel3.wordCountShadow | 0) >= (((this.mode | 0) == 2) ? 0x4A : 0xA)) {
                this.largestSizePossible = 0x2000;
                this.allocate();
                break;
            }
        case 0xE:
            this.changeModeToActive();
    }
}
GameBoyAdvanceEEPROMChip.prototype.changeModeToActive = function () {
    this.address &= 0x3FF;
    this.address <<= 3;
    this.bitsProcessed = 0;
    this.mode = ((this.mode | 0) + 2) | 0;
}
GameBoyAdvanceEEPROMChip.prototype.writeMode = function (data) {
    data = data | 0;
    this.pushBuffer(data | 0);
    if ((this.bitsProcessed | 0) == 0x40) {
        this.copyBuffer();
        this.mode = 6;
    }
}
GameBoyAdvanceEEPROMChip.prototype.pushBuffer = function (data) {
    data = data | 0;
    var bufferPosition = this.bitsProcessed >> 3;
    this.buffer[bufferPosition & 0x7] = ((this.buffer[bufferPosition & 0x7] << 1) & 0xFE) | data;
    this.bitsProcessed = ((this.bitsProcessed | 0) + 1) | 0;
}
GameBoyAdvanceEEPROMChip.prototype.copyBuffer = function () {
    for (var index = 0; (index | 0) < 8; index = ((index | 0) + 1) | 0) {
        this.saves[this.address | index] = this.buffer[index & 0x7] & 0xFF;
    }
}
GameBoyAdvanceEEPROMChip.prototype.endAddressing = function () {
    this.mode = ((this.mode | 0) + 2) | 0;
}
GameBoyAdvanceEEPROMChip.prototype.resetMode = function () {
    this.mode = 0;
}