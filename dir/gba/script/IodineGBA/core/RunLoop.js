"use strict";
function GameBoyAdvanceIO(settings, coreExposed, BIOS, ROM) {
    this.systemStatus = 0;
    this.cyclesToIterate = 0;
    this.cyclesOveriteratedPreviously = 0;
    this.accumulatedClocks = 0;
    this.graphicsClocks = 0;
    this.timerClocks = 0;
    this.serialClocks = 0;
    this.nextEventClocks = 0;
    this.BIOSFound = false;
    this.settings = settings;
    this.coreExposed = coreExposed;
    this.BIOS = BIOS;
    this.ROM = ROM;
    this.memory = new GameBoyAdvanceMemory(this);
    this.dma = new GameBoyAdvanceDMA(this);
    this.dmaChannel0 = new GameBoyAdvanceDMA0(this);
    this.dmaChannel1 = new GameBoyAdvanceDMA1(this);
    this.dmaChannel2 = new GameBoyAdvanceDMA2(this);
    this.dmaChannel3 = new GameBoyAdvanceDMA3(this);
    this.gfxState = new GameBoyAdvanceGraphics(this);
    this.gfxRenderer = new GameBoyAdvanceRendererProxy(this);
    this.sound = new GameBoyAdvanceSound(this);
    this.timer = new GameBoyAdvanceTimer(this);
    this.irq = new GameBoyAdvanceIRQ(this);
    this.serial = new GameBoyAdvanceSerial(this);
    this.joypad = new GameBoyAdvanceJoyPad(this);
    this.cartridge = new GameBoyAdvanceCartridge(this);
    this.saves = new GameBoyAdvanceSaves(this);
    this.wait = new GameBoyAdvanceWait(this);
    this.cpu = new GameBoyAdvanceCPU(this);
    this.memory.initialize();
    this.dma.initialize();
    this.dmaChannel0.initialize();
    this.dmaChannel1.initialize();
    this.dmaChannel2.initialize();
    this.dmaChannel3.initialize();
    this.gfxState.initialize();
    this.gfxRenderer.initialize();
    this.sound.initialize();
    this.timer.initialize();
    this.irq.initialize();
    this.serial.initialize();
    this.joypad.initialize();
    this.cartridge.initialize();
    this.saves.initialize();
    this.wait.initialize();
    this.cpu.initialize();
}
GameBoyAdvanceIO.prototype.assignInstructionCoreReferences = function (ARM, THUMB) {
    this.ARM = ARM;
    this.THUMB = THUMB;
}
GameBoyAdvanceIO.prototype.enter = function (CPUCyclesTotal) {
    this.cyclesToIterate = ((CPUCyclesTotal | 0) + (this.cyclesOveriteratedPreviously | 0)) | 0;
    if ((this.cyclesToIterate | 0) > 0) {
        this.updateCoreEventTime();
        this.run();
        this.updateCoreClocking();
        this.sound.audioJIT();
    }
    this.cyclesOveriteratedPreviously = this.cyclesToIterate | 0;
}
GameBoyAdvanceIO.prototype.run = function () {
    while (true) {
        switch (this.systemStatus & 0x84) {
            case 0:
                this.runARM();
                break;
            case 0x4:
                this.runTHUMB();
                break;
            default:
                this.deflagIterationEnd();
                return;
        }
    }
}
GameBoyAdvanceIO.prototype.runARM = function () {
    while (true) {
        switch (this.systemStatus | 0) {
            case 0:
                this.ARM.executeIteration();
                break;
            case 1:
            case 2:
                this.ARM.executeBubble();
                this.tickBubble();
                break;
            default:
                switch (this.systemStatus >> 2) {
                    case 0x2:
                        this.handleIRQARM();
                        break;
                    case 0x4:
                    case 0x6:
                    case 0xC:
                    case 0xE:
                        this.handleDMA();
                        break;
                    case 0x8:
                    case 0xA:
                        this.handleHalt();
                        break;
                    default:
                        if ((this.systemStatus & 0x84) != 0) {
                            return;
                        }
                        this.handleStop();
                }
        }
    }
}
GameBoyAdvanceIO.prototype.runTHUMB = function () {
    while (true) {
        switch (this.systemStatus | 0) {
            case 4:
                this.THUMB.executeIteration();
                break;
            case 5:
            case 6:
                this.THUMB.executeBubble();
                this.tickBubble();
                break;
            default:
                switch (this.systemStatus >> 2) {
                    case 0x3:
                        this.handleIRQThumb();
                        break;
                    case 0x5:
                    case 0x7:
                    case 0xD:
                    case 0xF:
                        this.handleDMA();
                        break;
                    case 0x9:
                    case 0x11:
                        this.handleHalt();
                        break;
                    default:
                        if ((this.systemStatus & 0x84) != 0x4) {
                            return;
                        }
                        this.handleStop();
                }
        }
    }
}
GameBoyAdvanceIO.prototype.updateCore = function (clocks) {
    clocks = clocks | 0;
    this.accumulatedClocks = ((this.accumulatedClocks | 0) + (clocks | 0)) | 0;
    if ((this.accumulatedClocks | 0) >= (this.nextEventClocks | 0)) {
        this.updateCoreSpill();
    }
}
GameBoyAdvanceIO.prototype.updateCoreForce = function (clocks) {
    clocks = clocks | 0;
    this.accumulatedClocks = ((this.accumulatedClocks | 0) + (clocks | 0)) | 0;
    this.updateCoreSpill();
}
GameBoyAdvanceIO.prototype.updateCoreNegative = function (clocks) {
    clocks = clocks | 0;
    this.accumulatedClocks = ((this.accumulatedClocks | 0) - (clocks | 0)) | 0;
    if ((this.accumulatedClocks | 0) >= (this.nextEventClocks | 0)) {
        this.updateCoreSpill();
    }
}
GameBoyAdvanceIO.prototype.updateCoreSingle = function () {
    this.accumulatedClocks = ((this.accumulatedClocks | 0) + 1) | 0;
    if ((this.accumulatedClocks | 0) >= (this.nextEventClocks | 0)) {
        this.updateCoreSpill();
    }
}
GameBoyAdvanceIO.prototype.updateCoreSpill = function () {
    this.updateCoreClocking();
    this.updateCoreEventTime();
}
GameBoyAdvanceIO.prototype.updateCoreSpillRetain = function () {
    this.nextEventClocks = ((this.nextEventClocks | 0) - (this.accumulatedClocks | 0)) | 0;
    this.updateCoreClocking();
}
GameBoyAdvanceIO.prototype.updateCoreClocking = function () {
    var clocks = this.accumulatedClocks | 0;
    this.cyclesToIterate = ((this.cyclesToIterate | 0) - (clocks | 0)) | 0;
    this.gfxState.addClocks(((clocks | 0) - (this.graphicsClocks | 0)) | 0);
    this.timer.addClocks(((clocks | 0) - (this.timerClocks | 0)) | 0);
    this.serial.addClocks(((clocks | 0) - (this.serialClocks | 0)) | 0);
    this.accumulatedClocks = 0;
    this.graphicsClocks = 0;
    this.timerClocks = 0;
    this.serialClocks = 0;
}
GameBoyAdvanceIO.prototype.updateGraphicsClocking = function () {
    this.gfxState.addClocks(((this.accumulatedClocks | 0) - (this.graphicsClocks | 0)) | 0);
    this.graphicsClocks = this.accumulatedClocks | 0;
}
GameBoyAdvanceIO.prototype.updateTimerClocking = function () {
    this.timer.addClocks(((this.accumulatedClocks | 0) - (this.timerClocks | 0)) | 0);
    this.timerClocks = this.accumulatedClocks | 0;
}
GameBoyAdvanceIO.prototype.updateSerialClocking = function () {
    this.serial.addClocks(((this.accumulatedClocks | 0) - (this.serialClocks | 0)) | 0);
    this.serialClocks = this.accumulatedClocks | 0;
}
GameBoyAdvanceIO.prototype.updateCoreEventTime = function () {
    this.nextEventClocks = this.cyclesUntilNextEvent() | 0;
}
GameBoyAdvanceIO.prototype.getRemainingCycles = function () {
    if ((this.cyclesToIterate | 0) < 1) {
        this.flagIterationEnd();
        return 0;
    }
    return this.cyclesToIterate | 0;
}
GameBoyAdvanceIO.prototype.handleIRQARM = function () {
    if ((this.systemStatus | 0) > 0x8) {
        this.ARM.executeBubble();
        this.tickBubble();
    }
    else {
        this.cpu.IRQinARM();
    }
}
GameBoyAdvanceIO.prototype.handleIRQThumb = function () {
    if ((this.systemStatus | 0) > 0xC) {
        this.THUMB.executeBubble();
        this.tickBubble();
    }
    else {
        this.cpu.IRQinTHUMB();
    }
}
GameBoyAdvanceIO.prototype.handleDMA = function () {
    do {
        this.dma.perform();
    } while ((this.systemStatus & 0x90) == 0x10);
}
GameBoyAdvanceIO.prototype.handleHalt = function () {
    if ((this.irq.IRQMatch() | 0) == 0) {
        this.updateCoreForce(this.cyclesUntilNextHALTEvent() | 0);
    }
    else {
        this.deflagHalt();
    }
}
GameBoyAdvanceIO.prototype.handleStop = function () {
    this.sound.addClocks(this.getRemainingCycles() | 0);
    this.cyclesToIterate = 0;
}
GameBoyAdvanceIO.prototype.cyclesUntilNextHALTEvent = function () {
    var haltClocks = this.irq.nextEventTime() | 0;
    var dmaClocks = this.dma.nextEventTime() | 0;
    return this.solveClosestTime(haltClocks | 0, dmaClocks | 0) | 0;
}
GameBoyAdvanceIO.prototype.cyclesUntilNextEvent = function () {
    var irqClocks = this.irq.nextIRQEventTime() | 0;
    var dmaClocks = this.dma.nextEventTime() | 0;
    return this.solveClosestTime(irqClocks | 0, dmaClocks | 0) | 0;
}
GameBoyAdvanceIO.prototype.solveClosestTime = function (clocks1, clocks2) {
    clocks1 = clocks1 | 0;
    clocks2 = clocks2 | 0;
    var clocks = this.getRemainingCycles() | 0;
    clocks = Math.min(clocks | 0, clocks1 | 0, clocks2 | 0);
    return clocks | 0;
}
GameBoyAdvanceIO.prototype.flagBubble = function () {
    this.systemStatus = this.systemStatus | 0x2;
}
GameBoyAdvanceIO.prototype.tickBubble = function () {
    this.systemStatus = ((this.systemStatus | 0) - 1) | 0;
}
GameBoyAdvanceIO.prototype.flagTHUMB = function () {
    this.systemStatus = this.systemStatus | 0x4;
}
GameBoyAdvanceIO.prototype.deflagTHUMB = function () {
    this.systemStatus = this.systemStatus & 0xFB;
}
GameBoyAdvanceIO.prototype.flagIRQ = function () {
    this.systemStatus = this.systemStatus | 0x8;
}
GameBoyAdvanceIO.prototype.deflagIRQ = function () {
    this.systemStatus = this.systemStatus & 0xF7;
}
GameBoyAdvanceIO.prototype.flagDMA = function () {
    this.systemStatus = this.systemStatus | 0x10;
}
GameBoyAdvanceIO.prototype.deflagDMA = function () {
    this.systemStatus = this.systemStatus & 0xEF;
}
GameBoyAdvanceIO.prototype.flagHalt = function () {
    this.systemStatus = this.systemStatus | 0x20;
}
GameBoyAdvanceIO.prototype.deflagHalt = function () {
    this.systemStatus = this.systemStatus & 0xDF;
}
GameBoyAdvanceIO.prototype.flagStop = function () {
    this.systemStatus = this.systemStatus | 0x40;
}
GameBoyAdvanceIO.prototype.deflagStop = function () {
    this.systemStatus = this.systemStatus & 0xBF;
}
GameBoyAdvanceIO.prototype.flagIterationEnd = function () {
    this.systemStatus = this.systemStatus | 0x80;
}
GameBoyAdvanceIO.prototype.deflagIterationEnd = function () {
    this.systemStatus = this.systemStatus & 0x7F;
}
GameBoyAdvanceIO.prototype.isStopped = function () {
    return ((this.systemStatus & 0x40) != 0);
}
GameBoyAdvanceIO.prototype.inDMA = function () {
    return ((this.systemStatus & 0x10) != 0);
}
GameBoyAdvanceIO.prototype.getCurrentFetchValue = function () {
    var fetch = 0;
    if ((this.systemStatus & 0x10) == 0) {
        fetch = this.cpu.getCurrentFetchValue() | 0;
    }
    else {
        fetch = this.dma.getCurrentFetchValue() | 0;
    }
    return fetch | 0;
}