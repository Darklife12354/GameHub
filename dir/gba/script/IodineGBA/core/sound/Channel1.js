"use strict";
function GameBoyAdvanceChannel1Synth(sound) {
    this.sound = sound;
    this.currentSampleLeft = 0;
    this.currentSampleLeftSecondary = 0;
    this.currentSampleLeftTrimary = 0;
    this.currentSampleRight = 0;
    this.currentSampleRightSecondary = 0;
    this.currentSampleRightTrimary = 0;
    this.SweepFault = false;
    this.lastTimeSweep = 0;
    this.timeSweep = 0;
    this.frequencySweepDivider = 0;
    this.decreaseSweep = false;
    this.nr11 = 0;
    this.CachedDuty = this.dutyLookup[0];
    this.totalLength = 0x40;
    this.nr12 = 0;
    this.envelopeVolume = 0;
    this.frequency = 0;
    this.FrequencyTracker = 0x8000;
    this.nr14 = 0;
    this.consecutive = true;
    this.ShadowFrequency = 0x8000;
    this.canPlay = false;
    this.Enabled = false;
    this.envelopeSweeps = 0;
    this.envelopeSweepsLast = -1;
    this.FrequencyCounter = 0;
    this.DutyTracker = 0;
    this.Swept = false;
}
GameBoyAdvanceChannel1Synth.prototype.dutyLookup = [
    [false, false, false, false, false, false, false, true],
    [true, false, false, false, false, false, false, true],
    [true, false, false, false, false, true, true, true],
    [false, true, true, true, true, true, true, false]
];
GameBoyAdvanceChannel1Synth.prototype.disabled = function () {
    this.nr10 = 0;
    this.SweepFault = false;
    this.lastTimeSweep = 0;
    this.timeSweep = 0;
    this.frequencySweepDivider = 0;
    this.decreaseSweep = false;
    this.nr11 = 0;
    this.CachedDuty = this.dutyLookup[0];
    this.totalLength = 0x40;
    this.nr12 = 0;
    this.envelopeVolume = 0;
    this.frequency = 0;
    this.FrequencyTracker = 0x8000;
    this.nr14 = 0;
    this.consecutive = true;
    this.ShadowFrequency = 0x8000;
    this.canPlay = false;
    this.Enabled = false;
    this.envelopeSweeps = 0;
    this.envelopeSweepsLast = -1;
    this.FrequencyCounter = 0;
    this.DutyTracker = 0;
}
GameBoyAdvanceChannel1Synth.prototype.clockAudioLength = function () {
    if ((this.totalLength | 0) > 1) {
        this.totalLength = ((this.totalLength | 0) - 1) | 0;
    }
    else if ((this.totalLength | 0) == 1) {
        this.totalLength = 0;
        this.enableCheck();
        this.sound.unsetNR52(0xFE);
    }
}
GameBoyAdvanceChannel1Synth.prototype.enableCheck = function () {
    this.Enabled = ((this.consecutive || (this.totalLength | 0) > 0) && !this.SweepFault && this.canPlay);
}
GameBoyAdvanceChannel1Synth.prototype.volumeEnableCheck = function () {
    this.canPlay = ((this.nr12 | 0) > 7);
    this.enableCheck();
}
GameBoyAdvanceChannel1Synth.prototype.outputLevelCache = function () {
    this.currentSampleLeft = (this.sound.leftChannel1) ? (this.envelopeVolume | 0) : 0;
    this.currentSampleRight = (this.sound.rightChannel1) ? (this.envelopeVolume | 0) : 0;
    this.outputLevelSecondaryCache();
}
GameBoyAdvanceChannel1Synth.prototype.outputLevelSecondaryCache = function () {
    if (this.Enabled) {
        this.currentSampleLeftSecondary = this.currentSampleLeft | 0;
        this.currentSampleRightSecondary = this.currentSampleRight | 0;
    }
    else {
        this.currentSampleLeftSecondary = 0;
        this.currentSampleRightSecondary = 0;
    }
    this.outputLevelTrimaryCache();
}
GameBoyAdvanceChannel1Synth.prototype.outputLevelTrimaryCache = function () {
    if (this.CachedDuty[this.DutyTracker | 0]) {
        this.currentSampleLeftTrimary = this.currentSampleLeftSecondary | 0;
        this.currentSampleRightTrimary = this.currentSampleRightSecondary | 0;
    }
    else {
        this.currentSampleLeftTrimary = 0;
        this.currentSampleRightTrimary = 0;
    }
}
GameBoyAdvanceChannel1Synth.prototype.clockAudioSweep = function () {
    if (!this.SweepFault && (this.timeSweep | 0) > 0) {
        this.timeSweep = ((this.timeSweep | 0) - 1) | 0
        if ((this.timeSweep | 0) == 0) {
            this.runAudioSweep();
        }
    }
}
GameBoyAdvanceChannel1Synth.prototype.runAudioSweep = function () {
    if ((this.lastTimeSweep | 0) > 0) {
        if ((this.frequencySweepDivider | 0) > 0) {
            this.Swept = true;
            if (this.decreaseSweep) {
                this.ShadowFrequency = ((this.ShadowFrequency | 0) - (this.ShadowFrequency >> (this.frequencySweepDivider | 0))) | 0;
                this.frequency = this.ShadowFrequency & 0x7FF;
                this.FrequencyTracker = (0x800 - (this.frequency | 0)) << 4;
            }
            else {
                this.ShadowFrequency = ((this.ShadowFrequency | 0) + (this.ShadowFrequency >> (this.frequencySweepDivider | 0))) | 0;
                this.frequency = this.ShadowFrequency | 0;
                if ((this.ShadowFrequency | 0) <= 0x7FF) {
                    this.FrequencyTracker = (0x800 - (this.frequency | 0)) << 4;
                    if ((((this.ShadowFrequency | 0) + (this.ShadowFrequency >> (this.frequencySweepDivider | 0))) | 0) > 0x7FF) {
                        this.SweepFault = true;
                        this.enableCheck();
                        this.sound.unsetNR52(0xFE);
                    }
                }
                else {
                    this.frequency &= 0x7FF;
                    this.SweepFault = true;
                    this.enableCheck();
                    this.sound.unsetNR52(0xFE);
                }
            }
            this.timeSweep = this.lastTimeSweep | 0;
        }
        else {
            this.SweepFault = true;
            this.enableCheck();
        }
    }
}
GameBoyAdvanceChannel1Synth.prototype.audioSweepPerformDummy = function () {
    if ((this.frequencySweepDivider | 0) > 0) {
        if (!this.decreaseSweep) {
            var channel1ShadowFrequency = ((this.ShadowFrequency | 0) + (this.ShadowFrequency >> (this.frequencySweepDivider | 0))) | 0;
            if ((channel1ShadowFrequency | 0) <= 0x7FF) {
                if ((((channel1ShadowFrequency | 0) + (channel1ShadowFrequency >> (this.frequencySweepDivider | 0))) | 0) > 0x7FF) {
                    this.SweepFault = true;
                    this.enableCheck();
                    this.sound.unsetNR52(0xFE);
                }
            }
            else {
                this.SweepFault = true;
                this.enableCheck();
                this.sound.unsetNR52(0xFE);
            }
        }
    }
}
GameBoyAdvanceChannel1Synth.prototype.clockAudioEnvelope = function () {
    if ((this.envelopeSweepsLast | 0) > -1) {
        if ((this.envelopeSweeps | 0) > 0) {
            this.envelopeSweeps = ((this.envelopeSweeps | 0) - 1) | 0;
        }
        else {
            if (!this.envelopeType) {
                if ((this.envelopeVolume | 0) > 0) {
                    this.envelopeVolume = ((this.envelopeVolume | 0) - 1) | 0;
                    this.envelopeSweeps = this.envelopeSweepsLast | 0;
                }
                else {
                    this.envelopeSweepsLast = -1;
                }
            }
            else if ((this.envelopeVolume | 0) < 0xF) {
                this.envelopeVolume = ((this.envelopeVolume | 0) + 1) | 0;
                this.envelopeSweeps = this.envelopeSweepsLast | 0;
            }
            else {
                this.envelopeSweepsLast = -1;
            }
        }
    }
}
GameBoyAdvanceChannel1Synth.prototype.computeAudioChannel = function () {
    if ((this.FrequencyCounter | 0) == 0) {
        this.FrequencyCounter = this.FrequencyTracker | 0;
        this.DutyTracker = ((this.DutyTracker | 0) + 1) & 0x7;
    }
}
GameBoyAdvanceChannel1Synth.prototype.readSOUND1CNT8_0 = function () {
    return this.nr10 | 0;
}
GameBoyAdvanceChannel1Synth.prototype.writeSOUND1CNT8_0 = function (data) {
    data = data | 0;
    if (this.decreaseSweep && (data & 0x08) == 0) {
        if (this.Swept) {
            this.SweepFault = true;
        }
    }
    this.lastTimeSweep = (data & 0x70) >> 4;
    this.frequencySweepDivider = data & 0x07;
    this.decreaseSweep = ((data & 0x08) != 0);
    this.nr10 = data & 0xFF;
    this.enableCheck();
}
GameBoyAdvanceChannel1Synth.prototype.readSOUND1CNT8_2 = function () {
    return this.nr11 | 0;
}
GameBoyAdvanceChannel1Synth.prototype.writeSOUND1CNT8_2 = function (data) {
    data = data | 0;
    this.CachedDuty = this.dutyLookup[(data >> 6) & 0x2];
    this.totalLength = (0x40 - (data & 0x3F)) | 0;
    this.nr11 = data & 0xFF;
    this.enableCheck();
}
GameBoyAdvanceChannel1Synth.prototype.readSOUND1CNT8_3 = function () {
    return this.nr12 | 0;
}
GameBoyAdvanceChannel1Synth.prototype.writeSOUND1CNT8_3 = function (data) {
    data = data | 0;
    this.envelopeType = ((data & 0x08) != 0);
    this.nr12 = data & 0xFF;
    this.volumeEnableCheck();
}
GameBoyAdvanceChannel1Synth.prototype.writeSOUND1CNT_X0 = function (data) {
    data = data | 0;
    this.frequency = (this.frequency & 0x700) | data;
    this.FrequencyTracker = (0x800 - (this.frequency | 0)) << 4;
}
GameBoyAdvanceChannel1Synth.prototype.readSOUND1CNT_X = function () {
    return this.nr14 | 0;
}
GameBoyAdvanceChannel1Synth.prototype.writeSOUND1CNT_X1 = function (data) {
    data = data | 0;
    this.consecutive = ((data & 0x40) == 0);
    this.frequency = ((data & 0x7) << 8) | (this.frequency & 0xFF);
    this.FrequencyTracker = (0x800 - (this.frequency | 0)) << 4;
    if (data > 0x7F) {
        this.timeSweep = this.lastTimeSweep | 0;
        this.Swept = false;
        this.envelopeVolume = this.nr12 >> 4;
        this.envelopeSweepsLast = ((this.nr12 & 0x7) - 1) | 0;
        if ((this.totalLength | 0) == 0) {
            this.totalLength = 0x40;
        }
        if ((this.lastTimeSweep | 0) > 0 || (this.frequencySweepDivider | 0) > 0) {
            this.sound.setNR52(0x1);
        }
        else {
            this.sound.unsetNR52(0xFE);
        }
        if ((data & 0x40) != 0) {
            this.sound.setNR52(0x1);
        }
        this.ShadowFrequency = this.frequency | 0;
        this.SweepFault = false;
        this.audioSweepPerformDummy();
    }
    this.enableCheck();
    this.nr14 = data | 0;
}