"use strict";
function GameBoyAdvanceGraphics(IOCore) {
    this.IOCore = IOCore;
}
GameBoyAdvanceGraphics.prototype.initialize = function () {
    this.gfxRenderer = this.IOCore.gfxRenderer;
    this.dma = this.IOCore.dma;
    this.dmaChannel3 = this.IOCore.dmaChannel3;
    this.irq = this.IOCore.irq;
    this.wait = this.IOCore.wait;
    this.initializeState();
}
GameBoyAdvanceGraphics.prototype.initializeState = function () {
    this.renderedScanLine = false;
    this.statusFlags = 0;
    this.IRQFlags = 0;
    this.VCounter = 0;
    this.currentScanLine = 0;
    this.LCDTicks = 0;
    if (!this.IOCore.BIOSFound || this.IOCore.settings.SKIPBoot) {
        this.currentScanLine = 0x7C;
    }
}
GameBoyAdvanceGraphics.prototype.addClocks = function (clocks) {
    clocks = clocks | 0;
    this.LCDTicks = ((this.LCDTicks | 0) + (clocks | 0)) | 0;
    this.clockLCDState();
}
GameBoyAdvanceGraphics.prototype.clockLCDState = function () {
    if ((this.LCDTicks | 0) >= 960) {
        this.clockScanLine();
        this.clockLCDStatePostRender();
    }
}
GameBoyAdvanceGraphics.prototype.clockScanLine = function () {
    if (!this.renderedScanLine) {
        this.renderedScanLine = true;
        if ((this.currentScanLine | 0) < 160) {
            this.gfxRenderer.incrementScanLineQueue();
        }
    }
}
GameBoyAdvanceGraphics.prototype.clockLCDStatePostRender = function () {
    if ((this.LCDTicks | 0) >= 1006) {
        this.updateHBlank();
        if ((this.LCDTicks | 0) >= 1232) {
            this.clockLCDNextLine();
        }
    }
}
GameBoyAdvanceGraphics.prototype.clockLCDNextLine = function () {
    this.renderedScanLine = false;
    this.statusFlags = this.statusFlags & 0x5;
    this.LCDTicks = ((this.LCDTicks | 0) - 1232) | 0;
    this.currentScanLine = ((this.currentScanLine | 0) + 1) | 0;
    if ((this.currentScanLine | 0) >= 160) {
        switch (this.currentScanLine | 0) {
            case 160:
                this.updateVBlankStart();
            case 161:
                this.dmaChannel3.gfxDisplaySyncRequest();
                break;
            case 162:
                this.dmaChannel3.gfxDisplaySyncEnableCheck();
                break;
            case 227:
                this.statusFlags = this.statusFlags & 0x6;
                break;
            case 228:
                this.currentScanLine = 0;
        }
    }
    else if ((this.currentScanLine | 0) > 1) {
        this.dmaChannel3.gfxDisplaySyncRequest();
    }
    this.checkVCounter();
    this.isRenderingCheckPreprocess();
    this.clockLCDState();
}
GameBoyAdvanceGraphics.prototype.updateHBlank = function () {
    if ((this.statusFlags & 0x2) == 0) {
        this.statusFlags = this.statusFlags | 0x2;
        if ((this.IRQFlags & 0x10) != 0) {
            this.irq.requestIRQ(0x2);
        }
        if ((this.currentScanLine | 0) < 160) {
            this.dma.gfxHBlankRequest();
        }
        this.isRenderingCheckPreprocess();
    }
}
GameBoyAdvanceGraphics.prototype.checkVCounter = function () {
    if ((this.currentScanLine | 0) == (this.VCounter | 0)) {
        this.statusFlags = this.statusFlags | 0x4;
        if ((this.IRQFlags & 0x20) != 0) {
            this.irq.requestIRQ(0x4);
        }
    }
    else {
        this.statusFlags = this.statusFlags & 0x3;
    }
}
GameBoyAdvanceGraphics.prototype.nextVBlankIRQEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.IRQFlags & 0x8) != 0) {
        nextEventTime = this.nextVBlankEventTime() | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextHBlankEventTime = function () {
    var time = this.LCDTicks | 0;
    if ((time | 0) < 1006) {
        time = (1006 - (time | 0)) | 0;
    }
    else {
        time = (2238 - (time | 0)) | 0;
    }
    return time | 0;
}
GameBoyAdvanceGraphics.prototype.nextHBlankIRQEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.IRQFlags & 0x10) != 0) {
        nextEventTime = this.nextHBlankEventTime() | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextVCounterIRQEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.IRQFlags & 0x20) != 0) {
        nextEventTime = this.nextVCounterEventTime() | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextVBlankEventTime = function () {
    var nextEventTime = this.currentScanLine | 0;
    if ((nextEventTime | 0) < 160) {
        nextEventTime = (160 - (nextEventTime | 0)) | 0;
    }
    else {
        nextEventTime = (388 - (nextEventTime | 0)) | 0;
    }
    nextEventTime = this.convertScanlineToClocks(nextEventTime | 0) | 0;
    nextEventTime = ((nextEventTime | 0) - (this.LCDTicks | 0)) | 0;
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextHBlankDMAEventTime = function () {
    var nextEventTime = this.nextHBlankEventTime() | 0;
    if ((this.currentScanLine | 0) > 159 || ((this.currentScanLine | 0) == 159 && (this.LCDTicks | 0) >= 1006)) {
        var linesToSkip = (227 - (this.currentScanLine | 0)) | 0;
        linesToSkip = this.convertScanlineToClocks(linesToSkip | 0) | 0;
        nextEventTime = ((nextEventTime | 0) + (linesToSkip | 0)) | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextVCounterEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.VCounter | 0) <= 227) {
        nextEventTime = ((this.VCounter | 0) - (this.currentScanLine | 0)) | 0;
        if ((nextEventTime | 0) <= 0) {
            nextEventTime = ((nextEventTime | 0) + 228) | 0;
        }
        nextEventTime = this.convertScanlineToClocks(nextEventTime | 0) | 0;
        nextEventTime = ((nextEventTime | 0) - (this.LCDTicks | 0)) | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextDisplaySyncEventTime = function (delay) {
    delay = delay | 0;
    var nextEventTime = 0x7FFFFFFF;
    if ((this.currentScanLine | 0) >= 161 || (delay | 0) != 0) {
        nextEventTime = (230 - (this.currentScanLine | 0)) | 0;
        nextEventTime = this.convertScanlineToClocks(nextEventTime | 0) | 0;
        nextEventTime = ((nextEventTime | 0) - (this.LCDTicks | 0)) | 0;
    }
    else if ((this.currentScanLine | 0) == 0) {
        nextEventTime = (2464 - (this.LCDTicks | 0)) | 0;
    }
    else {
        nextEventTime = (1232 - (this.LCDTicks | 0)) | 0;
    }
    return nextEventTime | 0;
}
if (typeof Math.imul == "function") {
    GameBoyAdvanceGraphics.prototype.convertScanlineToClocks = function (lines) {
        lines = lines | 0;
        lines = Math.imul(lines | 0, 1232) | 0;
        return lines | 0;
    }
}
else {
    GameBoyAdvanceGraphics.prototype.convertScanlineToClocks = function (lines) {
        lines = lines | 0;
        lines = ((lines | 0) * 1232) | 0;
        return lines | 0;
    }
}
GameBoyAdvanceGraphics.prototype.updateVBlankStart = function () {
    this.statusFlags = this.statusFlags | 0x1;
    if ((this.IRQFlags & 0x8) != 0) {
        this.irq.requestIRQ(0x1);
    }
    this.gfxRenderer.ensureFraming();
    this.dma.gfxVBlankRequest();
}
GameBoyAdvanceGraphics.prototype.isRenderingCheckPreprocess = function () {
    var isInVisibleLines = ((this.gfxRenderer.IOData8[0] & 0x80) == 0 && (this.statusFlags & 0x1) == 0);
    var isRendering = (isInVisibleLines && (this.statusFlags & 0x2) == 0) ? 2 : 1;
    var isOAMRendering = (isInVisibleLines && ((this.statusFlags & 0x2) == 0 || (this.gfxRenderer.IOData8[0] & 0x20) == 0)) ? 2 : 1;
    this.wait.updateRenderStatus(isRendering | 0, isOAMRendering | 0);
}
GameBoyAdvanceGraphics.prototype.writeDISPSTAT8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    this.IRQFlags = data & 0x38;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceGraphics.prototype.writeDISPSTAT8_1 = function (data) {
    data = data | 0;
    data = data & 0xFF;
    if ((data | 0) != (this.VCounter | 0)) {
        this.IOCore.updateCoreClocking();
        this.VCounter = data | 0;
        this.checkVCounter();
        this.IOCore.updateCoreEventTime();
    }
}
GameBoyAdvanceGraphics.prototype.writeDISPSTAT16 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    this.IRQFlags = data & 0x38;
    data = (data >> 8) & 0xFF;
    if ((data | 0) != (this.VCounter | 0)) {
        this.VCounter = data | 0;
        this.checkVCounter();
    }
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT8_0 = function () {
    this.IOCore.updateGraphicsClocking();
    return (this.statusFlags | this.IRQFlags);
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT8_1 = function () {
    return this.VCounter | 0;
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT8_2 = function () {
    this.IOCore.updateGraphicsClocking();
    return this.currentScanLine | 0;
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT16_0 = function () {
    this.IOCore.updateGraphicsClocking();
    return ((this.VCounter << 8) | this.statusFlags | this.IRQFlags);
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT32 = function () {
    this.IOCore.updateGraphicsClocking();
    return ((this.currentScanLine << 16) | (this.VCounter << 8) | this.statusFlags | this.IRQFlags);
}