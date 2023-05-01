"use strict";
function THUMBInstructionSet(CPUCore) {
    this.CPUCore = CPUCore;
    this.initialize();
}
THUMBInstructionSet.prototype.initialize = function () {
    this.wait = this.CPUCore.wait;
    this.registers = this.CPUCore.registers;
    this.branchFlags = this.CPUCore.branchFlags;
    this.fetch = 0;
    this.decode = 0;
    this.execute = 0;
    this.memory = this.CPUCore.memory;
}
THUMBInstructionSet.prototype.executeIteration = function () {
    this.fetch = this.memory.memoryReadCPU16(this.readPC() | 0) | 0;
    this.executeDecoded();
    this.execute = this.decode | 0;
    this.decode = this.fetch | 0;
}
THUMBInstructionSet.prototype.executeDecoded = function () {
    switch (this.instructionMap[this.execute >> 6] & 0xFF) {
        case 0:
            this.CMPimm8();
            break;
        case 1:
            this.BEQ();
            break;
        case 2:
            this.MOVH_LH();
            break;
        case 3:
            this.LDRimm5();
            break;
        case 4:
            this.AND();
            break;
        case 5:
            this.LDRBimm5();
            break;
        case 6:
            this.LSLimm();
            break;
        case 7:
            this.LSRimm();
            break;
        case 8:
            this.MOVimm8();
            break;
        case 9:
            this.CMP();
            break;
        case 10:
            this.LDRSP();
            break;
        case 11:
            this.ADDimm3();
            break;
        case 12:
            this.ADDreg();
            break;
        case 13:
            this.STRSP();
            break;
        case 14:
            this.B();
            break;
        case 15:
            this.LDRPC();
            break;
        case 16:
            this.MOVH_HL();
            break;
        case 17:
            this.ADDimm8();
            break;
        case 18:
            this.SUBreg();
            break;
        case 19:
            this.BCC();
            break;
        case 20:
            this.STRimm5();
            break;
        case 21:
            this.ORR();
            break;
        case 22:
            this.LDRHimm5();
            break;
        case 23:
            this.BCS();
            break;
        case 24:
            this.BNE();
            break;
        case 25:
            this.BGE();
            break;
        case 26:
            this.POP();
            break;
        case 27:
            this.ADDH_HL();
            break;
        case 28:
            this.STRHimm5();
            break;
        case 29:
            this.BLE();
            break;
        case 30:
            this.ASRimm();
            break;
        case 31:
            this.MUL();
            break;
        case 32:
            this.BLsetup();
            break;
        case 33:
            this.BLoff();
            break;
        case 34:
            this.BGT();
            break;
        case 35:
            this.STRHreg();
            break;
        case 36:
            this.LDRHreg();
            break;
        case 37:
            this.BX_L();
            break;
        case 38:
            this.BLT();
            break;
        case 39:
            this.ADDSPimm7();
            break;
        case 40:
            this.PUSHlr();
            break;
        case 41:
            this.PUSH();
            break;
        case 42:
            this.SUBimm8();
            break;
        case 43:
            this.ROR();
            break;
        case 44:
            this.LDRSHreg();
            break;
        case 45:
            this.STRBimm5();
            break;
        case 46:
            this.NEG();
            break;
        case 47:
            this.BHI();
            break;
        case 48:
            this.TST();
            break;
        case 49:
            this.BX_H();
            break;
        case 50:
            this.STMIA();
            break;
        case 51:
            this.BLS();
            break;
        case 52:
            this.SWI();
            break;
        case 53:
            this.LDMIA();
            break;
        case 54:
            this.MOVH_HH();
            break;
        case 55:
            this.LSL();
            break;
        case 56:
            this.POPpc();
            break;
        case 57:
            this.LSR();
            break;
        case 58:
            this.CMPH_LH();
            break;
        case 59:
            this.EOR();
            break;
        case 60:
            this.SUBimm3();
            break;
        case 61:
            this.ADDH_LH();
            break;
        case 62:
            this.BPL();
            break;
        case 63:
            this.CMPH_HL();
            break;
        case 64:
            this.ADDPC();
            break;
        case 65:
            this.LDRSBreg();
            break;
        case 66:
            this.BIC();
            break;
        case 67:
            this.ADDSP();
            break;
        case 68:
            this.MVN();
            break;
        case 69:
            this.ASR();
            break;
        case 70:
            this.LDRreg();
            break;
        case 71:
            this.ADC();
            break;
        case 72:
            this.SBC();
            break;
        case 73:
            this.BMI();
            break;
        case 74:
            this.STRreg();
            break;
        case 75:
            this.CMN();
            break;
        case 76:
            this.LDRBreg();
            break;
        case 77:
            this.ADDH_HH();
            break;
        case 78:
            this.CMPH_HH();
            break;
        case 79:
            this.STRBreg();
            break;
        case 80:
            this.BVS();
            break;
        case 81:
            this.BVC();
            break;
        default:
            this.UNDEFINED();
    }
}
THUMBInstructionSet.prototype.executeBubble = function () {
    this.fetch = this.memory.memoryReadCPU16(this.readPC() | 0) | 0;
    this.incrementProgramCounter();
    this.execute = this.decode | 0;
    this.decode = this.fetch | 0;
}
THUMBInstructionSet.prototype.incrementProgramCounter = function () {
    this.registers[15] = ((this.registers[15] | 0) + 2) | 0;
}
THUMBInstructionSet.prototype.readLowRegister = function (address) {
    address = address | 0;
    return this.registers[address & 0x7] | 0;
}
THUMBInstructionSet.prototype.read0OffsetLowRegister = function () {
    return this.readLowRegister(this.execute | 0) | 0;
}
THUMBInstructionSet.prototype.read3OffsetLowRegister = function () {
    return this.readLowRegister(this.execute >> 3) | 0;
}
THUMBInstructionSet.prototype.read6OffsetLowRegister = function () {
    return this.readLowRegister(this.execute >> 6) | 0;
}
THUMBInstructionSet.prototype.read8OffsetLowRegister = function () {
    return this.readLowRegister(this.execute >> 8) | 0;
}
THUMBInstructionSet.prototype.readHighRegister = function (address) {
    address = address | 0x8;
    return this.registers[address & 0xF] | 0;
}
THUMBInstructionSet.prototype.writeLowRegister = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.registers[address & 0x7] = data | 0;
}
THUMBInstructionSet.prototype.write0OffsetLowRegister = function (data) {
    data = data | 0;
    this.writeLowRegister(this.execute | 0, data | 0);
}
THUMBInstructionSet.prototype.write8OffsetLowRegister = function (data) {
    data = data | 0;
    this.writeLowRegister(this.execute >> 8, data | 0);
}
THUMBInstructionSet.prototype.guardHighRegisterWrite = function (data) {
    data = data | 0;
    var address = 0x8 | (this.execute & 0x7);
    if ((address | 0) == 0xF) {
        this.CPUCore.branch(data & -2);
    }
    else {
        this.registers[address & 0xF] = data | 0;
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.writeSP = function (data) {
    data = data | 0;
    this.registers[0xD] = data | 0;
}
THUMBInstructionSet.prototype.SPDecrementWord = function () {
    this.registers[0xD] = ((this.registers[0xD] | 0) - 4) | 0;
}
THUMBInstructionSet.prototype.SPIncrementWord = function () {
    this.registers[0xD] = ((this.registers[0xD] | 0) + 4) | 0;
}
THUMBInstructionSet.prototype.writeLR = function (data) {
    data = data | 0;
    this.registers[0xE] = data | 0;
}
THUMBInstructionSet.prototype.writePC = function (data) {
    data = data | 0;
    this.CPUCore.branch(data & -2);
}
THUMBInstructionSet.prototype.offsetPC = function () {
    this.CPUCore.branch(((this.readPC() | 0) + ((this.execute << 24) >> 23)) | 0);
}
THUMBInstructionSet.prototype.getLR = function () {
    return ((this.readPC() | 0) - 2) | 0;
}
THUMBInstructionSet.prototype.getIRQLR = function () {
    return this.readPC() | 0;
}
THUMBInstructionSet.prototype.readSP = function () {
    return this.registers[0xD] | 0;
}
THUMBInstructionSet.prototype.readLR = function () {
    return this.registers[0xE] | 0;
}
THUMBInstructionSet.prototype.readPC = function () {
    return this.registers[0xF] | 0;
}
THUMBInstructionSet.prototype.getCurrentFetchValue = function () {
    return this.fetch | (this.fetch << 16);
}
THUMBInstructionSet.prototype.getSWICode = function () {
    return this.execute & 0xFF;
}
THUMBInstructionSet.prototype.LSLimm = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var offset = (this.execute >> 6) & 0x1F;
    if ((offset | 0) > 0) {
        this.branchFlags.setCarry((source << (((offset | 0) - 1) | 0)) | 0);
        source = source << (offset | 0);
    }
    this.branchFlags.setNZInt(source | 0);
    this.write0OffsetLowRegister(source | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LSRimm = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var offset = (this.execute >> 6) & 0x1F;
    if ((offset | 0) > 0) {
        this.branchFlags.setCarry((source >> (((offset | 0) - 1) | 0)) << 31);
        source = (source >>> (offset | 0)) | 0;
    }
    else {
        this.branchFlags.setCarry(source | 0);
        source = 0;
    }
    this.branchFlags.setNZInt(source | 0);
    this.write0OffsetLowRegister(source | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ASRimm = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var offset = (this.execute >> 6) & 0x1F;
    if ((offset | 0) > 0) {
        this.branchFlags.setCarry((source >> (((offset | 0) - 1) | 0)) << 31);
        source = source >> (offset | 0);
    }
    else {
        this.branchFlags.setCarry(source | 0);
        source = source >> 0x1F;
    }
    this.branchFlags.setNZInt(source | 0);
    this.write0OffsetLowRegister(source | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDreg = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = this.read6OffsetLowRegister() | 0;
    this.write0OffsetLowRegister(this.branchFlags.setADDFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.SUBreg = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = this.read6OffsetLowRegister() | 0;
    this.write0OffsetLowRegister(this.branchFlags.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDimm3 = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = (this.execute >> 6) & 0x7;
    this.write0OffsetLowRegister(this.branchFlags.setADDFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.SUBimm3 = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = (this.execute >> 6) & 0x7;
    this.write0OffsetLowRegister(this.branchFlags.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.MOVimm8 = function () {
    var result = this.execute & 0xFF;
    this.branchFlags.setNegativeFalse();
    this.branchFlags.setZero(result | 0);
    this.write8OffsetLowRegister(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.CMPimm8 = function () {
    var operand1 = this.read8OffsetLowRegister() | 0;
    var operand2 = this.execute & 0xFF;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDimm8 = function () {
    var operand1 = this.read8OffsetLowRegister() | 0;
    var operand2 = this.execute & 0xFF;
    this.write8OffsetLowRegister(this.branchFlags.setADDFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.SUBimm8 = function () {
    var operand1 = this.read8OffsetLowRegister() | 0;
    var operand2 = this.execute & 0xFF;
    this.write8OffsetLowRegister(this.branchFlags.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.AND = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    var result = source & destination;
    this.branchFlags.setNZInt(result | 0);
    this.write0OffsetLowRegister(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.EOR = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    var result = source ^ destination;
    this.branchFlags.setNZInt(result | 0);
    this.write0OffsetLowRegister(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LSL = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    if ((source | 0) > 0) {
        if ((source | 0) < 0x20) {
            this.branchFlags.setCarry(destination << (((source | 0) - 1) | 0));
            destination = destination << (source | 0);
        }
        else if ((source | 0) == 0x20) {
            this.branchFlags.setCarry(destination << 31);
            destination = 0;
        }
        else {
            this.branchFlags.setCarryFalse();
            destination = 0;
        }
    }
    this.branchFlags.setNZInt(destination | 0);
    this.write0OffsetLowRegister(destination | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LSR = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    if ((source | 0) > 0) {
        if ((source | 0) < 0x20) {
            this.branchFlags.setCarry((destination >> (((source | 0) - 1) | 0)) << 31);
            destination = (destination >>> (source | 0)) | 0;
        }
        else if (source == 0x20) {
            this.branchFlags.setCarry(destination | 0);
            destination = 0;
        }
        else {
            this.branchFlags.setCarryFalse();
            destination = 0;
        }
    }
    this.branchFlags.setNZInt(destination | 0);
    this.write0OffsetLowRegister(destination | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ASR = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    if ((source | 0) > 0) {
        if ((source | 0) < 0x20) {
            this.branchFlags.setCarry((destination >> (((source | 0) - 1) | 0)) << 31);
            destination = destination >> (source | 0);
        }
        else {
            this.branchFlags.setCarry(destination | 0);
            destination = destination >> 0x1F;
        }
    }
    this.branchFlags.setNZInt(destination | 0);
    this.write0OffsetLowRegister(destination | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADC = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.write0OffsetLowRegister(this.branchFlags.setADCFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.SBC = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.write0OffsetLowRegister(this.branchFlags.setSBCFlags(operand1 | 0, operand2 | 0) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ROR = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    if ((source | 0) > 0) {
        source = source & 0x1F;
        if ((source | 0) > 0) {
            this.branchFlags.setCarry((destination >> ((source - 1) | 0)) << 31);
            destination = (destination << ((0x20 - (source | 0)) | 0)) | (destination >>> (source | 0));
        }
        else {
            this.branchFlags.setCarry(destination | 0);
        }
    }
    this.branchFlags.setNZInt(destination | 0);
    this.write0OffsetLowRegister(destination | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.TST = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    var result = source & destination;
    this.branchFlags.setNZInt(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.NEG = function () {
    var source = this.read3OffsetLowRegister() | 0;
    if ((source | 0) != -0x80000000) {
        source = (-(source | 0)) | 0;
        this.branchFlags.setOverflowFalse();
    }
    else {
        this.branchFlags.setOverflowTrue();
    }
    this.branchFlags.setNZInt(source | 0);
    this.write0OffsetLowRegister(source | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.CMP = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.CMN = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.branchFlags.setCMNFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ORR = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    var result = source | destination;
    this.branchFlags.setNZInt(result | 0);
    this.write0OffsetLowRegister(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.MUL = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    var result = this.CPUCore.performMUL32(source | 0, destination | 0, 0) | 0;
    this.branchFlags.setCarryFalse();
    this.branchFlags.setNZInt(result | 0);
    this.write0OffsetLowRegister(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.BIC = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    var result = (~source) & destination;
    this.branchFlags.setNZInt(result | 0);
    this.write0OffsetLowRegister(result | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.MVN = function () {
    var source = ~this.read3OffsetLowRegister();
    this.branchFlags.setNZInt(source | 0);
    this.write0OffsetLowRegister(source | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDH_LH = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    this.write0OffsetLowRegister(((operand1 | 0) + (operand2 | 0)) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDH_HL = function () {
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.guardHighRegisterWrite(((operand1 | 0) + (operand2 | 0)) | 0);
}
THUMBInstructionSet.prototype.ADDH_HH = function () {
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    this.guardHighRegisterWrite(((operand1 | 0) + (operand2 | 0)) | 0);
}
THUMBInstructionSet.prototype.CMPH_LH = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.CMPH_HL = function () {
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.CMPH_HH = function () {
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    this.branchFlags.setCMPFlags(operand1 | 0, operand2 | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.MOVH_LH = function () {
    this.write0OffsetLowRegister(this.readHighRegister(this.execute >> 3) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.MOVH_HL = function () {
    this.guardHighRegisterWrite(this.read3OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.MOVH_HH = function () {
    this.guardHighRegisterWrite(this.readHighRegister(this.execute >> 3) | 0);
}
THUMBInstructionSet.prototype.BX_L = function () {
    var address = this.read3OffsetLowRegister() | 0;
    if ((address & 0x1) == 0) {
        this.CPUCore.enterARM();
        this.CPUCore.branch(address & -0x4);
    }
    else {
        this.CPUCore.branch(address & -0x2);
    }
}
THUMBInstructionSet.prototype.BX_H = function () {
    var address = this.readHighRegister(this.execute >> 3) | 0;
    if ((address & 0x1) == 0) {
        this.CPUCore.enterARM();
        this.CPUCore.branch(address & -0x4);
    }
    else {
        this.CPUCore.branch(address & -0x2);
    }
}
THUMBInstructionSet.prototype.LDRPC = function () {
    var data = this.CPUCore.read32(((this.readPC() & -3) + ((this.execute & 0xFF) << 2)) | 0) | 0;
    this.write8OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.STRreg = function () {
    var address = ((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write32(address | 0, this.read0OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.STRHreg = function () {
    var address = ((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write16(address | 0, this.read0OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.STRBreg = function () {
    var address = ((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write8(address | 0, this.read0OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LDRSBreg = function () {
    var data = (this.CPUCore.read8(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) << 24) >> 24;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.LDRreg = function () {
    var data = this.CPUCore.read32(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.LDRHreg = function () {
    var data = this.CPUCore.read16(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.LDRBreg = function () {
    var data = this.CPUCore.read8(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.LDRSHreg = function () {
    var data = (this.CPUCore.read16(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) << 16) >> 16;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.STRimm5 = function () {
    var address = (((this.execute >> 4) & 0x7C) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write32(address | 0, this.read0OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LDRimm5 = function () {
    var data = this.CPUCore.read32((((this.execute >> 4) & 0x7C) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.STRBimm5 = function () {
    var address = (((this.execute >> 6) & 0x1F) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write8(address | 0, this.read0OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LDRBimm5 = function () {
    var data = this.CPUCore.read8((((this.execute >> 6) & 0x1F) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.STRHimm5 = function () {
    var address = (((this.execute >> 5) & 0x3E) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write16(address | 0, this.read0OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LDRHimm5 = function () {
    var data = this.CPUCore.read16((((this.execute >> 5) & 0x3E) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.STRSP = function () {
    var address = (((this.execute & 0xFF) << 2) + (this.readSP() | 0)) | 0;
    this.CPUCore.write32(address | 0, this.read8OffsetLowRegister() | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LDRSP = function () {
    var data = this.CPUCore.read32((((this.execute & 0xFF) << 2) + (this.readSP() | 0)) | 0) | 0;
    this.write8OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.ADDPC = function () {
    var data = ((this.readPC() & -3) + ((this.execute & 0xFF) << 2)) | 0;
    this.write8OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDSP = function () {
    var data = (((this.execute & 0xFF) << 2) + (this.readSP() | 0)) | 0;
    this.write8OffsetLowRegister(data | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.ADDSPimm7 = function () {
    if ((this.execute & 0x80) != 0) {
        this.writeSP(((this.readSP() | 0) - ((this.execute & 0x7F) << 2)) | 0);
    }
    else {
        this.writeSP(((this.readSP() | 0) + ((this.execute & 0x7F) << 2)) | 0);
    }
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.PUSH = function () {
    if ((this.execute & 0xFF) > 0) {
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 7; (rListPosition | 0) > -1; rListPosition = ((rListPosition | 0) - 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.SPDecrementWord();
                this.memory.memoryWrite32(this.readSP() | 0, this.readLowRegister(rListPosition | 0) | 0);
            }
        }
        this.wait.NonSequentialBroadcast();
    }
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.PUSHlr = function () {
    this.wait.NonSequentialBroadcast();
    this.SPDecrementWord();
    this.memory.memoryWrite32(this.readSP() | 0, this.readLR() | 0);
    for (var rListPosition = 7; (rListPosition | 0) > -1; rListPosition = ((rListPosition | 0) - 1) | 0) {
        if ((this.execute & (1 << rListPosition)) != 0) {
            this.SPDecrementWord();
            this.memory.memoryWrite32(this.readSP() | 0, this.readLowRegister(rListPosition | 0) | 0);
        }
    }
    this.wait.NonSequentialBroadcast();
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.POP = function () {
    if ((this.execute & 0xFF) > 0) {
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.writeLowRegister(rListPosition | 0, this.memory.memoryRead32(this.readSP() | 0) | 0);
                this.SPIncrementWord();
            }
        }
        this.wait.NonSequentialBroadcast();
    }
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.POPpc = function () {
    this.wait.NonSequentialBroadcast();
    for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
        if ((this.execute & (1 << rListPosition)) != 0) {
            this.writeLowRegister(rListPosition | 0, this.memory.memoryRead32(this.readSP() | 0) | 0);
            this.SPIncrementWord();
        }
    }
    this.writePC(this.memory.memoryRead32(this.readSP() | 0) | 0);
    this.SPIncrementWord();
    this.wait.NonSequentialBroadcast();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.STMIA = function () {
    if ((this.execute & 0xFF) > 0) {
        var currentAddress = this.read8OffsetLowRegister() | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.memory.memoryWrite32(currentAddress | 0, this.readLowRegister(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.write8OffsetLowRegister(currentAddress | 0);
        this.wait.NonSequentialBroadcast();
    }
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.LDMIA = function () {
    if ((this.execute & 0xFF) > 0) {
        var currentAddress = this.read8OffsetLowRegister() | 0;
        this.wait.NonSequentialBroadcast();
        for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                this.writeLowRegister(rListPosition | 0, this.memory.memoryRead32(currentAddress | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        this.write8OffsetLowRegister(currentAddress | 0);
        this.wait.NonSequentialBroadcast();
    }
    this.incrementProgramCounter();
    this.wait.CPUInternalSingleCyclePrefetch();
}
THUMBInstructionSet.prototype.BEQ = function () {
    if ((this.branchFlags.getZero() | 0) == 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BNE = function () {
    if ((this.branchFlags.getZero() | 0) != 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BCS = function () {
    if ((this.branchFlags.getCarry() | 0) < 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BCC = function () {
    if ((this.branchFlags.getCarry() | 0) >= 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BMI = function () {
    if ((this.branchFlags.getNegative() | 0) < 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BPL = function () {
    if ((this.branchFlags.getNegative() | 0) >= 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BVS = function () {
    if ((this.branchFlags.getOverflow() | 0) < 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BVC = function () {
    if ((this.branchFlags.getOverflow() | 0) >= 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BHI = function () {
    if ((this.branchFlags.getCarry() | 0) < 0 && (this.branchFlags.getZero() | 0) != 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BLS = function () {
    if ((this.branchFlags.getCarry() | 0) < 0 && (this.branchFlags.getZero() | 0) != 0) {
        this.incrementProgramCounter();
    }
    else {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BGE = function () {
    if ((this.branchFlags.BGE() | 0) >= 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BLT = function () {
    if ((this.branchFlags.BGE() | 0) < 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BGT = function () {
    if ((this.branchFlags.getZero() | 0) != 0 && (this.branchFlags.BGE() | 0) >= 0) {
        this.offsetPC();
    }
    else {
        this.incrementProgramCounter();
    }
}
THUMBInstructionSet.prototype.BLE = function () {
    if ((this.branchFlags.getZero() | 0) != 0 && (this.branchFlags.BGE() | 0) >= 0) {
        this.incrementProgramCounter();
    }
    else {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.SWI = function () {
    this.CPUCore.SWI();
}
THUMBInstructionSet.prototype.B = function () {
    this.CPUCore.branch(((this.readPC() | 0) + ((this.execute << 21) >> 20)) | 0);
}
THUMBInstructionSet.prototype.BLsetup = function () {
    this.writeLR(((this.readPC() | 0) + ((this.execute << 21) >> 9)) | 0);
    this.incrementProgramCounter();
}
THUMBInstructionSet.prototype.BLoff = function () {
    this.writeLR(((this.readLR() | 0) + ((this.execute & 0x7FF) << 1)) | 0);
    var oldPC = this.readPC() | 0;
    this.CPUCore.branch(this.readLR() & -0x2);
    this.writeLR(((oldPC | 0) - 0x2) | 0x1);
}
THUMBInstructionSet.prototype.UNDEFINED = function () {
    this.CPUCore.UNDEFINED();
}
function compileTHUMBInstructionDecodeMap() {
    var opcodeIndice = 0;
    var instructionMap = getUint8Array(1024);
    function generateLowMap(instruction) {
        for (var index = 0; index < 0x20; ++index) {
            instructionMap[opcodeIndice++] = instruction;
        }
    }
    function generateLowMap2(instruction) {
        for (var index = 0; index < 0x8; ++index) {
            instructionMap[opcodeIndice++] = instruction;
        }
    }
    function generateLowMap3(instruction) {
        for (var index = 0; index < 0x4; ++index) {
            instructionMap[opcodeIndice++] = instruction;
        }
    }
    function generateLowMap4(instruction1, instruction2, instruction3, instruction4) {
        instructionMap[opcodeIndice++] = instruction1;
        instructionMap[opcodeIndice++] = instruction2;
        instructionMap[opcodeIndice++] = instruction3;
        instructionMap[opcodeIndice++] = instruction4;
    }
    generateLowMap(6);
    generateLowMap(7);
    generateLowMap(30);
    generateLowMap2(12);
    generateLowMap2(18);
    generateLowMap2(11);
    generateLowMap2(60);
    generateLowMap(8);
    generateLowMap(0);
    generateLowMap(17);
    generateLowMap(42);
    generateLowMap4(4, 59, 55, 57);
    generateLowMap4(69, 71, 72, 43);
    generateLowMap4(48, 46, 9, 75);
    generateLowMap4(21, 31, 66, 68);
    generateLowMap4(82, 61, 27, 77);
    generateLowMap4(82, 58, 63, 78);
    generateLowMap4(82, 2, 16, 54);
    generateLowMap4(37, 49, 82, 82);
    generateLowMap(15);
    generateLowMap2(74);
    generateLowMap2(35);
    generateLowMap2(79);
    generateLowMap2(65);
    generateLowMap2(70);
    generateLowMap2(36);
    generateLowMap2(76);
    generateLowMap2(44);
    generateLowMap(20);
    generateLowMap(3);
    generateLowMap(45);
    generateLowMap(5);
    generateLowMap(28);
    generateLowMap(22);
    generateLowMap(13);
    generateLowMap(10);
    generateLowMap(64);
    generateLowMap(67);
    generateLowMap3(39);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(41);
    generateLowMap3(40);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap3(26);
    generateLowMap3(56);
    generateLowMap3(82);
    generateLowMap3(82);
    generateLowMap(50);
    generateLowMap(53);
    generateLowMap3(1);
    generateLowMap3(24);
    generateLowMap3(23);
    generateLowMap3(19);
    generateLowMap3(73);
    generateLowMap3(62);
    generateLowMap3(80);
    generateLowMap3(81);
    generateLowMap3(47);
    generateLowMap3(51);
    generateLowMap3(25);
    generateLowMap3(38);
    generateLowMap3(34);
    generateLowMap3(29);
    generateLowMap3(82);
    generateLowMap3(52);
    generateLowMap(14);
    generateLowMap(82);
    generateLowMap(32);
    generateLowMap(33);
    THUMBInstructionSet.prototype.instructionMap = instructionMap;
}
compileTHUMBInstructionDecodeMap();