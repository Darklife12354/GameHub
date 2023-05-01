"use strict";
function ARMInstructionSet(CPUCore) {
    this.CPUCore = CPUCore;
    this.initialize();
}
ARMInstructionSet.prototype.initialize = function () {
    this.wait = this.CPUCore.wait;
    this.registers = this.CPUCore.registers;
    this.registersUSR = this.CPUCore.registersUSR;
    this.branchFlags = this.CPUCore.branchFlags;
    this.fetch = 0;
    this.decode = 0;
    this.execute = 0;
    this.memory = this.CPUCore.memory;
}
ARMInstructionSet.prototype.executeIteration = function () {
    this.fetch = this.memory.memoryReadCPU32(this.readPC() | 0) | 0;
    this.executeConditionalCode();
    this.execute = this.decode | 0;
    this.decode = this.fetch | 0;
}
ARMInstructionSet.prototype.executeConditionalCode = function () {
    if (((this.execute << 3) ^ this.branchFlags.checkConditionalCode(this.execute | 0)) >= 0) {
        this.executeDecoded();
    }
    else {
        this.incrementProgramCounter();
    }
}
ARMInstructionSet.prototype.executeBubble = function () {
    this.fetch = this.memory.memoryReadCPU32(this.readPC() | 0) | 0;
    this.incrementProgramCounter();
    this.execute = this.decode | 0;
    this.decode = this.fetch | 0;
}
ARMInstructionSet.prototype.incrementProgramCounter = function () {
    this.registers[15] = ((this.registers[15] | 0) + 4) | 0;
}
ARMInstructionSet.prototype.getLR = function () {
    return ((this.readPC() | 0) - 4) | 0;
}
ARMInstructionSet.prototype.getIRQLR = function () {
    return this.getLR() | 0;
}
ARMInstructionSet.prototype.getCurrentFetchValue = function () {
    return this.fetch | 0;
}
ARMInstructionSet.prototype.getSWICode = function () {
    return (this.execute >> 16) & 0xFF;
}
if (typeof Math.imul == "function") {
    ARMInstructionSet.prototype.getPopCount = function () {
        var temp = this.execute & 0xFFFF;
        temp = ((temp | 0) - ((temp >> 1) & 0x55555555)) | 0;
        temp = ((temp & 0x33333333) + ((temp >> 2) & 0x33333333)) | 0;
        temp = (((temp | 0) + (temp >> 4)) & 0xF0F0F0F) | 0;
        temp = Math.imul(temp | 0, 0x1010101) >> 24;
        return temp | 0;
    }
}
else {
    ARMInstructionSet.prototype.getPopCount = function () {
        var temp = this.execute & 0xFFFF;
        temp = ((temp | 0) - ((temp >> 1) & 0x55555555)) | 0;
        temp = ((temp & 0x33333333) + ((temp >> 2) & 0x33333333)) | 0;
        temp = (((temp | 0) + (temp >> 4)) & 0xF0F0F0F) | 0;
        temp = (temp * 0x1010101) >> 24;
        return temp | 0;
    }
}
ARMInstructionSet.prototype.getNegativeOffsetStartAddress = function (currentAddress) {
    currentAddress = currentAddress | 0;
    var offset = this.getPopCount() << 2;
    currentAddress = ((currentAddress | 0) - (offset | 0)) | 0;
    return currentAddress | 0;
}
ARMInstructionSet.prototype.getPositiveOffsetStartAddress = function (currentAddress) {
    currentAddress = currentAddress | 0;
    var offset = this.getPopCount() << 2;
    currentAddress = ((currentAddress | 0) + (offset | 0)) | 0;
    return currentAddress | 0;
}
ARMInstructionSet.prototype.writeRegister = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.registers[address & 0xF] = data | 0;
}
ARMInstructionSet.prototype.writeUserRegister = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.registersUSR[address & 0x7] = data | 0;
}
ARMInstructionSet.prototype.guardRegisterWrite = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((address | 0) < 0xF) {
        this.writeRegister(address | 0, data | 0);
    }
    else {
        this.CPUCore.branch(data & -4);
    }
}
ARMInstructionSet.prototype.multiplyGuard12OffsetRegisterWrite = function (data) {
    data = data | 0;
    var address = (this.execute >> 0xC) & 0xF;
    if ((address | 0) != 0xF) {
        this.writeRegister(address | 0, data | 0);
    }
}
ARMInstructionSet.prototype.multiplyGuard16OffsetRegisterWrite = function (data) {
    data = data | 0;
    var address = (this.execute >> 0x10) & 0xF;
    this.incrementProgramCounter();
    if ((address | 0) != 0xF) {
        this.writeRegister(address | 0, data | 0);
    }
}
ARMInstructionSet.prototype.performMUL32 = function () {
    var result = 0;
    if (((this.execute >> 16) & 0xF) != (this.execute & 0xF)) {
        result = this.CPUCore.performMUL32(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0) | 0;
    }
    return result | 0;
}
ARMInstructionSet.prototype.performMUL32MLA = function () {
    var result = 0;
    if (((this.execute >> 16) & 0xF) != (this.execute & 0xF)) {
        result = this.CPUCore.performMUL32MLA(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0) | 0;
    }
    return result | 0;
}
ARMInstructionSet.prototype.guard12OffsetRegisterWrite = function (data) {
    data = data | 0;
    this.incrementProgramCounter();
    this.guard12OffsetRegisterWrite2(data | 0);
}
ARMInstructionSet.prototype.guard12OffsetRegisterWrite2 = function (data) {
    data = data | 0;
    this.guardRegisterWrite((this.execute >> 0xC) & 0xF, data | 0);
}
ARMInstructionSet.prototype.guard16OffsetRegisterWrite = function (data) {
    data = data | 0;
    this.guardRegisterWrite((this.execute >> 0x10) & 0xF, data | 0);
}
ARMInstructionSet.prototype.guardProgramCounterRegisterWriteCPSR = function (data) {
    data = data | 0;
    data = data & (-4 >> (this.CPUCore.SPSRtoCPSR() >> 5));
    this.CPUCore.branch(data | 0);
}
ARMInstructionSet.prototype.guardRegisterWriteCPSR = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((address | 0) < 0xF) {
        this.writeRegister(address | 0, data | 0);
    }
    else {
        this.guardProgramCounterRegisterWriteCPSR(data | 0);
    }
}
ARMInstructionSet.prototype.guard12OffsetRegisterWriteCPSR = function (data) {
    data = data | 0;
    this.incrementProgramCounter();
    this.guard12OffsetRegisterWriteCPSR2(data | 0);
}
ARMInstructionSet.prototype.guard12OffsetRegisterWriteCPSR2 = function (data) {
    data = data | 0;
    this.guardRegisterWriteCPSR((this.execute >> 0xC) & 0xF, data | 0);
}
ARMInstructionSet.prototype.guard16OffsetRegisterWriteCPSR = function (data) {
    data = data | 0;
    this.guardRegisterWriteCPSR((this.execute >> 0x10) & 0xF, data | 0);
}
ARMInstructionSet.prototype.guardUserRegisterWrite = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (this.CPUCore.modeFlags & 0x1f) {
        case 0x10:
        case 0x1F:
            this.writeRegister(address | 0, data | 0);
            break;
        case 0x11:
            if ((address | 0) < 8) {
                this.writeRegister(address | 0, data | 0);
            }
            else {
                this.writeUserRegister(address | 0, data | 0);
            }
            break;
        default:
            if ((address | 0) < 13) {
                this.writeRegister(address | 0, data | 0);
            }
            else {
                this.writeUserRegister(address | 0, data | 0);
            }
    }
}
ARMInstructionSet.prototype.guardRegisterWriteLDM = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.guardRegisterWrite(address | 0, data | 0);
}
ARMInstructionSet.prototype.guardUserRegisterWriteLDM = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((address | 0) < 0xF) {
        if ((this.execute & 0x8000) != 0) {
            this.writeRegister(address | 0, data | 0);
        }
        else {
            this.guardUserRegisterWrite(address | 0, data | 0);
        }
    }
    else {
        this.guardProgramCounterRegisterWriteCPSR(data | 0);
    }
}
ARMInstructionSet.prototype.baseRegisterWrite = function (data, userMode) {
    data = data | 0;
    userMode = userMode | 0;
    var address = (this.execute >> 16) & 0xF;
    if ((address | userMode) == 0xF) {
        this.guardRegisterWrite(address | 0, data | 0);
    }
    else {
        this.guardUserRegisterWrite(address | 0, data | 0);
    }
}
ARMInstructionSet.prototype.readPC = function () {
    return this.registers[0xF] | 0;
}
ARMInstructionSet.prototype.readRegister = function (address) {
    address = address | 0;
    return this.registers[address & 0xF] | 0;
}
ARMInstructionSet.prototype.readUserRegister = function (address) {
    address = address | 0;
    return this.registersUSR[address & 0x7] | 0;
}
ARMInstructionSet.prototype.read0OffsetRegister = function () {
    return this.readRegister(this.execute | 0) | 0;
}
ARMInstructionSet.prototype.read8OffsetRegister = function () {
    return this.readRegister(this.execute >> 0x8) | 0;
}
ARMInstructionSet.prototype.read12OffsetRegister = function () {
    return this.readRegister(this.execute >> 0xC) | 0;
}
ARMInstructionSet.prototype.read16OffsetRegister = function () {
    return this.readRegister(this.execute >> 0x10) | 0;
}
ARMInstructionSet.prototype.guard12OffsetRegisterRead = function () {
    this.incrementProgramCounter();
    return this.readRegister((this.execute >> 12) & 0xF) | 0;
}
ARMInstructionSet.prototype.guardUserRegisterRead = function (address) {
    address = address | 0;
    switch (this.CPUCore.modeFlags & 0x1f) {
        case 0x10:
        case 0x1F:
            return this.readRegister(address | 0) | 0;
        case 0x11:
            if ((address | 0) < 8) {
                return this.readRegister(address | 0) | 0;
            }
            else {
                return this.readUserRegister(address | 0) | 0;
            }
            break;
        default:
            if ((address | 0) < 13) {
                return this.readRegister(address | 0) | 0;
            }
            else {
                return this.readUserRegister(address | 0) | 0;
            }
    }
}
ARMInstructionSet.prototype.guardUserRegisterReadSTM = function (address) {
    address = address | 0;
    if ((address | 0) < 0xF) {
        return this.guardUserRegisterRead(address | 0) | 0;
    }
    else {
        return this.readPC() | 0;
    }
}
ARMInstructionSet.prototype.baseRegisterRead = function (userMode) {
    userMode = userMode | 0;
    var address = (this.execute >> 16) & 0xF;
    if ((address | userMode) == 0xF) {
        return this.readRegister(address | 0) | 0;
    }
    else {
        return this.guardUserRegisterRead(address | 0) | 0;
    }
}
ARMInstructionSet.prototype.BX = function () {
    var address = this.read0OffsetRegister() | 0;
    if ((address & 0x1) == 0) {
        this.CPUCore.branch(address & -4);
    }
    else {
        this.CPUCore.enterTHUMB();
        this.CPUCore.branch(address & -2);
    }
}
ARMInstructionSet.prototype.B = function () {
    this.CPUCore.branch(((this.readPC() | 0) + ((this.execute << 8) >> 6)) | 0);
}
ARMInstructionSet.prototype.BL = function () {
    this.writeRegister(0xE, this.getLR() | 0);
    this.B();
}
ARMInstructionSet.prototype.AND = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWrite(operand1 & operand2);
}
ARMInstructionSet.prototype.AND2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWrite2(operand1 & operand2);
}
ARMInstructionSet.prototype.ANDS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing2() | 0;
    var result = operand1 & operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR(result | 0);
}
ARMInstructionSet.prototype.ANDS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing4() | 0;
    var result = operand1 & operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR2(result | 0);
}
ARMInstructionSet.prototype.EOR = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWrite(operand1 ^ operand2);
}
ARMInstructionSet.prototype.EOR2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWrite2(operand1 ^ operand2);
}
ARMInstructionSet.prototype.EORS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing2() | 0;
    var result = operand1 ^ operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR(result | 0);
}
ARMInstructionSet.prototype.EORS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing4() | 0;
    var result = operand1 ^ operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR2(result | 0);
}
ARMInstructionSet.prototype.SUB = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWrite(((operand1 | 0) - (operand2 | 0)) | 0);
}
ARMInstructionSet.prototype.SUB2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWrite2(((operand1 | 0) - (operand2 | 0)) | 0);
}
ARMInstructionSet.prototype.SUBS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWriteCPSR(this.branchFlags.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.SUBS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWriteCPSR2(this.branchFlags.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.RSB = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWrite(((operand2 | 0) - (operand1 | 0)) | 0);
}
ARMInstructionSet.prototype.RSB2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWrite2(((operand2 | 0) - (operand1 | 0)) | 0);
}
ARMInstructionSet.prototype.RSBS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWriteCPSR(this.branchFlags.setSUBFlags(operand2 | 0, operand1 | 0) | 0);
}
ARMInstructionSet.prototype.RSBS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWriteCPSR2(this.branchFlags.setSUBFlags(operand2 | 0, operand1 | 0) | 0);
}
ARMInstructionSet.prototype.ADD = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWrite(((operand1 | 0) + (operand2 | 0)) | 0);
}
ARMInstructionSet.prototype.ADD2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWrite2(((operand1 | 0) + (operand2 | 0)) | 0);
}
ARMInstructionSet.prototype.ADDS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWriteCPSR(this.branchFlags.setADDFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.ADDS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWriteCPSR2(this.branchFlags.setADDFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.ADC = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    operand1 = ((operand1 | 0) + (operand2 | 0)) | 0;
    operand1 = ((operand1 | 0) + (this.branchFlags.getCarry() >>> 31)) | 0;
    this.guard12OffsetRegisterWrite(operand1 | 0);
}
ARMInstructionSet.prototype.ADC2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    operand1 = ((operand1 | 0) + (operand2 | 0)) | 0;
    operand1 = ((operand1 | 0) + (this.branchFlags.getCarry() >>> 31)) | 0;
    this.guard12OffsetRegisterWrite2(operand1 | 0);
}
ARMInstructionSet.prototype.ADCS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWriteCPSR(this.branchFlags.setADCFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.ADCS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWriteCPSR2(this.branchFlags.setADCFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.SBC = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    operand1 = ((operand1 | 0) - (operand2 | 0)) | 0;
    operand1 = ((operand1 | 0) - (this.branchFlags.getCarryReverse() >>> 31)) | 0;
    this.guard12OffsetRegisterWrite(operand1 | 0);
}
ARMInstructionSet.prototype.SBC2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    operand1 = ((operand1 | 0) - (operand2 | 0)) | 0;
    operand1 = ((operand1 | 0) - (this.branchFlags.getCarryReverse() >>> 31)) | 0;
    this.guard12OffsetRegisterWrite2(operand1 | 0);
}
ARMInstructionSet.prototype.SBCS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWriteCPSR(this.branchFlags.setSBCFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.SBCS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWriteCPSR2(this.branchFlags.setSBCFlags(operand1 | 0, operand2 | 0) | 0);
}
ARMInstructionSet.prototype.RSC = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    operand1 = ((operand2 | 0) - (operand1 | 0)) | 0;
    operand1 = ((operand1 | 0) - (this.branchFlags.getCarryReverse() >>> 31)) | 0;
    this.guard12OffsetRegisterWrite(operand1 | 0);
}
ARMInstructionSet.prototype.RSC2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    operand1 = ((operand2 | 0) - (operand1 | 0)) | 0;
    operand1 = ((operand1 | 0) - (this.branchFlags.getCarryReverse() >>> 31)) | 0;
    this.guard12OffsetRegisterWrite2(operand1 | 0);
}
ARMInstructionSet.prototype.RSCS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWriteCPSR(this.branchFlags.setSBCFlags(operand2 | 0, operand1 | 0) | 0);
}
ARMInstructionSet.prototype.RSCS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWriteCPSR2(this.branchFlags.setSBCFlags(operand2 | 0, operand1 | 0) | 0);
}
ARMInstructionSet.prototype.TSTS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing2() | 0;
    var result = operand1 & operand2;
    this.branchFlags.setNZInt(result | 0);
    this.incrementProgramCounter();
}
ARMInstructionSet.prototype.TSTS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing4() | 0;
    var result = operand1 & operand2;
    this.branchFlags.setNZInt(result | 0);
}
ARMInstructionSet.prototype.TEQS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing2() | 0;
    var result = operand1 ^ operand2;
    this.branchFlags.setNZInt(result | 0);
    this.incrementProgramCounter();
}
ARMInstructionSet.prototype.TEQS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing4() | 0;
    var result = operand1 ^ operand2;
    this.branchFlags.setNZInt(result | 0);
}
ARMInstructionSet.prototype.CMPS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
ARMInstructionSet.prototype.CMPS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
}
ARMInstructionSet.prototype.CMNS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1();
    this.branchFlags.setCMNFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
ARMInstructionSet.prototype.CMNS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3();
    this.branchFlags.setCMNFlags(operand1 | 0, operand2 | 0);
}
ARMInstructionSet.prototype.ORR = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing1() | 0;
    this.guard12OffsetRegisterWrite(operand1 | operand2);
}
ARMInstructionSet.prototype.ORR2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing3() | 0;
    this.guard12OffsetRegisterWrite2(operand1 | operand2);
}
ARMInstructionSet.prototype.ORRS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing2() | 0;
    var result = operand1 | operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR(result | 0);
}
ARMInstructionSet.prototype.ORRS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = this.operand2OP_DataProcessing4() | 0;
    var result = operand1 | operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR2(result | 0);
}
ARMInstructionSet.prototype.MOV = function () {
    this.guard12OffsetRegisterWrite(this.operand2OP_DataProcessing1() | 0);
}
ARMInstructionSet.prototype.MOV2 = function () {
    this.incrementProgramCounter();
    this.guard12OffsetRegisterWrite2(this.operand2OP_DataProcessing3() | 0);
}
ARMInstructionSet.prototype.MOVS = function () {
    var operand2 = this.operand2OP_DataProcessing2() | 0;
    this.branchFlags.setNZInt(operand2 | 0);
    this.guard12OffsetRegisterWriteCPSR(operand2 | 0);
}
ARMInstructionSet.prototype.MOVS2 = function () {
    this.incrementProgramCounter();
    var operand2 = this.operand2OP_DataProcessing4() | 0;
    this.branchFlags.setNZInt(operand2 | 0);
    this.guard12OffsetRegisterWriteCPSR2(operand2 | 0);
}
ARMInstructionSet.prototype.BIC = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = ~this.operand2OP_DataProcessing1();
    this.guard12OffsetRegisterWrite(operand1 & operand2);
}
ARMInstructionSet.prototype.BIC2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = ~this.operand2OP_DataProcessing3();
    this.guard12OffsetRegisterWrite2(operand1 & operand2);
}
ARMInstructionSet.prototype.BICS = function () {
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = ~this.operand2OP_DataProcessing2();
    var result = operand1 & operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR(result | 0);
}
ARMInstructionSet.prototype.BICS2 = function () {
    this.incrementProgramCounter();
    var operand1 = this.read16OffsetRegister() | 0;
    var operand2 = ~this.operand2OP_DataProcessing4();
    var result = operand1 & operand2;
    this.branchFlags.setNZInt(result | 0);
    this.guard12OffsetRegisterWriteCPSR2(result | 0);
}
ARMInstructionSet.prototype.MVN = function () {
    this.guard12OffsetRegisterWrite(~this.operand2OP_DataProcessing1());
}
ARMInstructionSet.prototype.MVN2 = function () {
    this.incrementProgramCounter();
    this.guard12OffsetRegisterWrite2(~this.operand2OP_DataProcessing3());
}
ARMInstructionSet.prototype.MVNS = function () {
    var operand2 = ~this.operand2OP_DataProcessing2();
    this.branchFlags.setNZInt(operand2 | 0);
    this.guard12OffsetRegisterWriteCPSR(operand2 | 0);
}
ARMInstructionSet.prototype.MVNS2 = function () {
    this.incrementProgramCounter();
    var operand2 = ~this.operand2OP_DataProcessing4();
    this.branchFlags.setNZInt(operand2 | 0);
    this.guard12OffsetRegisterWriteCPSR2(operand2 | 0);
}
ARMInstructionSet.prototype.MRS = function () {
    var psr = 0;
    if ((this.execute & 0x400000) == 0) {
        psr = this.rc() | 0;
    }
    else {
        psr = this.rs() | 0;
    }
    this.guard12OffsetRegisterWrite(psr | 0);
}
ARMInstructionSet.prototype.MSR = function () {
    switch (this.execute & 0x2400000) {
        case 0:
            this.MSR1();
            break;
        case 0x400000:
            this.MSR2();
            break;
        case 0x2000000:
            this.MSR3();
            break;
        default:
            this.MSR4();
    }
    this.incrementProgramCounter();
}
ARMInstructionSet.prototype.MSR1 = function () {
    var newcpsr = this.read0OffsetRegister() | 0;
    this.branchFlags.setNZCV(newcpsr | 0);
    if ((this.execute & 0x10000) == 0x10000 && (this.CPUCore.modeFlags & 0x1f) != 0x10) {
        this.CPUCore.switchRegisterBank(newcpsr & 0x1F);
        this.CPUCore.modeFlags = newcpsr & 0xdf;
        this.CPUCore.assertIRQ();
    }
}
ARMInstructionSet.prototype.MSR2 = function () {
    var operand = this.read0OffsetRegister() | 0;
    var bank = 1;
    switch (this.CPUCore.modeFlags & 0x1f) {
        case 0x12:
            break;
        case 0x13:
            bank = 2;
            break;
        case 0x11:
            bank = 0;
            break;
        case 0x17:
            bank = 3;
            break;
        case 0x1B:
            bank = 4;
            break;
        default:
            return;
    }
    var spsr = (operand >> 20) & 0xF00;
    if ((this.execute & 0x10000) == 0x10000) {
        spsr = spsr | (operand & 0xFF);
    }
    else {
        spsr = spsr | (this.CPUCore.SPSR[bank | 0] & 0xFF);
    }
    this.CPUCore.SPSR[bank | 0] = spsr | 0;
}
ARMInstructionSet.prototype.MSR3 = function () {
    var operand = this.imm() | 0;
    this.branchFlags.setNZCV(operand | 0);
}
ARMInstructionSet.prototype.MSR4 = function () {
    var operand = this.imm() >> 20;
    var bank = 1;
    switch (this.CPUCore.modeFlags & 0x1f) {
        case 0x12:
            break;
        case 0x13:
            bank = 2;
            break;
        case 0x11:
            bank = 0;
            break;
        case 0x17:
            bank = 3;
            break;
        case 0x1B:
            bank = 4;
            break;
        default:
            return;
    }
    var spsr = this.CPUCore.SPSR[bank | 0] & 0xFF;
    this.CPUCore.SPSR[bank | 0] = spsr | (operand & 0xF00);
}
ARMInstructionSet.prototype.MUL = function () {
    var result = this.performMUL32() | 0;
    this.multiplyGuard16OffsetRegisterWrite(result | 0);
}
ARMInstructionSet.prototype.MULS = function () {
    var result = this.performMUL32() | 0;
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNZInt(result | 0);
    this.multiplyGuard16OffsetRegisterWrite(result | 0);
}
ARMInstructionSet.prototype.MLA = function () {
    var result = this.performMUL32MLA() | 0;
    result = ((result | 0) + (this.read12OffsetRegister() | 0)) | 0;
    this.multiplyGuard16OffsetRegisterWrite(result | 0);
}
ARMInstructionSet.prototype.MLAS = function () {
    var result = this.performMUL32MLA() | 0;
    result = ((result | 0) + (this.read12OffsetRegister() | 0)) | 0;
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNZInt(result | 0);
    this.multiplyGuard16OffsetRegisterWrite(result | 0);
}
ARMInstructionSet.prototype.UMULL = function () {
    this.CPUCore.performUMUL64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.UMULLS = function () {
    this.CPUCore.performUMUL64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0);
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNegative(this.CPUCore.mul64ResultHigh | 0);
    this.branchFlags.setZero(this.CPUCore.mul64ResultHigh | this.CPUCore.mul64ResultLow);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.UMLAL = function () {
    this.CPUCore.performUMLA64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0, this.read16OffsetRegister() | 0, this.read12OffsetRegister() | 0);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.UMLALS = function () {
    this.CPUCore.performUMLA64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0, this.read16OffsetRegister() | 0, this.read12OffsetRegister() | 0);
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNegative(this.CPUCore.mul64ResultHigh | 0);
    this.branchFlags.setZero(this.CPUCore.mul64ResultHigh | this.CPUCore.mul64ResultLow);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.SMULL = function () {
    this.CPUCore.performMUL64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.SMULLS = function () {
    this.CPUCore.performMUL64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0);
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNegative(this.CPUCore.mul64ResultHigh | 0);
    this.branchFlags.setZero(this.CPUCore.mul64ResultHigh | this.CPUCore.mul64ResultLow);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.SMLAL = function () {
    this.CPUCore.performMLA64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0, this.read16OffsetRegister() | 0, this.read12OffsetRegister() | 0);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.SMLALS = function () {
    this.CPUCore.performMLA64(this.read0OffsetRegister() | 0, this.read8OffsetRegister() | 0, this.read16OffsetRegister() | 0, this.read12OffsetRegister() | 0);
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNegative(this.CPUCore.mul64ResultHigh | 0);
    this.branchFlags.setZero(this.CPUCore.mul64ResultHigh | this.CPUCore.mul64ResultLow);
    this.multiplyGuard16OffsetRegisterWrite(this.CPUCore.mul64ResultHigh | 0);
    this.multiplyGuard12OffsetRegisterWrite(this.CPUCore.mul64ResultLow | 0);
}
ARMInstructionSet.prototype.STRH = function () {
    var address = this.operand2OP_LoadStore1() | 0;
    this.CPUCore.write16(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRH = function () {
    var address = this.operand2OP_LoadStore1() | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read16(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDRSH = function () {
    var address = this.operand2OP_LoadStore1() | 0;
    this.guard12OffsetRegisterWrite((this.CPUCore.read16(address | 0) << 16) >> 16);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDRSB = function () {
    var address = this.operand2OP_LoadStore1() | 0;
    this.guard12OffsetRegisterWrite((this.CPUCore.read8(address | 0) << 24) >> 24);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRH2 = function () {
    var address = this.operand2OP_LoadStore2() | 0;
    this.CPUCore.write16(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRH2 = function () {
    var address = this.operand2OP_LoadStore2() | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read16(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDRSH2 = function () {
    var address = this.operand2OP_LoadStore2() | 0;
    this.guard12OffsetRegisterWrite((this.CPUCore.read16(address | 0) << 16) >> 16);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDRSB2 = function () {
    var address = this.operand2OP_LoadStore2() | 0;
    this.guard12OffsetRegisterWrite((this.CPUCore.read8(address | 0) << 24) >> 24);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STR = function () {
    var address = this.operand2OP_LoadStore3(0) | 0;
    this.CPUCore.write32(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDR = function () {
    var address = this.operand2OP_LoadStore3(0) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read32(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRB = function () {
    var address = this.operand2OP_LoadStore3(0) | 0;
    this.CPUCore.write8(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRB = function () {
    var address = this.operand2OP_LoadStore3(0) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read8(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STR4 = function () {
    var address = this.operand2OP_LoadStore4() | 0;
    this.CPUCore.write32(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDR4 = function () {
    var address = this.operand2OP_LoadStore4() | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read32(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRB4 = function () {
    var address = this.operand2OP_LoadStore4() | 0;
    this.CPUCore.write8(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRB4 = function () {
    var address = this.operand2OP_LoadStore4() | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read8(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRT = function () {
    var address = this.operand2OP_LoadStore3(0xF) | 0;
    this.CPUCore.write32(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRT = function () {
    var address = this.operand2OP_LoadStore3(0xF) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read32(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRBT = function () {
    var address = this.operand2OP_LoadStore3(0xF) | 0;
    this.CPUCore.write8(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRBT = function () {
    var address = this.operand2OP_LoadStore3(0xF) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read8(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STR2 = function () {
    var address = this.operand2OP_LoadStore5(0) | 0;
    this.CPUCore.write32(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDR2 = function () {
    var address = this.operand2OP_LoadStore5(0) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read32(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRB2 = function () {
    var address = this.operand2OP_LoadStore5(0) | 0;
    this.CPUCore.write8(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRB2 = function () {
    var address = this.operand2OP_LoadStore5(0) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read8(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRT2 = function () {
    var address = this.operand2OP_LoadStore5(0xF) | 0;
    this.CPUCore.write32(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRT2 = function () {
    var address = this.operand2OP_LoadStore5(0xF) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read32(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRBT2 = function () {
    var address = this.operand2OP_LoadStore5(0xF) | 0;
    this.CPUCore.write8(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRBT2 = function () {
    var address = this.operand2OP_LoadStore5(0xF) | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read8(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STR3 = function () {
    var address = this.operand2OP_LoadStore6() | 0;
    this.CPUCore.write32(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDR3 = function () {
    var address = this.operand2OP_LoadStore6() | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read32(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STRB3 = function () {
    var address = this.operand2OP_LoadStore6() | 0;
    this.CPUCore.write8(address | 0, this.guard12OffsetRegisterRead() | 0);
}
ARMInstructionSet.prototype.LDRB3 = function () {
    var address = this.operand2OP_LoadStore6() | 0;
    this.guard12OffsetRegisterWrite(this.CPUCore.read8(address | 0) | 0);
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.STMIA = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIAW = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        var finalAddress = this.getPositiveOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDA = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDAW = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var finalAddress = currentAddress | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIB = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIBW = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        var finalAddress = this.getPositiveOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDB = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDBW = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var finalAddress = currentAddress | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.readRegister(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIAG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIAWG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        var finalAddress = this.getPositiveOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDAG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDAWG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var finalAddress = currentAddress | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIBG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMIBWG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        var finalAddress = this.getPositiveOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDBG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.STMDBWG = function () {
    if ((this.execute & 0xFFFF) > 0) {
        var currentAddress = this.read16OffsetRegister() | 0;
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var finalAddress = currentAddress | 0;
        this.wait.NonSequentialBroadcast();
        var count = 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.guardUserRegisterReadSTM(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
                if ((count | 0) == 0) {
                    count = 1;
                    this.guard16OffsetRegisterWrite(finalAddress | 0);
                }
            }
        }
        this.wait.NonSequentialBroadcast();
    }
}
ARMInstructionSet.prototype.LDMIA = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
    }
    else {
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIAW = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
    }
    else {
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
        currentAddress = ((currentAddress | 0) + 0x40) | 0;
    }
    this.guard16OffsetRegisterWrite(currentAddress | 0);
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDA = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
        this.wait.NonSequentialBroadcast();
    }
    else {
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDAW = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var writebackAddress = currentAddress | 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
        this.guard16OffsetRegisterWrite(writebackAddress | 0);
    }
    else {
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
        currentAddress = ((currentAddress | 0) - 0x40) | 0;
        this.guard16OffsetRegisterWrite(currentAddress | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIB = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
    }
    else {
        currentAddress = ((currentAddress | 0) + 4) | 0;
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIBW = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
    }
    else {
        currentAddress = ((currentAddress | 0) + 0x40) | 0;
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.guard16OffsetRegisterWrite(currentAddress | 0);
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDB = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
    }
    else {
        currentAddress = ((currentAddress | 0) - 4) | 0;
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDBW = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var writebackAddress = currentAddress | 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.guard16OffsetRegisterWrite(writebackAddress | 0);
    }
    else {
        currentAddress = ((currentAddress | 0) - 0x40) | 0;
        this.guardRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
        this.guard16OffsetRegisterWrite(currentAddress | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIAG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
    }
    else {
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIAWG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
    }
    else {
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
        currentAddress = ((currentAddress | 0) + 0x40) | 0;
    }
    this.guard16OffsetRegisterWrite(currentAddress | 0);
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDAG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
    }
    else {
        this.guardUserRegisterWriteLDM(0xF, this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDAWG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var writebackAddress = currentAddress | 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
        this.guard16OffsetRegisterWrite(writebackAddress | 0);
    }
    else {
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
        currentAddress = ((currentAddress | 0) - 0x40) | 0;
        this.guard16OffsetRegisterWrite(currentAddress | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIBG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
    }
    else {
        currentAddress = ((currentAddress | 0) + 4) | 0;
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMIBWG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                currentAddress = ((currentAddress | 0) + 4) | 0;
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
            }
        }
    }
    else {
        currentAddress = ((currentAddress | 0) + 0x40) | 0;
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.guard16OffsetRegisterWrite(currentAddress | 0);
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDBG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        for (var rListPosition = 0; (rListPosition | 0) < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
    }
    else {
        currentAddress = ((currentAddress | 0) - 4) | 0;
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LDMDBWG = function () {
    var currentAddress = this.read16OffsetRegister() | 0;
    this.wait.NonSequentialBroadcast();
    if ((this.execute & 0xFFFF) > 0) {
        currentAddress = this.getNegativeOffsetStartAddress(currentAddress | 0) | 0;
        var writebackAddress = currentAddress | 0;
        for (var rListPosition = 0; rListPosition < 0x10; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.guardUserRegisterWriteLDM(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.guard16OffsetRegisterWrite(writebackAddress | 0);
    }
    else {
        currentAddress = ((currentAddress | 0) - 0x40) | 0;
        this.guardProgramCounterRegisterWriteCPSR(this.memory.memoryRead32(currentAddress | 0) | 0);
        this.guard16OffsetRegisterWrite(currentAddress | 0);
    }
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
ARMInstructionSet.prototype.LoadStoreMultiple = function () {
    this.incrementProgramCounter();
    switch ((this.execute >> 20) & 0x1F) {
        case 0:
            this.STMDA();
            break;
        case 0x1:
            this.LDMDA();
            break;
        case 0x2:
            this.STMDAW();
            break;
        case 0x3:
            this.LDMDAW();
            break;
        case 0x4:
            this.STMDAG();
            break;
        case 0x5:
            this.LDMDAG();
            break;
        case 0x6:
            this.STMDAWG();
            break;
        case 0x7:
            this.LDMDAWG();
            break;
        case 0x8:
            this.STMIA();
            break;
        case 0x9:
            this.LDMIA();
            break;
        case 0xA:
            this.STMIAW();
            break;
        case 0xB:
            this.LDMIAW();
            break;
        case 0xC:
            this.STMIAG();
            break;
        case 0xD:
            this.LDMIAG();
            break;
        case 0xE:
            this.STMIAWG();
            break;
        case 0xF:
            this.LDMIAWG();
            break;
        case 0x10:
            this.STMDB();
            break;
        case 0x11:
            this.LDMDB();
            break;
        case 0x12:
            this.STMDBW();
            break;
        case 0x13:
            this.LDMDBW();
            break;
        case 0x14:
            this.STMDBG();
            break;
        case 0x15:
            this.LDMDBG();
            break;
        case 0x16:
            this.STMDBWG();
            break;
        case 0x17:
            this.LDMDBWG();
            break;
        case 0x18:
            this.STMIB();
            break;
        case 0x19:
            this.LDMIB();
            break;
        case 0x1A:
            this.STMIBW();
            break;
        case 0x1B:
            this.LDMIBW();
            break;
        case 0x1C:
            this.STMIBG();
            break;
        case 0x1D:
            this.LDMIBG();
            break;
        case 0x1E:
            this.STMIBWG();
            break;
        default:
            this.LDMIBWG();
    }
}
ARMInstructionSet.prototype.SWP = function () {
    var base = this.read16OffsetRegister() | 0;
    var data = this.CPUCore.read32(base | 0) | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    this.CPUCore.write32(base | 0, this.read0OffsetRegister() | 0);
    this.guard12OffsetRegisterWrite(data | 0);
}
ARMInstructionSet.prototype.SWPB = function () {
    var base = this.read16OffsetRegister() | 0;
    var data = this.CPUCore.read8(base | 0) | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    this.CPUCore.write8(base | 0, this.read0OffsetRegister() | 0);
    this.guard12OffsetRegisterWrite(data | 0);
}
ARMInstructionSet.prototype.SWI = function () {
    this.CPUCore.SWI();
}
ARMInstructionSet.prototype.UNDEFINED = function () {
    this.CPUCore.UNDEFINED();
}
ARMInstructionSet.prototype.operand2OP_DataProcessing1 = function () {
    var data = 0;
    switch ((this.execute & 0x2000060) >> 5) {
        case 0:
            data = this.lli() | 0;
            break;
        case 1:
            data = this.lri() | 0;
            break;
        case 2:
            data = this.ari() | 0;
            break;
        case 3:
            data = this.rri() | 0;
            break;
        default:
            data = this.imm() | 0;
    }
    return data | 0;
}
ARMInstructionSet.prototype.operand2OP_DataProcessing2 = function () {
    var data = 0;
    switch ((this.execute & 0x2000060) >> 5) {
        case 0:
            data = this.llis() | 0;
            break;
        case 1:
            data = this.lris() | 0;
            break;
        case 2:
            data = this.aris() | 0;
            break;
        case 3:
            data = this.rris() | 0;
            break;
        default:
            data = this.imms() | 0;
    }
    return data | 0;
}
ARMInstructionSet.prototype.operand2OP_DataProcessing3 = function () {
    var data = 0;
    switch ((this.execute >> 5) & 0x3) {
        case 0:
            data = this.llr() | 0;
            break;
        case 1:
            data = this.lrr() | 0;
            break;
        case 2:
            data = this.arr() | 0;
            break;
        default:
            data = this.rrr() | 0;
    }
    return data | 0;
}
ARMInstructionSet.prototype.operand2OP_DataProcessing4 = function () {
    var data = 0;
    switch ((this.execute >> 5) & 0x3) {
        case 0:
            data = this.llrs() | 0;
            break;
        case 1:
            data = this.lrrs() | 0;
            break;
        case 2:
            data = this.arrs() | 0;
            break;
        default:
            data = this.rrrs() | 0;
    }
    return data | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStoreOffsetGen = function () {
    var data = 0;
    switch ((this.execute >> 5) & 0x3) {
        case 0:
            data = this.lli() | 0;
            break;
        case 1:
            data = this.lri() | 0;
            break;
        case 2:
            data = this.ari() | 0;
            break;
        default:
            data = this.rri() | 0;
    }
    return data | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStoreOperandDetermine = function () {
    var offset = 0;
    if ((this.execute & 0x400000) == 0) {
        offset = this.read0OffsetRegister() | 0;
    }
    else {
        offset = ((this.execute & 0xF00) >> 4) | (this.execute & 0xF);
    }
    return offset | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStorePostT = function (offset, userMode) {
    offset = offset | 0;
    userMode = userMode | 0;
    var base = this.baseRegisterRead(userMode | 0) | 0;
    if ((this.execute & 0x800000) == 0) {
        offset = ((base | 0) - (offset | 0)) | 0;
    }
    else {
        offset = ((base | 0) + (offset | 0)) | 0;
    }
    this.baseRegisterWrite(offset | 0, userMode | 0);
    return base | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStoreNotT = function (offset) {
    offset = offset | 0;
    var base = this.read16OffsetRegister() | 0;
    if ((this.execute & 0x800000) == 0) {
        offset = ((base | 0) - (offset | 0)) | 0;
    }
    else {
        offset = ((base | 0) + (offset | 0)) | 0;
    }
    if ((this.execute & 0x200000) == 0x200000) {
        this.guard16OffsetRegisterWrite(offset | 0);
    }
    return offset | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStore1 = function () {
    return this.operand2OP_LoadStorePostT(this.operand2OP_LoadStoreOperandDetermine() | 0, 0) | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStore2 = function () {
    return this.operand2OP_LoadStoreNotT(this.operand2OP_LoadStoreOperandDetermine() | 0) | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStore3 = function (userMode) {
    userMode = userMode | 0;
    return this.operand2OP_LoadStorePostT(this.execute & 0xFFF, userMode | 0) | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStore4 = function () {
    return this.operand2OP_LoadStoreNotT(this.execute & 0xFFF) | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStore5 = function (userMode) {
    userMode = userMode | 0;
    return this.operand2OP_LoadStorePostT(this.operand2OP_LoadStoreOffsetGen() | 0, userMode | 0) | 0;
}
ARMInstructionSet.prototype.operand2OP_LoadStore6 = function () {
    return this.operand2OP_LoadStoreNotT(this.operand2OP_LoadStoreOffsetGen() | 0) | 0;
}
ARMInstructionSet.prototype.lli = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    return register << (shifter | 0);
}
ARMInstructionSet.prototype.llis = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) > 0) {
        this.branchFlags.setCarry(register << (((shifter | 0) - 1) | 0));
    }
    return register << (shifter | 0);
}
ARMInstructionSet.prototype.llr = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0xFF;
    if ((shifter | 0) < 0x20) {
        register = register << (shifter | 0);
    }
    else {
        register = 0;
    }
    return register | 0;
}
ARMInstructionSet.prototype.llrs = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0xFF;
    if ((shifter | 0) > 0) {
        if ((shifter | 0) < 0x20) {
            this.branchFlags.setCarry(register << (((shifter | 0) - 1) | 0));
            register = register << (shifter | 0);
        }
        else {
            if ((shifter | 0) == 0x20) {
                this.branchFlags.setCarry(register << 31);
            }
            else {
                this.branchFlags.setCarryFalse();
            }
            register = 0;
        }
    }
    return register | 0;
}
ARMInstructionSet.prototype.lri = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) == 0) {
        register = 0;
    }
    else {
        register = (register >>> (shifter | 0)) | 0;
    }
    return register | 0;
}
ARMInstructionSet.prototype.lris = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) > 0) {
        this.branchFlags.setCarry((register >> (((shifter | 0) - 1) | 0)) << 31);
        register = (register >>> (shifter | 0)) | 0;
    }
    else {
        this.branchFlags.setCarry(register | 0);
        register = 0;
    }
    return register | 0;
}
ARMInstructionSet.prototype.lrr = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0xFF;
    if ((shifter | 0) < 0x20) {
        register = (register >>> (shifter | 0)) | 0;
    }
    else {
        register = 0;
    }
    return register | 0;
}
ARMInstructionSet.prototype.lrrs = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0xFF;
    if ((shifter | 0) > 0) {
        if ((shifter | 0) < 0x20) {
            this.branchFlags.setCarry((register >> (((shifter | 0) - 1) | 0)) << 31);
            register = (register >>> (shifter | 0)) | 0;
        }
        else {
            if ((shifter | 0) == 0x20) {
                this.branchFlags.setCarry(register | 0);
            }
            else {
                this.branchFlags.setCarryFalse();
            }
            register = 0;
        }
    }
    return register | 0;
}
ARMInstructionSet.prototype.ari = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) == 0) {
        shifter = 0x1F;
    }
    return register >> (shifter | 0);
}
ARMInstructionSet.prototype.aris = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) > 0) {
        this.branchFlags.setCarry((register >> (((shifter | 0) - 1) | 0)) << 31);
    }
    else {
        shifter = 0x1F;
        this.branchFlags.setCarry(register | 0);
    }
    return register >> (shifter | 0);
}
ARMInstructionSet.prototype.arr = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    return register >> Math.min(this.read8OffsetRegister() & 0xFF, 0x1F);
}
ARMInstructionSet.prototype.arrs = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0xFF;
    if ((shifter | 0) > 0) {
        if ((shifter | 0) < 0x20) {
            this.branchFlags.setCarry((register >> (((shifter | 0) - 1) | 0)) << 31);
            register = register >> (shifter | 0);
        }
        else {
            this.branchFlags.setCarry(register | 0);
            register = register >> 0x1F;
        }
    }
    return register | 0;
}
ARMInstructionSet.prototype.rri = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) > 0) {
        register = (register << (0x20 - (shifter | 0))) | (register >>> (shifter | 0));
    }
    else {
        register = (this.branchFlags.getCarry() & 0x80000000) | (register >>> 0x1);
    }
    return register | 0;
}
ARMInstructionSet.prototype.rris = function () {
    var register = this.read0OffsetRegister() | 0;
    var shifter = (this.execute >> 7) & 0x1F;
    if ((shifter | 0) > 0) {
        this.branchFlags.setCarry((register >> (((shifter | 0) - 1) | 0)) << 31);
        register = (register << (0x20 - (shifter | 0))) | (register >>> (shifter | 0));
    }
    else {
        var rrxValue = (this.branchFlags.getCarry() & 0x80000000) | (register >>> 0x1);
        this.branchFlags.setCarry(register << 31);
        register = rrxValue | 0;
    }
    return register | 0;
}
ARMInstructionSet.prototype.rrr = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0x1F;
    if ((shifter | 0) > 0) {
        register = (register << (0x20 - (shifter | 0))) | (register >>> (shifter | 0));
    }
    return register | 0;
}
ARMInstructionSet.prototype.rrrs = function () {
    var register = this.read0OffsetRegister() | 0;
    this.wait.CPUInternalSingleCyclePrefetch();
    var shifter = this.read8OffsetRegister() & 0xFF;
    if ((shifter | 0) > 0) {
        shifter = shifter & 0x1F;
        if ((shifter | 0) > 0) {
            this.branchFlags.setCarry((register >> (((shifter | 0) - 1) | 0)) << 31);
            register = (register << (0x20 - (shifter | 0))) | (register >>> (shifter | 0));
        }
        else {
            this.branchFlags.setCarry(register | 0);
        }
    }
    return register | 0;
}
ARMInstructionSet.prototype.imm = function () {
    var immediate = this.execute & 0xFF;
    var shifter = (this.execute >> 7) & 0x1E;
    if ((shifter | 0) > 0) {
        immediate = (immediate << (0x20 - (shifter | 0))) | (immediate >>> (shifter | 0));
    }
    return immediate | 0;
}
ARMInstructionSet.prototype.imms = function () {
    var immediate = this.execute & 0xFF;
    var shifter = (this.execute >> 7) & 0x1E;
    if ((shifter | 0) > 0) {
        immediate = (immediate << (0x20 - (shifter | 0))) | (immediate >>> (shifter | 0));
        this.branchFlags.setCarry(immediate | 0);
    }
    return immediate | 0;
}
ARMInstructionSet.prototype.rc = function () {
    return (this.branchFlags.getNZCV() | this.CPUCore.modeFlags);
}
ARMInstructionSet.prototype.rs = function () {
    var spsr = 0;
    switch (this.CPUCore.modeFlags & 0x1f) {
        case 0x12:
            spsr = this.CPUCore.SPSR[1] | 0;
            break;
        case 0x13:
            spsr = this.CPUCore.SPSR[2] | 0;
            break;
        case 0x11:
            spsr = this.CPUCore.SPSR[0] | 0;
            break;
        case 0x17:
            spsr = this.CPUCore.SPSR[3] | 0;
            break;
        case 0x1B:
            spsr = this.CPUCore.SPSR[4] | 0;
            break;
        default:
            return this.rc() | 0;
    }
    return ((spsr & 0xF00) << 20) | (spsr & 0xFF);
}
function compileARMInstructionDecodeMap() {
    var pseudoCodes = [
        "BX",
        "B",
        "BL",
        "AND",
        "AND2",
        "ANDS",
        "ANDS2",
        "EOR",
        "EOR2",
        "EORS",
        "EORS2",
        "SUB",
        "SUB2",
        "SUBS",
        "SUBS2",
        "RSB",
        "RSB2",
        "RSBS",
        "RSBS2",
        "ADD",
        "ADD2",
        "ADDS",
        "ADDS2",
        "ADC",
        "ADC2",
        "ADCS",
        "ADCS2",
        "SBC",
        "SBC2",
        "SBCS",
        "SBCS2",
        "RSC",
        "RSC2",
        "RSCS",
        "RSCS2",
        "TSTS",
        "TSTS2",
        "TEQS",
        "TEQS2",
        "CMPS",
        "CMPS2",
        "CMNS",
        "CMNS2",
        "ORR",
        "ORR2",
        "ORRS",
        "ORRS2",
        "MOV",
        "MOV2",
        "MOVS",
        "MOVS2",
        "BIC",
        "BIC2",
        "BICS",
        "BICS2",
        "MVN",
        "MVN2",
        "MVNS",
        "MVNS2",
        "MRS",
        "MSR",
        "MUL",
        "MULS",
        "MLA",
        "MLAS",
        "UMULL",
        "UMULLS",
        "UMLAL",
        "UMLALS",
        "SMULL",
        "SMULLS",
        "SMLAL",
        "SMLALS",
        "STRH",
        "LDRH",
        "LDRSH",
        "LDRSB",
        "STRH2",
        "LDRH2",
        "LDRSH2",
        "LDRSB2",
        "STR",
        "LDR",
        "STRB",
        "LDRB",
        "STRT",
        "LDRT",
        "STRBT",
        "LDRBT",
        "STR2",
        "LDR2",
        "STRB2",
        "LDRB2",
        "STRT2",
        "LDRT2",
        "STRBT2",
        "LDRBT2",
        "STR3",
        "LDR3",
        "STRB3",
        "LDRB3",
        "STR4",
        "LDR4",
        "STRB4",
        "LDRB4",
        "LoadStoreMultiple",
        "SWP",
        "SWPB",
        "SWI"
    ];
    function compileARMInstructionDecodeOpcodeMap(codeMap) {
        var opcodeIndice = 0;
        var instructionMap = getUint8Array(4096);
        function generateMap1(instruction) {
            for (var index = 0; index < 0x10; ++index) {
                instructionMap[opcodeIndice++] = codeMap[instruction[index]];
            }
        }
        function generateMap2(instruction) {
            var translatedOpcode = codeMap[instruction];
            for (var index = 0; index < 0x10; ++index) {
                instructionMap[opcodeIndice++] = translatedOpcode;
            }
        }
        function generateMap3(instruction) {
            var translatedOpcode = codeMap[instruction];
            for (var index = 0; index < 0x100; ++index) {
                instructionMap[opcodeIndice++] = translatedOpcode;
            }
        }
        function generateMap4(instruction) {
            var translatedOpcode = codeMap[instruction];
            for (var index = 0; index < 0x200; ++index) {
                instructionMap[opcodeIndice++] = translatedOpcode;
            }
        }
        function generateMap5(instruction) {
            var translatedOpcode = codeMap[instruction];
            for (var index = 0; index < 0x300; ++index) {
                instructionMap[opcodeIndice++] = translatedOpcode;
            }
        }
        function generateStoreLoadInstructionSector1() {
            var instrMap = [
                "STR2",
                "LDR2",
                "STRT2",
                "LDRT2",
                "STRB2",
                "LDRB2",
                "STRBT2",
                "LDRBT2"
            ];
            for (var instrIndex = 0; instrIndex < 0x10; ++instrIndex) {
                for (var dataIndex = 0; dataIndex < 0x10; ++dataIndex) {
                    if ((dataIndex & 0x1) == 0) {
                        instructionMap[opcodeIndice++] = codeMap[instrMap[instrIndex & 0x7]];
                    }
                    else {
                        instructionMap[opcodeIndice++] = codeMap["UNDEFINED"];
                    }
                }
            }
        }
        function generateStoreLoadInstructionSector2() {
            var instrMap = [
                "STR3",
                "LDR3",
                "STRB3",
                "LDRB3"
            ];
            for (var instrIndex = 0; instrIndex < 0x10; ++instrIndex) {
                for (var dataIndex = 0; dataIndex < 0x10; ++dataIndex) {
                    if ((dataIndex & 0x1) == 0) {
                        instructionMap[opcodeIndice++] = codeMap[instrMap[((instrIndex >> 1) & 0x2) | (instrIndex & 0x1)]];
                    }
                    else {
                        instructionMap[opcodeIndice++] = codeMap["UNDEFINED"];
                    }
                }
            }
        }
        generateMap1([
            "AND",
            "AND2",
            "AND",
            "AND2",
            "AND",
            "AND2",
            "AND",
            "AND2",
            "AND",
            "MUL",
            "AND",
            "STRH",
            "AND",
            "UNDEFINED",
            "AND",
            "UNDEFINED"
        ]);
        generateMap1([
            "ANDS",
            "ANDS2",
            "ANDS",
            "ANDS2",
            "ANDS",
            "ANDS2",
            "ANDS",
            "ANDS2",
            "ANDS",
            "MULS",
            "ANDS",
            "LDRH",
            "ANDS",
            "LDRSB",
            "ANDS",
            "LDRSH"
        ]);
        generateMap1([
            "EOR",
            "EOR2",
            "EOR",
            "EOR2",
            "EOR",
            "EOR2",
            "EOR",
            "EOR2",
            "EOR",
            "MLA",
            "EOR",
            "STRH",
            "EOR",
            "UNDEFINED",
            "EOR",
            "UNDEFINED"
        ]);
        generateMap1([
            "EORS",
            "EORS2",
            "EORS",
            "EORS2",
            "EORS",
            "EORS2",
            "EORS",
            "EORS2",
            "EORS",
            "MLAS",
            "EORS",
            "LDRH",
            "EORS",
            "LDRSB",
            "EORS",
            "LDRSH"
        ]);
        generateMap1([
            "SUB",
            "SUB2",
            "SUB",
            "SUB2",
            "SUB",
            "SUB2",
            "SUB",
            "SUB2",
            "SUB",
            "UNDEFINED",
            "SUB",
            "STRH",
            "SUB",
            "UNDEFINED",
            "SUB",
            "UNDEFINED"
        ]);
        generateMap1([
            "SUBS",
            "SUBS2",
            "SUBS",
            "SUBS2",
            "SUBS",
            "SUBS2",
            "SUBS",
            "SUBS2",
            "SUBS",
            "UNDEFINED",
            "SUBS",
            "LDRH",
            "SUBS",
            "LDRSB",
            "SUBS",
            "LDRSH"
        ]);
        generateMap1([
            "RSB",
            "RSB2",
            "RSB",
            "RSB2",
            "RSB",
            "RSB2",
            "RSB",
            "RSB2",
            "RSB",
            "UNDEFINED",
            "RSB",
            "STRH",
            "RSB",
            "UNDEFINED",
            "RSB",
            "UNDEFINED"
        ]);
        generateMap1([
            "RSBS",
            "RSBS2",
            "RSBS",
            "RSBS2",
            "RSBS",
            "RSBS2",
            "RSBS",
            "RSBS2",
            "RSBS",
            "UNDEFINED",
            "RSBS",
            "LDRH",
            "RSBS",
            "LDRSB",
            "RSBS",
            "LDRSH"
        ]);
        generateMap1([
            "ADD",
            "ADD2",
            "ADD",
            "ADD2",
            "ADD",
            "ADD2",
            "ADD",
            "ADD2",
            "ADD",
            "UMULL",
            "ADD",
            "STRH",
            "ADD",
            "UNDEFINED",
            "ADD",
            "UNDEFINED"
        ]);
        generateMap1([
            "ADDS",
            "ADDS2",
            "ADDS",
            "ADDS2",
            "ADDS",
            "ADDS2",
            "ADDS",
            "ADDS2",
            "ADDS",
            "UMULLS",
            "ADDS",
            "LDRH",
            "ADDS",
            "LDRSB",
            "ADDS",
            "LDRSH"
        ]);
        generateMap1([
            "ADC",
            "ADC2",
            "ADC",
            "ADC2",
            "ADC",
            "ADC2",
            "ADC",
            "ADC2",
            "ADC",
            "UMLAL",
            "ADC",
            "STRH",
            "ADC",
            "UNDEFINED",
            "ADC",
            "UNDEFINED"
        ]);
        generateMap1([
            "ADCS",
            "ADCS2",
            "ADCS",
            "ADCS2",
            "ADCS",
            "ADCS2",
            "ADCS",
            "ADCS2",
            "ADCS",
            "UMLALS",
            "ADCS",
            "LDRH",
            "ADCS",
            "LDRSB",
            "ADCS",
            "LDRSH"
        ]);
        generateMap1([
            "SBC",
            "SBC2",
            "SBC",
            "SBC2",
            "SBC",
            "SBC2",
            "SBC",
            "SBC2",
            "SBC",
            "SMULL",
            "SBC",
            "STRH",
            "SBC",
            "UNDEFINED",
            "SBC",
            "UNDEFINED"
        ]);
        generateMap1([
            "SBCS",
            "SBCS2",
            "SBCS",
            "SBCS2",
            "SBCS",
            "SBCS2",
            "SBCS",
            "SBCS2",
            "SBCS",
            "SMULLS",
            "SBCS",
            "LDRH",
            "SBCS",
            "LDRSB",
            "SBCS",
            "LDRSH"
        ]);
        generateMap1([
            "RSC",
            "RSC2",
            "RSC",
            "RSC2",
            "RSC",
            "RSC2",
            "RSC",
            "RSC2",
            "RSC",
            "SMLAL",
            "RSC",
            "STRH",
            "RSC",
            "UNDEFINED",
            "RSC",
            "UNDEFINED"
        ]);
        generateMap1([
            "RSCS",
            "RSCS2",
            "RSCS",
            "RSCS2",
            "RSCS",
            "RSCS2",
            "RSCS",
            "RSCS2",
            "RSCS",
            "SMLALS",
            "RSCS",
            "LDRH",
            "RSCS",
            "LDRSB",
            "RSCS",
            "LDRSH"
        ]);
        generateMap1([
            "MRS",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "SWP",
            "UNDEFINED",
            "STRH2",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED"
        ]);
        generateMap1([
            "TSTS",
            "TSTS2",
            "TSTS",
            "TSTS2",
            "TSTS",
            "TSTS2",
            "TSTS",
            "TSTS2",
            "TSTS",
            "UNDEFINED",
            "TSTS",
            "LDRH2",
            "TSTS",
            "LDRSB2",
            "TSTS",
            "LDRSH2"
        ]);
        generateMap1([
            "MSR",
            "BX",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "STRH2",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED"
        ]);
        generateMap1([
            "TEQS",
            "TEQS2",
            "TEQS",
            "TEQS2",
            "TEQS",
            "TEQS2",
            "TEQS",
            "TEQS2",
            "TEQS",
            "UNDEFINED",
            "TEQS",
            "LDRH2",
            "TEQS",
            "LDRSB2",
            "TEQS",
            "LDRSH2"
        ]);
        generateMap1([
            "MRS",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "SWPB",
            "UNDEFINED",
            "STRH2",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED"
        ]);
        generateMap1([
            "CMPS",
            "CMPS2",
            "CMPS",
            "CMPS2",
            "CMPS",
            "CMPS2",
            "CMPS",
            "CMPS2",
            "CMPS",
            "UNDEFINED",
            "CMPS",
            "LDRH2",
            "CMPS",
            "LDRSB2",
            "CMPS",
            "LDRSH2"
        ]);
        generateMap1([
            "MSR",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "STRH2",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED",
            "UNDEFINED"
        ]);
        generateMap1([
            "CMNS",
            "CMNS2",
            "CMNS",
            "CMNS2",
            "CMNS",
            "CMNS2",
            "CMNS",
            "CMNS2",
            "CMNS",
            "UNDEFINED",
            "CMNS",
            "LDRH2",
            "CMNS",
            "LDRSB2",
            "CMNS",
            "LDRSH2"
        ]);
        generateMap1([
            "ORR",
            "ORR2",
            "ORR",
            "ORR2",
            "ORR",
            "ORR2",
            "ORR",
            "ORR2",
            "ORR",
            "UNDEFINED",
            "ORR",
            "STRH2",
            "ORR",
            "UNDEFINED",
            "ORR",
            "UNDEFINED"
        ]);
        generateMap1([
            "ORRS",
            "ORRS2",
            "ORRS",
            "ORRS2",
            "ORRS",
            "ORRS2",
            "ORRS",
            "ORRS2",
            "ORRS",
            "UNDEFINED",
            "ORRS",
            "LDRH2",
            "ORRS",
            "LDRSB2",
            "ORRS",
            "LDRSH2"
        ]);
        generateMap1([
            "MOV",
            "MOV2",
            "MOV",
            "MOV2",
            "MOV",
            "MOV2",
            "MOV",
            "MOV2",
            "MOV",
            "UNDEFINED",
            "MOV",
            "STRH2",
            "MOV",
            "UNDEFINED",
            "MOV",
            "UNDEFINED"
        ]);
        generateMap1([
            "MOVS",
            "MOVS2",
            "MOVS",
            "MOVS2",
            "MOVS",
            "MOVS2",
            "MOVS",
            "MOVS2",
            "MOVS",
            "UNDEFINED",
            "MOVS",
            "LDRH2",
            "MOVS",
            "LDRSB2",
            "MOVS",
            "LDRSH2"
        ]);
        generateMap1([
            "BIC",
            "BIC2",
            "BIC",
            "BIC2",
            "BIC",
            "BIC2",
            "BIC",
            "BIC2",
            "BIC",
            "UNDEFINED",
            "BIC",
            "STRH2",
            "BIC",
            "UNDEFINED",
            "BIC",
            "UNDEFINED"
        ]);
        generateMap1([
            "BICS",
            "BICS2",
            "BICS",
            "BICS2",
            "BICS",
            "BICS2",
            "BICS",
            "BICS2",
            "BICS",
            "UNDEFINED",
            "BICS",
            "LDRH2",
            "BICS",
            "LDRSB2",
            "BICS",
            "LDRSH2"
        ]);
        generateMap1([
            "MVN",
            "MVN2",
            "MVN",
            "MVN2",
            "MVN",
            "MVN2",
            "MVN",
            "MVN2",
            "MVN",
            "UNDEFINED",
            "MVN",
            "STRH2",
            "MVN",
            "UNDEFINED",
            "MVN",
            "UNDEFINED"
        ]);
        generateMap1([
            "MVNS",
            "MVNS2",
            "MVNS",
            "MVNS2",
            "MVNS",
            "MVNS2",
            "MVNS",
            "MVNS2",
            "MVNS",
            "UNDEFINED",
            "MVNS",
            "LDRH2",
            "MVNS",
            "LDRSB2",
            "MVNS",
            "LDRSH2"
        ]);
        generateMap2("AND");
        generateMap2("ANDS");
        generateMap2("EOR");
        generateMap2("EORS");
        generateMap2("SUB");
        generateMap2("SUBS");
        generateMap2("RSB");
        generateMap2("RSBS");
        generateMap2("ADD");
        generateMap2("ADDS");
        generateMap2("ADC");
        generateMap2("ADCS");
        generateMap2("SBC");
        generateMap2("SBCS");
        generateMap2("RSC");
        generateMap2("RSCS");
        generateMap2("UNDEFINED");
        generateMap2("TSTS");
        generateMap2("MSR");
        generateMap2("TEQS");
        generateMap2("UNDEFINED");
        generateMap2("CMPS");
        generateMap2("MSR");
        generateMap2("CMNS");
        generateMap2("ORR");
        generateMap2("ORRS");
        generateMap2("MOV");
        generateMap2("MOVS");
        generateMap2("BIC");
        generateMap2("BICS");
        generateMap2("MVN");
        generateMap2("MVNS");
        generateMap2("STR");
        generateMap2("LDR");
        generateMap2("STRT");
        generateMap2("LDRT");
        generateMap2("STRB");
        generateMap2("LDRB");
        generateMap2("STRBT");
        generateMap2("LDRBT");
        generateMap2("STR");
        generateMap2("LDR");
        generateMap2("STRT");
        generateMap2("LDRT");
        generateMap2("STRB");
        generateMap2("LDRB");
        generateMap2("STRBT");
        generateMap2("LDRBT");
        generateMap2("STR4");
        generateMap2("LDR4");
        generateMap2("STR4");
        generateMap2("LDR4");
        generateMap2("STRB4");
        generateMap2("LDRB4");
        generateMap2("STRB4");
        generateMap2("LDRB4");
        generateMap2("STR4");
        generateMap2("LDR4");
        generateMap2("STR4");
        generateMap2("LDR4");
        generateMap2("STRB4");
        generateMap2("LDRB4");
        generateMap2("STRB4");
        generateMap2("LDRB4");
        generateStoreLoadInstructionSector1();
        generateStoreLoadInstructionSector2();
        generateMap4("LoadStoreMultiple");
        generateMap3("B");
        generateMap3("BL");
        generateMap5("UNDEFINED");
        generateMap3("SWI");
        ARMInstructionSet.prototype.instructionMap = instructionMap;
    }
    function compileARMInstructionDecodeOpcodeSwitch() {
        var opcodeNameMap = {};
        var code = "switch (this.instructionMap[((this.execute >> 16) & 0xFF0) | ((this.execute >> 4) & 0xF)] & 0xFF) {";
        for (var opcodeNumber = 0; opcodeNumber < pseudoCodes.length; ++opcodeNumber) {
            var opcodeName = pseudoCodes[opcodeNumber];
            opcodeNameMap[opcodeName] = opcodeNumber;
            code += "case " + opcodeNumber + ":{this." + opcodeName + "();break};";
        }
        code += "default:{this.UNDEFINED()}}";
        opcodeNameMap["UNDEFINED"] = opcodeNumber;
        ARMInstructionSet.prototype.executeDecoded = Function(code);
        return opcodeNameMap;
    }
    compileARMInstructionDecodeOpcodeMap(compileARMInstructionDecodeOpcodeSwitch());
}
compileARMInstructionDecodeMap();