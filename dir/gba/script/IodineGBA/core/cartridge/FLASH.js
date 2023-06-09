"use strict";
function GameBoyAdvanceFLASHChip(is128, isAteml) {
    this.largestSizePossible = (!!is128) ? 0x20000 : 0x10000;
    this.notATMEL = !isAteml;
    this.saves = null;
    this.BANKOffset = 0;
    this.flashCommandUnlockStage = 0;
    this.flashCommand = 0;
    this.writeBytesLeft = 0;
}
GameBoyAdvanceFLASHChip.prototype.initialize = function () {
    this.allocate();
}
GameBoyAdvanceFLASHChip.prototype.allocate = function () {
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
GameBoyAdvanceFLASHChip.prototype.load = function (save) {
    if ((save.length | 0) == 0x10000 || (save.length | 0) == 0x20000) {
        this.saves = save;
        if ((save.length | 0) == 0x20000) {
            this.notATMEL = true;
        }
    }
}
GameBoyAdvanceFLASHChip.prototype.read = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.flashCommand | 0) != 2 || (address | 0) > 1) {
        data = this.saves[address | this.BANKOffset] | 0;
    }
    else {
        if ((address | 0) == 0) {
            if (this.notATMEL) {
                data = ((this.largestSizePossible | 0) == 0x20000) ? 0x62 : 0xBF;
            }
            else {
                data = 0x1F;
            }
        }
        else {
            if (this.notATMEL) {
                data = ((this.largestSizePossible | 0) == 0x20000) ? 0x13 : 0xD4;
            }
            else {
                data = 0x3D;
            }
        }
    }
    return data | 0;
}
GameBoyAdvanceFLASHChip.prototype.write = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (this.writeBytesLeft | 0) {
        case 0:
            this.writeControlBits(address | 0, data | 0);
            break;
        case 0x80:
            var addressToErase = (address & 0xFF80) | this.BANKOffset;
            for (var index = 0; (index | 0) < 0x80; index = ((index | 0) + 1) | 0) {
                this.saves[addressToErase | index] = 0xFF;
            }
        default:
            this.writeByte(address | 0, data | 0);
    }
}
GameBoyAdvanceFLASHChip.prototype.writeControlBits = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (address | 0) {
        case 0:
            this.sectorEraseOrBankSwitch(address | 0, data | 0);
            break;
        case 0x5555:
            this.controlWriteStage2(data | 0);
            break;
        case 0x2AAA:
            this.controlWriteStageIncrement(data | 0);
            break;
        default:
            this.sectorErase(address | 0, data | 0);
    }
}
GameBoyAdvanceFLASHChip.prototype.writeByte = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.saves[address | this.BANKOffset] = data | 0;
    this.writeBytesLeft = ((this.writeBytesLeft | 0) - 1) | 0;
}
GameBoyAdvanceFLASHChip.prototype.selectBank = function (bankNumber) {
    bankNumber = bankNumber | 0;
    this.BANKOffset = (bankNumber & 0x1) << 16;
    this.largestSizePossible = Math.max((0x10000 + (this.BANKOffset | 0)) | 0, this.largestSizePossible | 0) | 0;
    this.notATMEL = true;
    this.allocate();
}
GameBoyAdvanceFLASHChip.prototype.controlWriteStage2 = function (data) {
    data = data | 0;
    if ((data | 0) == 0xAA) {
        this.flashCommandUnlockStage = 1;
    }
    else if ((this.flashCommandUnlockStage | 0) == 2) {
        switch (data | 0) {
            case 0x10:
                if ((this.flashCommand | 0) == 1) {
                    for (var index = 0; (index | 0) < (this.largestSizePossible | 0); index = ((index | 0) + 1) | 0) {
                        this.saves[index | 0] = 0xFF;
                    }
                }
                this.flashCommand = 0;
                break;
            case 0x80:
                this.flashCommand = 1;
                break;
            case 0x90:
                this.flashCommand = 2;
                break;
            case 0xA0:
                this.writeCommandTrigger();
                break;
            case 0xB0:
                this.flashCommand = 3;
                break;
            default:
                this.flashCommand = 0;
        }
        this.flashCommandUnlockStage = 0;
    }
    else if ((data | 0) == 0xF0) {
        this.flashCommand = 0;
        this.flashCommandUnlockStage = 0;
        this.notATMEL = true;
    }
}
GameBoyAdvanceFLASHChip.prototype.writeCommandTrigger = function () {
    if ((this.flashCommandUnlockStage | 0) == 2) {
        if (this.notATMEL) {
            this.writeBytesLeft = 1;
        }
        else {
            this.writeBytesLeft = 0x80;
        }
    }
}
GameBoyAdvanceFLASHChip.prototype.sectorErase = function (address, data) {
    address = (address << 12) >> 12;
    data = data | 0;
    if ((this.flashCommand | 0) == 1 && (this.flashCommandUnlockStage | 0) == 2 && ((data | 0) == 0x30)) {
        var addressEnd = ((address | this.BANKOffset) + 0x1000) | 0;
        for (var index = address | this.BANKOffset; (index | 0) < (addressEnd | 0); index = ((index | 0) + 1) | 0) {
            this.saves[index | 0] = 0xFF;
        }
        this.notATMEL = true;
    }
    this.flashCommand = 0;
    this.flashCommandUnlockStage = 0;
}
GameBoyAdvanceFLASHChip.prototype.sectorEraseOrBankSwitch = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.flashCommandUnlockStage | 0) == 2) {
        this.sectorErase(address | 0, data | 0);
    }
    else if ((this.flashCommand | 0) == 3 && (this.flashCommandUnlockStage | 0) == 0) {
        this.selectBank(data & 0x1);
    }
    this.flashCommand = 0;
    this.flashCommandUnlockStage = 0;
}
GameBoyAdvanceFLASHChip.prototype.controlWriteStageIncrement = function (data) {
    if ((data | 0) == 0x55 && (this.flashCommandUnlockStage | 0) == 1) {
        this.flashCommandUnlockStage = ((this.flashCommandUnlockStage | 0) + 1) | 0;
    }
    else {
        this.flashCommandUnlockStage = 0;
    }
}