"use strict";
function GameBoyAdvanceChannel4Synth(sound) {
    this.sound = sound;
    this.currentSampleLeft = 0;
    this.currentSampleLeftSecondary = 0;
    this.currentSampleRight = 0;
    this.currentSampleRightSecondary = 0;
    this.totalLength = 0x40;
    this.envelopeVolume = 0;
    this.FrequencyPeriod = 32;
    this.lastSampleLookup = 0;
    this.BitRange = 0x7FFF;
    this.VolumeShifter = 15;
    this.currentVolume = 0;
    this.consecutive = true;
    this.envelopeSweeps = 0;
    this.envelopeSweepsLast = -1;
    this.canPlay = false;
    this.Enabled = false;
    this.counter = 0;
    this.nr42 = 0;
    this.nr43 = 0;
    this.nr44 = 0;
    this.cachedSample = 0;
    this.intializeWhiteNoise();
    this.noiseSampleTable = this.LSFR15Table;
}
GameBoyAdvanceChannel4Synth.prototype.intializeWhiteNoise = function () {
    var randomFactor = 1;
    this.LSFR15Table = getInt8Array(0x80000);
    var LSFR = 0x7FFF;
    var LSFRShifted = 0x3FFF;
    for (var index = 0; index < 0x8000; ++index) {
        randomFactor = 1 - (LSFR & 1);
        this.LSFR15Table[0x08000 | index] = randomFactor;
        this.LSFR15Table[0x10000 | index] = randomFactor * 0x2;
        this.LSFR15Table[0x18000 | index] = randomFactor * 0x3;
        this.LSFR15Table[0x20000 | index] = randomFactor * 0x4;
        this.LSFR15Table[0x28000 | index] = randomFactor * 0x5;
        this.LSFR15Table[0x30000 | index] = randomFactor * 0x6;
        this.LSFR15Table[0x38000 | index] = randomFactor * 0x7;
        this.LSFR15Table[0x40000 | index] = randomFactor * 0x8;
        this.LSFR15Table[0x48000 | index] = randomFactor * 0x9;
        this.LSFR15Table[0x50000 | index] = randomFactor * 0xA;
        this.LSFR15Table[0x58000 | index] = randomFactor * 0xB;
        this.LSFR15Table[0x60000 | index] = randomFactor * 0xC;
        this.LSFR15Table[0x68000 | index] = randomFactor * 0xD;
        this.LSFR15Table[0x70000 | index] = randomFactor * 0xE;
        this.LSFR15Table[0x78000 | index] = randomFactor * 0xF;
        LSFRShifted = LSFR >> 1;
        LSFR = LSFRShifted | (((LSFRShifted ^ LSFR) & 0x1) << 14);
    }
    this.LSFR7Table = getInt8Array(0x800);
    LSFR = 0x7F;
    for (index = 0; index < 0x80; ++index) {
        randomFactor = 1 - (LSFR & 1);
        this.LSFR7Table[0x080 | index] = randomFactor;
        this.LSFR7Table[0x100 | index] = randomFactor * 0x2;
        this.LSFR7Table[0x180 | index] = randomFactor * 0x3;
        this.LSFR7Table[0x200 | index] = randomFactor * 0x4;
        this.LSFR7Table[0x280 | index] = randomFactor * 0x5;
        this.LSFR7Table[0x300 | index] = randomFactor * 0x6;
        this.LSFR7Table[0x380 | index] = randomFactor * 0x7;
        this.LSFR7Table[0x400 | index] = randomFactor * 0x8;
        this.LSFR7Table[0x480 | index] = randomFactor * 0x9;
        this.LSFR7Table[0x500 | index] = randomFactor * 0xA;
        this.LSFR7Table[0x580 | index] = randomFactor * 0xB;
        this.LSFR7Table[0x600 | index] = randomFactor * 0xC;
        this.LSFR7Table[0x680 | index] = randomFactor * 0xD;
        this.LSFR7Table[0x700 | index] = randomFactor * 0xE;
        this.LSFR7Table[0x780 | index] = randomFactor * 0xF;
        LSFRShifted = LSFR >> 1;
        LSFR = LSFRShifted | (((LSFRShifted ^ LSFR) & 0x1) << 6);
    }
}
GameBoyAdvanceChannel4Synth.prototype.disabled = function () {
    this.totalLength = 0x40;
    this.nr42 = 0;
    this.envelopeVolume = 0;
    this.nr43 = 0;
    this.FrequencyPeriod = 32;
    this.lastSampleLookup = 0;
    this.BitRange = 0x7FFF;
    this.VolumeShifter = 15;
    this.currentVolume = 0;
    this.noiseSampleTable = this.LSFR15Table;
    this.nr44 = 0;
    this.consecutive = true;
    this.envelopeSweeps = 0;
    this.envelopeSweepsLast = -1;
    this.canPlay = false;
    this.Enabled = false;
    this.counter = 0;
}
GameBoyAdvanceChannel4Synth.prototype.clockAudioLength = function () {
    if ((this.totalLength | 0) > 1) {
        this.totalLength = ((this.totalLength | 0) - 1) | 0;
    }
    else if ((this.totalLength | 0) == 1) {
        this.totalLength = 0;
        this.enableCheck();
        this.sound.unsetNR52(0xF7);
    }
}
GameBoyAdvanceChannel4Synth.prototype.clockAudioEnvelope = function () {
    if ((this.envelopeSweepsLast | 0) > -1) {
        if ((this.envelopeSweeps | 0) > 0) {
            this.envelopeSweeps = ((this.envelopeSweeps | 0) - 1) | 0;
        }
        else {
            if (!this.envelopeType) {
                if ((this.envelopeVolume | 0) > 0) {
                    this.envelopeVolume = ((this.envelopeVolume | 0) - 1) | 0;
                    this.currentVolume = (this.envelopeVolume | 0) << (this.VolumeShifter | 0);
                    this.envelopeSweeps = this.envelopeSweepsLast | 0;
                }
                else {
                    this.envelopeSweepsLast = -1;
                }
            }
            else if ((this.envelopeVolume | 0) < 0xF) {
                this.envelopeVolume = ((this.envelopeVolume | 0) + 1) | 0;
                this.currentVolume = (this.envelopeVolume | 0) << (this.VolumeShifter | 0);
                this.envelopeSweeps = this.envelopeSweepsLast | 0;
            }
            else {
                this.envelopeSweepsLast = -1;
            }
        }
    }
}
GameBoyAdvanceChannel4Synth.prototype.computeAudioChannel = function () {
    if ((this.counter | 0) == 0) {
        this.lastSampleLookup = ((this.lastSampleLookup | 0) + 1) & this.BitRange;
        this.counter = this.FrequencyPeriod | 0;
    }
}
GameBoyAdvanceChannel4Synth.prototype.enableCheck = function () {
    this.Enabled = ((this.consecutive || (this.totalLength | 0) > 0) && this.canPlay);
}
GameBoyAdvanceChannel4Synth.prototype.volumeEnableCheck = function () {
    this.canPlay = ((this.nr42 | 0) > 7);
    this.enableCheck();
}
GameBoyAdvanceChannel4Synth.prototype.outputLevelCache = function () {
    this.currentSampleLeft = (this.sound.leftChannel4) ? (this.cachedSample | 0) : 0;
    this.currentSampleRight = (this.sound.rightChannel4) ? (this.cachedSample | 0) : 0;
    this.outputLevelSecondaryCache();
}
GameBoyAdvanceChannel4Synth.prototype.outputLevelSecondaryCache = function () {
    if (this.Enabled) {
        this.currentSampleLeftSecondary = this.currentSampleLeft | 0;
        this.currentSampleRightSecondary = this.currentSampleRight | 0;
    }
    else {
        this.currentSampleLeftSecondary = 0;
        this.currentSampleRightSecondary = 0;
    }
}
GameBoyAdvanceChannel4Synth.prototype.updateCache = function () {
    this.cachedSample = this.noiseSampleTable[this.currentVolume | this.lastSampleLookup] | 0;
    this.outputLevelCache();
}
GameBoyAdvanceChannel4Synth.prototype.writeSOUND4CNT_L0 = function (data) {
    data = data | 0;
    this.totalLength = (0x40 - (data & 0x3F)) | 0;
    this.enableCheck();
}
GameBoyAdvanceChannel4Synth.prototype.writeSOUND4CNT_L1 = function (data) {
    data = data | 0;
    this.envelopeType = ((data & 0x08) != 0);
    this.nr42 = data | 0;
    this.volumeEnableCheck();
}
GameBoyAdvanceChannel4Synth.prototype.readSOUND4CNT_L = function () {
    return this.nr42 | 0;
}
GameBoyAdvanceChannel4Synth.prototype.writeSOUND4CNT_H0 = function (data) {
    data = data | 0;
    this.FrequencyPeriod = Math.max((data & 0x7) << 4, 8) << (((data >> 4) + 2) | 0);
    var bitWidth = data & 0x8;
    if (((bitWidth | 0) == 0x8 && (this.BitRange | 0) == 0x7FFF) || ((bitWidth | 0) == 0 && (this.BitRange | 0) == 0x7F)) {
        this.lastSampleLookup = 0;
        this.BitRange = ((bitWidth | 0) == 0x8) ? 0x7F : 0x7FFF;
        this.VolumeShifter = ((bitWidth | 0) == 0x8) ? 7 : 15;
        this.currentVolume = this.envelopeVolume << (this.VolumeShifter | 0);
        this.noiseSampleTable = ((bitWidth | 0) == 0x8) ? this.LSFR7Table : this.LSFR15Table;
    }
    this.nr43 = data | 0;
}
GameBoyAdvanceChannel4Synth.prototype.readSOUND4CNT_H0 = function () {
    return this.nr43 | 0;
}
GameBoyAdvanceChannel4Synth.prototype.writeSOUND4CNT_H1 = function (data) {
    data = data | 0;
    this.nr44 = data | 0;
    this.consecutive = ((data & 0x40) == 0x0);
    if ((data | 0) > 0x7F) {
        this.envelopeVolume = this.nr42 >> 4;
        this.currentVolume = this.envelopeVolume << (this.VolumeShifter | 0);
        this.envelopeSweepsLast = ((this.nr42 & 0x7) - 1) | 0;
        if ((this.totalLength | 0) == 0) {
            this.totalLength = 0x40;
        }
        if ((data & 0x40) != 0) {
            this.sound.setNR52(0x8);
        }
    }
    this.enableCheck();
}
GameBoyAdvanceChannel4Synth.prototype.readSOUND4CNT_H1 = function () {
    return this.nr44 | 0;
}