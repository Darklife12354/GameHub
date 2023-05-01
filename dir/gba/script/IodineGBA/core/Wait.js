"use strict";
function GameBoyAdvanceWait(IOCore) {
    this.IOCore = IOCore;
}
GameBoyAdvanceWait.prototype.initialize = function () {
    this.memory = this.IOCore.memory;
    this.cpu = this.IOCore.cpu;
    this.WRAMConfiguration = 0xD000020;
    this.WRAMWaitState = 3;
    this.SRAMWaitState = 5;
    this.WAITCNT0 = 0;
    this.WAITCNT1 = 0;
    this.POSTBOOT = 0;
    this.isRendering = 1;
    this.isOAMRendering = 1;
    this.nonSequential = 0x10;
    this.buffer = 0;
    this.clocks = 0;
    this.waitStateClocks16 = getUint8Array(0x20);
    this.waitStateClocks32 = getUint8Array(0x20);
    this.setWaitState(0, 0);
    this.setWaitState(1, 0);
    this.setWaitState(2, 0);
    this.getROMRead16 = this.getROMRead16NoPrefetch;
    this.getROMRead32 = this.getROMRead32NoPrefetch;
    this.CPUInternalCyclePrefetch = this.CPUInternalCycleNoPrefetch;
    this.CPUInternalSingleCyclePrefetch = this.CPUInternalSingleCycleNoPrefetch;
}
GameBoyAdvanceWait.prototype.getWaitStateFirstAccess = function (data) {
    data = data | 0;
    data = data & 0x3;
    if ((data | 0) < 0x3) {
        data = (5 - (data | 0)) | 0;
    }
    else {
        data = 9;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.getWaitStateSecondAccess = function (region, data) {
    region = region | 0;
    data = data | 0;
    if ((data & 0x4) == 0) {
        data = 0x2 << (region | 0);
        data = ((data | 0) + 1) | 0;
    }
    else {
        data = 0x2;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.setWaitState = function (region, data) {
    region = region | 0;
    data = data | 0;
    var firstAccess = this.getWaitStateFirstAccess(data & 0x3) | 0;
    var secondAccess = this.getWaitStateSecondAccess(region | 0, data | 0) | 0;
    region = region << 1;
    this.waitStateClocks16[0x18 | region] = firstAccess | 0;
    this.waitStateClocks16[0x19 | region] = firstAccess | 0;
    var accessTime = ((firstAccess | 0) + (secondAccess | 0)) | 0;
    this.waitStateClocks32[0x18 | region] = accessTime | 0;
    this.waitStateClocks32[0x19 | region] = accessTime | 0;
    this.waitStateClocks16[0x8 | region] = secondAccess | 0;
    this.waitStateClocks16[0x9 | region] = secondAccess | 0;
    this.waitStateClocks32[0x8 | region] = secondAccess << 1;
    this.waitStateClocks32[0x9 | region] = secondAccess << 1;
}
GameBoyAdvanceWait.prototype.writeWAITCNT0 = function (data) {
    data = data | 0;
    if ((data & 0x3) < 0x3) {
        this.SRAMWaitState = (5 - (data & 0x3)) | 0;
    }
    else {
        this.SRAMWaitState = 9;
    }
    this.setWaitState(0, data >> 2);
    this.setWaitState(1, data >> 5);
    this.WAITCNT0 = data | 0;
}
GameBoyAdvanceWait.prototype.readWAITCNT0 = function () {
    return this.WAITCNT0 | 0;
}
GameBoyAdvanceWait.prototype.writeWAITCNT1 = function (data) {
    data = data | 0;
    this.setWaitState(2, data | 0);
    if ((data & 0x40) == 0) {
        this.resetPrebuffer();
        this.getROMRead16 = this.getROMRead16NoPrefetch;
        this.getROMRead32 = this.getROMRead32NoPrefetch;
        this.CPUInternalCyclePrefetch = this.CPUInternalCycleNoPrefetch;
        this.CPUInternalSingleCyclePrefetch = this.CPUInternalSingleCycleNoPrefetch;
    }
    else {
        this.getROMRead16 = this.getROMRead16Prefetch;
        this.getROMRead32 = this.getROMRead32Prefetch;
        this.CPUInternalCyclePrefetch = this.multiClock;
        this.CPUInternalSingleCyclePrefetch = this.singleClock;
    }
    this.WAITCNT1 = data & 0x5F;
}
GameBoyAdvanceWait.prototype.readWAITCNT1 = function () {
    return this.WAITCNT1 | 0;
}
GameBoyAdvanceWait.prototype.writePOSTBOOT = function (data) {
    this.POSTBOOT = data | 0;
}
GameBoyAdvanceWait.prototype.readPOSTBOOT = function () {
    return this.POSTBOOT | 0;
}
GameBoyAdvanceWait.prototype.writeHALTCNT = function (data) {
    data = data | 0;
    this.IOCore.updateCoreSpillRetain();
    if ((data & 0x80) == 0) {
        this.IOCore.flagHalt();
    }
    else {
        this.IOCore.flagStop();
    }
}
GameBoyAdvanceWait.prototype.writeConfigureWRAM8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (address & 0x3) {
        case 0:
            this.memory.remapWRAM(data & 0x21);
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFFFF00) | data;
            break;
        case 1:
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFF00FF) | (data << 8);
            break;
        case 2:
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFF00FFFF) | (data << 16);
            break;
        default:
            this.WRAMWaitState = (0x10 - (data & 0xF)) | 0;
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFFFF) | (data << 24);
    }
}
GameBoyAdvanceWait.prototype.writeConfigureWRAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((address & 0x2) == 0) {
        this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFF0000) | (data & 0xFFFF);
        this.memory.remapWRAM(data & 0x21);
    }
    else {
        this.WRAMConfiguration = (data << 16) | (this.WRAMConfiguration & 0xFFFF);
        this.WRAMWaitState = (0x10 - ((data >> 8) & 0xF)) | 0;
    }
}
GameBoyAdvanceWait.prototype.writeConfigureWRAM32 = function (data) {
    data = data | 0;
    this.WRAMConfiguration = data | 0;
    this.WRAMWaitState = (0x10 - ((data >> 24) & 0xF)) | 0;
    this.memory.remapWRAM(data & 0x21);
}
GameBoyAdvanceWait.prototype.readConfigureWRAM8 = function (address) {
    address = address | 0;
    var data = 0;
    switch (address & 0x3) {
        case 0:
            data = this.WRAMConfiguration & 0x2F;
            break;
        case 3:
            data = this.WRAMConfiguration >>> 24;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.readConfigureWRAM16 = function (address) {
    address = address | 0;
    var data = 0;
    if ((address & 0x2) == 0) {
        data = this.WRAMConfiguration & 0x2F;
    }
    else {
        data = (this.WRAMConfiguration >> 16) & 0xFF00;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.readConfigureWRAM32 = function () {
    return this.WRAMConfiguration & 0xFF00002F;
}
GameBoyAdvanceWait.prototype.CPUInternalCycleNoPrefetch = function (clocks) {
    clocks = clocks | 0;
    this.IOCore.updateCore(clocks | 0);
    this.checkPrebufferBug();
}
GameBoyAdvanceWait.prototype.CPUInternalSingleCycleNoPrefetch = function () {
    this.IOCore.updateCoreSingle();
    this.checkPrebufferBug();
}
GameBoyAdvanceWait.prototype.checkPrebufferBug = function () {
    var address = this.cpu.registers[15] | 0;
    if ((address | 0) >= 0x8000000 && (address | 0) < 0xE000000) {
        this.NonSequentialBroadcast();
    }
}
GameBoyAdvanceWait.prototype.NonSequentialBroadcast = function () {
    this.nonSequential = 0x10;
}
GameBoyAdvanceWait.prototype.NonSequentialBroadcastClear = function () {
    this.NonSequentialBroadcast();
    this.resetPrebuffer();
}
GameBoyAdvanceWait.prototype.check128kAlignmentBug = function (address) {
    address = address | 0;
    if ((address & 0x1FFFF) == 0) {
        this.NonSequentialBroadcast();
    }
}
GameBoyAdvanceWait.prototype.multiClock = function (clocks) {
    clocks = clocks | 0;
    this.IOCore.updateCore(clocks | 0);
    var address = this.cpu.registers[15] | 0;
    if ((address | 0) >= 0x8000000 && (address | 0) < 0xE000000) {
        if ((this.clocks | 0) < 0xFF) {
            this.clocks = ((this.clocks | 0) + (clocks | 0)) | 0;
        }
    }
    else {
        this.resetPrebuffer();
    }
}
GameBoyAdvanceWait.prototype.singleClock = function () {
    this.IOCore.updateCoreSingle();
    var address = this.cpu.registers[15] | 0;
    if ((address | 0) >= 0x8000000 && (address | 0) < 0xE000000) {
        if ((this.clocks | 0) < 0xFF) {
            this.clocks = ((this.clocks | 0) + 1) | 0;
        }
    }
    else {
        this.resetPrebuffer();
    }
}
GameBoyAdvanceWait.prototype.addPrebufferSingleClock = function () {
    this.clocks = ((this.clocks | 0) + 1) | 0;
}
GameBoyAdvanceWait.prototype.decrementBufferSingle = function () {
    this.buffer = ((this.buffer | 0) - 1) | 0;
}
GameBoyAdvanceWait.prototype.decrementBufferDouble = function () {
    this.buffer = ((this.buffer | 0) - 2) | 0;
}
GameBoyAdvanceWait.prototype.resetPrebuffer = function () {
    this.clocks = 0;
    this.buffer = 0;
}
GameBoyAdvanceWait.prototype.drainOverdueClocks = function () {
    if ((this.clocks | 0) > 0 && (this.buffer | 0) < 8) {
        var address = this.cpu.registers[15] >>> 24;
        do {
            this.clocks = ((this.clocks | 0) - (this.waitStateClocks16[address | 0] | 0)) | 0;
            this.buffer = ((this.buffer | 0) + 1) | 0;
        } while ((this.clocks | 0) > 0 && (this.buffer | 0) < 8);
        if ((this.clocks | 0) < 0) {
            this.IOCore.updateCoreNegative(this.clocks | 0);
            this.clocks = 0;
        }
    }
}
GameBoyAdvanceWait.prototype.computeClocks = function (address) {
    address = address | 0;
    while ((this.buffer | 0) < 8 && (this.clocks | 0) >= (this.waitStateClocks16[address | 0] | 0)) {
        this.clocks = ((this.clocks | 0) - (this.waitStateClocks16[address | 0] | 0)) | 0;
        this.buffer = ((this.buffer | 0) + 1) | 0;
    }
}
GameBoyAdvanceWait.prototype.drainOverdueClocksCPU = function () {
    if ((this.clocks | 0) < 0) {
        this.IOCore.updateCoreNegative(this.clocks | 0);
        this.clocks = 0;
    }
    else {
        this.IOCore.updateCoreSingle();
    }
}
GameBoyAdvanceWait.prototype.doGamePakFetch16 = function (address) {
    address = address | 0;
    this.clocks = ((this.clocks | 0) - (this.waitStateClocks16[address | this.nonSequential] | 0)) | 0;
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.doGamePakFetch32 = function (address) {
    address = address | 0;
    this.clocks = ((this.clocks | 0) - (this.waitStateClocks32[address | this.nonSequential] | 0)) | 0;
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.getROMRead16Prefetch = function (address) {
    address = address | 0;
    this.computeClocks(address | 0);
    switch (this.buffer | 0) {
        case 0:
            this.doGamePakFetch16(address | 0);
            break;
        default:
            this.addPrebufferSingleClock();
            this.decrementBufferSingle();
    }
    this.drainOverdueClocksCPU();
}
GameBoyAdvanceWait.prototype.getROMRead16NoPrefetch = function (address) {
    address = address | 0;
    this.IOCore.updateCore(this.waitStateClocks16[address | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.getROMRead32Prefetch = function (address) {
    address = address | 0;
    this.computeClocks(address | 0);
    switch (this.buffer | 0) {
        case 0:
            this.doGamePakFetch32(address | 0);
            break;
        case 1:
            this.doGamePakFetch16(address | 0);
            this.buffer = 0;
            break;
        default:
            this.addPrebufferSingleClock();
            this.decrementBufferDouble();
    }
    this.drainOverdueClocksCPU();
}
GameBoyAdvanceWait.prototype.getROMRead32NoPrefetch = function (address) {
    address = address | 0;
    this.IOCore.updateCore(this.waitStateClocks32[address | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.WRAMAccess = function () {
    this.multiClock(this.WRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.WRAMAccess16CPU = function () {
    this.IOCore.updateCore(this.WRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.WRAMAccess32 = function () {
    this.multiClock(this.WRAMWaitState << 1);
}
GameBoyAdvanceWait.prototype.WRAMAccess32CPU = function () {
    this.IOCore.updateCore(this.WRAMWaitState << 1);
}
GameBoyAdvanceWait.prototype.ROMAccess = function (address) {
    address = address | 0;
    this.drainOverdueClocks();
    this.check128kAlignmentBug(address | 0);
    this.IOCore.updateCore(this.waitStateClocks16[(address >> 24) | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.ROMAccess16CPU = function (address) {
    address = address | 0;
    this.check128kAlignmentBug(address | 0);
    this.getROMRead16(address >> 24);
}
GameBoyAdvanceWait.prototype.ROMAccess32 = function (address) {
    address = address | 0;
    this.drainOverdueClocks();
    this.check128kAlignmentBug(address | 0);
    this.IOCore.updateCore(this.waitStateClocks32[(address >> 24) | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.ROMAccess32CPU = function (address) {
    address = address | 0;
    this.check128kAlignmentBug(address | 0);
    this.getROMRead32(address >> 24);
}
GameBoyAdvanceWait.prototype.SRAMAccess = function () {
    this.multiClock(this.SRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.SRAMAccessCPU = function () {
    this.resetPrebuffer();
    this.IOCore.updateCore(this.SRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.VRAMAccess = function () {
    this.multiClock(this.isRendering | 0);
}
GameBoyAdvanceWait.prototype.VRAMAccess16CPU = function () {
    this.IOCore.updateCore(this.isRendering | 0);
}
GameBoyAdvanceWait.prototype.VRAMAccess32 = function () {
    this.multiClock(this.isRendering << 1);
}
GameBoyAdvanceWait.prototype.VRAMAccess32CPU = function () {
    this.IOCore.updateCore(this.isRendering << 1);
}
GameBoyAdvanceWait.prototype.OAMAccess = function () {
    this.multiClock(this.isOAMRendering | 0);
}
GameBoyAdvanceWait.prototype.OAMAccessCPU = function () {
    this.IOCore.updateCore(this.isOAMRendering | 0);
}
GameBoyAdvanceWait.prototype.updateRenderStatus = function (isRendering, isOAMRendering) {
    this.isRendering = isRendering | 0;
    this.isOAMRendering = isOAMRendering | 0;
}