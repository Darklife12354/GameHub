"use strict";
function GameBoyCore(canvas, ROMImage) {
	this.canvas = canvas;
	this.drawContext = null;
	this.ROMImage = ROMImage;
	this.registerA = 0x01;
	this.FZero = true;
	this.FSubtract = false;
	this.FHalfCarry = true;
	this.FCarry = true;
	this.registerB = 0x00;
	this.registerC = 0x13;
	this.registerD = 0x00;
	this.registerE = 0xD8;
	this.registersHL = 0x014D;
	this.stackPointer = 0xFFFE;
	this.programCounter = 0x0100;
	this.CPUCyclesTotal = 0;
	this.CPUCyclesTotalBase = 0;
	this.CPUCyclesTotalCurrent = 0;
	this.CPUCyclesTotalRoundoff = 0;
	this.baseCPUCyclesPerIteration = 0;
	this.remainingClocks = 0;
	this.inBootstrap = true;
	this.usedBootROM = false;
	this.usedGBCBootROM = false;
	this.halt = false;
	this.skipPCIncrement = false;
	this.stopEmulator = 3;
	this.IME = true;
	this.IRQLineMatched = 0;
	this.interruptsRequested = 0;
	this.interruptsEnabled = 0;
	this.hdmaRunning = false;
	this.CPUTicks = 0;
	this.doubleSpeedShifter = 0;
	this.JoyPad = 0xFF;
	this.CPUStopped = false;
	this.memoryReader = [];
	this.memoryWriter = [];
	this.memoryHighReader = [];
	this.memoryHighWriter = [];
	this.ROM = [];
	this.memory = [];
	this.MBCRam = [];
	this.VRAM = [];
	this.GBCMemory = [];
	this.MBC1Mode = false;
	this.MBCRAMBanksEnabled = false;
	this.currMBCRAMBank = 0;
	this.currMBCRAMBankPosition = -0xA000;
	this.cGBC = false;
	this.gbcRamBank = 1;
	this.gbcRamBankPosition = -0xD000;
	this.gbcRamBankPositionECHO = -0xF000;
	this.RAMBanks = [0, 1, 2, 4, 16];
	this.ROMBank1offs = 0;
	this.currentROMBank = 0;
	this.cartridgeType = 0;
	this.name = "";
	this.gameCode = "";
	this.fromSaveState = false;
	this.savedStateFileName = "";
	this.STATTracker = 0;
	this.modeSTAT = 0;
	this.spriteCount = 252;
	this.LYCMatchTriggerSTAT = false;
	this.mode2TriggerSTAT = false;
	this.mode1TriggerSTAT = false;
	this.mode0TriggerSTAT = false;
	this.LCDisOn = false;
	this.LINECONTROL = [];
	this.DISPLAYOFFCONTROL = [function (parentObj) {
	}];
	this.LCDCONTROL = null;
	this.initializeLCDController();
	this.RTCisLatched = false;
	this.latchedSeconds = 0;
	this.latchedMinutes = 0;
	this.latchedHours = 0;
	this.latchedLDays = 0;
	this.latchedHDays = 0;
	this.RTCSeconds = 0;
	this.RTCMinutes = 0;
	this.RTCHours = 0;
	this.RTCDays = 0;
	this.RTCDayOverFlow = false;
	this.RTCHALT = false;
	this.highX = 127;
	this.lowX = 127;
	this.highY = 127;
	this.lowY = 127;
	this.audioHandle = null;
	this.numSamplesTotal = 0;
	this.dutyLookup = [
		[false, false, false, false, false, false, false, true],
		[true, false, false, false, false, false, false, true],
		[true, false, false, false, false, true, true, true],
		[false, true, true, true, true, true, true, false]
	];
	this.bufferContainAmount = 0;
	this.LSFR15Table = null;
	this.LSFR7Table = null;
	this.noiseSampleTable = null;
	this.initializeAudioStartState();
	this.soundMasterEnabled = false;
	this.channel3PCM = null;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.leftChannel1 = false;
	this.leftChannel2 = false;
	this.leftChannel3 = false;
	this.leftChannel4 = false;
	this.rightChannel1 = false;
	this.rightChannel2 = false;
	this.rightChannel3 = false;
	this.rightChannel4 = false;
	this.audioClocksUntilNextEvent = 1;
	this.audioClocksUntilNextEventCounter = 1;
	this.channel1currentSampleLeft = 0;
	this.channel1currentSampleRight = 0;
	this.channel2currentSampleLeft = 0;
	this.channel2currentSampleRight = 0;
	this.channel3currentSampleLeft = 0;
	this.channel3currentSampleRight = 0;
	this.channel4currentSampleLeft = 0;
	this.channel4currentSampleRight = 0;
	this.channel1currentSampleLeftSecondary = 0;
	this.channel1currentSampleRightSecondary = 0;
	this.channel2currentSampleLeftSecondary = 0;
	this.channel2currentSampleRightSecondary = 0;
	this.channel3currentSampleLeftSecondary = 0;
	this.channel3currentSampleRightSecondary = 0;
	this.channel4currentSampleLeftSecondary = 0;
	this.channel4currentSampleRightSecondary = 0;
	this.channel1currentSampleLeftTrimary = 0;
	this.channel1currentSampleRightTrimary = 0;
	this.channel2currentSampleLeftTrimary = 0;
	this.channel2currentSampleRightTrimary = 0;
	this.mixerOutputCache = 0;
	this.emulatorSpeed = 1;
	this.initializeTiming();
	this.audioTicks = 0;
	this.audioIndex = 0;
	this.downsampleInput = 0;
	this.audioDestinationPosition = 0;
	this.rollover = 0;
	this.emulatorTicks = 0;
	this.DIVTicks = 56;
	this.LCDTicks = 60;
	this.timerTicks = 0;
	this.TIMAEnabled = false;
	this.TACClocker = 1024;
	this.serialTimer = 0;
	this.serialShiftTimer = 0;
	this.serialShiftTimerAllocated = 0;
	this.IRQEnableDelay = 0;
	var dateVar = new Date();
	this.lastIteration = dateVar.getTime();
	dateVar = new Date();
	this.firstIteration = dateVar.getTime();
	this.iterations = 0;
	this.actualScanLine = 0;
	this.lastUnrenderedLine = 0;
	this.queuedScanLines = 0;
	this.totalLinesPassed = 0;
	this.haltPostClocks = 0;
	this.cMBC1 = false;
	this.cMBC2 = false;
	this.cMBC3 = false;
	this.cMBC5 = false;
	this.cMBC7 = false;
	this.cSRAM = false;
	this.cMMMO1 = false;
	this.cRUMBLE = false;
	this.cCamera = false;
	this.cTAMA5 = false;
	this.cHuC3 = false;
	this.cHuC1 = false;
	this.cTIMER = false;
	this.ROMBanks = [
		2, 4, 8, 16, 32, 64, 128, 256, 512
	];
	this.ROMBanks[0x52] = 72;
	this.ROMBanks[0x53] = 80;
	this.ROMBanks[0x54] = 96;
	this.numRAMBanks = 0;
	this.currVRAMBank = 0;
	this.backgroundX = 0;
	this.backgroundY = 0;
	this.gfxWindowDisplay = false;
	this.gfxSpriteShow = false;
	this.gfxSpriteNormalHeight = true;
	this.bgEnabled = true;
	this.BGPriorityEnabled = true;
	this.gfxWindowCHRBankPosition = 0;
	this.gfxBackgroundCHRBankPosition = 0;
	this.gfxBackgroundBankOffset = 0x80;
	this.windowY = 0;
	this.windowX = 0;
	this.drewBlank = 0;
	this.drewFrame = false;
	this.midScanlineOffset = -1;
	this.pixelEnd = 0;
	this.currentX = 0;
	this.BGCHRBank1 = null;
	this.BGCHRBank2 = null;
	this.BGCHRCurrentBank = null;
	this.tileCache = null;
	this.colors = [0xEFFFDE, 0xADD794, 0x529273, 0x183442];
	this.OBJPalette = null;
	this.BGPalette = null;
	this.gbcOBJRawPalette = null;
	this.gbcBGRawPalette = null;
	this.gbOBJPalette = null;
	this.gbBGPalette = null;
	this.gbcOBJPalette = null;
	this.gbcBGPalette = null;
	this.gbBGColorizedPalette = null;
	this.gbOBJColorizedPalette = null;
	this.cachedBGPaletteConversion = null;
	this.cachedOBJPaletteConversion = null;
	this.updateGBBGPalette = this.updateGBRegularBGPalette;
	this.updateGBOBJPalette = this.updateGBRegularOBJPalette;
	this.colorizedGBPalettes = false;
	this.BGLayerRender = null;
	this.WindowLayerRender = null;
	this.SpriteLayerRender = null;
	this.frameBuffer = [];
	this.swizzledFrame = null;
	this.canvasBuffer = null;
	this.pixelStart = 0;
	this.onscreenWidth = this.offscreenWidth = 160;
	this.onscreenHeight = this.offscreenHeight = 144;
	this.offscreenRGBCount = this.onscreenWidth * this.onscreenHeight * 4;
	this.resizePathClear = true;
	this.intializeWhiteNoise();
}
GameBoyCore.prototype.GBBOOTROM = [
];
GameBoyCore.prototype.GBCBOOTROM = [
];
GameBoyCore.prototype.ffxxDump = [
	0x0F, 0x00, 0x7C, 0xFF, 0x00, 0x00, 0x00, 0xF8, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x01,
	0x80, 0xBF, 0xF3, 0xFF, 0xBF, 0xFF, 0x3F, 0x00, 0xFF, 0xBF, 0x7F, 0xFF, 0x9F, 0xFF, 0xBF, 0xFF,
	0xFF, 0x00, 0x00, 0xBF, 0x77, 0xF3, 0xF1, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
	0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF,
	0x91, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x7E, 0xFF, 0xFE,
	0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x3E, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
	0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0, 0xFF, 0xC1, 0x00, 0xFE, 0xFF, 0xFF, 0xFF,
	0xF8, 0xFF, 0x00, 0x00, 0x00, 0x8F, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
	0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B, 0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D,
	0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E, 0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99,
	0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC, 0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E,
	0x45, 0xEC, 0x52, 0xFA, 0x08, 0xB7, 0x07, 0x5D, 0x01, 0xFD, 0xC0, 0xFF, 0x08, 0xFC, 0x00, 0xE5,
	0x0B, 0xF8, 0xC2, 0xCE, 0xF4, 0xF9, 0x0F, 0x7F, 0x45, 0x6D, 0x3D, 0xFE, 0x46, 0x97, 0x33, 0x5E,
	0x08, 0xEF, 0xF1, 0xFF, 0x86, 0x83, 0x24, 0x74, 0x12, 0xFC, 0x00, 0x9F, 0xB4, 0xB7, 0x06, 0xD5,
	0xD0, 0x7A, 0x00, 0x9E, 0x04, 0x5F, 0x41, 0x2F, 0x1D, 0x77, 0x36, 0x75, 0x81, 0xAA, 0x70, 0x3A,
	0x98, 0xD1, 0x71, 0x02, 0x4D, 0x01, 0xC1, 0xFF, 0x0D, 0x00, 0xD3, 0x05, 0xF9, 0x00, 0x0B, 0x00
];
GameBoyCore.prototype.OPCODE = [
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.registerB = parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.memoryWrite((parentObj.registerB << 8) | parentObj.registerC, parentObj.registerA);
	},
	function (parentObj) {
		var temp_var = ((parentObj.registerB << 8) | parentObj.registerC) + 1;
		parentObj.registerB = (temp_var >> 8) & 0xFF;
		parentObj.registerC = temp_var & 0xFF;
	},
	function (parentObj) {
		parentObj.registerB = (parentObj.registerB + 1) & 0xFF;
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FHalfCarry = ((parentObj.registerB & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerB = (parentObj.registerB - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FHalfCarry = ((parentObj.registerB & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.registerB = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | (parentObj.registerA >> 7);
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		var temp_var = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		parentObj.memoryWrite(temp_var, parentObj.stackPointer & 0xFF);
		parentObj.memoryWrite((temp_var + 1) & 0xFFFF, parentObj.stackPointer >> 8);
	},
	function (parentObj) {
		var dirtySum = parentObj.registersHL + ((parentObj.registerB << 8) | parentObj.registerC);
		parentObj.FHalfCarry = ((parentObj.registersHL & 0xFFF) > (dirtySum & 0xFFF));
		parentObj.FCarry = (dirtySum > 0xFFFF);
		parentObj.registersHL = dirtySum & 0xFFFF;
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryRead((parentObj.registerB << 8) | parentObj.registerC);
	},
	function (parentObj) {
		var temp_var = (((parentObj.registerB << 8) | parentObj.registerC) - 1) & 0xFFFF;
		parentObj.registerB = temp_var >> 8;
		parentObj.registerC = temp_var & 0xFF;
	},
	function (parentObj) {
		parentObj.registerC = (parentObj.registerC + 1) & 0xFF;
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FHalfCarry = ((parentObj.registerC & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerC = (parentObj.registerC - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FHalfCarry = ((parentObj.registerC & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registerA = (parentObj.registerA >> 1) | ((parentObj.registerA & 1) << 7);
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		if (parentObj.cGBC) {
			if ((parentObj.memory[0xFF4D] & 0x01) == 0x01) {
				if (parentObj.memory[0xFF4D] > 0x7F) {
					cout("Going into single clock speed mode.", 0);
					parentObj.doubleSpeedShifter = 0;
					parentObj.memory[0xFF4D] &= 0x7F;
				}
				else {
					cout("Going into double clock speed mode.", 0);
					parentObj.doubleSpeedShifter = 1;
					parentObj.memory[0xFF4D] |= 0x80;
				}
				parentObj.memory[0xFF4D] &= 0xFE;
			}
			else {
				parentObj.handleSTOP();
			}
		}
		else {
			parentObj.handleSTOP();
		}
	},
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.registerD = parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.memoryWrite((parentObj.registerD << 8) | parentObj.registerE, parentObj.registerA);
	},
	function (parentObj) {
		var temp_var = ((parentObj.registerD << 8) | parentObj.registerE) + 1;
		parentObj.registerD = (temp_var >> 8) & 0xFF;
		parentObj.registerE = temp_var & 0xFF;
	},
	function (parentObj) {
		parentObj.registerD = (parentObj.registerD + 1) & 0xFF;
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FHalfCarry = ((parentObj.registerD & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerD = (parentObj.registerD - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FHalfCarry = ((parentObj.registerD & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.registerD = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		var carry_flag = (parentObj.FCarry) ? 1 : 0;
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | carry_flag;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
	},
	function (parentObj) {
		var dirtySum = parentObj.registersHL + ((parentObj.registerD << 8) | parentObj.registerE);
		parentObj.FHalfCarry = ((parentObj.registersHL & 0xFFF) > (dirtySum & 0xFFF));
		parentObj.FCarry = (dirtySum > 0xFFFF);
		parentObj.registersHL = dirtySum & 0xFFFF;
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryRead((parentObj.registerD << 8) | parentObj.registerE);
	},
	function (parentObj) {
		var temp_var = (((parentObj.registerD << 8) | parentObj.registerE) - 1) & 0xFFFF;
		parentObj.registerD = temp_var >> 8;
		parentObj.registerE = temp_var & 0xFF;
	},
	function (parentObj) {
		parentObj.registerE = (parentObj.registerE + 1) & 0xFF;
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FHalfCarry = ((parentObj.registerE & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerE = (parentObj.registerE - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FHalfCarry = ((parentObj.registerE & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		var carry_flag = (parentObj.FCarry) ? 0x80 : 0;
		parentObj.FCarry = ((parentObj.registerA & 1) == 1);
		parentObj.registerA = (parentObj.registerA >> 1) | carry_flag;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
		parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
	},
	function (parentObj) {
		var H = ((parentObj.registersHL >> 8) + 1) & 0xFF;
		parentObj.FZero = (H == 0);
		parentObj.FHalfCarry = ((H & 0xF) == 0);
		parentObj.FSubtract = false;
		parentObj.registersHL = (H << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		var H = ((parentObj.registersHL >> 8) - 1) & 0xFF;
		parentObj.FZero = (H == 0);
		parentObj.FHalfCarry = ((H & 0xF) == 0xF);
		parentObj.FSubtract = true;
		parentObj.registersHL = (H << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8) | (parentObj.registersHL & 0xFF);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		if (!parentObj.FSubtract) {
			if (parentObj.FCarry || parentObj.registerA > 0x99) {
				parentObj.registerA = (parentObj.registerA + 0x60) & 0xFF;
				parentObj.FCarry = true;
			}
			if (parentObj.FHalfCarry || (parentObj.registerA & 0xF) > 0x9) {
				parentObj.registerA = (parentObj.registerA + 0x06) & 0xFF;
				parentObj.FHalfCarry = false;
			}
		}
		else if (parentObj.FCarry && parentObj.FHalfCarry) {
			parentObj.registerA = (parentObj.registerA + 0x9A) & 0xFF;
			parentObj.FHalfCarry = false;
		}
		else if (parentObj.FCarry) {
			parentObj.registerA = (parentObj.registerA + 0xA0) & 0xFF;
		}
		else if (parentObj.FHalfCarry) {
			parentObj.registerA = (parentObj.registerA + 0xFA) & 0xFF;
			parentObj.FHalfCarry = false;
		}
		parentObj.FZero = (parentObj.registerA == 0);
	},
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	function (parentObj) {
		parentObj.FHalfCarry = ((parentObj.registersHL & 0xFFF) > 0x7FF);
		parentObj.FCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = (parentObj.registersHL << 1) & 0xFFFF;
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	function (parentObj) {
		var L = (parentObj.registersHL + 1) & 0xFF;
		parentObj.FZero = (L == 0);
		parentObj.FHalfCarry = ((L & 0xF) == 0);
		parentObj.FSubtract = false;
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | L;
	},
	function (parentObj) {
		var L = (parentObj.registersHL - 1) & 0xFF;
		parentObj.FZero = (L == 0);
		parentObj.FHalfCarry = ((L & 0xF) == 0xF);
		parentObj.FSubtract = true;
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | L;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registerA ^= 0xFF;
		parentObj.FSubtract = parentObj.FHalfCarry = true;
	},
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer + 1) & 0xFFFF;
	},
	function (parentObj) {
		var temp_var = (parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) + 1) & 0xFF;
		parentObj.FZero = (temp_var == 0);
		parentObj.FHalfCarry = ((temp_var & 0xF) == 0);
		parentObj.FSubtract = false;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
	},
	function (parentObj) {
		var temp_var = (parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) - 1) & 0xFF;
		parentObj.FZero = (temp_var == 0);
		parentObj.FHalfCarry = ((temp_var & 0xF) == 0xF);
		parentObj.FSubtract = true;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter));
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.FCarry = true;
		parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	function (parentObj) {
		var dirtySum = parentObj.registersHL + parentObj.stackPointer;
		parentObj.FHalfCarry = ((parentObj.registersHL & 0xFFF) > (dirtySum & 0xFFF));
		parentObj.FCarry = (dirtySum > 0xFFFF);
		parentObj.registersHL = dirtySum & 0xFFFF;
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registerA = (parentObj.registerA + 1) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.registerA = (parentObj.registerA - 1) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) == 0xF);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.FCarry = !parentObj.FCarry;
		parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registerB = parentObj.registerC;
	},
	function (parentObj) {
		parentObj.registerB = parentObj.registerD;
	},
	function (parentObj) {
		parentObj.registerB = parentObj.registerE;
	},
	function (parentObj) {
		parentObj.registerB = parentObj.registersHL >> 8;
	},
	function (parentObj) {
		parentObj.registerB = parentObj.registersHL & 0xFF;
	},
	function (parentObj) {
		parentObj.registerB = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	function (parentObj) {
		parentObj.registerB = parentObj.registerA;
	},
	function (parentObj) {
		parentObj.registerC = parentObj.registerB;
	},
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registerC = parentObj.registerD;
	},
	function (parentObj) {
		parentObj.registerC = parentObj.registerE;
	},
	function (parentObj) {
		parentObj.registerC = parentObj.registersHL >> 8;
	},
	function (parentObj) {
		parentObj.registerC = parentObj.registersHL & 0xFF;
	},
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	function (parentObj) {
		parentObj.registerC = parentObj.registerA;
	},
	function (parentObj) {
		parentObj.registerD = parentObj.registerB;
	},
	function (parentObj) {
		parentObj.registerD = parentObj.registerC;
	},
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registerD = parentObj.registerE;
	},
	function (parentObj) {
		parentObj.registerD = parentObj.registersHL >> 8;
	},
	function (parentObj) {
		parentObj.registerD = parentObj.registersHL & 0xFF;
	},
	function (parentObj) {
		parentObj.registerD = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	function (parentObj) {
		parentObj.registerD = parentObj.registerA;
	},
	function (parentObj) {
		parentObj.registerE = parentObj.registerB;
	},
	function (parentObj) {
		parentObj.registerE = parentObj.registerC;
	},
	function (parentObj) {
		parentObj.registerE = parentObj.registerD;
	},
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registerE = parentObj.registersHL >> 8;
	},
	function (parentObj) {
		parentObj.registerE = parentObj.registersHL & 0xFF;
	},
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	function (parentObj) {
		parentObj.registerE = parentObj.registerA;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerB << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerC << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerD << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerE << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF) * 0x101;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registerA << 8) | (parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerB;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerC;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerD;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerE;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | (parentObj.registersHL >> 8);
	},
	function (parentObj) {
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerA;
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerB);
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerC);
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerD);
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerE);
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registersHL >> 8);
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		if ((parentObj.interruptsEnabled & parentObj.interruptsRequested & 0x1F) > 0) {
			if (!parentObj.cGBC && !parentObj.usedBootROM) {
				parentObj.skipPCIncrement = true;
			}
			else {
				parentObj.CPUTicks += 4;
			}
		}
		else {
			parentObj.calculateHALTPeriod();
		}
	},
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
	},
	function (parentObj) {
		parentObj.registerA = parentObj.registerB;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.registerC;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.registerD;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.registerE;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.registersHL >> 8;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.registersHL & 0xFF;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
	},
	function (parentObj) {
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerB;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerC;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerD;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerE;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + (parentObj.registersHL >> 8);
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.FHalfCarry = ((parentObj.registerA & 0x8) == 0x8);
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = (parentObj.registerA << 1) & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerB + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerB & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerC + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerC & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerD + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerD & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerE + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerE & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var tempValue = (parentObj.registersHL >> 8);
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var tempValue = (parentObj.registersHL & 0xFF);
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var tempValue = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = (parentObj.registerA << 1) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((((parentObj.registerA << 1) & 0x1E) | ((parentObj.FCarry) ? 1 : 0)) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerB;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerC;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerD;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerE;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL >> 8);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.registerA = 0;
		parentObj.FHalfCarry = parentObj.FCarry = false;
		parentObj.FZero = parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerB - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerB & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerC - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerC & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerD - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerD & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerE - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerE & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var temp_var = parentObj.registersHL >> 8;
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL & 0xFF) - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registersHL & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.FZero = false;
			parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = true;
			parentObj.registerA = 0xFF;
		}
		else {
			parentObj.FHalfCarry = parentObj.FCarry = false;
			parentObj.FSubtract = parentObj.FZero = true;
			parentObj.registerA = 0;
		}
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA &= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.registersHL;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA ^= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA = 0;
		parentObj.FZero = true;
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.registerA |= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerB;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerC;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerD;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerE;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL >> 8);
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.FHalfCarry = parentObj.FCarry = false;
		parentObj.FZero = parentObj.FSubtract = true;
	},
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	function (parentObj) {
		parentObj.registerC = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.registerB = parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
	},
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
	},
	function (parentObj) {
		if (!parentObj.FZero) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerB);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerC);
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0;
	},
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	function (parentObj) {
		parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
	},
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		var opcode = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.CPUTicks += parentObj.SecondaryTICKTable[opcode];
		parentObj.CBOPCODE[opcode](parentObj);
	},
	function (parentObj) {
		if (parentObj.FZero) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = temp_pc;
	},
	function (parentObj) {
		var tempValue = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x8;
	},
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	function (parentObj) {
		parentObj.registerE = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.registerD = parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
	},
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		cout("Illegal op code 0xD3 called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		if (!parentObj.FCarry) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerD);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerE);
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x10;
	},
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	function (parentObj) {
		parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
		parentObj.IRQEnableDelay = (parentObj.IRQEnableDelay == 2 || parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) == 0x76) ? 1 : 2;
	},
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		cout("Illegal op code 0xDB called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		if (parentObj.FCarry) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	function (parentObj) {
		cout("Illegal op code 0xDD called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x18;
	},
	function (parentObj) {
		parentObj.memoryHighWrite(parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter), parentObj.registerA);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registersHL = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.memoryHighWriter[parentObj.registerC](parentObj, parentObj.registerC, parentObj.registerA);
	},
	function (parentObj) {
		cout("Illegal op code 0xE3 called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		cout("Illegal op code 0xE4 called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registersHL >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registersHL & 0xFF);
	},
	function (parentObj) {
		parentObj.registerA &= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x20;
	},
	function (parentObj) {
		var temp_value2 = (parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24;
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		var temp_value = (parentObj.stackPointer + temp_value2) & 0xFFFF;
		temp_value2 = parentObj.stackPointer ^ temp_value2 ^ temp_value;
		parentObj.stackPointer = temp_value;
		parentObj.FCarry = ((temp_value2 & 0x100) == 0x100);
		parentObj.FHalfCarry = ((temp_value2 & 0x10) == 0x10);
		parentObj.FZero = parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.programCounter = parentObj.registersHL;
	},
	function (parentObj) {
		parentObj.memoryWrite((parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter), parentObj.registerA);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
	},
	function (parentObj) {
		cout("Illegal op code 0xEB called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		cout("Illegal op code 0xEC called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		cout("Illegal op code 0xED called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		parentObj.registerA ^= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x28;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryHighRead(parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter));
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.FZero = (temp_var > 0x7F);
		parentObj.FSubtract = ((temp_var & 0x40) == 0x40);
		parentObj.FHalfCarry = ((temp_var & 0x20) == 0x20);
		parentObj.FCarry = ((temp_var & 0x10) == 0x10);
		parentObj.registerA = parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryHighReader[parentObj.registerC](parentObj, parentObj.registerC);
	},
	function (parentObj) {
		parentObj.IME = false;
		parentObj.IRQEnableDelay = 0;
	},
	function (parentObj) {
		cout("Illegal op code 0xF4 called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerA);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, ((parentObj.FZero) ? 0x80 : 0) | ((parentObj.FSubtract) ? 0x40 : 0) | ((parentObj.FHalfCarry) ? 0x20 : 0) | ((parentObj.FCarry) ? 0x10 : 0));
	},
	function (parentObj) {
		parentObj.registerA |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x30;
	},
	function (parentObj) {
		var temp_var = (parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24;
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.registersHL = (parentObj.stackPointer + temp_var) & 0xFFFF;
		temp_var = parentObj.stackPointer ^ temp_var ^ parentObj.registersHL;
		parentObj.FCarry = ((temp_var & 0x100) == 0x100);
		parentObj.FHalfCarry = ((temp_var & 0x10) == 0x10);
		parentObj.FZero = parentObj.FSubtract = false;
	},
	function (parentObj) {
		parentObj.stackPointer = parentObj.registersHL;
	},
	function (parentObj) {
		parentObj.registerA = parentObj.memoryRead((parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter));
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
	},
	function (parentObj) {
		parentObj.IRQEnableDelay = (parentObj.IRQEnableDelay == 2 || parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) == 0x76) ? 1 : 2;
	},
	function (parentObj) {
		cout("Illegal op code 0xFC called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		cout("Illegal op code 0xFD called, pausing emulation.", 2);
		pause();
	},
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x38;
	}
];
GameBoyCore.prototype.CBOPCODE = [
	function (parentObj) {
		parentObj.FCarry = (parentObj.registerB > 0x7F);
		parentObj.registerB = ((parentObj.registerB << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerC > 0x7F);
		parentObj.registerC = ((parentObj.registerC << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerD > 0x7F);
		parentObj.registerD = ((parentObj.registerD << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerE > 0x7F);
		parentObj.registerE = ((parentObj.registerE << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | ((parentObj.FCarry) ? 0x100 : 0) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x80) == 0x80);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = (temp_var > 0x7F);
		temp_var = ((temp_var << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerB >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerC >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerD >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerE >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.FCarry) ? 0x8000 : 0) | ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x01) == 0x01);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.FCarry) ? 0x80 : 0) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		temp_var = ((parentObj.FCarry) ? 0x80 : 0) | (temp_var >> 1);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerA >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		var newFCarry = (parentObj.registerB > 0x7F);
		parentObj.registerB = ((parentObj.registerB << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		var newFCarry = (parentObj.registerC > 0x7F);
		parentObj.registerC = ((parentObj.registerC << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		var newFCarry = (parentObj.registerD > 0x7F);
		parentObj.registerD = ((parentObj.registerD << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		var newFCarry = (parentObj.registerE > 0x7F);
		parentObj.registerE = ((parentObj.registerE << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		var newFCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | ((parentObj.FCarry) ? 0x100 : 0) | (parentObj.registersHL & 0xFF);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x80) == 0x80);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var newFCarry = (temp_var > 0x7F);
		temp_var = ((temp_var << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	, function (parentObj) {
		var newFCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerB >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerC >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerD >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerE >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.FCarry) ? 0x8000 : 0) | ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x01) == 0x01);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.FCarry) ? 0x80 : 0) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var newFCarry = ((temp_var & 0x01) == 0x01);
		temp_var = ((parentObj.FCarry) ? 0x80 : 0) | (temp_var >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	, function (parentObj) {
		var newFCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerA >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerB > 0x7F);
		parentObj.registerB = (parentObj.registerB << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerC > 0x7F);
		parentObj.registerC = (parentObj.registerC << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerD > 0x7F);
		parentObj.registerD = (parentObj.registerD << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerE > 0x7F);
		parentObj.registerE = (parentObj.registerE << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0080) == 0x0080);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = (temp_var > 0x7F);
		temp_var = (temp_var << 1) & 0xFF;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = (parentObj.registerA << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = (parentObj.registerB & 0x80) | (parentObj.registerB >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = (parentObj.registerC & 0x80) | (parentObj.registerC >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = (parentObj.registerD & 0x80) | (parentObj.registerD >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = (parentObj.registerE & 0x80) | (parentObj.registerE >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0x80FF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0001) == 0x0001);
		parentObj.registersHL = (parentObj.registersHL & 0xFF80) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		temp_var = (temp_var & 0x80) | (temp_var >> 1);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = (parentObj.registerA & 0x80) | (parentObj.registerA >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		parentObj.registerB = ((parentObj.registerB & 0xF) << 4) | (parentObj.registerB >> 4);
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.registerC = ((parentObj.registerC & 0xF) << 4) | (parentObj.registerC >> 4);
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.registerD = ((parentObj.registerD & 0xF) << 4) | (parentObj.registerD >> 4);
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.registerE = ((parentObj.registerE & 0xF) << 4) | (parentObj.registerE >> 4);
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.registersHL = ((parentObj.registersHL & 0xF00) << 4) | ((parentObj.registersHL & 0xF000) >> 4) | (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registersHL < 0x100);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL & 0xF) << 4) | ((parentObj.registersHL & 0xF0) >> 4);
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		temp_var = ((temp_var & 0xF) << 4) | (temp_var >> 4);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FZero = (temp_var == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.registerA = ((parentObj.registerA & 0xF) << 4) | (parentObj.registerA >> 4);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0001) == 0x0001);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	, function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var < 2);
	}
	, function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x01) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x01) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x01) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x01) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0100) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0001) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x01) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x01) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x02) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x02) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x02) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x02) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0200) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0002) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x02) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x02) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x04) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x04) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x04) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x04) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0400) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0004) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x04) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x04) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x08) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x08) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x08) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x08) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0800) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0008) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x08) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x08) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x10) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x10) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x10) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x10) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x1000) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0010) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x10) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x10) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x20) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x20) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x20) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x20) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x2000) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0020) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x20) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x20) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x40) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x40) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x40) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x40) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x4000) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0040) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x40) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x40) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x80) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x80) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x80) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x80) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x8000) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0080) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x80) == 0);
	}
	, function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x80) == 0);
	}
	, function (parentObj) {
		parentObj.registerB &= 0xFE;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xFE;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xFE;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xFE;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFEFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFFE;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xFE);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xFE;
	}
	, function (parentObj) {
		parentObj.registerB &= 0xFD;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xFD;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xFD;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xFD;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFDFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFFD;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xFD);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xFD;
	}
	, function (parentObj) {
		parentObj.registerB &= 0xFB;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xFB;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xFB;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xFB;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFBFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFFB;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xFB);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xFB;
	}
	, function (parentObj) {
		parentObj.registerB &= 0xF7;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xF7;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xF7;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xF7;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xF7FF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFF7;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xF7);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xF7;
	}
	, function (parentObj) {
		parentObj.registerB &= 0xEF;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xEF;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xEF;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xEF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xEFFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFEF;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xEF);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xEF;
	}
	, function (parentObj) {
		parentObj.registerB &= 0xDF;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xDF;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xDF;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xDF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xDFFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFDF;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xDF);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xDF;
	}
	, function (parentObj) {
		parentObj.registerB &= 0xBF;
	}
	, function (parentObj) {
		parentObj.registerC &= 0xBF;
	}
	, function (parentObj) {
		parentObj.registerD &= 0xBF;
	}
	, function (parentObj) {
		parentObj.registerE &= 0xBF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xBFFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFFBF;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xBF);
	}
	, function (parentObj) {
		parentObj.registerA &= 0xBF;
	}
	, function (parentObj) {
		parentObj.registerB &= 0x7F;
	}
	, function (parentObj) {
		parentObj.registerC &= 0x7F;
	}
	, function (parentObj) {
		parentObj.registerD &= 0x7F;
	}
	, function (parentObj) {
		parentObj.registerE &= 0x7F;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0x7FFF;
	}
	, function (parentObj) {
		parentObj.registersHL &= 0xFF7F;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x7F);
	}
	, function (parentObj) {
		parentObj.registerA &= 0x7F;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x01;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x01;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x01;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x01;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x0100;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x01;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x01);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x01;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x02;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x02;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x02;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x02;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x0200;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x02;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x02);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x02;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x04;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x04;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x04;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x04;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x0400;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x04;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x04);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x04;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x08;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x08;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x08;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x08;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x0800;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x08;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x08);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x08;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x10;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x10;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x10;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x10;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x1000;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x10;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x10);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x10;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x20;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x20;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x20;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x20;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x2000;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x20;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x20);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x20;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x40;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x40;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x40;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x40;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x4000;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x40;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x40);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x40;
	}
	, function (parentObj) {
		parentObj.registerB |= 0x80;
	}
	, function (parentObj) {
		parentObj.registerC |= 0x80;
	}
	, function (parentObj) {
		parentObj.registerD |= 0x80;
	}
	, function (parentObj) {
		parentObj.registerE |= 0x80;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x8000;
	}
	, function (parentObj) {
		parentObj.registersHL |= 0x80;
	}
	, function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x80);
	}
	, function (parentObj) {
		parentObj.registerA |= 0x80;
	}
];
GameBoyCore.prototype.TICKTable = [
	4, 12, 8, 8, 4, 4, 8, 4, 20, 8, 8, 8, 4, 4, 8, 4,
	4, 12, 8, 8, 4, 4, 8, 4, 12, 8, 8, 8, 4, 4, 8, 4,
	8, 12, 8, 8, 4, 4, 8, 4, 8, 8, 8, 8, 4, 4, 8, 4,
	8, 12, 8, 8, 12, 12, 12, 4, 8, 8, 8, 8, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	8, 8, 8, 8, 8, 8, 4, 8, 4, 4, 4, 4, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	4, 4, 4, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 8, 4,
	8, 12, 12, 16, 12, 16, 8, 16, 8, 16, 12, 0, 12, 24, 8, 16,
	8, 12, 12, 4, 12, 16, 8, 16, 8, 16, 12, 4, 12, 4, 8, 16,
	12, 12, 8, 4, 4, 16, 8, 16, 16, 4, 16, 4, 4, 4, 8, 16,
	12, 12, 8, 4, 4, 16, 8, 16, 12, 8, 16, 4, 0, 4, 8, 16
];
GameBoyCore.prototype.SecondaryTICKTable = [
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
	8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
	8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
	8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8,
	8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 16, 8
];
GameBoyCore.prototype.saveSRAMState = function () {
	if (!this.cBATT || this.MBCRam.length == 0) {
		return [];
	}
	else {
		return this.fromTypedArray(this.MBCRam);
	}
}
GameBoyCore.prototype.saveRTCState = function () {
	if (!this.cTIMER) {
		return [];
	}
	else {
		return [
			this.lastIteration,
			this.RTCisLatched,
			this.latchedSeconds,
			this.latchedMinutes,
			this.latchedHours,
			this.latchedLDays,
			this.latchedHDays,
			this.RTCSeconds,
			this.RTCMinutes,
			this.RTCHours,
			this.RTCDays,
			this.RTCDayOverFlow,
			this.RTCHALT
		];
	}
}
GameBoyCore.prototype.saveState = function () {
	return [
		this.fromTypedArray(this.ROM),
		this.inBootstrap,
		this.registerA,
		this.FZero,
		this.FSubtract,
		this.FHalfCarry,
		this.FCarry,
		this.registerB,
		this.registerC,
		this.registerD,
		this.registerE,
		this.registersHL,
		this.stackPointer,
		this.programCounter,
		this.halt,
		this.IME,
		this.hdmaRunning,
		this.CPUTicks,
		this.doubleSpeedShifter,
		this.fromTypedArray(this.memory),
		this.fromTypedArray(this.MBCRam),
		this.fromTypedArray(this.VRAM),
		this.currVRAMBank,
		this.fromTypedArray(this.GBCMemory),
		this.MBC1Mode,
		this.MBCRAMBanksEnabled,
		this.currMBCRAMBank,
		this.currMBCRAMBankPosition,
		this.cGBC,
		this.gbcRamBank,
		this.gbcRamBankPosition,
		this.ROMBank1offs,
		this.currentROMBank,
		this.cartridgeType,
		this.name,
		this.gameCode,
		this.modeSTAT,
		this.LYCMatchTriggerSTAT,
		this.mode2TriggerSTAT,
		this.mode1TriggerSTAT,
		this.mode0TriggerSTAT,
		this.LCDisOn,
		this.gfxWindowCHRBankPosition,
		this.gfxWindowDisplay,
		this.gfxSpriteShow,
		this.gfxSpriteNormalHeight,
		this.gfxBackgroundCHRBankPosition,
		this.gfxBackgroundBankOffset,
		this.TIMAEnabled,
		this.DIVTicks,
		this.LCDTicks,
		this.timerTicks,
		this.TACClocker,
		this.serialTimer,
		this.serialShiftTimer,
		this.serialShiftTimerAllocated,
		this.IRQEnableDelay,
		this.lastIteration,
		this.cMBC1,
		this.cMBC2,
		this.cMBC3,
		this.cMBC5,
		this.cMBC7,
		this.cSRAM,
		this.cMMMO1,
		this.cRUMBLE,
		this.cCamera,
		this.cTAMA5,
		this.cHuC3,
		this.cHuC1,
		this.drewBlank,
		this.fromTypedArray(this.frameBuffer),
		this.bgEnabled,
		this.BGPriorityEnabled,
		this.channel1FrequencyTracker,
		this.channel1FrequencyCounter,
		this.channel1totalLength,
		this.channel1envelopeVolume,
		this.channel1envelopeType,
		this.channel1envelopeSweeps,
		this.channel1envelopeSweepsLast,
		this.channel1consecutive,
		this.channel1frequency,
		this.channel1SweepFault,
		this.channel1ShadowFrequency,
		this.channel1timeSweep,
		this.channel1lastTimeSweep,
		this.channel1Swept,
		this.channel1frequencySweepDivider,
		this.channel1decreaseSweep,
		this.channel2FrequencyTracker,
		this.channel2FrequencyCounter,
		this.channel2totalLength,
		this.channel2envelopeVolume,
		this.channel2envelopeType,
		this.channel2envelopeSweeps,
		this.channel2envelopeSweepsLast,
		this.channel2consecutive,
		this.channel2frequency,
		this.channel3canPlay,
		this.channel3totalLength,
		this.channel3patternType,
		this.channel3frequency,
		this.channel3consecutive,
		this.fromTypedArray(this.channel3PCM),
		this.channel4FrequencyPeriod,
		this.channel4lastSampleLookup,
		this.channel4totalLength,
		this.channel4envelopeVolume,
		this.channel4currentVolume,
		this.channel4envelopeType,
		this.channel4envelopeSweeps,
		this.channel4envelopeSweepsLast,
		this.channel4consecutive,
		this.channel4BitRange,
		this.soundMasterEnabled,
		this.VinLeftChannelMasterVolume,
		this.VinRightChannelMasterVolume,
		this.leftChannel1,
		this.leftChannel2,
		this.leftChannel3,
		this.leftChannel4,
		this.rightChannel1,
		this.rightChannel2,
		this.rightChannel3,
		this.rightChannel4,
		this.channel1currentSampleLeft,
		this.channel1currentSampleRight,
		this.channel2currentSampleLeft,
		this.channel2currentSampleRight,
		this.channel3currentSampleLeft,
		this.channel3currentSampleRight,
		this.channel4currentSampleLeft,
		this.channel4currentSampleRight,
		this.channel1currentSampleLeftSecondary,
		this.channel1currentSampleRightSecondary,
		this.channel2currentSampleLeftSecondary,
		this.channel2currentSampleRightSecondary,
		this.channel3currentSampleLeftSecondary,
		this.channel3currentSampleRightSecondary,
		this.channel4currentSampleLeftSecondary,
		this.channel4currentSampleRightSecondary,
		this.channel1currentSampleLeftTrimary,
		this.channel1currentSampleRightTrimary,
		this.channel2currentSampleLeftTrimary,
		this.channel2currentSampleRightTrimary,
		this.mixerOutputCache,
		this.channel1DutyTracker,
		this.channel1CachedDuty,
		this.channel2DutyTracker,
		this.channel2CachedDuty,
		this.channel1Enabled,
		this.channel2Enabled,
		this.channel3Enabled,
		this.channel4Enabled,
		this.sequencerClocks,
		this.sequencePosition,
		this.channel3Counter,
		this.channel4Counter,
		this.cachedChannel3Sample,
		this.cachedChannel4Sample,
		this.channel3FrequencyPeriod,
		this.channel3lastSampleLookup,
		this.actualScanLine,
		this.lastUnrenderedLine,
		this.queuedScanLines,
		this.RTCisLatched,
		this.latchedSeconds,
		this.latchedMinutes,
		this.latchedHours,
		this.latchedLDays,
		this.latchedHDays,
		this.RTCSeconds,
		this.RTCMinutes,
		this.RTCHours,
		this.RTCDays,
		this.RTCDayOverFlow,
		this.RTCHALT,
		this.usedBootROM,
		this.skipPCIncrement,
		this.STATTracker,
		this.gbcRamBankPositionECHO,
		this.numRAMBanks,
		this.windowY,
		this.windowX,
		this.fromTypedArray(this.gbcOBJRawPalette),
		this.fromTypedArray(this.gbcBGRawPalette),
		this.fromTypedArray(this.gbOBJPalette),
		this.fromTypedArray(this.gbBGPalette),
		this.fromTypedArray(this.gbcOBJPalette),
		this.fromTypedArray(this.gbcBGPalette),
		this.fromTypedArray(this.gbBGColorizedPalette),
		this.fromTypedArray(this.gbOBJColorizedPalette),
		this.fromTypedArray(this.cachedBGPaletteConversion),
		this.fromTypedArray(this.cachedOBJPaletteConversion),
		this.fromTypedArray(this.BGCHRBank1),
		this.fromTypedArray(this.BGCHRBank2),
		this.haltPostClocks,
		this.interruptsRequested,
		this.interruptsEnabled,
		this.remainingClocks,
		this.colorizedGBPalettes,
		this.backgroundY,
		this.backgroundX,
		this.CPUStopped,
		this.audioClocksUntilNextEvent,
		this.audioClocksUntilNextEventCounter
	];
}
GameBoyCore.prototype.returnFromState = function (returnedFrom) {
	var index = 0;
	var state = returnedFrom.slice(0);
	this.ROM = this.toTypedArray(state[index++], "uint8");
	this.ROMBankEdge = Math.floor(this.ROM.length / 0x4000);
	this.inBootstrap = state[index++];
	this.registerA = state[index++];
	this.FZero = state[index++];
	this.FSubtract = state[index++];
	this.FHalfCarry = state[index++];
	this.FCarry = state[index++];
	this.registerB = state[index++];
	this.registerC = state[index++];
	this.registerD = state[index++];
	this.registerE = state[index++];
	this.registersHL = state[index++];
	this.stackPointer = state[index++];
	this.programCounter = state[index++];
	this.halt = state[index++];
	this.IME = state[index++];
	this.hdmaRunning = state[index++];
	this.CPUTicks = state[index++];
	this.doubleSpeedShifter = state[index++];
	this.memory = this.toTypedArray(state[index++], "uint8");
	this.MBCRam = this.toTypedArray(state[index++], "uint8");
	this.VRAM = this.toTypedArray(state[index++], "uint8");
	this.currVRAMBank = state[index++];
	this.GBCMemory = this.toTypedArray(state[index++], "uint8");
	this.MBC1Mode = state[index++];
	this.MBCRAMBanksEnabled = state[index++];
	this.currMBCRAMBank = state[index++];
	this.currMBCRAMBankPosition = state[index++];
	this.cGBC = state[index++];
	this.gbcRamBank = state[index++];
	this.gbcRamBankPosition = state[index++];
	this.ROMBank1offs = state[index++];
	this.currentROMBank = state[index++];
	this.cartridgeType = state[index++];
	this.name = state[index++];
	this.gameCode = state[index++];
	this.modeSTAT = state[index++];
	this.LYCMatchTriggerSTAT = state[index++];
	this.mode2TriggerSTAT = state[index++];
	this.mode1TriggerSTAT = state[index++];
	this.mode0TriggerSTAT = state[index++];
	this.LCDisOn = state[index++];
	this.gfxWindowCHRBankPosition = state[index++];
	this.gfxWindowDisplay = state[index++];
	this.gfxSpriteShow = state[index++];
	this.gfxSpriteNormalHeight = state[index++];
	this.gfxBackgroundCHRBankPosition = state[index++];
	this.gfxBackgroundBankOffset = state[index++];
	this.TIMAEnabled = state[index++];
	this.DIVTicks = state[index++];
	this.LCDTicks = state[index++];
	this.timerTicks = state[index++];
	this.TACClocker = state[index++];
	this.serialTimer = state[index++];
	this.serialShiftTimer = state[index++];
	this.serialShiftTimerAllocated = state[index++];
	this.IRQEnableDelay = state[index++];
	this.lastIteration = state[index++];
	this.cMBC1 = state[index++];
	this.cMBC2 = state[index++];
	this.cMBC3 = state[index++];
	this.cMBC5 = state[index++];
	this.cMBC7 = state[index++];
	this.cSRAM = state[index++];
	this.cMMMO1 = state[index++];
	this.cRUMBLE = state[index++];
	this.cCamera = state[index++];
	this.cTAMA5 = state[index++];
	this.cHuC3 = state[index++];
	this.cHuC1 = state[index++];
	this.drewBlank = state[index++];
	this.frameBuffer = this.toTypedArray(state[index++], "int32");
	this.bgEnabled = state[index++];
	this.BGPriorityEnabled = state[index++];
	this.channel1FrequencyTracker = state[index++];
	this.channel1FrequencyCounter = state[index++];
	this.channel1totalLength = state[index++];
	this.channel1envelopeVolume = state[index++];
	this.channel1envelopeType = state[index++];
	this.channel1envelopeSweeps = state[index++];
	this.channel1envelopeSweepsLast = state[index++];
	this.channel1consecutive = state[index++];
	this.channel1frequency = state[index++];
	this.channel1SweepFault = state[index++];
	this.channel1ShadowFrequency = state[index++];
	this.channel1timeSweep = state[index++];
	this.channel1lastTimeSweep = state[index++];
	this.channel1Swept = state[index++];
	this.channel1frequencySweepDivider = state[index++];
	this.channel1decreaseSweep = state[index++];
	this.channel2FrequencyTracker = state[index++];
	this.channel2FrequencyCounter = state[index++];
	this.channel2totalLength = state[index++];
	this.channel2envelopeVolume = state[index++];
	this.channel2envelopeType = state[index++];
	this.channel2envelopeSweeps = state[index++];
	this.channel2envelopeSweepsLast = state[index++];
	this.channel2consecutive = state[index++];
	this.channel2frequency = state[index++];
	this.channel3canPlay = state[index++];
	this.channel3totalLength = state[index++];
	this.channel3patternType = state[index++];
	this.channel3frequency = state[index++];
	this.channel3consecutive = state[index++];
	this.channel3PCM = this.toTypedArray(state[index++], "int8");
	this.channel4FrequencyPeriod = state[index++];
	this.channel4lastSampleLookup = state[index++];
	this.channel4totalLength = state[index++];
	this.channel4envelopeVolume = state[index++];
	this.channel4currentVolume = state[index++];
	this.channel4envelopeType = state[index++];
	this.channel4envelopeSweeps = state[index++];
	this.channel4envelopeSweepsLast = state[index++];
	this.channel4consecutive = state[index++];
	this.channel4BitRange = state[index++];
	this.soundMasterEnabled = state[index++];
	this.VinLeftChannelMasterVolume = state[index++];
	this.VinRightChannelMasterVolume = state[index++];
	this.leftChannel1 = state[index++];
	this.leftChannel2 = state[index++];
	this.leftChannel3 = state[index++];
	this.leftChannel4 = state[index++];
	this.rightChannel1 = state[index++];
	this.rightChannel2 = state[index++];
	this.rightChannel3 = state[index++];
	this.rightChannel4 = state[index++];
	this.channel1currentSampleLeft = state[index++];
	this.channel1currentSampleRight = state[index++];
	this.channel2currentSampleLeft = state[index++];
	this.channel2currentSampleRight = state[index++];
	this.channel3currentSampleLeft = state[index++];
	this.channel3currentSampleRight = state[index++];
	this.channel4currentSampleLeft = state[index++];
	this.channel4currentSampleRight = state[index++];
	this.channel1currentSampleLeftSecondary = state[index++];
	this.channel1currentSampleRightSecondary = state[index++];
	this.channel2currentSampleLeftSecondary = state[index++];
	this.channel2currentSampleRightSecondary = state[index++];
	this.channel3currentSampleLeftSecondary = state[index++];
	this.channel3currentSampleRightSecondary = state[index++];
	this.channel4currentSampleLeftSecondary = state[index++];
	this.channel4currentSampleRightSecondary = state[index++];
	this.channel1currentSampleLeftTrimary = state[index++];
	this.channel1currentSampleRightTrimary = state[index++];
	this.channel2currentSampleLeftTrimary = state[index++];
	this.channel2currentSampleRightTrimary = state[index++];
	this.mixerOutputCache = state[index++];
	this.channel1DutyTracker = state[index++];
	this.channel1CachedDuty = state[index++];
	this.channel2DutyTracker = state[index++];
	this.channel2CachedDuty = state[index++];
	this.channel1Enabled = state[index++];
	this.channel2Enabled = state[index++];
	this.channel3Enabled = state[index++];
	this.channel4Enabled = state[index++];
	this.sequencerClocks = state[index++];
	this.sequencePosition = state[index++];
	this.channel3Counter = state[index++];
	this.channel4Counter = state[index++];
	this.cachedChannel3Sample = state[index++];
	this.cachedChannel4Sample = state[index++];
	this.channel3FrequencyPeriod = state[index++];
	this.channel3lastSampleLookup = state[index++];
	this.actualScanLine = state[index++];
	this.lastUnrenderedLine = state[index++];
	this.queuedScanLines = state[index++];
	this.RTCisLatched = state[index++];
	this.latchedSeconds = state[index++];
	this.latchedMinutes = state[index++];
	this.latchedHours = state[index++];
	this.latchedLDays = state[index++];
	this.latchedHDays = state[index++];
	this.RTCSeconds = state[index++];
	this.RTCMinutes = state[index++];
	this.RTCHours = state[index++];
	this.RTCDays = state[index++];
	this.RTCDayOverFlow = state[index++];
	this.RTCHALT = state[index++];
	this.usedBootROM = state[index++];
	this.skipPCIncrement = state[index++];
	this.STATTracker = state[index++];
	this.gbcRamBankPositionECHO = state[index++];
	this.numRAMBanks = state[index++];
	this.windowY = state[index++];
	this.windowX = state[index++];
	this.gbcOBJRawPalette = this.toTypedArray(state[index++], "uint8");
	this.gbcBGRawPalette = this.toTypedArray(state[index++], "uint8");
	this.gbOBJPalette = this.toTypedArray(state[index++], "int32");
	this.gbBGPalette = this.toTypedArray(state[index++], "int32");
	this.gbcOBJPalette = this.toTypedArray(state[index++], "int32");
	this.gbcBGPalette = this.toTypedArray(state[index++], "int32");
	this.gbBGColorizedPalette = this.toTypedArray(state[index++], "int32");
	this.gbOBJColorizedPalette = this.toTypedArray(state[index++], "int32");
	this.cachedBGPaletteConversion = this.toTypedArray(state[index++], "int32");
	this.cachedOBJPaletteConversion = this.toTypedArray(state[index++], "int32");
	this.BGCHRBank1 = this.toTypedArray(state[index++], "uint8");
	this.BGCHRBank2 = this.toTypedArray(state[index++], "uint8");
	this.haltPostClocks = state[index++];
	this.interruptsRequested = state[index++];
	this.interruptsEnabled = state[index++];
	this.checkIRQMatching();
	this.remainingClocks = state[index++];
	this.colorizedGBPalettes = state[index++];
	this.backgroundY = state[index++];
	this.backgroundX = state[index++];
	this.CPUStopped = state[index++];
	this.audioClocksUntilNextEvent = state[index++];
	this.audioClocksUntilNextEventCounter = state[index];
	this.fromSaveState = true;
	this.TICKTable = this.toTypedArray(this.TICKTable, "uint8");
	this.SecondaryTICKTable = this.toTypedArray(this.SecondaryTICKTable, "uint8");
	this.initializeReferencesFromSaveState();
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
	this.initLCD();
	this.initSound();
	this.noiseSampleTable = (this.channel4BitRange == 0x7FFF) ? this.LSFR15Table : this.LSFR7Table;
	this.channel4VolumeShifter = (this.channel4BitRange == 0x7FFF) ? 15 : 7;
}
GameBoyCore.prototype.returnFromRTCState = function () {
	if (typeof this.openRTC == "function" && this.cTIMER) {
		var rtcData = this.openRTC(this.name);
		var index = 0;
		this.lastIteration = rtcData[index++];
		this.RTCisLatched = rtcData[index++];
		this.latchedSeconds = rtcData[index++];
		this.latchedMinutes = rtcData[index++];
		this.latchedHours = rtcData[index++];
		this.latchedLDays = rtcData[index++];
		this.latchedHDays = rtcData[index++];
		this.RTCSeconds = rtcData[index++];
		this.RTCMinutes = rtcData[index++];
		this.RTCHours = rtcData[index++];
		this.RTCDays = rtcData[index++];
		this.RTCDayOverFlow = rtcData[index++];
		this.RTCHALT = rtcData[index];
	}
}
GameBoyCore.prototype.start = function () {
	this.initMemory();
	this.ROMLoad();
	this.initLCD();
	this.initSound();
	this.run();
}
GameBoyCore.prototype.initMemory = function () {
	this.memory = this.getTypedArray(0x10000, 0, "uint8");
	this.frameBuffer = this.getTypedArray(23040, 0xF8F8F8, "int32");
	this.BGCHRBank1 = this.getTypedArray(0x800, 0, "uint8");
	this.TICKTable = this.toTypedArray(this.TICKTable, "uint8");
	this.SecondaryTICKTable = this.toTypedArray(this.SecondaryTICKTable, "uint8");
	this.channel3PCM = this.getTypedArray(0x20, 0, "int8");
}
GameBoyCore.prototype.generateCacheArray = function (tileAmount) {
	var tileArray = [];
	var tileNumber = 0;
	while (tileNumber < tileAmount) {
		tileArray[tileNumber++] = this.getTypedArray(64, 0, "uint8");
	}
	return tileArray;
}
GameBoyCore.prototype.initSkipBootstrap = function () {
	var index = 0xFF;
	while (index >= 0) {
		if (index >= 0x30 && index < 0x40) {
			this.memoryWrite(0xFF00 | index, this.ffxxDump[index]);
		}
		else {
			switch (index) {
				case 0x00:
				case 0x01:
				case 0x02:
				case 0x05:
				case 0x07:
				case 0x0F:
				case 0xFF:
					this.memoryWrite(0xFF00 | index, this.ffxxDump[index]);
					break;
				default:
					this.memory[0xFF00 | index] = this.ffxxDump[index];
			}
		}
		--index;
	}
	if (this.cGBC) {
		this.memory[0xFF6C] = 0xFE;
		this.memory[0xFF74] = 0xFE;
	}
	else {
		this.memory[0xFF48] = 0xFF;
		this.memory[0xFF49] = 0xFF;
		this.memory[0xFF6C] = 0xFF;
		this.memory[0xFF74] = 0xFF;
	}
	cout("Starting without the GBC boot ROM.", 0);
	this.registerA = (this.cGBC) ? 0x11 : 0x1;
	this.registerB = 0;
	this.registerC = 0x13;
	this.registerD = 0;
	this.registerE = 0xD8;
	this.FZero = true;
	this.FSubtract = false;
	this.FHalfCarry = true;
	this.FCarry = true;
	this.registersHL = 0x014D;
	this.LCDCONTROL = this.LINECONTROL;
	this.IME = false;
	this.IRQLineMatched = 0;
	this.interruptsRequested = 225;
	this.interruptsEnabled = 0;
	this.hdmaRunning = false;
	this.CPUTicks = 12;
	this.STATTracker = 0;
	this.modeSTAT = 1;
	this.spriteCount = 252;
	this.LYCMatchTriggerSTAT = false;
	this.mode2TriggerSTAT = false;
	this.mode1TriggerSTAT = false;
	this.mode0TriggerSTAT = false;
	this.LCDisOn = true;
	this.channel1FrequencyTracker = 0x2000;
	this.channel1DutyTracker = 0;
	this.channel1CachedDuty = this.dutyLookup[2];
	this.channel1totalLength = 0;
	this.channel1envelopeVolume = 0;
	this.channel1envelopeType = false;
	this.channel1envelopeSweeps = 0;
	this.channel1envelopeSweepsLast = 0;
	this.channel1consecutive = true;
	this.channel1frequency = 1985;
	this.channel1SweepFault = true;
	this.channel1ShadowFrequency = 1985;
	this.channel1timeSweep = 1;
	this.channel1lastTimeSweep = 0;
	this.channel1Swept = false;
	this.channel1frequencySweepDivider = 0;
	this.channel1decreaseSweep = false;
	this.channel2FrequencyTracker = 0x2000;
	this.channel2DutyTracker = 0;
	this.channel2CachedDuty = this.dutyLookup[2];
	this.channel2totalLength = 0;
	this.channel2envelopeVolume = 0;
	this.channel2envelopeType = false;
	this.channel2envelopeSweeps = 0;
	this.channel2envelopeSweepsLast = 0;
	this.channel2consecutive = true;
	this.channel2frequency = 0;
	this.channel3canPlay = false;
	this.channel3totalLength = 0;
	this.channel3patternType = 4;
	this.channel3frequency = 0;
	this.channel3consecutive = true;
	this.channel3Counter = 0x418;
	this.channel4FrequencyPeriod = 8;
	this.channel4totalLength = 0;
	this.channel4envelopeVolume = 0;
	this.channel4currentVolume = 0;
	this.channel4envelopeType = false;
	this.channel4envelopeSweeps = 0;
	this.channel4envelopeSweepsLast = 0;
	this.channel4consecutive = true;
	this.channel4BitRange = 0x7FFF;
	this.channel4VolumeShifter = 15;
	this.channel1FrequencyCounter = 0x200;
	this.channel2FrequencyCounter = 0x200;
	this.channel3Counter = 0x800;
	this.channel3FrequencyPeriod = 0x800;
	this.channel3lastSampleLookup = 0;
	this.channel4lastSampleLookup = 0;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.soundMasterEnabled = true;
	this.leftChannel1 = true;
	this.leftChannel2 = true;
	this.leftChannel3 = true;
	this.leftChannel4 = true;
	this.rightChannel1 = true;
	this.rightChannel2 = true;
	this.rightChannel3 = false;
	this.rightChannel4 = false;
	this.DIVTicks = 27044;
	this.LCDTicks = 160;
	this.timerTicks = 0;
	this.TIMAEnabled = false;
	this.TACClocker = 1024;
	this.serialTimer = 0;
	this.serialShiftTimer = 0;
	this.serialShiftTimerAllocated = 0;
	this.IRQEnableDelay = 0;
	this.actualScanLine = 144;
	this.lastUnrenderedLine = 0;
	this.gfxWindowDisplay = false;
	this.gfxSpriteShow = false;
	this.gfxSpriteNormalHeight = true;
	this.bgEnabled = true;
	this.BGPriorityEnabled = true;
	this.gfxWindowCHRBankPosition = 0;
	this.gfxBackgroundCHRBankPosition = 0;
	this.gfxBackgroundBankOffset = 0;
	this.windowY = 0;
	this.windowX = 0;
	this.drewBlank = 0;
	this.midScanlineOffset = -1;
	this.currentX = 0;
}
GameBoyCore.prototype.initBootstrap = function () {
	cout("Starting the selected boot ROM.", 0);
	this.programCounter = 0;
	this.stackPointer = 0;
	this.IME = false;
	this.LCDTicks = 0;
	this.DIVTicks = 0;
	this.registerA = 0;
	this.registerB = 0;
	this.registerC = 0;
	this.registerD = 0;
	this.registerE = 0;
	this.FZero = this.FSubtract = this.FHalfCarry = this.FCarry = false;
	this.registersHL = 0;
	this.leftChannel1 = false;
	this.leftChannel2 = false;
	this.leftChannel3 = false;
	this.leftChannel4 = false;
	this.rightChannel1 = false;
	this.rightChannel2 = false;
	this.rightChannel3 = false;
	this.rightChannel4 = false;
	this.channel2frequency = this.channel1frequency = 0;
	this.channel4consecutive = this.channel2consecutive = this.channel1consecutive = false;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.memory[0xFF00] = 0xF;
}
GameBoyCore.prototype.ROMLoad = function () {
	this.ROM = [];
	this.usedBootROM = settings[1] && ((!settings[11] && this.GBCBOOTROM.length == 0x800) || (settings[11] && this.GBBOOTROM.length == 0x100));
	var maxLength = this.ROMImage.length;
	if (maxLength < 0x4000) {
		throw (new Error("ROM image size too small."));
	}
	this.ROM = this.getTypedArray(maxLength, 0, "uint8");
	var romIndex = 0;
	if (this.usedBootROM) {
		if (!settings[11]) {
			for (; romIndex < 0x100; ++romIndex) {
				this.memory[romIndex] = this.GBCBOOTROM[romIndex];
				this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
			}
			for (; romIndex < 0x200; ++romIndex) {
				this.memory[romIndex] = this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
			}
			for (; romIndex < 0x900; ++romIndex) {
				this.memory[romIndex] = this.GBCBOOTROM[romIndex - 0x100];
				this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
			}
			this.usedGBCBootROM = true;
		}
		else {
			for (; romIndex < 0x100; ++romIndex) {
				this.memory[romIndex] = this.GBBOOTROM[romIndex];
				this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
			}
		}
		for (; romIndex < 0x4000; ++romIndex) {
			this.memory[romIndex] = this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
		}
	}
	else {
		for (; romIndex < 0x4000; ++romIndex) {
			this.memory[romIndex] = this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
		}
	}
	for (; romIndex < maxLength; ++romIndex) {
		this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
	}
	this.ROMBankEdge = Math.floor(this.ROM.length / 0x4000);
	this.interpretCartridge();
	this.checkIRQMatching();
}
GameBoyCore.prototype.getROMImage = function () {
	if (this.ROMImage.length > 0) {
		return this.ROMImage.length;
	}
	var length = this.ROM.length;
	for (var index = 0; index < length; index++) {
		this.ROMImage += String.fromCharCode(this.ROM[index]);
	}
	return this.ROMImage;
}
GameBoyCore.prototype.interpretCartridge = function () {
	for (var index = 0x134; index < 0x13F; index++) {
		if (this.ROMImage.charCodeAt(index) > 0) {
			this.name += this.ROMImage[index];
		}
	}
	for (var index = 0x13F; index < 0x143; index++) {
		if (this.ROMImage.charCodeAt(index) > 0) {
			this.gameCode += this.ROMImage[index];
		}
	}
	cout("Game Title: " + this.name + "[" + this.gameCode + "][" + this.ROMImage[0x143] + "]", 0);
	cout("Game Code: " + this.gameCode, 0);
	this.cartridgeType = this.ROM[0x147];
	cout("Cartridge type #" + this.cartridgeType, 0);
	var MBCType = "";
	switch (this.cartridgeType) {
		case 0x00:
			if (!settings[9]) {
				MBCType = "ROM";
				break;
			}
		case 0x01:
			this.cMBC1 = true;
			MBCType = "MBC1";
			break;
		case 0x02:
			this.cMBC1 = true;
			this.cSRAM = true;
			MBCType = "MBC1 + SRAM";
			break;
		case 0x03:
			this.cMBC1 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC1 + SRAM + BATT";
			break;
		case 0x05:
			this.cMBC2 = true;
			MBCType = "MBC2";
			break;
		case 0x06:
			this.cMBC2 = true;
			this.cBATT = true;
			MBCType = "MBC2 + BATT";
			break;
		case 0x08:
			this.cSRAM = true;
			MBCType = "ROM + SRAM";
			break;
		case 0x09:
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "ROM + SRAM + BATT";
			break;
		case 0x0B:
			this.cMMMO1 = true;
			MBCType = "MMMO1";
			break;
		case 0x0C:
			this.cMMMO1 = true;
			this.cSRAM = true;
			MBCType = "MMMO1 + SRAM";
			break;
		case 0x0D:
			this.cMMMO1 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MMMO1 + SRAM + BATT";
			break;
		case 0x0F:
			this.cMBC3 = true;
			this.cTIMER = true;
			this.cBATT = true;
			MBCType = "MBC3 + TIMER + BATT";
			break;
		case 0x10:
			this.cMBC3 = true;
			this.cTIMER = true;
			this.cBATT = true;
			this.cSRAM = true;
			MBCType = "MBC3 + TIMER + BATT + SRAM";
			break;
		case 0x11:
			this.cMBC3 = true;
			MBCType = "MBC3";
			break;
		case 0x12:
			this.cMBC3 = true;
			this.cSRAM = true;
			MBCType = "MBC3 + SRAM";
			break;
		case 0x13:
			this.cMBC3 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC3 + SRAM + BATT";
			break;
		case 0x19:
			this.cMBC5 = true;
			MBCType = "MBC5";
			break;
		case 0x1A:
			this.cMBC5 = true;
			this.cSRAM = true;
			MBCType = "MBC5 + SRAM";
			break;
		case 0x1B:
			this.cMBC5 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC5 + SRAM + BATT";
			break;
		case 0x1C:
			this.cRUMBLE = true;
			MBCType = "RUMBLE";
			break;
		case 0x1D:
			this.cRUMBLE = true;
			this.cSRAM = true;
			MBCType = "RUMBLE + SRAM";
			break;
		case 0x1E:
			this.cRUMBLE = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "RUMBLE + SRAM + BATT";
			break;
		case 0x1F:
			this.cCamera = true;
			MBCType = "GameBoy Camera";
			break;
		case 0x22:
			this.cMBC7 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC7 + SRAM + BATT";
			break;
		case 0xFD:
			this.cTAMA5 = true;
			MBCType = "TAMA5";
			break;
		case 0xFE:
			this.cHuC3 = true;
			MBCType = "HuC3";
			break;
		case 0xFF:
			this.cHuC1 = true;
			MBCType = "HuC1";
			break;
		default:
			MBCType = "Unknown";
			cout("Cartridge type is unknown.", 2);
			pause();
	}
	cout("Cartridge Type: " + MBCType + ".", 0);
	this.numROMBanks = this.ROMBanks[this.ROM[0x148]];
	cout(this.numROMBanks + " ROM banks.", 0);
	switch (this.RAMBanks[this.ROM[0x149]]) {
		case 0:
			cout("No RAM banking requested for allocation or MBC is of type 2.", 0);
			break;
		case 2:
			cout("1 RAM bank requested for allocation.", 0);
			break;
		case 3:
			cout("4 RAM banks requested for allocation.", 0);
			break;
		case 4:
			cout("16 RAM banks requested for allocation.", 0);
			break;
		default:
			cout("RAM bank amount requested is unknown, will use maximum allowed by specified MBC type.", 0);
	}
	if (!this.usedBootROM) {
		switch (this.ROM[0x143]) {
			case 0x00:
				this.cGBC = false;
				cout("Only GB mode detected.", 0);
				break;
			case 0x32:
				if (!settings[2] && this.name + this.gameCode + this.ROM[0x143] == "Game and Watch 50") {
					this.cGBC = true;
					cout("Created a boot exception for Game and Watch Gallery 2 (GBC ID byte is wrong on the cartridge).", 1);
				}
				else {
					this.cGBC = false;
				}
				break;
			case 0x80:
				this.cGBC = !settings[2];
				cout("GB and GBC mode detected.", 0);
				break;
			case 0xC0:
				this.cGBC = true;
				cout("Only GBC mode detected.", 0);
				break;
			default:
				this.cGBC = false;
				cout("Unknown GameBoy game type code #" + this.ROM[0x143] + ", defaulting to GB mode (Old games don't have a type code).", 1);
		}
		this.inBootstrap = false;
		this.setupRAM();
		this.initSkipBootstrap();
	}
	else {
		this.cGBC = this.usedGBCBootROM;
		this.setupRAM();
		this.initBootstrap();
	}
	this.initializeModeSpecificArrays();
	var cOldLicense = this.ROM[0x14B];
	var cNewLicense = (this.ROM[0x144] & 0xFF00) | (this.ROM[0x145] & 0xFF);
	if (cOldLicense != 0x33) {
		cout("Old style license code: " + cOldLicense, 0);
	}
	else {
		cout("New style license code: " + cNewLicense, 0);
	}
	this.ROMImage = "";
}
GameBoyCore.prototype.disableBootROM = function () {
	for (var index = 0; index < 0x100; ++index) {
		this.memory[index] = this.ROM[index];
	}
	if (this.usedGBCBootROM) {
		for (index = 0x200; index < 0x900; ++index) {
			this.memory[index] = this.ROM[index];
		}
		if (!this.cGBC) {
			this.GBCtoGBModeAdjust();
		}
		else {
			this.recompileBootIOWriteHandling();
		}
	}
	else {
		this.recompileBootIOWriteHandling();
	}
}
GameBoyCore.prototype.initializeTiming = function () {
	this.clocksPerSecond = this.emulatorSpeed * 0x400000;
	this.baseCPUCyclesPerIteration = this.clocksPerSecond / 1000 * settings[6];
	this.CPUCyclesTotalRoundoff = this.baseCPUCyclesPerIteration % 4;
	this.CPUCyclesTotalBase = this.CPUCyclesTotal = (this.baseCPUCyclesPerIteration - this.CPUCyclesTotalRoundoff) | 0;
	this.CPUCyclesTotalCurrent = 0;
}
GameBoyCore.prototype.setSpeed = function (speed) {
	this.emulatorSpeed = speed;
	this.initializeTiming();
	if (this.audioHandle) {
		this.initSound();
	}
}
GameBoyCore.prototype.setupRAM = function () {
	if (this.cMBC2) {
		this.numRAMBanks = 1 / 16;
	}
	else if (this.cMBC1 || this.cRUMBLE || this.cMBC3 || this.cHuC3) {
		this.numRAMBanks = 4;
	}
	else if (this.cMBC5) {
		this.numRAMBanks = 16;
	}
	else if (this.cSRAM) {
		this.numRAMBanks = 1;
	}
	if (this.numRAMBanks > 0) {
		if (!this.MBCRAMUtilized()) {
			this.MBCRAMBanksEnabled = true;
		}
		var MBCRam = (typeof this.openMBC == "function") ? this.openMBC(this.name) : [];
		if (MBCRam.length > 0) {
			this.MBCRam = this.toTypedArray(MBCRam, "uint8");
		}
		else {
			this.MBCRam = this.getTypedArray(this.numRAMBanks * 0x2000, 0, "uint8");
		}
	}
	cout("Actual bytes of MBC RAM allocated: " + (this.numRAMBanks * 0x2000), 0);
	this.returnFromRTCState();
	if (this.cGBC) {
		this.VRAM = this.getTypedArray(0x2000, 0, "uint8");
		this.GBCMemory = this.getTypedArray(0x7000, 0, "uint8");
	}
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
}
GameBoyCore.prototype.MBCRAMUtilized = function () {
	return this.cMBC1 || this.cMBC2 || this.cMBC3 || this.cMBC5 || this.cMBC7 || this.cRUMBLE;
}
GameBoyCore.prototype.recomputeDimension = function () {
	initNewCanvas();
	this.onscreenWidth = this.canvas.width;
	this.onscreenHeight = this.canvas.height;
	if (window && window.mozRequestAnimationFrame || (navigator.userAgent.toLowerCase().indexOf("gecko") != -1 && navigator.userAgent.toLowerCase().indexOf("like gecko") == -1)) {
		this.canvas.width = this.onscreenWidth = (!settings[12]) ? 160 : this.canvas.width;
		this.canvas.height = this.onscreenHeight = (!settings[12]) ? 144 : this.canvas.height;
	}
	else {
		this.onscreenWidth = this.canvas.width;
		this.onscreenHeight = this.canvas.height;
	}
	this.offscreenWidth = (!settings[12]) ? 160 : this.canvas.width;
	this.offscreenHeight = (!settings[12]) ? 144 : this.canvas.height;
	this.offscreenRGBCount = this.offscreenWidth * this.offscreenHeight * 4;
}
GameBoyCore.prototype.initLCD = function () {
	this.recomputeDimension();
	if (this.offscreenRGBCount != 92160) {
		this.compileResizeFrameBufferFunction();
	}
	else {
		this.resizer = null;
	}
	try {
		this.canvasOffscreen = document.createElement("canvas");
		this.canvasOffscreen.width = this.offscreenWidth;
		this.canvasOffscreen.height = this.offscreenHeight;
		this.drawContextOffscreen = this.canvasOffscreen.getContext("2d");
		this.drawContextOnscreen = this.canvas.getContext("2d");
		this.canvas.setAttribute("style", (this.canvas.getAttribute("style") || "") + "; image-rendering: " + ((settings[13]) ? "auto" : "-webkit-optimize-contrast") + ";" +
			"image-rendering: " + ((settings[13]) ? "optimizeQuality" : "-o-crisp-edges") + ";" +
			"image-rendering: " + ((settings[13]) ? "optimizeQuality" : "-moz-crisp-edges") + ";" +
			"-ms-interpolation-mode: " + ((settings[13]) ? "bicubic" : "nearest-neighbor") + ";");
		this.drawContextOffscreen.webkitImageSmoothingEnabled = settings[13];
		this.drawContextOffscreen.mozImageSmoothingEnabled = settings[13];
		this.drawContextOnscreen.webkitImageSmoothingEnabled = settings[13];
		this.drawContextOnscreen.mozImageSmoothingEnabled = settings[13];
		try {
			this.canvasBuffer = this.drawContextOffscreen.createImageData(this.offscreenWidth, this.offscreenHeight);
		}
		catch (error) {
			cout("Falling back to the getImageData initialization (Error \"" + error.message + "\").", 1);
			this.canvasBuffer = this.drawContextOffscreen.getImageData(0, 0, this.offscreenWidth, this.offscreenHeight);
		}
		var index = this.offscreenRGBCount;
		while (index > 0) {
			this.canvasBuffer.data[index -= 4] = 0xF8;
			this.canvasBuffer.data[index + 1] = 0xF8;
			this.canvasBuffer.data[index + 2] = 0xF8;
			this.canvasBuffer.data[index + 3] = 0xFF;
		}
		this.graphicsBlit();
		this.canvas.style.visibility = "visible";
		if (this.swizzledFrame == null) {
			this.swizzledFrame = this.getTypedArray(69120, 0xFF, "uint8");
		}
		this.drewFrame = true;
		this.requestDraw();
	}
	catch (error) {
		throw (new Error("HTML5 Canvas support required: " + error.message + "file: " + error.fileName + ", line: " + error.lineNumber));
	}
}
GameBoyCore.prototype.graphicsBlit = function () {
	if (this.offscreenWidth == this.onscreenWidth && this.offscreenHeight == this.onscreenHeight) {
		this.drawContextOnscreen.putImageData(this.canvasBuffer, 0, 0);
	}
	else {
		this.drawContextOffscreen.putImageData(this.canvasBuffer, 0, 0);
		this.drawContextOnscreen.drawImage(this.canvasOffscreen, 0, 0, this.onscreenWidth, this.onscreenHeight);
	}
}
GameBoyCore.prototype.JoyPadEvent = function (key, down) {
	if (down) {
		this.JoyPad &= 0xFF ^ (1 << key);
		if (!this.cGBC && (!this.usedBootROM || !this.usedGBCBootROM)) {
			this.interruptsRequested |= 0x10;
			this.remainingClocks = 0;
			this.checkIRQMatching();
		}
	}
	else {
		this.JoyPad |= (1 << key);
	}
	this.memory[0xFF00] = (this.memory[0xFF00] & 0x30) + ((((this.memory[0xFF00] & 0x20) == 0) ? (this.JoyPad >> 4) : 0xF) & (((this.memory[0xFF00] & 0x10) == 0) ? (this.JoyPad & 0xF) : 0xF));
	this.CPUStopped = false;
}
GameBoyCore.prototype.GyroEvent = function (x, y) {
	x *= -100;
	x += 2047;
	this.highX = x >> 8;
	this.lowX = x & 0xFF;
	y *= -100;
	y += 2047;
	this.highY = y >> 8;
	this.lowY = y & 0xFF;
}
GameBoyCore.prototype.initSound = function () {
	this.audioResamplerFirstPassFactor = Math.max(Math.min(Math.floor(this.clocksPerSecond / 44100), Math.floor(0xFFFF / 0x1E0)), 1);
	this.downSampleInputDivider = 1 / (this.audioResamplerFirstPassFactor * 0xF0);
	if (settings[0]) {
		this.audioHandle = new XAudioServer(2, this.clocksPerSecond / this.audioResamplerFirstPassFactor, 0, Math.max(this.baseCPUCyclesPerIteration * settings[8] / this.audioResamplerFirstPassFactor, 8192) << 1, null, settings[3], function () {
			settings[0] = false;
		});
		this.initAudioBuffer();
	}
	else if (this.audioHandle) {
		this.audioHandle.changeVolume(0);
	}
}
GameBoyCore.prototype.changeVolume = function () {
	if (settings[0] && this.audioHandle) {
		this.audioHandle.changeVolume(settings[3]);
	}
}
GameBoyCore.prototype.initAudioBuffer = function () {
	this.audioIndex = 0;
	this.audioDestinationPosition = 0;
	this.downsampleInput = 0;
	this.bufferContainAmount = Math.max(this.baseCPUCyclesPerIteration * settings[7] / this.audioResamplerFirstPassFactor, 4096) << 1;
	this.numSamplesTotal = (this.baseCPUCyclesPerIteration / this.audioResamplerFirstPassFactor) << 1;
	this.audioBuffer = this.getTypedArray(this.numSamplesTotal, 0, "float32");
}
GameBoyCore.prototype.intializeWhiteNoise = function () {
	var randomFactor = 1;
	this.LSFR15Table = this.getTypedArray(0x80000, 0, "int8");
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
	this.LSFR7Table = this.getTypedArray(0x800, 0, "int8");
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
	this.noiseSampleTable = this.LSFR15Table;
}
GameBoyCore.prototype.audioUnderrunAdjustment = function () {
	if (settings[0]) {
		var underrunAmount = this.audioHandle.remainingBuffer();
		if (typeof underrunAmount == "number") {
			underrunAmount = this.bufferContainAmount - Math.max(underrunAmount, 0);
			if (underrunAmount > 0) {
				this.recalculateIterationClockLimitForAudio((underrunAmount >> 1) * this.audioResamplerFirstPassFactor);
			}
		}
	}
}
GameBoyCore.prototype.initializeAudioStartState = function () {
	this.channel1FrequencyTracker = 0x2000;
	this.channel1DutyTracker = 0;
	this.channel1CachedDuty = this.dutyLookup[2];
	this.channel1totalLength = 0;
	this.channel1envelopeVolume = 0;
	this.channel1envelopeType = false;
	this.channel1envelopeSweeps = 0;
	this.channel1envelopeSweepsLast = 0;
	this.channel1consecutive = true;
	this.channel1frequency = 0;
	this.channel1SweepFault = false;
	this.channel1ShadowFrequency = 0;
	this.channel1timeSweep = 1;
	this.channel1lastTimeSweep = 0;
	this.channel1Swept = false;
	this.channel1frequencySweepDivider = 0;
	this.channel1decreaseSweep = false;
	this.channel2FrequencyTracker = 0x2000;
	this.channel2DutyTracker = 0;
	this.channel2CachedDuty = this.dutyLookup[2];
	this.channel2totalLength = 0;
	this.channel2envelopeVolume = 0;
	this.channel2envelopeType = false;
	this.channel2envelopeSweeps = 0;
	this.channel2envelopeSweepsLast = 0;
	this.channel2consecutive = true;
	this.channel2frequency = 0;
	this.channel3canPlay = false;
	this.channel3totalLength = 0;
	this.channel3patternType = 4;
	this.channel3frequency = 0;
	this.channel3consecutive = true;
	this.channel3Counter = 0x800;
	this.channel4FrequencyPeriod = 8;
	this.channel4totalLength = 0;
	this.channel4envelopeVolume = 0;
	this.channel4currentVolume = 0;
	this.channel4envelopeType = false;
	this.channel4envelopeSweeps = 0;
	this.channel4envelopeSweepsLast = 0;
	this.channel4consecutive = true;
	this.channel4BitRange = 0x7FFF;
	this.noiseSampleTable = this.LSFR15Table;
	this.channel4VolumeShifter = 15;
	this.channel1FrequencyCounter = 0x2000;
	this.channel2FrequencyCounter = 0x2000;
	this.channel3Counter = 0x800;
	this.channel3FrequencyPeriod = 0x800;
	this.channel3lastSampleLookup = 0;
	this.channel4lastSampleLookup = 0;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.mixerOutputCache = 0;
	this.sequencerClocks = 0x2000;
	this.sequencePosition = 0;
	this.channel4FrequencyPeriod = 8;
	this.channel4Counter = 8;
	this.cachedChannel3Sample = 0;
	this.cachedChannel4Sample = 0;
	this.channel1Enabled = false;
	this.channel2Enabled = false;
	this.channel3Enabled = false;
	this.channel4Enabled = false;
	this.channel1canPlay = false;
	this.channel2canPlay = false;
	this.channel4canPlay = false;
	this.audioClocksUntilNextEvent = 1;
	this.audioClocksUntilNextEventCounter = 1;
	this.channel1OutputLevelCache();
	this.channel2OutputLevelCache();
	this.channel3OutputLevelCache();
	this.channel4OutputLevelCache();
	this.noiseSampleTable = this.LSFR15Table;
}
GameBoyCore.prototype.outputAudio = function () {
	this.audioBuffer[this.audioDestinationPosition++] = (this.downsampleInput >>> 16) * this.downSampleInputDivider - 1;
	this.audioBuffer[this.audioDestinationPosition++] = (this.downsampleInput & 0xFFFF) * this.downSampleInputDivider - 1;
	if (this.audioDestinationPosition == this.numSamplesTotal) {
		this.audioHandle.writeAudioNoCallback(this.audioBuffer);
		this.audioDestinationPosition = 0;
	}
	this.downsampleInput = 0;
}
GameBoyCore.prototype.generateAudio = function (numSamples) {
	var multiplier = 0;
	if (this.soundMasterEnabled && !this.CPUStopped) {
		for (var clockUpTo = 0; numSamples > 0;) {
			clockUpTo = Math.min(this.audioClocksUntilNextEventCounter, this.sequencerClocks, numSamples);
			this.audioClocksUntilNextEventCounter -= clockUpTo;
			this.sequencerClocks -= clockUpTo;
			numSamples -= clockUpTo;
			while (clockUpTo > 0) {
				multiplier = Math.min(clockUpTo, this.audioResamplerFirstPassFactor - this.audioIndex);
				clockUpTo -= multiplier;
				this.audioIndex += multiplier;
				this.downsampleInput += this.mixerOutputCache * multiplier;
				if (this.audioIndex == this.audioResamplerFirstPassFactor) {
					this.audioIndex = 0;
					this.outputAudio();
				}
			}
			if (this.sequencerClocks == 0) {
				this.audioComputeSequencer();
				this.sequencerClocks = 0x2000;
			}
			if (this.audioClocksUntilNextEventCounter == 0) {
				this.computeAudioChannels();
			}
		}
	}
	else {
		while (numSamples > 0) {
			multiplier = Math.min(numSamples, this.audioResamplerFirstPassFactor - this.audioIndex);
			numSamples -= multiplier;
			this.audioIndex += multiplier;
			if (this.audioIndex == this.audioResamplerFirstPassFactor) {
				this.audioIndex = 0;
				this.outputAudio();
			}
		}
	}
}
GameBoyCore.prototype.generateAudioFake = function (numSamples) {
	if (this.soundMasterEnabled && !this.CPUStopped) {
		for (var clockUpTo = 0; numSamples > 0;) {
			clockUpTo = Math.min(this.audioClocksUntilNextEventCounter, this.sequencerClocks, numSamples);
			this.audioClocksUntilNextEventCounter -= clockUpTo;
			this.sequencerClocks -= clockUpTo;
			numSamples -= clockUpTo;
			if (this.sequencerClocks == 0) {
				this.audioComputeSequencer();
				this.sequencerClocks = 0x2000;
			}
			if (this.audioClocksUntilNextEventCounter == 0) {
				this.computeAudioChannels();
			}
		}
	}
}
GameBoyCore.prototype.audioJIT = function () {
	if (settings[0]) {
		this.generateAudio(this.audioTicks);
	}
	else {
		this.generateAudioFake(this.audioTicks);
	}
	this.audioTicks = 0;
}
GameBoyCore.prototype.audioComputeSequencer = function () {
	switch (this.sequencePosition++) {
		case 0:
			this.clockAudioLength();
			break;
		case 2:
			this.clockAudioLength();
			this.clockAudioSweep();
			break;
		case 4:
			this.clockAudioLength();
			break;
		case 6:
			this.clockAudioLength();
			this.clockAudioSweep();
			break;
		case 7:
			this.clockAudioEnvelope();
			this.sequencePosition = 0;
	}
}
GameBoyCore.prototype.clockAudioLength = function () {
	if (this.channel1totalLength > 1) {
		--this.channel1totalLength;
	}
	else if (this.channel1totalLength == 1) {
		this.channel1totalLength = 0;
		this.channel1EnableCheck();
		this.memory[0xFF26] &= 0xFE;
	}
	if (this.channel2totalLength > 1) {
		--this.channel2totalLength;
	}
	else if (this.channel2totalLength == 1) {
		this.channel2totalLength = 0;
		this.channel2EnableCheck();
		this.memory[0xFF26] &= 0xFD;
	}
	if (this.channel3totalLength > 1) {
		--this.channel3totalLength;
	}
	else if (this.channel3totalLength == 1) {
		this.channel3totalLength = 0;
		this.channel3EnableCheck();
		this.memory[0xFF26] &= 0xFB;
	}
	if (this.channel4totalLength > 1) {
		--this.channel4totalLength;
	}
	else if (this.channel4totalLength == 1) {
		this.channel4totalLength = 0;
		this.channel4EnableCheck();
		this.memory[0xFF26] &= 0xF7;
	}
}
GameBoyCore.prototype.clockAudioSweep = function () {
	if (!this.channel1SweepFault && this.channel1timeSweep > 0) {
		if (--this.channel1timeSweep == 0) {
			this.runAudioSweep();
		}
	}
}
GameBoyCore.prototype.runAudioSweep = function () {
	if (this.channel1lastTimeSweep > 0) {
		if (this.channel1frequencySweepDivider > 0) {
			this.channel1Swept = true;
			if (this.channel1decreaseSweep) {
				this.channel1ShadowFrequency -= this.channel1ShadowFrequency >> this.channel1frequencySweepDivider;
				this.channel1frequency = this.channel1ShadowFrequency & 0x7FF;
				this.channel1FrequencyTracker = (0x800 - this.channel1frequency) << 2;
			}
			else {
				this.channel1ShadowFrequency += this.channel1ShadowFrequency >> this.channel1frequencySweepDivider;
				this.channel1frequency = this.channel1ShadowFrequency;
				if (this.channel1ShadowFrequency <= 0x7FF) {
					this.channel1FrequencyTracker = (0x800 - this.channel1frequency) << 2;
					if ((this.channel1ShadowFrequency + (this.channel1ShadowFrequency >> this.channel1frequencySweepDivider)) > 0x7FF) {
						this.channel1SweepFault = true;
						this.channel1EnableCheck();
						this.memory[0xFF26] &= 0xFE;
					}
				}
				else {
					this.channel1frequency &= 0x7FF;
					this.channel1SweepFault = true;
					this.channel1EnableCheck();
					this.memory[0xFF26] &= 0xFE;
				}
			}
			this.channel1timeSweep = this.channel1lastTimeSweep;
		}
		else {
			this.channel1SweepFault = true;
			this.channel1EnableCheck();
		}
	}
}
GameBoyCore.prototype.channel1AudioSweepPerformDummy = function () {
	if (this.channel1frequencySweepDivider > 0) {
		if (!this.channel1decreaseSweep) {
			var channel1ShadowFrequency = this.channel1ShadowFrequency + (this.channel1ShadowFrequency >> this.channel1frequencySweepDivider);
			if (channel1ShadowFrequency <= 0x7FF) {
				if ((channel1ShadowFrequency + (channel1ShadowFrequency >> this.channel1frequencySweepDivider)) > 0x7FF) {
					this.channel1SweepFault = true;
					this.channel1EnableCheck();
					this.memory[0xFF26] &= 0xFE;
				}
			}
			else {
				this.channel1SweepFault = true;
				this.channel1EnableCheck();
				this.memory[0xFF26] &= 0xFE;
			}
		}
	}
}
GameBoyCore.prototype.clockAudioEnvelope = function () {
	if (this.channel1envelopeSweepsLast > -1) {
		if (this.channel1envelopeSweeps > 0) {
			--this.channel1envelopeSweeps;
		}
		else {
			if (!this.channel1envelopeType) {
				if (this.channel1envelopeVolume > 0) {
					--this.channel1envelopeVolume;
					this.channel1envelopeSweeps = this.channel1envelopeSweepsLast;
					this.channel1OutputLevelCache();
				}
				else {
					this.channel1envelopeSweepsLast = -1;
				}
			}
			else if (this.channel1envelopeVolume < 0xF) {
				++this.channel1envelopeVolume;
				this.channel1envelopeSweeps = this.channel1envelopeSweepsLast;
				this.channel1OutputLevelCache();
			}
			else {
				this.channel1envelopeSweepsLast = -1;
			}
		}
	}
	if (this.channel2envelopeSweepsLast > -1) {
		if (this.channel2envelopeSweeps > 0) {
			--this.channel2envelopeSweeps;
		}
		else {
			if (!this.channel2envelopeType) {
				if (this.channel2envelopeVolume > 0) {
					--this.channel2envelopeVolume;
					this.channel2envelopeSweeps = this.channel2envelopeSweepsLast;
					this.channel2OutputLevelCache();
				}
				else {
					this.channel2envelopeSweepsLast = -1;
				}
			}
			else if (this.channel2envelopeVolume < 0xF) {
				++this.channel2envelopeVolume;
				this.channel2envelopeSweeps = this.channel2envelopeSweepsLast;
				this.channel2OutputLevelCache();
			}
			else {
				this.channel2envelopeSweepsLast = -1;
			}
		}
	}
	if (this.channel4envelopeSweepsLast > -1) {
		if (this.channel4envelopeSweeps > 0) {
			--this.channel4envelopeSweeps;
		}
		else {
			if (!this.channel4envelopeType) {
				if (this.channel4envelopeVolume > 0) {
					this.channel4currentVolume = --this.channel4envelopeVolume << this.channel4VolumeShifter;
					this.channel4envelopeSweeps = this.channel4envelopeSweepsLast;
					this.channel4UpdateCache();
				}
				else {
					this.channel4envelopeSweepsLast = -1;
				}
			}
			else if (this.channel4envelopeVolume < 0xF) {
				this.channel4currentVolume = ++this.channel4envelopeVolume << this.channel4VolumeShifter;
				this.channel4envelopeSweeps = this.channel4envelopeSweepsLast;
				this.channel4UpdateCache();
			}
			else {
				this.channel4envelopeSweepsLast = -1;
			}
		}
	}
}
GameBoyCore.prototype.computeAudioChannels = function () {
	this.channel1FrequencyCounter -= this.audioClocksUntilNextEvent;
	this.channel2FrequencyCounter -= this.audioClocksUntilNextEvent;
	this.channel3Counter -= this.audioClocksUntilNextEvent;
	this.channel4Counter -= this.audioClocksUntilNextEvent;
	if (this.channel1FrequencyCounter == 0) {
		this.channel1FrequencyCounter = this.channel1FrequencyTracker;
		this.channel1DutyTracker = (this.channel1DutyTracker + 1) & 0x7;
		this.channel1OutputLevelTrimaryCache();
	}
	if (this.channel2FrequencyCounter == 0) {
		this.channel2FrequencyCounter = this.channel2FrequencyTracker;
		this.channel2DutyTracker = (this.channel2DutyTracker + 1) & 0x7;
		this.channel2OutputLevelTrimaryCache();
	}
	if (this.channel3Counter == 0) {
		if (this.channel3canPlay) {
			this.channel3lastSampleLookup = (this.channel3lastSampleLookup + 1) & 0x1F;
		}
		this.channel3Counter = this.channel3FrequencyPeriod;
		this.channel3UpdateCache();
	}
	if (this.channel4Counter == 0) {
		this.channel4lastSampleLookup = (this.channel4lastSampleLookup + 1) & this.channel4BitRange;
		this.channel4Counter = this.channel4FrequencyPeriod;
		this.channel4UpdateCache();
	}
	this.audioClocksUntilNextEventCounter = this.audioClocksUntilNextEvent = Math.min(this.channel1FrequencyCounter, this.channel2FrequencyCounter, this.channel3Counter, this.channel4Counter);
}
GameBoyCore.prototype.channel1EnableCheck = function () {
	this.channel1Enabled = ((this.channel1consecutive || this.channel1totalLength > 0) && !this.channel1SweepFault && this.channel1canPlay);
	this.channel1OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel1VolumeEnableCheck = function () {
	this.channel1canPlay = (this.memory[0xFF12] > 7);
	this.channel1EnableCheck();
	this.channel1OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel1OutputLevelCache = function () {
	this.channel1currentSampleLeft = (this.leftChannel1) ? this.channel1envelopeVolume : 0;
	this.channel1currentSampleRight = (this.rightChannel1) ? this.channel1envelopeVolume : 0;
	this.channel1OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel1OutputLevelSecondaryCache = function () {
	if (this.channel1Enabled) {
		this.channel1currentSampleLeftSecondary = this.channel1currentSampleLeft;
		this.channel1currentSampleRightSecondary = this.channel1currentSampleRight;
	}
	else {
		this.channel1currentSampleLeftSecondary = 0;
		this.channel1currentSampleRightSecondary = 0;
	}
	this.channel1OutputLevelTrimaryCache();
}
GameBoyCore.prototype.channel1OutputLevelTrimaryCache = function () {
	if (this.channel1CachedDuty[this.channel1DutyTracker] && settings[14][0]) {
		this.channel1currentSampleLeftTrimary = this.channel1currentSampleLeftSecondary;
		this.channel1currentSampleRightTrimary = this.channel1currentSampleRightSecondary;
	}
	else {
		this.channel1currentSampleLeftTrimary = 0;
		this.channel1currentSampleRightTrimary = 0;
	}
	this.mixerOutputLevelCache();
}
GameBoyCore.prototype.channel2EnableCheck = function () {
	this.channel2Enabled = ((this.channel2consecutive || this.channel2totalLength > 0) && this.channel2canPlay);
	this.channel2OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel2VolumeEnableCheck = function () {
	this.channel2canPlay = (this.memory[0xFF17] > 7);
	this.channel2EnableCheck();
	this.channel2OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel2OutputLevelCache = function () {
	this.channel2currentSampleLeft = (this.leftChannel2) ? this.channel2envelopeVolume : 0;
	this.channel2currentSampleRight = (this.rightChannel2) ? this.channel2envelopeVolume : 0;
	this.channel2OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel2OutputLevelSecondaryCache = function () {
	if (this.channel2Enabled) {
		this.channel2currentSampleLeftSecondary = this.channel2currentSampleLeft;
		this.channel2currentSampleRightSecondary = this.channel2currentSampleRight;
	}
	else {
		this.channel2currentSampleLeftSecondary = 0;
		this.channel2currentSampleRightSecondary = 0;
	}
	this.channel2OutputLevelTrimaryCache();
}
GameBoyCore.prototype.channel2OutputLevelTrimaryCache = function () {
	if (this.channel2CachedDuty[this.channel2DutyTracker] && settings[14][1]) {
		this.channel2currentSampleLeftTrimary = this.channel2currentSampleLeftSecondary;
		this.channel2currentSampleRightTrimary = this.channel2currentSampleRightSecondary;
	}
	else {
		this.channel2currentSampleLeftTrimary = 0;
		this.channel2currentSampleRightTrimary = 0;
	}
	this.mixerOutputLevelCache();
}
GameBoyCore.prototype.channel3EnableCheck = function () {
	this.channel3Enabled = ((this.channel3consecutive || this.channel3totalLength > 0));
	this.channel3OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel3OutputLevelCache = function () {
	this.channel3currentSampleLeft = (this.leftChannel3) ? this.cachedChannel3Sample : 0;
	this.channel3currentSampleRight = (this.rightChannel3) ? this.cachedChannel3Sample : 0;
	this.channel3OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel3OutputLevelSecondaryCache = function () {
	if (this.channel3Enabled && settings[14][2]) {
		this.channel3currentSampleLeftSecondary = this.channel3currentSampleLeft;
		this.channel3currentSampleRightSecondary = this.channel3currentSampleRight;
	}
	else {
		this.channel3currentSampleLeftSecondary = 0;
		this.channel3currentSampleRightSecondary = 0;
	}
	this.mixerOutputLevelCache();
}
GameBoyCore.prototype.channel4EnableCheck = function () {
	this.channel4Enabled = ((this.channel4consecutive || this.channel4totalLength > 0) && this.channel4canPlay);
	this.channel4OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel4VolumeEnableCheck = function () {
	this.channel4canPlay = (this.memory[0xFF21] > 7);
	this.channel4EnableCheck();
	this.channel4OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel4OutputLevelCache = function () {
	this.channel4currentSampleLeft = (this.leftChannel4) ? this.cachedChannel4Sample : 0;
	this.channel4currentSampleRight = (this.rightChannel4) ? this.cachedChannel4Sample : 0;
	this.channel4OutputLevelSecondaryCache();
}
GameBoyCore.prototype.channel4OutputLevelSecondaryCache = function () {
	if (this.channel4Enabled && settings[14][3]) {
		this.channel4currentSampleLeftSecondary = this.channel4currentSampleLeft;
		this.channel4currentSampleRightSecondary = this.channel4currentSampleRight;
	}
	else {
		this.channel4currentSampleLeftSecondary = 0;
		this.channel4currentSampleRightSecondary = 0;
	}
	this.mixerOutputLevelCache();
}
GameBoyCore.prototype.mixerOutputLevelCache = function () {
	this.mixerOutputCache = ((((this.channel1currentSampleLeftTrimary + this.channel2currentSampleLeftTrimary + this.channel3currentSampleLeftSecondary + this.channel4currentSampleLeftSecondary) * this.VinLeftChannelMasterVolume) << 16) |
		((this.channel1currentSampleRightTrimary + this.channel2currentSampleRightTrimary + this.channel3currentSampleRightSecondary + this.channel4currentSampleRightSecondary) * this.VinRightChannelMasterVolume));
}
GameBoyCore.prototype.channel3UpdateCache = function () {
	this.cachedChannel3Sample = this.channel3PCM[this.channel3lastSampleLookup] >> this.channel3patternType;
	this.channel3OutputLevelCache();
}
GameBoyCore.prototype.channel3WriteRAM = function (address, data) {
	if (this.channel3canPlay) {
		this.audioJIT();
	}
	this.memory[0xFF30 | address] = data;
	address <<= 1;
	this.channel3PCM[address] = data >> 4;
	this.channel3PCM[address | 1] = data & 0xF;
}
GameBoyCore.prototype.channel4UpdateCache = function () {
	this.cachedChannel4Sample = this.noiseSampleTable[this.channel4currentVolume | this.channel4lastSampleLookup];
	this.channel4OutputLevelCache();
}
GameBoyCore.prototype.run = function () {
	if ((this.stopEmulator & 2) == 0) {
		if ((this.stopEmulator & 1) == 1) {
			if (!this.CPUStopped) {
				this.stopEmulator = 0;
				this.audioUnderrunAdjustment();
				this.clockUpdate();
				if (!this.halt) {
					this.executeIteration();
				}
				else {
					this.CPUTicks = 0;
					this.calculateHALTPeriod();
					if (this.halt) {
						this.updateCore();
						this.iterationEndRoutine();
					}
					else {
						this.executeIteration();
					}
				}
				this.requestDraw();
			}
			else {
				this.audioUnderrunAdjustment();
				this.audioTicks += this.CPUCyclesTotal;
				this.audioJIT();
				this.stopEmulator |= 1;
			}
		}
		else {
			cout("Iterator restarted a faulted core.", 2);
			pause();
		}
	}
}
GameBoyCore.prototype.executeIteration = function () {
	var opcodeToExecute = 0;
	var timedTicks = 0;
	while (this.stopEmulator == 0) {
		switch (this.IRQEnableDelay) {
			case 1:
				this.IME = true;
				this.checkIRQMatching();
			case 2:
				--this.IRQEnableDelay;
		}
		if (this.IRQLineMatched > 0) {
			this.launchIRQ();
		}
		opcodeToExecute = this.memoryReader[this.programCounter](this, this.programCounter);
		this.programCounter = (this.programCounter + 1) & 0xFFFF;
		if (this.skipPCIncrement) {
			this.programCounter = (this.programCounter - 1) & 0xFFFF;
			this.skipPCIncrement = false;
		}
		this.CPUTicks = this.TICKTable[opcodeToExecute];
		this.OPCODE[opcodeToExecute](this);
		this.LCDTicks += this.CPUTicks >> this.doubleSpeedShifter;
		this.LCDCONTROL[this.actualScanLine](this);
		timedTicks = this.CPUTicks >> this.doubleSpeedShifter;
		this.audioTicks += timedTicks;
		this.emulatorTicks += timedTicks;
		this.DIVTicks += this.CPUTicks;
		if (this.TIMAEnabled) {
			this.timerTicks += this.CPUTicks;
			while (this.timerTicks >= this.TACClocker) {
				this.timerTicks -= this.TACClocker;
				if (++this.memory[0xFF05] == 0x100) {
					this.memory[0xFF05] = this.memory[0xFF06];
					this.interruptsRequested |= 0x4;
					this.checkIRQMatching();
				}
			}
		}
		if (this.serialTimer > 0) {
			this.serialTimer -= this.CPUTicks;
			if (this.serialTimer <= 0) {
				this.interruptsRequested |= 0x8;
				this.checkIRQMatching();
			}
			this.serialShiftTimer -= this.CPUTicks;
			if (this.serialShiftTimer <= 0) {
				this.serialShiftTimer = this.serialShiftTimerAllocated;
				this.memory[0xFF01] = ((this.memory[0xFF01] << 1) & 0xFE) | 0x01;
			}
		}
		if (this.emulatorTicks >= this.CPUCyclesTotal) {
			this.iterationEndRoutine();
		}
	}
}
GameBoyCore.prototype.iterationEndRoutine = function () {
	if ((this.stopEmulator & 0x1) == 0) {
		this.audioJIT();
		this.memory[0xFF04] = (this.memory[0xFF04] + (this.DIVTicks >> 8)) & 0xFF;
		this.DIVTicks &= 0xFF;
		this.stopEmulator |= 1;
		this.emulatorTicks -= this.CPUCyclesTotal;
		this.CPUCyclesTotalCurrent += this.CPUCyclesTotalRoundoff;
		this.recalculateIterationClockLimit();
	}
}
GameBoyCore.prototype.handleSTOP = function () {
	this.CPUStopped = true;
	this.iterationEndRoutine();
	if (this.emulatorTicks < 0) {
		this.audioTicks -= this.emulatorTicks;
		this.audioJIT();
	}
}
GameBoyCore.prototype.recalculateIterationClockLimit = function () {
	var endModulus = this.CPUCyclesTotalCurrent % 4;
	this.CPUCyclesTotal = this.CPUCyclesTotalBase + this.CPUCyclesTotalCurrent - endModulus;
	this.CPUCyclesTotalCurrent = endModulus;
}
GameBoyCore.prototype.recalculateIterationClockLimitForAudio = function (audioClocking) {
	this.CPUCyclesTotal += Math.min((audioClocking >> 2) << 2, this.CPUCyclesTotalBase << 1);
}
GameBoyCore.prototype.scanLineMode2 = function () {
	if (this.STATTracker != 1) {
		if (this.mode2TriggerSTAT) {
			this.interruptsRequested |= 0x2;
			this.checkIRQMatching();
		}
		this.STATTracker = 1;
		this.modeSTAT = 2;
	}
}
GameBoyCore.prototype.scanLineMode3 = function () {
	if (this.modeSTAT != 3) {
		if (this.STATTracker == 0 && this.mode2TriggerSTAT) {
			this.interruptsRequested |= 0x2;
			this.checkIRQMatching();
		}
		this.STATTracker = 1;
		this.modeSTAT = 3;
	}
}
GameBoyCore.prototype.scanLineMode0 = function () {
	if (this.modeSTAT != 0) {
		if (this.STATTracker != 2) {
			if (this.STATTracker == 0) {
				if (this.mode2TriggerSTAT) {
					this.interruptsRequested |= 0x2;
					this.checkIRQMatching();
				}
				this.modeSTAT = 3;
			}
			this.incrementScanLineQueue();
			this.updateSpriteCount(this.actualScanLine);
			this.STATTracker = 2;
		}
		if (this.LCDTicks >= this.spriteCount) {
			if (this.hdmaRunning) {
				this.executeHDMA();
			}
			if (this.mode0TriggerSTAT) {
				this.interruptsRequested |= 0x2;
				this.checkIRQMatching();
			}
			this.STATTracker = 3;
			this.modeSTAT = 0;
		}
	}
}
GameBoyCore.prototype.clocksUntilLYCMatch = function () {
	if (this.memory[0xFF45] != 0) {
		if (this.memory[0xFF45] > this.actualScanLine) {
			return 456 * (this.memory[0xFF45] - this.actualScanLine);
		}
		return 456 * (154 - this.actualScanLine + this.memory[0xFF45]);
	}
	return (456 * ((this.actualScanLine == 153 && this.memory[0xFF44] == 0) ? 154 : (153 - this.actualScanLine))) + 8;
}
GameBoyCore.prototype.clocksUntilMode0 = function () {
	switch (this.modeSTAT) {
		case 0:
			if (this.actualScanLine == 143) {
				this.updateSpriteCount(0);
				return this.spriteCount + 5016;
			}
			this.updateSpriteCount(this.actualScanLine + 1);
			return this.spriteCount + 456;
		case 2:
		case 3:
			this.updateSpriteCount(this.actualScanLine);
			return this.spriteCount;
		case 1:
			this.updateSpriteCount(0);
			return this.spriteCount + (456 * (154 - this.actualScanLine));
	}
}
GameBoyCore.prototype.updateSpriteCount = function (line) {
	this.spriteCount = 252;
	if (this.cGBC && this.gfxSpriteShow) {
		var lineAdjusted = line + 0x10;
		var yoffset = 0;
		var yCap = (this.gfxSpriteNormalHeight) ? 0x8 : 0x10;
		for (var OAMAddress = 0xFE00; OAMAddress < 0xFEA0 && this.spriteCount < 312; OAMAddress += 4) {
			yoffset = lineAdjusted - this.memory[OAMAddress];
			if (yoffset > -1 && yoffset < yCap) {
				this.spriteCount += 6;
			}
		}
	}
}
GameBoyCore.prototype.matchLYC = function () {
	if (this.memory[0xFF44] == this.memory[0xFF45]) {
		this.memory[0xFF41] |= 0x04;
		if (this.LYCMatchTriggerSTAT) {
			this.interruptsRequested |= 0x2;
			this.checkIRQMatching();
		}
	}
	else {
		this.memory[0xFF41] &= 0x7B;
	}
}
GameBoyCore.prototype.updateCore = function () {
	this.LCDTicks += this.CPUTicks >> this.doubleSpeedShifter;
	this.LCDCONTROL[this.actualScanLine](this);
	var timedTicks = this.CPUTicks >> this.doubleSpeedShifter;
	this.audioTicks += timedTicks;
	this.emulatorTicks += timedTicks;
	this.DIVTicks += this.CPUTicks;
	if (this.TIMAEnabled) {
		this.timerTicks += this.CPUTicks;
		while (this.timerTicks >= this.TACClocker) {
			this.timerTicks -= this.TACClocker;
			if (++this.memory[0xFF05] == 0x100) {
				this.memory[0xFF05] = this.memory[0xFF06];
				this.interruptsRequested |= 0x4;
				this.checkIRQMatching();
			}
		}
	}
	if (this.serialTimer > 0) {
		this.serialTimer -= this.CPUTicks;
		if (this.serialTimer <= 0) {
			this.interruptsRequested |= 0x8;
			this.checkIRQMatching();
		}
		this.serialShiftTimer -= this.CPUTicks;
		if (this.serialShiftTimer <= 0) {
			this.serialShiftTimer = this.serialShiftTimerAllocated;
			this.memory[0xFF01] = ((this.memory[0xFF01] << 1) & 0xFE) | 0x01;
		}
	}
}
GameBoyCore.prototype.updateCoreFull = function () {
	this.updateCore();
	if (this.emulatorTicks >= this.CPUCyclesTotal) {
		this.iterationEndRoutine();
	}
}
GameBoyCore.prototype.initializeLCDController = function () {
	var line = 0;
	while (line < 154) {
		if (line < 143) {
			this.LINECONTROL[line] = function (parentObj) {
				if (parentObj.LCDTicks < 80) {
					parentObj.scanLineMode2();
				}
				else if (parentObj.LCDTicks < 252) {
					parentObj.scanLineMode3();
				}
				else if (parentObj.LCDTicks < 456) {
					parentObj.scanLineMode0();
				}
				else {
					parentObj.LCDTicks -= 456;
					if (parentObj.STATTracker != 3) {
						if (parentObj.STATTracker != 2) {
							if (parentObj.STATTracker == 0 && parentObj.mode2TriggerSTAT) {
								parentObj.interruptsRequested |= 0x2;
							}
							parentObj.incrementScanLineQueue();
						}
						if (parentObj.hdmaRunning) {
							parentObj.executeHDMA();
						}
						if (parentObj.mode0TriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					if (parentObj.actualScanLine == parentObj.memory[0xFF45]) {
						parentObj.memory[0xFF41] |= 0x04;
						if (parentObj.LYCMatchTriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					else {
						parentObj.memory[0xFF41] &= 0x7B;
					}
					parentObj.checkIRQMatching();
					parentObj.STATTracker = 0;
					parentObj.modeSTAT = 2;
					parentObj.LINECONTROL[parentObj.actualScanLine](parentObj);
				}
			}
		}
		else if (line == 143) {
			this.LINECONTROL[143] = function (parentObj) {
				if (parentObj.LCDTicks < 80) {
					parentObj.scanLineMode2();
				}
				else if (parentObj.LCDTicks < 252) {
					parentObj.scanLineMode3();
				}
				else if (parentObj.LCDTicks < 456) {
					parentObj.scanLineMode0();
				}
				else {
					parentObj.LCDTicks -= 456;
					if (parentObj.STATTracker != 3) {
						if (parentObj.STATTracker != 2) {
							if (parentObj.STATTracker == 0 && parentObj.mode2TriggerSTAT) {
								parentObj.interruptsRequested |= 0x2;
							}
							parentObj.incrementScanLineQueue();
						}
						if (parentObj.hdmaRunning) {
							parentObj.executeHDMA();
						}
						if (parentObj.mode0TriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					parentObj.actualScanLine = parentObj.memory[0xFF44] = 144;
					if (parentObj.memory[0xFF45] == 144) {
						parentObj.memory[0xFF41] |= 0x04;
						if (parentObj.LYCMatchTriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					else {
						parentObj.memory[0xFF41] &= 0x7B;
					}
					parentObj.STATTracker = 0;
					parentObj.modeSTAT = 1;
					parentObj.interruptsRequested |= (parentObj.mode1TriggerSTAT) ? 0x3 : 0x1;
					parentObj.checkIRQMatching();
					if (parentObj.drewBlank == 0) {
						if (parentObj.totalLinesPassed < 144 || (parentObj.totalLinesPassed == 144 && parentObj.midScanlineOffset > -1)) {
							parentObj.graphicsJITVBlank();
							parentObj.prepareFrame();
						}
					}
					else {
						--parentObj.drewBlank;
					}
					parentObj.LINECONTROL[144](parentObj);
				}
			}
		}
		else if (line < 153) {
			this.LINECONTROL[line] = function (parentObj) {
				if (parentObj.LCDTicks >= 456) {
					parentObj.LCDTicks -= 456;
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					if (parentObj.actualScanLine == parentObj.memory[0xFF45]) {
						parentObj.memory[0xFF41] |= 0x04;
						if (parentObj.LYCMatchTriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
							parentObj.checkIRQMatching();
						}
					}
					else {
						parentObj.memory[0xFF41] &= 0x7B;
					}
					parentObj.LINECONTROL[parentObj.actualScanLine](parentObj);
				}
			}
		}
		else {
			this.LINECONTROL[153] = function (parentObj) {
				if (parentObj.LCDTicks >= 8) {
					if (parentObj.STATTracker != 4 && parentObj.memory[0xFF44] == 153) {
						parentObj.memory[0xFF44] = 0;
						if (parentObj.memory[0xFF45] == 0) {
							parentObj.memory[0xFF41] |= 0x04;
							if (parentObj.LYCMatchTriggerSTAT) {
								parentObj.interruptsRequested |= 0x2;
								parentObj.checkIRQMatching();
							}
						}
						else {
							parentObj.memory[0xFF41] &= 0x7B;
						}
						parentObj.STATTracker = 4;
					}
					if (parentObj.LCDTicks >= 456) {
						parentObj.LCDTicks -= 456;
						parentObj.STATTracker = parentObj.actualScanLine = 0;
						parentObj.LINECONTROL[0](parentObj);
					}
				}
			}
		}
		++line;
	}
}
GameBoyCore.prototype.DisplayShowOff = function () {
	if (this.drewBlank == 0) {
		this.clearFrameBuffer();
		this.drewFrame = true;
	}
	this.drewBlank = 2;
}
GameBoyCore.prototype.executeHDMA = function () {
	this.DMAWrite(1);
	if (this.halt) {
		if ((this.LCDTicks - this.spriteCount) < ((4 >> this.doubleSpeedShifter) | 0x20)) {
			this.CPUTicks = 4 + ((0x20 + this.spriteCount) << this.doubleSpeedShifter);
			this.LCDTicks = this.spriteCount + ((4 >> this.doubleSpeedShifter) | 0x20);
		}
	}
	else {
		this.LCDTicks += (4 >> this.doubleSpeedShifter) | 0x20;
	}
	if (this.memory[0xFF55] == 0) {
		this.hdmaRunning = false;
		this.memory[0xFF55] = 0xFF;
	}
	else {
		--this.memory[0xFF55];
	}
}
GameBoyCore.prototype.clockUpdate = function () {
	if (this.cTIMER) {
		var dateObj = new Date();
		var newTime = dateObj.getTime();
		var timeElapsed = newTime - this.lastIteration;
		this.lastIteration = newTime;
		if (this.cTIMER && !this.RTCHALT) {
			this.RTCSeconds += timeElapsed / 1000;
			while (this.RTCSeconds >= 60) {
				this.RTCSeconds -= 60;
				++this.RTCMinutes;
				if (this.RTCMinutes >= 60) {
					this.RTCMinutes -= 60;
					++this.RTCHours;
					if (this.RTCHours >= 24) {
						this.RTCHours -= 24
						++this.RTCDays;
						if (this.RTCDays >= 512) {
							this.RTCDays -= 512;
							this.RTCDayOverFlow = true;
						}
					}
				}
			}
		}
	}
}
GameBoyCore.prototype.prepareFrame = function () {
	this.swizzleFrameBuffer();
	this.drewFrame = true;
}
GameBoyCore.prototype.requestDraw = function () {
	if (this.drewFrame) {
		this.dispatchDraw();
	}
}
GameBoyCore.prototype.dispatchDraw = function () {
	if (this.offscreenRGBCount > 0) {
		if (this.offscreenRGBCount == 92160) {
			this.processDraw(this.swizzledFrame);
		}
		else {
			this.resizeFrameBuffer();
		}
	}
}
GameBoyCore.prototype.processDraw = function (frameBuffer) {
	var canvasRGBALength = this.offscreenRGBCount;
	var canvasData = this.canvasBuffer.data;
	var bufferIndex = 0;
	for (var canvasIndex = 0; canvasIndex < canvasRGBALength; ++canvasIndex) {
		canvasData[canvasIndex++] = frameBuffer[bufferIndex++];
		canvasData[canvasIndex++] = frameBuffer[bufferIndex++];
		canvasData[canvasIndex++] = frameBuffer[bufferIndex++];
	}
	this.graphicsBlit();
	this.drewFrame = false;
}
GameBoyCore.prototype.swizzleFrameBuffer = function () {
	var frameBuffer = this.frameBuffer;
	var swizzledFrame = this.swizzledFrame;
	var bufferIndex = 0;
	for (var canvasIndex = 0; canvasIndex < 69120;) {
		swizzledFrame[canvasIndex++] = (frameBuffer[bufferIndex] >> 16) & 0xFF;
		swizzledFrame[canvasIndex++] = (frameBuffer[bufferIndex] >> 8) & 0xFF;
		swizzledFrame[canvasIndex++] = frameBuffer[bufferIndex++] & 0xFF;
	}
}
GameBoyCore.prototype.clearFrameBuffer = function () {
	var bufferIndex = 0;
	var frameBuffer = this.swizzledFrame;
	if (this.cGBC || this.colorizedGBPalettes) {
		while (bufferIndex < 69120) {
			frameBuffer[bufferIndex++] = 248;
		}
	}
	else {
		while (bufferIndex < 69120) {
			frameBuffer[bufferIndex++] = 239;
			frameBuffer[bufferIndex++] = 255;
			frameBuffer[bufferIndex++] = 222;
		}
	}
}
GameBoyCore.prototype.resizeFrameBuffer = function () {
	if (this.resizePathClear) {
		this.resizePathClear = false;
		this.resizer.resize(this.swizzledFrame);
	}
}
GameBoyCore.prototype.compileResizeFrameBufferFunction = function () {
	if (this.offscreenRGBCount > 0) {
		var parentObj = this;
		this.resizer = new Resize(160, 144, this.offscreenWidth, this.offscreenHeight, false, settings[13], false, function (buffer) {
			if ((buffer.length / 3 * 4) == parentObj.offscreenRGBCount) {
				parentObj.processDraw(buffer);
			}
			parentObj.resizePathClear = true;
		});
	}
}
GameBoyCore.prototype.renderScanLine = function (scanlineToRender) {
	this.pixelStart = scanlineToRender * 160;
	if (this.bgEnabled) {
		this.pixelEnd = 160;
		this.BGLayerRender(scanlineToRender);
		this.WindowLayerRender(scanlineToRender);
	}
	else {
		var pixelLine = (scanlineToRender + 1) * 160;
		var defaultColor = (this.cGBC || this.colorizedGBPalettes) ? 0xF8F8F8 : 0xEFFFDE;
		for (var pixelPosition = (scanlineToRender * 160) + this.currentX; pixelPosition < pixelLine; pixelPosition++) {
			this.frameBuffer[pixelPosition] = defaultColor;
		}
	}
	this.SpriteLayerRender(scanlineToRender);
	this.currentX = 0;
	this.midScanlineOffset = -1;
}
GameBoyCore.prototype.renderMidScanLine = function () {
	if (this.actualScanLine < 144 && this.modeSTAT == 3) {
		if (this.midScanlineOffset == -1) {
			this.midScanlineOffset = this.backgroundX & 0x7;
		}
		if (this.LCDTicks >= 82) {
			this.pixelEnd = this.LCDTicks - 74;
			this.pixelEnd = Math.min(this.pixelEnd - this.midScanlineOffset - (this.pixelEnd % 0x8), 160);
			if (this.bgEnabled) {
				this.pixelStart = this.lastUnrenderedLine * 160;
				this.BGLayerRender(this.lastUnrenderedLine);
				this.WindowLayerRender(this.lastUnrenderedLine);
			}
			else {
				var pixelLine = (this.lastUnrenderedLine * 160) + this.pixelEnd;
				var defaultColor = (this.cGBC || this.colorizedGBPalettes) ? 0xF8F8F8 : 0xEFFFDE;
				for (var pixelPosition = (this.lastUnrenderedLine * 160) + this.currentX; pixelPosition < pixelLine; pixelPosition++) {
					this.frameBuffer[pixelPosition] = defaultColor;
				}
			}
			this.currentX = this.pixelEnd;
		}
	}
}
GameBoyCore.prototype.initializeModeSpecificArrays = function () {
	this.LCDCONTROL = (this.LCDisOn) ? this.LINECONTROL : this.DISPLAYOFFCONTROL;
	if (this.cGBC) {
		this.gbcOBJRawPalette = this.getTypedArray(0x40, 0, "uint8");
		this.gbcBGRawPalette = this.getTypedArray(0x40, 0, "uint8");
		this.gbcOBJPalette = this.getTypedArray(0x20, 0x1000000, "int32");
		this.gbcBGPalette = this.getTypedArray(0x40, 0, "int32");
		this.BGCHRBank2 = this.getTypedArray(0x800, 0, "uint8");
		this.BGCHRCurrentBank = (this.currVRAMBank > 0) ? this.BGCHRBank2 : this.BGCHRBank1;
		this.tileCache = this.generateCacheArray(0xF80);
	}
	else {
		this.gbOBJPalette = this.getTypedArray(8, 0, "int32");
		this.gbBGPalette = this.getTypedArray(4, 0, "int32");
		this.BGPalette = this.gbBGPalette;
		this.OBJPalette = this.gbOBJPalette;
		this.tileCache = this.generateCacheArray(0x700);
		this.sortBuffer = this.getTypedArray(0x100, 0, "uint8");
		this.OAMAddressCache = this.getTypedArray(10, 0, "int32");
	}
	this.renderPathBuild();
}
GameBoyCore.prototype.GBCtoGBModeAdjust = function () {
	cout("Stepping down from GBC mode.", 0);
	this.VRAM = this.GBCMemory = this.BGCHRCurrentBank = this.BGCHRBank2 = null;
	this.tileCache.length = 0x700;
	if (settings[4]) {
		this.gbBGColorizedPalette = this.getTypedArray(4, 0, "int32");
		this.gbOBJColorizedPalette = this.getTypedArray(8, 0, "int32");
		this.cachedBGPaletteConversion = this.getTypedArray(4, 0, "int32");
		this.cachedOBJPaletteConversion = this.getTypedArray(8, 0, "int32");
		this.BGPalette = this.gbBGColorizedPalette;
		this.OBJPalette = this.gbOBJColorizedPalette;
		this.gbOBJPalette = this.gbBGPalette = null;
		this.getGBCColor();
	}
	else {
		this.gbOBJPalette = this.getTypedArray(8, 0, "int32");
		this.gbBGPalette = this.getTypedArray(4, 0, "int32");
		this.BGPalette = this.gbBGPalette;
		this.OBJPalette = this.gbOBJPalette;
	}
	this.sortBuffer = this.getTypedArray(0x100, 0, "uint8");
	this.OAMAddressCache = this.getTypedArray(10, 0, "int32");
	this.renderPathBuild();
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
}
GameBoyCore.prototype.renderPathBuild = function () {
	if (!this.cGBC) {
		this.BGLayerRender = this.BGGBLayerRender;
		this.WindowLayerRender = this.WindowGBLayerRender;
		this.SpriteLayerRender = this.SpriteGBLayerRender;
	}
	else {
		this.priorityFlaggingPathRebuild();
		this.SpriteLayerRender = this.SpriteGBCLayerRender;
	}
}
GameBoyCore.prototype.priorityFlaggingPathRebuild = function () {
	if (this.BGPriorityEnabled) {
		this.BGLayerRender = this.BGGBCLayerRender;
		this.WindowLayerRender = this.WindowGBCLayerRender;
	}
	else {
		this.BGLayerRender = this.BGGBCLayerRenderNoPriorityFlagging;
		this.WindowLayerRender = this.WindowGBCLayerRenderNoPriorityFlagging;
	}
}
GameBoyCore.prototype.initializeReferencesFromSaveState = function () {
	this.LCDCONTROL = (this.LCDisOn) ? this.LINECONTROL : this.DISPLAYOFFCONTROL;
	var tileIndex = 0;
	if (!this.cGBC) {
		if (this.colorizedGBPalettes) {
			this.BGPalette = this.gbBGColorizedPalette;
			this.OBJPalette = this.gbOBJColorizedPalette;
			this.updateGBBGPalette = this.updateGBColorizedBGPalette;
			this.updateGBOBJPalette = this.updateGBColorizedOBJPalette;
		}
		else {
			this.BGPalette = this.gbBGPalette;
			this.OBJPalette = this.gbOBJPalette;
		}
		this.tileCache = this.generateCacheArray(0x700);
		for (tileIndex = 0x8000; tileIndex < 0x9000; tileIndex += 2) {
			this.generateGBOAMTileLine(tileIndex);
		}
		for (tileIndex = 0x9000; tileIndex < 0x9800; tileIndex += 2) {
			this.generateGBTileLine(tileIndex);
		}
		this.sortBuffer = this.getTypedArray(0x100, 0, "uint8");
		this.OAMAddressCache = this.getTypedArray(10, 0, "int32");
	}
	else {
		this.BGCHRCurrentBank = (this.currVRAMBank > 0) ? this.BGCHRBank2 : this.BGCHRBank1;
		this.tileCache = this.generateCacheArray(0xF80);
		for (; tileIndex < 0x1800; tileIndex += 0x10) {
			this.generateGBCTileBank1(tileIndex);
			this.generateGBCTileBank2(tileIndex);
		}
	}
	this.renderPathBuild();
}
GameBoyCore.prototype.RGBTint = function (value) {
	var r = value & 0x1F;
	var g = (value >> 5) & 0x1F;
	var b = (value >> 10) & 0x1F;
	return ((r * 13 + g * 2 + b) >> 1) << 16 | (g * 3 + b) << 9 | (r * 3 + g * 2 + b * 11) >> 1;
}
GameBoyCore.prototype.getGBCColor = function () {
	for (var counter = 0; counter < 4; counter++) {
		var adjustedIndex = counter << 1;
		this.cachedBGPaletteConversion[counter] = this.RGBTint((this.gbcBGRawPalette[adjustedIndex | 1] << 8) | this.gbcBGRawPalette[adjustedIndex]);
		this.cachedOBJPaletteConversion[counter] = this.RGBTint((this.gbcOBJRawPalette[adjustedIndex | 1] << 8) | this.gbcOBJRawPalette[adjustedIndex]);
	}
	for (counter = 4; counter < 8; counter++) {
		adjustedIndex = counter << 1;
		this.cachedOBJPaletteConversion[counter] = this.RGBTint((this.gbcOBJRawPalette[adjustedIndex | 1] << 8) | this.gbcOBJRawPalette[adjustedIndex]);
	}
	this.updateGBBGPalette = this.updateGBColorizedBGPalette;
	this.updateGBOBJPalette = this.updateGBColorizedOBJPalette;
	this.updateGBBGPalette(this.memory[0xFF47]);
	this.updateGBOBJPalette(0, this.memory[0xFF48]);
	this.updateGBOBJPalette(1, this.memory[0xFF49]);
	this.colorizedGBPalettes = true;
}
GameBoyCore.prototype.updateGBRegularBGPalette = function (data) {
	this.gbBGPalette[0] = this.colors[data & 0x03] | 0x2000000;
	this.gbBGPalette[1] = this.colors[(data >> 2) & 0x03];
	this.gbBGPalette[2] = this.colors[(data >> 4) & 0x03];
	this.gbBGPalette[3] = this.colors[data >> 6];
}
GameBoyCore.prototype.updateGBColorizedBGPalette = function (data) {
	this.gbBGColorizedPalette[0] = this.cachedBGPaletteConversion[data & 0x03] | 0x2000000;
	this.gbBGColorizedPalette[1] = this.cachedBGPaletteConversion[(data >> 2) & 0x03];
	this.gbBGColorizedPalette[2] = this.cachedBGPaletteConversion[(data >> 4) & 0x03];
	this.gbBGColorizedPalette[3] = this.cachedBGPaletteConversion[data >> 6];
}
GameBoyCore.prototype.updateGBRegularOBJPalette = function (index, data) {
	this.gbOBJPalette[index | 1] = this.colors[(data >> 2) & 0x03];
	this.gbOBJPalette[index | 2] = this.colors[(data >> 4) & 0x03];
	this.gbOBJPalette[index | 3] = this.colors[data >> 6];
}
GameBoyCore.prototype.updateGBColorizedOBJPalette = function (index, data) {
	this.gbOBJColorizedPalette[index | 1] = this.cachedOBJPaletteConversion[index | ((data >> 2) & 0x03)];
	this.gbOBJColorizedPalette[index | 2] = this.cachedOBJPaletteConversion[index | ((data >> 4) & 0x03)];
	this.gbOBJColorizedPalette[index | 3] = this.cachedOBJPaletteConversion[index | (data >> 6)];
}
GameBoyCore.prototype.updateGBCBGPalette = function (index, data) {
	if (this.gbcBGRawPalette[index] != data) {
		this.midScanLineJIT();
		this.gbcBGRawPalette[index] = data;
		if ((index & 0x06) == 0) {
			data = 0x2000000 | this.RGBTint((this.gbcBGRawPalette[index | 1] << 8) | this.gbcBGRawPalette[index & 0x3E]);
			index >>= 1;
			this.gbcBGPalette[index] = data;
			this.gbcBGPalette[0x20 | index] = 0x1000000 | data;
		}
		else {
			data = this.RGBTint((this.gbcBGRawPalette[index | 1] << 8) | this.gbcBGRawPalette[index & 0x3E]);
			index >>= 1;
			this.gbcBGPalette[index] = data;
			this.gbcBGPalette[0x20 | index] = 0x1000000 | data;
		}
	}
}
GameBoyCore.prototype.updateGBCOBJPalette = function (index, data) {
	if (this.gbcOBJRawPalette[index] != data) {
		this.gbcOBJRawPalette[index] = data;
		if ((index & 0x06) > 0) {
			this.midScanLineJIT();
			this.gbcOBJPalette[index >> 1] = 0x1000000 | this.RGBTint((this.gbcOBJRawPalette[index | 1] << 8) | this.gbcOBJRawPalette[index & 0x3E]);
		}
	}
}
GameBoyCore.prototype.BGGBLayerRender = function (scanlineToRender) {
	var scrollYAdjusted = (this.backgroundY + scanlineToRender) & 0xFF;
	var tileYLine = (scrollYAdjusted & 7) << 3;
	var tileYDown = this.gfxBackgroundCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2);
	var scrollXAdjusted = (this.backgroundX + this.currentX) & 0xFF;
	var pixelPosition = this.pixelStart + this.currentX;
	var pixelPositionEnd = this.pixelStart + ((this.gfxWindowDisplay && (scanlineToRender - this.windowY) >= 0) ? Math.min(Math.max(this.windowX, 0) + this.currentX, this.pixelEnd) : this.pixelEnd);
	var tileNumber = tileYDown + (scrollXAdjusted >> 3);
	var chrCode = this.BGCHRBank1[tileNumber];
	if (chrCode < this.gfxBackgroundBankOffset) {
		chrCode |= 0x100;
	}
	var tile = this.tileCache[chrCode];
	for (var texel = (scrollXAdjusted & 0x7); texel < 8 && pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[tileYLine | texel++]];
	}
	var scrollXAdjustedAligned = Math.min(pixelPositionEnd - pixelPosition, 0x100 - scrollXAdjusted) >> 3;
	scrollXAdjusted += scrollXAdjustedAligned << 3;
	scrollXAdjustedAligned += tileNumber;
	while (tileNumber < scrollXAdjustedAligned) {
		chrCode = this.BGCHRBank1[++tileNumber];
		if (chrCode < this.gfxBackgroundBankOffset) {
			chrCode |= 0x100;
		}
		tile = this.tileCache[chrCode];
		texel = tileYLine;
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel]];
	}
	if (pixelPosition < pixelPositionEnd) {
		if (scrollXAdjusted < 0x100) {
			chrCode = this.BGCHRBank1[++tileNumber];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			tile = this.tileCache[chrCode];
			for (texel = tileYLine - 1; pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
				this.frameBuffer[pixelPosition++] = this.BGPalette[tile[++texel]];
			}
		}
		scrollXAdjustedAligned = ((pixelPositionEnd - pixelPosition) >> 3) + tileYDown;
		while (tileYDown < scrollXAdjustedAligned) {
			chrCode = this.BGCHRBank1[tileYDown++];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			tile = this.tileCache[chrCode];
			texel = tileYLine;
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel]];
		}
		if (pixelPosition < pixelPositionEnd) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			tile = this.tileCache[chrCode];
			switch (pixelPositionEnd - pixelPosition) {
				case 7:
					this.frameBuffer[pixelPosition + 6] = this.BGPalette[tile[tileYLine | 6]];
				case 6:
					this.frameBuffer[pixelPosition + 5] = this.BGPalette[tile[tileYLine | 5]];
				case 5:
					this.frameBuffer[pixelPosition + 4] = this.BGPalette[tile[tileYLine | 4]];
				case 4:
					this.frameBuffer[pixelPosition + 3] = this.BGPalette[tile[tileYLine | 3]];
				case 3:
					this.frameBuffer[pixelPosition + 2] = this.BGPalette[tile[tileYLine | 2]];
				case 2:
					this.frameBuffer[pixelPosition + 1] = this.BGPalette[tile[tileYLine | 1]];
				case 1:
					this.frameBuffer[pixelPosition] = this.BGPalette[tile[tileYLine]];
			}
		}
	}
}
GameBoyCore.prototype.BGGBCLayerRender = function (scanlineToRender) {
	var scrollYAdjusted = (this.backgroundY + scanlineToRender) & 0xFF;
	var tileYLine = (scrollYAdjusted & 7) << 3;
	var tileYDown = this.gfxBackgroundCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2);
	var scrollXAdjusted = (this.backgroundX + this.currentX) & 0xFF;
	var pixelPosition = this.pixelStart + this.currentX;
	var pixelPositionEnd = this.pixelStart + ((this.gfxWindowDisplay && (scanlineToRender - this.windowY) >= 0) ? Math.min(Math.max(this.windowX, 0) + this.currentX, this.pixelEnd) : this.pixelEnd);
	var tileNumber = tileYDown + (scrollXAdjusted >> 3);
	var chrCode = this.BGCHRBank1[tileNumber];
	if (chrCode < this.gfxBackgroundBankOffset) {
		chrCode |= 0x100;
	}
	var attrCode = this.BGCHRBank2[tileNumber];
	var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
	var palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
	for (var texel = (scrollXAdjusted & 0x7); texel < 8 && pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
	}
	var scrollXAdjustedAligned = Math.min(pixelPositionEnd - pixelPosition, 0x100 - scrollXAdjusted) >> 3;
	scrollXAdjusted += scrollXAdjustedAligned << 3;
	scrollXAdjustedAligned += tileNumber;
	while (tileNumber < scrollXAdjustedAligned) {
		chrCode = this.BGCHRBank1[++tileNumber];
		if (chrCode < this.gfxBackgroundBankOffset) {
			chrCode |= 0x100;
		}
		attrCode = this.BGCHRBank2[tileNumber];
		tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
		palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
		texel = tileYLine;
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
	}
	if (pixelPosition < pixelPositionEnd) {
		if (scrollXAdjusted < 0x100) {
			chrCode = this.BGCHRBank1[++tileNumber];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileNumber];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
			for (texel = tileYLine - 1; pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
				this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[++texel]];
			}
		}
		scrollXAdjustedAligned = ((pixelPositionEnd - pixelPosition) >> 3) + tileYDown;
		while (tileYDown < scrollXAdjustedAligned) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown++];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
			texel = tileYLine;
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
		}
		if (pixelPosition < pixelPositionEnd) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
			switch (pixelPositionEnd - pixelPosition) {
				case 7:
					this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
				case 6:
					this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
				case 5:
					this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
				case 4:
					this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
				case 3:
					this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
				case 2:
					this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
				case 1:
					this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
			}
		}
	}
}
GameBoyCore.prototype.BGGBCLayerRenderNoPriorityFlagging = function (scanlineToRender) {
	var scrollYAdjusted = (this.backgroundY + scanlineToRender) & 0xFF;
	var tileYLine = (scrollYAdjusted & 7) << 3;
	var tileYDown = this.gfxBackgroundCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2);
	var scrollXAdjusted = (this.backgroundX + this.currentX) & 0xFF;
	var pixelPosition = this.pixelStart + this.currentX;
	var pixelPositionEnd = this.pixelStart + ((this.gfxWindowDisplay && (scanlineToRender - this.windowY) >= 0) ? Math.min(Math.max(this.windowX, 0) + this.currentX, this.pixelEnd) : this.pixelEnd);
	var tileNumber = tileYDown + (scrollXAdjusted >> 3);
	var chrCode = this.BGCHRBank1[tileNumber];
	if (chrCode < this.gfxBackgroundBankOffset) {
		chrCode |= 0x100;
	}
	var attrCode = this.BGCHRBank2[tileNumber];
	var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
	var palette = (attrCode & 0x7) << 2;
	for (var texel = (scrollXAdjusted & 0x7); texel < 8 && pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
	}
	var scrollXAdjustedAligned = Math.min(pixelPositionEnd - pixelPosition, 0x100 - scrollXAdjusted) >> 3;
	scrollXAdjusted += scrollXAdjustedAligned << 3;
	scrollXAdjustedAligned += tileNumber;
	while (tileNumber < scrollXAdjustedAligned) {
		chrCode = this.BGCHRBank1[++tileNumber];
		if (chrCode < this.gfxBackgroundBankOffset) {
			chrCode |= 0x100;
		}
		attrCode = this.BGCHRBank2[tileNumber];
		tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
		palette = (attrCode & 0x7) << 2;
		texel = tileYLine;
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
	}
	if (pixelPosition < pixelPositionEnd) {
		if (scrollXAdjusted < 0x100) {
			chrCode = this.BGCHRBank1[++tileNumber];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileNumber];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = (attrCode & 0x7) << 2;
			for (texel = tileYLine - 1; pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
				this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[++texel]];
			}
		}
		scrollXAdjustedAligned = ((pixelPositionEnd - pixelPosition) >> 3) + tileYDown;
		while (tileYDown < scrollXAdjustedAligned) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown++];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = (attrCode & 0x7) << 2;
			texel = tileYLine;
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
		}
		if (pixelPosition < pixelPositionEnd) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = (attrCode & 0x7) << 2;
			switch (pixelPositionEnd - pixelPosition) {
				case 7:
					this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
				case 6:
					this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
				case 5:
					this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
				case 4:
					this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
				case 3:
					this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
				case 2:
					this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
				case 1:
					this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
			}
		}
	}
}
GameBoyCore.prototype.WindowGBLayerRender = function (scanlineToRender) {
	if (this.gfxWindowDisplay) {
		var scrollYAdjusted = scanlineToRender - this.windowY;
		if (scrollYAdjusted >= 0) {
			var scrollXRangeAdjusted = (this.windowX > 0) ? (this.windowX + this.currentX) : this.currentX;
			var pixelPosition = this.pixelStart + scrollXRangeAdjusted;
			var pixelPositionEnd = this.pixelStart + this.pixelEnd;
			if (pixelPosition < pixelPositionEnd) {
				var tileYLine = (scrollYAdjusted & 0x7) << 3;
				var tileNumber = (this.gfxWindowCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2)) + (this.currentX >> 3);
				var chrCode = this.BGCHRBank1[tileNumber];
				if (chrCode < this.gfxBackgroundBankOffset) {
					chrCode |= 0x100;
				}
				var tile = this.tileCache[chrCode];
				var texel = (scrollXRangeAdjusted - this.windowX) & 0x7;
				scrollXRangeAdjusted = Math.min(8, texel + pixelPositionEnd - pixelPosition);
				while (texel < scrollXRangeAdjusted) {
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[tileYLine | texel++]];
				}
				scrollXRangeAdjusted = tileNumber + ((pixelPositionEnd - pixelPosition) >> 3);
				while (tileNumber < scrollXRangeAdjusted) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					tile = this.tileCache[chrCode];
					texel = tileYLine;
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel]];
				}
				if (pixelPosition < pixelPositionEnd) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					tile = this.tileCache[chrCode];
					switch (pixelPositionEnd - pixelPosition) {
						case 7:
							this.frameBuffer[pixelPosition + 6] = this.BGPalette[tile[tileYLine | 6]];
						case 6:
							this.frameBuffer[pixelPosition + 5] = this.BGPalette[tile[tileYLine | 5]];
						case 5:
							this.frameBuffer[pixelPosition + 4] = this.BGPalette[tile[tileYLine | 4]];
						case 4:
							this.frameBuffer[pixelPosition + 3] = this.BGPalette[tile[tileYLine | 3]];
						case 3:
							this.frameBuffer[pixelPosition + 2] = this.BGPalette[tile[tileYLine | 2]];
						case 2:
							this.frameBuffer[pixelPosition + 1] = this.BGPalette[tile[tileYLine | 1]];
						case 1:
							this.frameBuffer[pixelPosition] = this.BGPalette[tile[tileYLine]];
					}
				}
			}
		}
	}
}
GameBoyCore.prototype.WindowGBCLayerRender = function (scanlineToRender) {
	if (this.gfxWindowDisplay) {
		var scrollYAdjusted = scanlineToRender - this.windowY;
		if (scrollYAdjusted >= 0) {
			var scrollXRangeAdjusted = (this.windowX > 0) ? (this.windowX + this.currentX) : this.currentX;
			var pixelPosition = this.pixelStart + scrollXRangeAdjusted;
			var pixelPositionEnd = this.pixelStart + this.pixelEnd;
			if (pixelPosition < pixelPositionEnd) {
				var tileYLine = (scrollYAdjusted & 0x7) << 3;
				var tileNumber = (this.gfxWindowCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2)) + (this.currentX >> 3);
				var chrCode = this.BGCHRBank1[tileNumber];
				if (chrCode < this.gfxBackgroundBankOffset) {
					chrCode |= 0x100;
				}
				var attrCode = this.BGCHRBank2[tileNumber];
				var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
				var palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
				var texel = (scrollXRangeAdjusted - this.windowX) & 0x7;
				scrollXRangeAdjusted = Math.min(8, texel + pixelPositionEnd - pixelPosition);
				while (texel < scrollXRangeAdjusted) {
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
				}
				scrollXRangeAdjusted = tileNumber + ((pixelPositionEnd - pixelPosition) >> 3);
				while (tileNumber < scrollXRangeAdjusted) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
					texel = tileYLine;
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
				}
				if (pixelPosition < pixelPositionEnd) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
					switch (pixelPositionEnd - pixelPosition) {
						case 7:
							this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
						case 6:
							this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
						case 5:
							this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
						case 4:
							this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
						case 3:
							this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
						case 2:
							this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
						case 1:
							this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
					}
				}
			}
		}
	}
}
GameBoyCore.prototype.WindowGBCLayerRenderNoPriorityFlagging = function (scanlineToRender) {
	if (this.gfxWindowDisplay) {
		var scrollYAdjusted = scanlineToRender - this.windowY;
		if (scrollYAdjusted >= 0) {
			var scrollXRangeAdjusted = (this.windowX > 0) ? (this.windowX + this.currentX) : this.currentX;
			var pixelPosition = this.pixelStart + scrollXRangeAdjusted;
			var pixelPositionEnd = this.pixelStart + this.pixelEnd;
			if (pixelPosition < pixelPositionEnd) {
				var tileYLine = (scrollYAdjusted & 0x7) << 3;
				var tileNumber = (this.gfxWindowCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2)) + (this.currentX >> 3);
				var chrCode = this.BGCHRBank1[tileNumber];
				if (chrCode < this.gfxBackgroundBankOffset) {
					chrCode |= 0x100;
				}
				var attrCode = this.BGCHRBank2[tileNumber];
				var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
				var palette = (attrCode & 0x7) << 2;
				var texel = (scrollXRangeAdjusted - this.windowX) & 0x7;
				scrollXRangeAdjusted = Math.min(8, texel + pixelPositionEnd - pixelPosition);
				while (texel < scrollXRangeAdjusted) {
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
				}
				scrollXRangeAdjusted = tileNumber + ((pixelPositionEnd - pixelPosition) >> 3);
				while (tileNumber < scrollXRangeAdjusted) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = (attrCode & 0x7) << 2;
					texel = tileYLine;
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
				}
				if (pixelPosition < pixelPositionEnd) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = (attrCode & 0x7) << 2;
					switch (pixelPositionEnd - pixelPosition) {
						case 7:
							this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
						case 6:
							this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
						case 5:
							this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
						case 4:
							this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
						case 3:
							this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
						case 2:
							this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
						case 1:
							this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
					}
				}
			}
		}
	}
}
GameBoyCore.prototype.SpriteGBLayerRender = function (scanlineToRender) {
	if (this.gfxSpriteShow) {
		var lineAdjusted = scanlineToRender + 0x10;
		var OAMAddress = 0xFE00;
		var yoffset = 0;
		var xcoord = 1;
		var xCoordStart = 0;
		var xCoordEnd = 0;
		var attrCode = 0;
		var palette = 0;
		var tile = null;
		var data = 0;
		var spriteCount = 0;
		var length = 0;
		var currentPixel = 0;
		var linePixel = 0;
		while (xcoord < 168) {
			this.sortBuffer[xcoord++] = 0xFF;
		}
		if (this.gfxSpriteNormalHeight) {
			for (var length = this.findLowestSpriteDrawable(lineAdjusted, 0x7); spriteCount < length; ++spriteCount) {
				OAMAddress = this.OAMAddressCache[spriteCount];
				yoffset = (lineAdjusted - this.memory[OAMAddress]) << 3;
				attrCode = this.memory[OAMAddress | 3];
				palette = (attrCode & 0x10) >> 2;
				tile = this.tileCache[((attrCode & 0x60) << 4) | this.memory[OAMAddress | 0x2]];
				linePixel = xCoordStart = this.memory[OAMAddress | 1];
				xCoordEnd = Math.min(168 - linePixel, 8);
				xcoord = (linePixel > 7) ? 0 : (8 - linePixel);
				for (currentPixel = this.pixelStart + ((linePixel > 8) ? (linePixel - 8) : 0); xcoord < xCoordEnd; ++xcoord, ++currentPixel, ++linePixel) {
					if (this.sortBuffer[linePixel] > xCoordStart) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[yoffset | xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[yoffset | xcoord];
							if (data > 0 && attrCode < 0x80) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
					}
				}
			}
		}
		else {
			for (var length = this.findLowestSpriteDrawable(lineAdjusted, 0xF); spriteCount < length; ++spriteCount) {
				OAMAddress = this.OAMAddressCache[spriteCount];
				yoffset = (lineAdjusted - this.memory[OAMAddress]) << 3;
				attrCode = this.memory[OAMAddress | 3];
				palette = (attrCode & 0x10) >> 2;
				if ((attrCode & 0x40) == (0x40 & yoffset)) {
					tile = this.tileCache[((attrCode & 0x60) << 4) | (this.memory[OAMAddress | 0x2] & 0xFE)];
				}
				else {
					tile = this.tileCache[((attrCode & 0x60) << 4) | this.memory[OAMAddress | 0x2] | 1];
				}
				yoffset &= 0x3F;
				linePixel = xCoordStart = this.memory[OAMAddress | 1];
				xCoordEnd = Math.min(168 - linePixel, 8);
				xcoord = (linePixel > 7) ? 0 : (8 - linePixel);
				for (currentPixel = this.pixelStart + ((linePixel > 8) ? (linePixel - 8) : 0); xcoord < xCoordEnd; ++xcoord, ++currentPixel, ++linePixel) {
					if (this.sortBuffer[linePixel] > xCoordStart) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[yoffset | xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[yoffset | xcoord];
							if (data > 0 && attrCode < 0x80) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
					}
				}
			}
		}
	}
}
GameBoyCore.prototype.findLowestSpriteDrawable = function (scanlineToRender, drawableRange) {
	var address = 0xFE00;
	var spriteCount = 0;
	var diff = 0;
	while (address < 0xFEA0 && spriteCount < 10) {
		diff = scanlineToRender - this.memory[address];
		if ((diff & drawableRange) == diff) {
			this.OAMAddressCache[spriteCount++] = address;
		}
		address += 4;
	}
	return spriteCount;
}
GameBoyCore.prototype.SpriteGBCLayerRender = function (scanlineToRender) {
	if (this.gfxSpriteShow) {
		var OAMAddress = 0xFE00;
		var lineAdjusted = scanlineToRender + 0x10;
		var yoffset = 0;
		var xcoord = 0;
		var endX = 0;
		var xCounter = 0;
		var attrCode = 0;
		var palette = 0;
		var tile = null;
		var data = 0;
		var currentPixel = 0;
		var spriteCount = 0;
		if (this.gfxSpriteNormalHeight) {
			for (; OAMAddress < 0xFEA0 && spriteCount < 10; OAMAddress += 4) {
				yoffset = lineAdjusted - this.memory[OAMAddress];
				if ((yoffset & 0x7) == yoffset) {
					xcoord = this.memory[OAMAddress | 1] - 8;
					endX = Math.min(160, xcoord + 8);
					attrCode = this.memory[OAMAddress | 3];
					palette = (attrCode & 7) << 2;
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | this.memory[OAMAddress | 2]];
					xCounter = (xcoord > 0) ? xcoord : 0;
					xcoord -= yoffset << 3;
					for (currentPixel = this.pixelStart + xCounter; xCounter < endX; ++xCounter, ++currentPixel) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[xCounter - xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[xCounter - xcoord];
							if (data > 0 && attrCode < 0x80) {
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
					}
					++spriteCount;
				}
			}
		}
		else {
			for (; OAMAddress < 0xFEA0 && spriteCount < 10; OAMAddress += 4) {
				yoffset = lineAdjusted - this.memory[OAMAddress];
				if ((yoffset & 0xF) == yoffset) {
					xcoord = this.memory[OAMAddress | 1] - 8;
					endX = Math.min(160, xcoord + 8);
					attrCode = this.memory[OAMAddress | 3];
					palette = (attrCode & 7) << 2;
					if ((attrCode & 0x40) == (0x40 & (yoffset << 3))) {
						tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | (this.memory[OAMAddress | 0x2] & 0xFE)];
					}
					else {
						tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | this.memory[OAMAddress | 0x2] | 1];
					}
					xCounter = (xcoord > 0) ? xcoord : 0;
					xcoord -= (yoffset & 0x7) << 3;
					for (currentPixel = this.pixelStart + xCounter; xCounter < endX; ++xCounter, ++currentPixel) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[xCounter - xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[xCounter - xcoord];
							if (data > 0 && attrCode < 0x80) {
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
					}
					++spriteCount;
				}
			}
		}
	}
}
GameBoyCore.prototype.generateGBTileLine = function (address) {
	var lineCopy = (this.memory[0x1 | address] << 8) | this.memory[0x9FFE & address];
	var tileBlock = this.tileCache[(address & 0x1FF0) >> 4];
	address = (address & 0xE) << 2;
	tileBlock[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}
GameBoyCore.prototype.generateGBCTileLineBank1 = function (address) {
	var lineCopy = (this.memory[0x1 | address] << 8) | this.memory[0x9FFE & address];
	address &= 0x1FFE;
	var tileBlock1 = this.tileCache[address >> 4];
	var tileBlock2 = this.tileCache[0x200 | (address >> 4)];
	var tileBlock3 = this.tileCache[0x400 | (address >> 4)];
	var tileBlock4 = this.tileCache[0x600 | (address >> 4)];
	address = (address & 0xE) << 2;
	var addressFlipped = 0x38 - address;
	tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}
GameBoyCore.prototype.generateGBCTileBank1 = function (vramAddress) {
	var address = vramAddress >> 4;
	var tileBlock1 = this.tileCache[address];
	var tileBlock2 = this.tileCache[0x200 | address];
	var tileBlock3 = this.tileCache[0x400 | address];
	var tileBlock4 = this.tileCache[0x600 | address];
	var lineCopy = 0;
	vramAddress |= 0x8000;
	address = 0;
	var addressFlipped = 56;
	do {
		lineCopy = (this.memory[0x1 | vramAddress] << 8) | this.memory[vramAddress];
		tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
		tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
		tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
		tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
		tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
		tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
		tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
		tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
		address += 8;
		addressFlipped -= 8;
		vramAddress += 2;
	} while (addressFlipped > -1);
}
GameBoyCore.prototype.generateGBCTileLineBank2 = function (address) {
	var lineCopy = (this.VRAM[0x1 | address] << 8) | this.VRAM[0x1FFE & address];
	var tileBlock1 = this.tileCache[0x800 | (address >> 4)];
	var tileBlock2 = this.tileCache[0xA00 | (address >> 4)];
	var tileBlock3 = this.tileCache[0xC00 | (address >> 4)];
	var tileBlock4 = this.tileCache[0xE00 | (address >> 4)];
	address = (address & 0xE) << 2;
	var addressFlipped = 0x38 - address;
	tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}
GameBoyCore.prototype.generateGBCTileBank2 = function (vramAddress) {
	var address = vramAddress >> 4;
	var tileBlock1 = this.tileCache[0x800 | address];
	var tileBlock2 = this.tileCache[0xA00 | address];
	var tileBlock3 = this.tileCache[0xC00 | address];
	var tileBlock4 = this.tileCache[0xE00 | address];
	var lineCopy = 0;
	address = 0;
	var addressFlipped = 56;
	do {
		lineCopy = (this.VRAM[0x1 | vramAddress] << 8) | this.VRAM[vramAddress];
		tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
		tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
		tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
		tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
		tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
		tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
		tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
		tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
		address += 8;
		addressFlipped -= 8;
		vramAddress += 2;
	} while (addressFlipped > -1);
}
GameBoyCore.prototype.generateGBOAMTileLine = function (address) {
	var lineCopy = (this.memory[0x1 | address] << 8) | this.memory[0x9FFE & address];
	address &= 0x1FFE;
	var tileBlock1 = this.tileCache[address >> 4];
	var tileBlock2 = this.tileCache[0x200 | (address >> 4)];
	var tileBlock3 = this.tileCache[0x400 | (address >> 4)];
	var tileBlock4 = this.tileCache[0x600 | (address >> 4)];
	address = (address & 0xE) << 2;
	var addressFlipped = 0x38 - address;
	tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}
GameBoyCore.prototype.graphicsJIT = function () {
	if (this.LCDisOn) {
		this.totalLinesPassed = 0;
		this.graphicsJITScanlineGroup();
	}
}
GameBoyCore.prototype.graphicsJITVBlank = function () {
	this.totalLinesPassed += this.queuedScanLines;
	this.graphicsJITScanlineGroup();
}
GameBoyCore.prototype.graphicsJITScanlineGroup = function () {
	while (this.queuedScanLines > 0) {
		this.renderScanLine(this.lastUnrenderedLine);
		if (this.lastUnrenderedLine < 143) {
			++this.lastUnrenderedLine;
		}
		else {
			this.lastUnrenderedLine = 0;
		}
		--this.queuedScanLines;
	}
}
GameBoyCore.prototype.incrementScanLineQueue = function () {
	if (this.queuedScanLines < 144) {
		++this.queuedScanLines;
	}
	else {
		this.currentX = 0;
		this.midScanlineOffset = -1;
		if (this.lastUnrenderedLine < 143) {
			++this.lastUnrenderedLine;
		}
		else {
			this.lastUnrenderedLine = 0;
		}
	}
}
GameBoyCore.prototype.midScanLineJIT = function () {
	this.graphicsJIT();
	this.renderMidScanLine();
}
GameBoyCore.prototype.launchIRQ = function () {
	var bitShift = 0;
	var testbit = 1;
	do {
		if ((testbit & this.IRQLineMatched) == testbit) {
			this.IME = false;
			this.interruptsRequested -= testbit;
			this.IRQLineMatched = 0;
			this.CPUTicks = 20;
			this.stackPointer = (this.stackPointer - 1) & 0xFFFF;
			this.memoryWriter[this.stackPointer](this, this.stackPointer, this.programCounter >> 8);
			this.stackPointer = (this.stackPointer - 1) & 0xFFFF;
			this.memoryWriter[this.stackPointer](this, this.stackPointer, this.programCounter & 0xFF);
			this.programCounter = 0x40 | (bitShift << 3);
			this.updateCore();
			return;
		}
		testbit = 1 << ++bitShift;
	} while (bitShift < 5);
}
GameBoyCore.prototype.checkIRQMatching = function () {
	if (this.IME) {
		this.IRQLineMatched = this.interruptsEnabled & this.interruptsRequested & 0x1F;
	}
}
GameBoyCore.prototype.calculateHALTPeriod = function () {
	if (!this.halt) {
		this.halt = true;
		var currentClocks = -1;
		var temp_var = 0;
		if (this.LCDisOn) {
			if ((this.interruptsEnabled & 0x1) == 0x1) {
				currentClocks = ((456 * (((this.modeSTAT == 1) ? 298 : 144) - this.actualScanLine)) - this.LCDTicks) << this.doubleSpeedShifter;
			}
			if ((this.interruptsEnabled & 0x2) == 0x2) {
				if (this.mode0TriggerSTAT) {
					temp_var = (this.clocksUntilMode0() - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
				if (this.mode1TriggerSTAT && (this.interruptsEnabled & 0x1) == 0) {
					temp_var = ((456 * (((this.modeSTAT == 1) ? 298 : 144) - this.actualScanLine)) - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
				if (this.mode2TriggerSTAT) {
					temp_var = (((this.actualScanLine >= 143) ? (456 * (154 - this.actualScanLine)) : 456) - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
				if (this.LYCMatchTriggerSTAT && this.memory[0xFF45] <= 153) {
					temp_var = (this.clocksUntilLYCMatch() - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
			}
		}
		if (this.TIMAEnabled && (this.interruptsEnabled & 0x4) == 0x4) {
			temp_var = ((0x100 - this.memory[0xFF05]) * this.TACClocker) - this.timerTicks;
			if (temp_var <= currentClocks || currentClocks == -1) {
				currentClocks = temp_var;
			}
		}
		if (this.serialTimer > 0 && (this.interruptsEnabled & 0x8) == 0x8) {
			if (this.serialTimer <= currentClocks || currentClocks == -1) {
				currentClocks = this.serialTimer;
			}
		}
	}
	else {
		var currentClocks = this.remainingClocks;
	}
	var maxClocks = (this.CPUCyclesTotal - this.emulatorTicks) << this.doubleSpeedShifter;
	if (currentClocks >= 0) {
		if (currentClocks <= maxClocks) {
			this.CPUTicks = Math.max(currentClocks, this.CPUTicks);
			this.updateCoreFull();
			this.halt = false;
			this.CPUTicks = 0;
		}
		else {
			this.CPUTicks = Math.max(maxClocks, this.CPUTicks);
			this.remainingClocks = currentClocks - this.CPUTicks;
		}
	}
	else {
		this.CPUTicks += maxClocks;
	}
}
GameBoyCore.prototype.memoryRead = function (address) {
	return this.memoryReader[address](this, address);
}
GameBoyCore.prototype.memoryHighRead = function (address) {
	return this.memoryHighReader[address](this, address);
}
GameBoyCore.prototype.memoryReadJumpCompile = function () {
	for (var index = 0x0000; index <= 0xFFFF; index++) {
		if (index < 0x4000) {
			this.memoryReader[index] = this.memoryReadNormal;
		}
		else if (index < 0x8000) {
			this.memoryReader[index] = this.memoryReadROM;
		}
		else if (index < 0x9800) {
			this.memoryReader[index] = (this.cGBC) ? this.VRAMDATAReadCGBCPU : this.VRAMDATAReadDMGCPU;
		}
		else if (index < 0xA000) {
			this.memoryReader[index] = (this.cGBC) ? this.VRAMCHRReadCGBCPU : this.VRAMCHRReadDMGCPU;
		}
		else if (index >= 0xA000 && index < 0xC000) {
			if ((this.numRAMBanks == 1 / 16 && index < 0xA200) || this.numRAMBanks >= 1) {
				if (this.cMBC7) {
					this.memoryReader[index] = this.memoryReadMBC7;
				}
				else if (!this.cMBC3) {
					this.memoryReader[index] = this.memoryReadMBC;
				}
				else {
					this.memoryReader[index] = this.memoryReadMBC3;
				}
			}
			else {
				this.memoryReader[index] = this.memoryReadBAD;
			}
		}
		else if (index >= 0xC000 && index < 0xE000) {
			if (!this.cGBC || index < 0xD000) {
				this.memoryReader[index] = this.memoryReadNormal;
			}
			else {
				this.memoryReader[index] = this.memoryReadGBCMemory;
			}
		}
		else if (index >= 0xE000 && index < 0xFE00) {
			if (!this.cGBC || index < 0xF000) {
				this.memoryReader[index] = this.memoryReadECHONormal;
			}
			else {
				this.memoryReader[index] = this.memoryReadECHOGBCMemory;
			}
		}
		else if (index < 0xFEA0) {
			this.memoryReader[index] = this.memoryReadOAM;
		}
		else if (this.cGBC && index >= 0xFEA0 && index < 0xFF00) {
			this.memoryReader[index] = this.memoryReadNormal;
		}
		else if (index >= 0xFF00) {
			switch (index) {
				case 0xFF00:
					this.memoryHighReader[0] = this.memoryReader[0xFF00] = function (parentObj, address) {
						return 0xC0 | parentObj.memory[0xFF00];
					}
					break;
				case 0xFF01:
					this.memoryHighReader[0x01] = this.memoryReader[0xFF01] = function (parentObj, address) {
						return (parentObj.memory[0xFF02] < 0x80) ? parentObj.memory[0xFF01] : 0xFF;
					}
					break;
				case 0xFF02:
					if (this.cGBC) {
						this.memoryHighReader[0x02] = this.memoryReader[0xFF02] = function (parentObj, address) {
							return ((parentObj.serialTimer <= 0) ? 0x7C : 0xFC) | parentObj.memory[0xFF02];
						}
					}
					else {
						this.memoryHighReader[0x02] = this.memoryReader[0xFF02] = function (parentObj, address) {
							return ((parentObj.serialTimer <= 0) ? 0x7E : 0xFE) | parentObj.memory[0xFF02];
						}
					}
					break;
				case 0xFF03:
					this.memoryHighReader[0x03] = this.memoryReader[0xFF03] = this.memoryReadBAD;
					break;
				case 0xFF04:
					this.memoryHighReader[0x04] = this.memoryReader[0xFF04] = function (parentObj, address) {
						parentObj.memory[0xFF04] = (parentObj.memory[0xFF04] + (parentObj.DIVTicks >> 8)) & 0xFF;
						parentObj.DIVTicks &= 0xFF;
						return parentObj.memory[0xFF04];
					}
					break;
				case 0xFF05:
				case 0xFF06:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF07:
					this.memoryHighReader[0x07] = this.memoryReader[0xFF07] = function (parentObj, address) {
						return 0xF8 | parentObj.memory[0xFF07];
					}
					break;
				case 0xFF08:
				case 0xFF09:
				case 0xFF0A:
				case 0xFF0B:
				case 0xFF0C:
				case 0xFF0D:
				case 0xFF0E:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF0F:
					this.memoryHighReader[0x0F] = this.memoryReader[0xFF0F] = function (parentObj, address) {
						return 0xE0 | parentObj.interruptsRequested;
					}
					break;
				case 0xFF10:
					this.memoryHighReader[0x10] = this.memoryReader[0xFF10] = function (parentObj, address) {
						return 0x80 | parentObj.memory[0xFF10];
					}
					break;
				case 0xFF11:
					this.memoryHighReader[0x11] = this.memoryReader[0xFF11] = function (parentObj, address) {
						return 0x3F | parentObj.memory[0xFF11];
					}
					break;
				case 0xFF12:
					this.memoryHighReader[0x12] = this.memoryHighReadNormal;
					this.memoryReader[0xFF12] = this.memoryReadNormal;
					break;
				case 0xFF13:
					this.memoryHighReader[0x13] = this.memoryReader[0xFF13] = this.memoryReadBAD;
					break;
				case 0xFF14:
					this.memoryHighReader[0x14] = this.memoryReader[0xFF14] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF14];
					}
					break;
				case 0xFF15:
					this.memoryHighReader[0x15] = this.memoryReadBAD;
					this.memoryReader[0xFF15] = this.memoryReadBAD;
					break;
				case 0xFF16:
					this.memoryHighReader[0x16] = this.memoryReader[0xFF16] = function (parentObj, address) {
						return 0x3F | parentObj.memory[0xFF16];
					}
					break;
				case 0xFF17:
					this.memoryHighReader[0x17] = this.memoryHighReadNormal;
					this.memoryReader[0xFF17] = this.memoryReadNormal;
					break;
				case 0xFF18:
					this.memoryHighReader[0x18] = this.memoryReader[0xFF18] = this.memoryReadBAD;
					break;
				case 0xFF19:
					this.memoryHighReader[0x19] = this.memoryReader[0xFF19] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF19];
					}
					break;
				case 0xFF1A:
					this.memoryHighReader[0x1A] = this.memoryReader[0xFF1A] = function (parentObj, address) {
						return 0x7F | parentObj.memory[0xFF1A];
					}
					break;
				case 0xFF1B:
					this.memoryHighReader[0x1B] = this.memoryReader[0xFF1B] = this.memoryReadBAD;
					break;
				case 0xFF1C:
					this.memoryHighReader[0x1C] = this.memoryReader[0xFF1C] = function (parentObj, address) {
						return 0x9F | parentObj.memory[0xFF1C];
					}
					break;
				case 0xFF1D:
					this.memoryHighReader[0x1D] = this.memoryReader[0xFF1D] = this.memoryReadBAD;
					break;
				case 0xFF1E:
					this.memoryHighReader[0x1E] = this.memoryReader[0xFF1E] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF1E];
					}
					break;
				case 0xFF1F:
				case 0xFF20:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF21:
				case 0xFF22:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF23:
					this.memoryHighReader[0x23] = this.memoryReader[0xFF23] = function (parentObj, address) {
						return 0xBF | parentObj.memory[0xFF23];
					}
					break;
				case 0xFF24:
				case 0xFF25:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF26:
					this.memoryHighReader[0x26] = this.memoryReader[0xFF26] = function (parentObj, address) {
						parentObj.audioJIT();
						return 0x70 | parentObj.memory[0xFF26];
					}
					break;
				case 0xFF27:
				case 0xFF28:
				case 0xFF29:
				case 0xFF2A:
				case 0xFF2B:
				case 0xFF2C:
				case 0xFF2D:
				case 0xFF2E:
				case 0xFF2F:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF30:
				case 0xFF31:
				case 0xFF32:
				case 0xFF33:
				case 0xFF34:
				case 0xFF35:
				case 0xFF36:
				case 0xFF37:
				case 0xFF38:
				case 0xFF39:
				case 0xFF3A:
				case 0xFF3B:
				case 0xFF3C:
				case 0xFF3D:
				case 0xFF3E:
				case 0xFF3F:
					this.memoryReader[index] = function (parentObj, address) {
						return (parentObj.channel3canPlay) ? parentObj.memory[0xFF00 | (parentObj.channel3lastSampleLookup >> 1)] : parentObj.memory[address];
					}
					this.memoryHighReader[index & 0xFF] = function (parentObj, address) {
						return (parentObj.channel3canPlay) ? parentObj.memory[0xFF00 | (parentObj.channel3lastSampleLookup >> 1)] : parentObj.memory[0xFF00 | address];
					}
					break;
				case 0xFF40:
					this.memoryHighReader[0x40] = this.memoryHighReadNormal;
					this.memoryReader[0xFF40] = this.memoryReadNormal;
					break;
				case 0xFF41:
					this.memoryHighReader[0x41] = this.memoryReader[0xFF41] = function (parentObj, address) {
						return 0x80 | parentObj.memory[0xFF41] | parentObj.modeSTAT;
					}
					break;
				case 0xFF42:
					this.memoryHighReader[0x42] = this.memoryReader[0xFF42] = function (parentObj, address) {
						return parentObj.backgroundY;
					}
					break;
				case 0xFF43:
					this.memoryHighReader[0x43] = this.memoryReader[0xFF43] = function (parentObj, address) {
						return parentObj.backgroundX;
					}
					break;
				case 0xFF44:
					this.memoryHighReader[0x44] = this.memoryReader[0xFF44] = function (parentObj, address) {
						return ((parentObj.LCDisOn) ? parentObj.memory[0xFF44] : 0);
					}
					break;
				case 0xFF45:
				case 0xFF46:
				case 0xFF47:
				case 0xFF48:
				case 0xFF49:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF4A:
					this.memoryHighReader[0x4A] = this.memoryReader[0xFF4A] = function (parentObj, address) {
						return parentObj.windowY;
					}
					break;
				case 0xFF4B:
					this.memoryHighReader[0x4B] = this.memoryHighReadNormal;
					this.memoryReader[0xFF4B] = this.memoryReadNormal;
					break;
				case 0xFF4C:
					this.memoryHighReader[0x4C] = this.memoryReader[0xFF4C] = this.memoryReadBAD;
					break;
				case 0xFF4D:
					this.memoryHighReader[0x4D] = this.memoryHighReadNormal;
					this.memoryReader[0xFF4D] = this.memoryReadNormal;
					break;
				case 0xFF4E:
					this.memoryHighReader[0x4E] = this.memoryReader[0xFF4E] = this.memoryReadBAD;
					break;
				case 0xFF4F:
					this.memoryHighReader[0x4F] = this.memoryReader[0xFF4F] = function (parentObj, address) {
						return parentObj.currVRAMBank;
					}
					break;
				case 0xFF50:
				case 0xFF51:
				case 0xFF52:
				case 0xFF53:
				case 0xFF54:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF55:
					if (this.cGBC) {
						this.memoryHighReader[0x55] = this.memoryReader[0xFF55] = function (parentObj, address) {
							if (!parentObj.LCDisOn && parentObj.hdmaRunning) {
								parentObj.DMAWrite((parentObj.memory[0xFF55] & 0x7F) + 1);
								parentObj.memory[0xFF55] = 0xFF;
								parentObj.hdmaRunning = false;
							}
							return parentObj.memory[0xFF55];
						}
					}
					else {
						this.memoryReader[0xFF55] = this.memoryReadNormal;
						this.memoryHighReader[0x55] = this.memoryHighReadNormal;
					}
					break;
				case 0xFF56:
					if (this.cGBC) {
						this.memoryHighReader[0x56] = this.memoryReader[0xFF56] = function (parentObj, address) {
							return 0x3C | ((parentObj.memory[0xFF56] >= 0xC0) ? (0x2 | (parentObj.memory[0xFF56] & 0xC1)) : (parentObj.memory[0xFF56] & 0xC3));
						}
					}
					else {
						this.memoryReader[0xFF56] = this.memoryReadNormal;
						this.memoryHighReader[0x56] = this.memoryHighReadNormal;
					}
					break;
				case 0xFF57:
				case 0xFF58:
				case 0xFF59:
				case 0xFF5A:
				case 0xFF5B:
				case 0xFF5C:
				case 0xFF5D:
				case 0xFF5E:
				case 0xFF5F:
				case 0xFF60:
				case 0xFF61:
				case 0xFF62:
				case 0xFF63:
				case 0xFF64:
				case 0xFF65:
				case 0xFF66:
				case 0xFF67:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF68:
				case 0xFF69:
				case 0xFF6A:
				case 0xFF6B:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF6C:
					if (this.cGBC) {
						this.memoryHighReader[0x6C] = this.memoryReader[0xFF6C] = function (parentObj, address) {
							return 0xFE | parentObj.memory[0xFF6C];
						}
					}
					else {
						this.memoryHighReader[0x6C] = this.memoryReader[0xFF6C] = this.memoryReadBAD;
					}
					break;
				case 0xFF6D:
				case 0xFF6E:
				case 0xFF6F:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF70:
					if (this.cGBC) {
						this.memoryHighReader[0x70] = this.memoryReader[0xFF70] = function (parentObj, address) {
							return 0x40 | parentObj.memory[0xFF70];
						}
					}
					else {
						this.memoryHighReader[0x70] = this.memoryReader[0xFF70] = this.memoryReadBAD;
					}
					break;
				case 0xFF71:
					this.memoryHighReader[0x71] = this.memoryReader[0xFF71] = this.memoryReadBAD;
					break;
				case 0xFF72:
				case 0xFF73:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF74:
					if (this.cGBC) {
						this.memoryHighReader[0x74] = this.memoryReader[0xFF74] = this.memoryReadNormal;
					}
					else {
						this.memoryHighReader[0x74] = this.memoryReader[0xFF74] = this.memoryReadBAD;
					}
					break;
				case 0xFF75:
					this.memoryHighReader[0x75] = this.memoryReader[0xFF75] = function (parentObj, address) {
						return 0x8F | parentObj.memory[0xFF75];
					}
					break;
				case 0xFF76:
					this.memoryHighReader[0x76] = this.memoryReader[0xFF76] = function (parentObj, address) {
						parentObj.audioJIT();
						return (parentObj.channel2envelopeVolume << 4) | parentObj.channel1envelopeVolume;
					}
					break;
				case 0xFF77:
					this.memoryHighReader[0x77] = this.memoryReader[0xFF77] = function (parentObj, address) {
						parentObj.audioJIT();
						return (parentObj.channel4envelopeVolume << 4) | parentObj.channel3envelopeVolume;
					}
					break;
				case 0xFF78:
				case 0xFF79:
				case 0xFF7A:
				case 0xFF7B:
				case 0xFF7C:
				case 0xFF7D:
				case 0xFF7E:
				case 0xFF7F:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFFFF:
					this.memoryHighReader[0xFF] = this.memoryReader[0xFFFF] = function (parentObj, address) {
						return parentObj.interruptsEnabled;
					}
					break;
				default:
					this.memoryReader[index] = this.memoryReadNormal;
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
			}
		}
		else {
			this.memoryReader[index] = this.memoryReadBAD;
		}
	}
}
GameBoyCore.prototype.memoryReadNormal = function (parentObj, address) {
	return parentObj.memory[address];
}
GameBoyCore.prototype.memoryHighReadNormal = function (parentObj, address) {
	return parentObj.memory[0xFF00 | address];
}
GameBoyCore.prototype.memoryReadROM = function (parentObj, address) {
	return parentObj.ROM[parentObj.currentROMBank + address];
}
GameBoyCore.prototype.memoryReadMBC = function (parentObj, address) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
	}
	return 0xFF;
}
GameBoyCore.prototype.memoryReadMBC7 = function (parentObj, address) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		switch (address) {
			case 0xA000:
			case 0xA060:
			case 0xA070:
				return 0;
			case 0xA080:
				return 0;
			case 0xA050:
				return parentObj.highY;
			case 0xA040:
				return parentObj.lowY;
			case 0xA030:
				return parentObj.highX;
			case 0xA020:
				return parentObj.lowX;
			default:
				return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
		}
	}
	return 0xFF;
}
GameBoyCore.prototype.memoryReadMBC3 = function (parentObj, address) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		switch (parentObj.currMBCRAMBank) {
			case 0x00:
			case 0x01:
			case 0x02:
			case 0x03:
				return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
				break;
			case 0x08:
				return parentObj.latchedSeconds;
				break;
			case 0x09:
				return parentObj.latchedMinutes;
				break;
			case 0x0A:
				return parentObj.latchedHours;
				break;
			case 0x0B:
				return parentObj.latchedLDays;
				break;
			case 0x0C:
				return (((parentObj.RTCDayOverFlow) ? 0x80 : 0) + ((parentObj.RTCHALT) ? 0x40 : 0)) + parentObj.latchedHDays;
		}
	}
	return 0xFF;
}
GameBoyCore.prototype.memoryReadGBCMemory = function (parentObj, address) {
	return parentObj.GBCMemory[address + parentObj.gbcRamBankPosition];
}
GameBoyCore.prototype.memoryReadOAM = function (parentObj, address) {
	return (parentObj.modeSTAT > 1) ? 0xFF : parentObj.memory[address];
}
GameBoyCore.prototype.memoryReadECHOGBCMemory = function (parentObj, address) {
	return parentObj.GBCMemory[address + parentObj.gbcRamBankPositionECHO];
}
GameBoyCore.prototype.memoryReadECHONormal = function (parentObj, address) {
	return parentObj.memory[address - 0x2000];
}
GameBoyCore.prototype.memoryReadBAD = function (parentObj, address) {
	return 0xFF;
}
GameBoyCore.prototype.VRAMDATAReadCGBCPU = function (parentObj, address) {
	return (parentObj.modeSTAT > 2) ? 0xFF : ((parentObj.currVRAMBank == 0) ? parentObj.memory[address] : parentObj.VRAM[address & 0x1FFF]);
}
GameBoyCore.prototype.VRAMDATAReadDMGCPU = function (parentObj, address) {
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.memory[address];
}
GameBoyCore.prototype.VRAMCHRReadCGBCPU = function (parentObj, address) {
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.BGCHRCurrentBank[address & 0x7FF];
}
GameBoyCore.prototype.VRAMCHRReadDMGCPU = function (parentObj, address) {
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.BGCHRBank1[address & 0x7FF];
}
GameBoyCore.prototype.setCurrentMBC1ROMBank = function () {
	switch (this.ROMBank1offs) {
		case 0x00:
		case 0x20:
		case 0x40:
		case 0x60:
			this.currentROMBank = (this.ROMBank1offs % this.ROMBankEdge) << 14;
			break;
		default:
			this.currentROMBank = ((this.ROMBank1offs % this.ROMBankEdge) - 1) << 14;
	}
}
GameBoyCore.prototype.setCurrentMBC2AND3ROMBank = function () {
	this.currentROMBank = Math.max((this.ROMBank1offs % this.ROMBankEdge) - 1, 0) << 14;
}
GameBoyCore.prototype.setCurrentMBC5ROMBank = function () {
	this.currentROMBank = ((this.ROMBank1offs % this.ROMBankEdge) - 1) << 14;
}
GameBoyCore.prototype.memoryWrite = function (address, data) {
	this.memoryWriter[address](this, address, data);
}
GameBoyCore.prototype.memoryHighWrite = function (address, data) {
	this.memoryHighWriter[address](this, address, data);
}
GameBoyCore.prototype.memoryWriteJumpCompile = function () {
	for (var index = 0x0000; index <= 0xFFFF; index++) {
		if (index < 0x8000) {
			if (this.cMBC1) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC1WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.MBC1WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.MBC1WriteType;
				}
			}
			else if (this.cMBC2) {
				if (index < 0x1000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index >= 0x2100 && index < 0x2200) {
					this.memoryWriter[index] = this.MBC2WriteROMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else if (this.cMBC3) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC3WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.MBC3WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.MBC3WriteRTCLatch;
				}
			}
			else if (this.cMBC5 || this.cRUMBLE || this.cMBC7) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x3000) {
					this.memoryWriter[index] = this.MBC5WriteROMBankLow;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC5WriteROMBankHigh;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = (this.cRUMBLE) ? this.RUMBLEWriteRAMBank : this.MBC5WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else if (this.cHuC3) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC3WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.HuC3WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else if (index < 0x9000) {
			this.memoryWriter[index] = (this.cGBC) ? this.VRAMGBCDATAWrite : this.VRAMGBDATAWrite;
		}
		else if (index < 0x9800) {
			this.memoryWriter[index] = (this.cGBC) ? this.VRAMGBCDATAWrite : this.VRAMGBDATAUpperWrite;
		}
		else if (index < 0xA000) {
			this.memoryWriter[index] = (this.cGBC) ? this.VRAMGBCCHRMAPWrite : this.VRAMGBCHRMAPWrite;
		}
		else if (index < 0xC000) {
			if ((this.numRAMBanks == 1 / 16 && index < 0xA200) || this.numRAMBanks >= 1) {
				if (!this.cMBC3) {
					this.memoryWriter[index] = this.memoryWriteMBCRAM;
				}
				else {
					this.memoryWriter[index] = this.memoryWriteMBC3RAM;
				}
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else if (index < 0xE000) {
			if (this.cGBC && index >= 0xD000) {
				this.memoryWriter[index] = this.memoryWriteGBCRAM;
			}
			else {
				this.memoryWriter[index] = this.memoryWriteNormal;
			}
		}
		else if (index < 0xFE00) {
			if (this.cGBC && index >= 0xF000) {
				this.memoryWriter[index] = this.memoryWriteECHOGBCRAM;
			}
			else {
				this.memoryWriter[index] = this.memoryWriteECHONormal;
			}
		}
		else if (index <= 0xFEA0) {
			this.memoryWriter[index] = this.memoryWriteOAMRAM;
		}
		else if (index < 0xFF00) {
			if (this.cGBC) {
				this.memoryWriter[index] = this.memoryWriteNormal;
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else {
			this.memoryWriter[index] = this.memoryWriteNormal;
			this.memoryHighWriter[index & 0xFF] = this.memoryHighWriteNormal;
		}
	}
	this.registerWriteJumpCompile();
}
GameBoyCore.prototype.MBCWriteEnable = function (parentObj, address, data) {
	parentObj.MBCRAMBanksEnabled = ((data & 0x0F) == 0x0A);
}
GameBoyCore.prototype.MBC1WriteROMBank = function (parentObj, address, data) {
	parentObj.ROMBank1offs = (parentObj.ROMBank1offs & 0x60) | (data & 0x1F);
	parentObj.setCurrentMBC1ROMBank();
}
GameBoyCore.prototype.MBC1WriteRAMBank = function (parentObj, address, data) {
	if (parentObj.MBC1Mode) {
		parentObj.currMBCRAMBank = data & 0x03;
		parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
	}
	else {
		parentObj.ROMBank1offs = ((data & 0x03) << 5) | (parentObj.ROMBank1offs & 0x1F);
		parentObj.setCurrentMBC1ROMBank();
	}
}
GameBoyCore.prototype.MBC1WriteType = function (parentObj, address, data) {
	parentObj.MBC1Mode = ((data & 0x1) == 0x1);
	if (parentObj.MBC1Mode) {
		parentObj.ROMBank1offs &= 0x1F;
		parentObj.setCurrentMBC1ROMBank();
	}
	else {
		parentObj.currMBCRAMBank = 0;
		parentObj.currMBCRAMBankPosition = -0xA000;
	}
}
GameBoyCore.prototype.MBC2WriteROMBank = function (parentObj, address, data) {
	parentObj.ROMBank1offs = data & 0x0F;
	parentObj.setCurrentMBC2AND3ROMBank();
}
GameBoyCore.prototype.MBC3WriteROMBank = function (parentObj, address, data) {
	parentObj.ROMBank1offs = data & 0x7F;
	parentObj.setCurrentMBC2AND3ROMBank();
}
GameBoyCore.prototype.MBC3WriteRAMBank = function (parentObj, address, data) {
	parentObj.currMBCRAMBank = data;
	if (data < 4) {
		parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
	}
}
GameBoyCore.prototype.MBC3WriteRTCLatch = function (parentObj, address, data) {
	if (data == 0) {
		parentObj.RTCisLatched = false;
	}
	else if (!parentObj.RTCisLatched) {
		parentObj.RTCisLatched = true;
		parentObj.latchedSeconds = parentObj.RTCSeconds | 0;
		parentObj.latchedMinutes = parentObj.RTCMinutes;
		parentObj.latchedHours = parentObj.RTCHours;
		parentObj.latchedLDays = (parentObj.RTCDays & 0xFF);
		parentObj.latchedHDays = parentObj.RTCDays >> 8;
	}
}
GameBoyCore.prototype.MBC5WriteROMBankLow = function (parentObj, address, data) {
	parentObj.ROMBank1offs = (parentObj.ROMBank1offs & 0x100) | data;
	parentObj.setCurrentMBC5ROMBank();
}
GameBoyCore.prototype.MBC5WriteROMBankHigh = function (parentObj, address, data) {
	parentObj.ROMBank1offs = ((data & 0x01) << 8) | (parentObj.ROMBank1offs & 0xFF);
	parentObj.setCurrentMBC5ROMBank();
}
GameBoyCore.prototype.MBC5WriteRAMBank = function (parentObj, address, data) {
	parentObj.currMBCRAMBank = data & 0xF;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}
GameBoyCore.prototype.RUMBLEWriteRAMBank = function (parentObj, address, data) {
	parentObj.currMBCRAMBank = data & 0x03;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}
GameBoyCore.prototype.HuC3WriteRAMBank = function (parentObj, address, data) {
	parentObj.currMBCRAMBank = data & 0x03;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}
GameBoyCore.prototype.cartIgnoreWrite = function (parentObj, address, data) {
}
GameBoyCore.prototype.memoryWriteNormal = function (parentObj, address, data) {
	parentObj.memory[address] = data;
}
GameBoyCore.prototype.memoryHighWriteNormal = function (parentObj, address, data) {
	parentObj.memory[0xFF00 | address] = data;
}
GameBoyCore.prototype.memoryWriteMBCRAM = function (parentObj, address, data) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition] = data;
	}
}
GameBoyCore.prototype.memoryWriteMBC3RAM = function (parentObj, address, data) {
	if (parentObj.MBCRAMBanksEnabled || settings[10]) {
		switch (parentObj.currMBCRAMBank) {
			case 0x00:
			case 0x01:
			case 0x02:
			case 0x03:
				parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition] = data;
				break;
			case 0x08:
				if (data < 60) {
					parentObj.RTCSeconds = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x09:
				if (data < 60) {
					parentObj.RTCMinutes = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x0A:
				if (data < 24) {
					parentObj.RTCHours = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x0B:
				parentObj.RTCDays = (data & 0xFF) | (parentObj.RTCDays & 0x100);
				break;
			case 0x0C:
				parentObj.RTCDayOverFlow = (data > 0x7F);
				parentObj.RTCHalt = (data & 0x40) == 0x40;
				parentObj.RTCDays = ((data & 0x1) << 8) | (parentObj.RTCDays & 0xFF);
				break;
			default:
				cout("Invalid MBC3 bank address selected: " + parentObj.currMBCRAMBank, 0);
		}
	}
}
GameBoyCore.prototype.memoryWriteGBCRAM = function (parentObj, address, data) {
	parentObj.GBCMemory[address + parentObj.gbcRamBankPosition] = data;
}
GameBoyCore.prototype.memoryWriteOAMRAM = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 2) {
		if (parentObj.memory[address] != data) {
			parentObj.graphicsJIT();
			parentObj.memory[address] = data;
		}
	}
}
GameBoyCore.prototype.memoryWriteECHOGBCRAM = function (parentObj, address, data) {
	parentObj.GBCMemory[address + parentObj.gbcRamBankPositionECHO] = data;
}
GameBoyCore.prototype.memoryWriteECHONormal = function (parentObj, address, data) {
	parentObj.memory[address - 0x2000] = data;
}
GameBoyCore.prototype.VRAMGBDATAWrite = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 3) {
		if (parentObj.memory[address] != data) {
			parentObj.graphicsJIT();
			parentObj.memory[address] = data;
			parentObj.generateGBOAMTileLine(address);
		}
	}
}
GameBoyCore.prototype.VRAMGBDATAUpperWrite = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 3) {
		if (parentObj.memory[address] != data) {
			parentObj.graphicsJIT();
			parentObj.memory[address] = data;
			parentObj.generateGBTileLine(address);
		}
	}
}
GameBoyCore.prototype.VRAMGBCDATAWrite = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 3) {
		if (parentObj.currVRAMBank == 0) {
			if (parentObj.memory[address] != data) {
				parentObj.graphicsJIT();
				parentObj.memory[address] = data;
				parentObj.generateGBCTileLineBank1(address);
			}
		}
		else {
			address &= 0x1FFF;
			if (parentObj.VRAM[address] != data) {
				parentObj.graphicsJIT();
				parentObj.VRAM[address] = data;
				parentObj.generateGBCTileLineBank2(address);
			}
		}
	}
}
GameBoyCore.prototype.VRAMGBCHRMAPWrite = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 3) {
		address &= 0x7FF;
		if (parentObj.BGCHRBank1[address] != data) {
			parentObj.graphicsJIT();
			parentObj.BGCHRBank1[address] = data;
		}
	}
}
GameBoyCore.prototype.VRAMGBCCHRMAPWrite = function (parentObj, address, data) {
	if (parentObj.modeSTAT < 3) {
		address &= 0x7FF;
		if (parentObj.BGCHRCurrentBank[address] != data) {
			parentObj.graphicsJIT();
			parentObj.BGCHRCurrentBank[address] = data;
		}
	}
}
GameBoyCore.prototype.DMAWrite = function (tilesToTransfer) {
	if (!this.halt) {
		this.CPUTicks += 4 | ((tilesToTransfer << 5) << this.doubleSpeedShifter);
	}
	var source = (this.memory[0xFF51] << 8) | this.memory[0xFF52];
	var destination = (this.memory[0xFF53] << 8) | this.memory[0xFF54];
	var memoryReader = this.memoryReader;
	this.graphicsJIT();
	var memory = this.memory;
	if (this.currVRAMBank == 0) {
		do {
			if (destination < 0x1800) {
				memory[0x8000 | destination] = memoryReader[source](this, source++);
				memory[0x8001 | destination] = memoryReader[source](this, source++);
				memory[0x8002 | destination] = memoryReader[source](this, source++);
				memory[0x8003 | destination] = memoryReader[source](this, source++);
				memory[0x8004 | destination] = memoryReader[source](this, source++);
				memory[0x8005 | destination] = memoryReader[source](this, source++);
				memory[0x8006 | destination] = memoryReader[source](this, source++);
				memory[0x8007 | destination] = memoryReader[source](this, source++);
				memory[0x8008 | destination] = memoryReader[source](this, source++);
				memory[0x8009 | destination] = memoryReader[source](this, source++);
				memory[0x800A | destination] = memoryReader[source](this, source++);
				memory[0x800B | destination] = memoryReader[source](this, source++);
				memory[0x800C | destination] = memoryReader[source](this, source++);
				memory[0x800D | destination] = memoryReader[source](this, source++);
				memory[0x800E | destination] = memoryReader[source](this, source++);
				memory[0x800F | destination] = memoryReader[source](this, source++);
				this.generateGBCTileBank1(destination);
				destination += 0x10;
			}
			else {
				destination &= 0x7F0;
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				destination = (destination + 0x1800) & 0x1FF0;
			}
			source &= 0xFFF0;
			--tilesToTransfer;
		} while (tilesToTransfer > 0);
	}
	else {
		var VRAM = this.VRAM;
		do {
			if (destination < 0x1800) {
				VRAM[destination] = memoryReader[source](this, source++);
				VRAM[destination | 0x1] = memoryReader[source](this, source++);
				VRAM[destination | 0x2] = memoryReader[source](this, source++);
				VRAM[destination | 0x3] = memoryReader[source](this, source++);
				VRAM[destination | 0x4] = memoryReader[source](this, source++);
				VRAM[destination | 0x5] = memoryReader[source](this, source++);
				VRAM[destination | 0x6] = memoryReader[source](this, source++);
				VRAM[destination | 0x7] = memoryReader[source](this, source++);
				VRAM[destination | 0x8] = memoryReader[source](this, source++);
				VRAM[destination | 0x9] = memoryReader[source](this, source++);
				VRAM[destination | 0xA] = memoryReader[source](this, source++);
				VRAM[destination | 0xB] = memoryReader[source](this, source++);
				VRAM[destination | 0xC] = memoryReader[source](this, source++);
				VRAM[destination | 0xD] = memoryReader[source](this, source++);
				VRAM[destination | 0xE] = memoryReader[source](this, source++);
				VRAM[destination | 0xF] = memoryReader[source](this, source++);
				this.generateGBCTileBank2(destination);
				destination += 0x10;
			}
			else {
				destination &= 0x7F0;
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				destination = (destination + 0x1800) & 0x1FF0;
			}
			source &= 0xFFF0;
			--tilesToTransfer;
		} while (tilesToTransfer > 0);
	}
	memory[0xFF51] = source >> 8;
	memory[0xFF52] = source & 0xF0;
	memory[0xFF53] = destination >> 8;
	memory[0xFF54] = destination & 0xF0;
}
GameBoyCore.prototype.registerWriteJumpCompile = function () {
	this.memoryHighWriter[0] = this.memoryWriter[0xFF00] = function (parentObj, address, data) {
		parentObj.memory[0xFF00] = (data & 0x30) | ((((data & 0x20) == 0) ? (parentObj.JoyPad >> 4) : 0xF) & (((data & 0x10) == 0) ? (parentObj.JoyPad & 0xF) : 0xF));
	}
	this.memoryHighWriter[0x1] = this.memoryWriter[0xFF01] = function (parentObj, address, data) {
		if (parentObj.memory[0xFF02] < 0x80) {
			parentObj.memory[0xFF01] = data;
		}
	}
	this.memoryHighWriter[0x2] = this.memoryHighWriteNormal;
	this.memoryWriter[0xFF02] = this.memoryWriteNormal;
	this.memoryHighWriter[0x3] = this.memoryWriter[0xFF03] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x4] = this.memoryWriter[0xFF04] = function (parentObj, address, data) {
		parentObj.DIVTicks &= 0xFF;
		parentObj.memory[0xFF04] = 0;
	}
	this.memoryHighWriter[0x5] = this.memoryWriter[0xFF05] = function (parentObj, address, data) {
		parentObj.memory[0xFF05] = data;
	}
	this.memoryHighWriter[0x6] = this.memoryWriter[0xFF06] = function (parentObj, address, data) {
		parentObj.memory[0xFF06] = data;
	}
	this.memoryHighWriter[0x7] = this.memoryWriter[0xFF07] = function (parentObj, address, data) {
		parentObj.memory[0xFF07] = data & 0x07;
		parentObj.TIMAEnabled = (data & 0x04) == 0x04;
		parentObj.TACClocker = Math.pow(4, ((data & 0x3) != 0) ? (data & 0x3) : 4) << 2;
	}
	this.memoryHighWriter[0x8] = this.memoryWriter[0xFF08] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x9] = this.memoryWriter[0xFF09] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xA] = this.memoryWriter[0xFF0A] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xB] = this.memoryWriter[0xFF0B] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xC] = this.memoryWriter[0xFF0C] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xD] = this.memoryWriter[0xFF0D] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xE] = this.memoryWriter[0xFF0E] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xF] = this.memoryWriter[0xFF0F] = function (parentObj, address, data) {
		parentObj.interruptsRequested = data;
		parentObj.checkIRQMatching();
	}
	this.memoryHighWriter[0x10] = this.memoryWriter[0xFF10] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel1decreaseSweep && (data & 0x08) == 0) {
				if (parentObj.channel1Swept) {
					parentObj.channel1SweepFault = true;
				}
			}
			parentObj.channel1lastTimeSweep = (data & 0x70) >> 4;
			parentObj.channel1frequencySweepDivider = data & 0x07;
			parentObj.channel1decreaseSweep = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF10] = data;
			parentObj.channel1EnableCheck();
		}
	}
	this.memoryHighWriter[0x11] = this.memoryWriter[0xFF11] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			else {
				data &= 0x3F;
			}
			parentObj.channel1CachedDuty = parentObj.dutyLookup[data >> 6];
			parentObj.channel1totalLength = 0x40 - (data & 0x3F);
			parentObj.memory[0xFF11] = data;
			parentObj.channel1EnableCheck();
		}
	}
	this.memoryHighWriter[0x12] = this.memoryWriter[0xFF12] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel1Enabled && parentObj.channel1envelopeSweeps == 0) {
				if (((parentObj.memory[0xFF12] ^ data) & 0x8) == 0x8) {
					if ((parentObj.memory[0xFF12] & 0x8) == 0) {
						if ((parentObj.memory[0xFF12] & 0x7) == 0x7) {
							parentObj.channel1envelopeVolume += 2;
						}
						else {
							++parentObj.channel1envelopeVolume;
						}
					}
					parentObj.channel1envelopeVolume = (16 - parentObj.channel1envelopeVolume) & 0xF;
				}
				else if ((parentObj.memory[0xFF12] & 0xF) == 0x8) {
					parentObj.channel1envelopeVolume = (1 + parentObj.channel1envelopeVolume) & 0xF;
				}
				parentObj.channel1OutputLevelCache();
			}
			parentObj.channel1envelopeType = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF12] = data;
			parentObj.channel1VolumeEnableCheck();
		}
	}
	this.memoryHighWriter[0x13] = this.memoryWriter[0xFF13] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel1frequency = (parentObj.channel1frequency & 0x700) | data;
			parentObj.channel1FrequencyTracker = (0x800 - parentObj.channel1frequency) << 2;
		}
	}
	this.memoryHighWriter[0x14] = this.memoryWriter[0xFF14] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel1consecutive = ((data & 0x40) == 0x0);
			parentObj.channel1frequency = ((data & 0x7) << 8) | (parentObj.channel1frequency & 0xFF);
			parentObj.channel1FrequencyTracker = (0x800 - parentObj.channel1frequency) << 2;
			if (data > 0x7F) {
				parentObj.channel1timeSweep = parentObj.channel1lastTimeSweep;
				parentObj.channel1Swept = false;
				var nr12 = parentObj.memory[0xFF12];
				parentObj.channel1envelopeVolume = nr12 >> 4;
				parentObj.channel1OutputLevelCache();
				parentObj.channel1envelopeSweepsLast = (nr12 & 0x7) - 1;
				if (parentObj.channel1totalLength == 0) {
					parentObj.channel1totalLength = 0x40;
				}
				if (parentObj.channel1lastTimeSweep > 0 || parentObj.channel1frequencySweepDivider > 0) {
					parentObj.memory[0xFF26] |= 0x1;
				}
				else {
					parentObj.memory[0xFF26] &= 0xFE;
				}
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x1;
				}
				parentObj.channel1ShadowFrequency = parentObj.channel1frequency;
				parentObj.channel1SweepFault = false;
				parentObj.channel1AudioSweepPerformDummy();
			}
			parentObj.channel1EnableCheck();
			parentObj.memory[0xFF14] = data;
		}
	}
	this.memoryHighWriter[0x15] = this.memoryWriter[0xFF15] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x16] = this.memoryWriter[0xFF16] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			else {
				data &= 0x3F;
			}
			parentObj.channel2CachedDuty = parentObj.dutyLookup[data >> 6];
			parentObj.channel2totalLength = 0x40 - (data & 0x3F);
			parentObj.memory[0xFF16] = data;
			parentObj.channel2EnableCheck();
		}
	}
	this.memoryHighWriter[0x17] = this.memoryWriter[0xFF17] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel2Enabled && parentObj.channel2envelopeSweeps == 0) {
				if (((parentObj.memory[0xFF17] ^ data) & 0x8) == 0x8) {
					if ((parentObj.memory[0xFF17] & 0x8) == 0) {
						if ((parentObj.memory[0xFF17] & 0x7) == 0x7) {
							parentObj.channel2envelopeVolume += 2;
						}
						else {
							++parentObj.channel2envelopeVolume;
						}
					}
					parentObj.channel2envelopeVolume = (16 - parentObj.channel2envelopeVolume) & 0xF;
				}
				else if ((parentObj.memory[0xFF17] & 0xF) == 0x8) {
					parentObj.channel2envelopeVolume = (1 + parentObj.channel2envelopeVolume) & 0xF;
				}
				parentObj.channel2OutputLevelCache();
			}
			parentObj.channel2envelopeType = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF17] = data;
			parentObj.channel2VolumeEnableCheck();
		}
	}
	this.memoryHighWriter[0x18] = this.memoryWriter[0xFF18] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel2frequency = (parentObj.channel2frequency & 0x700) | data;
			parentObj.channel2FrequencyTracker = (0x800 - parentObj.channel2frequency) << 2;
		}
	}
	this.memoryHighWriter[0x19] = this.memoryWriter[0xFF19] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (data > 0x7F) {
				var nr22 = parentObj.memory[0xFF17];
				parentObj.channel2envelopeVolume = nr22 >> 4;
				parentObj.channel2OutputLevelCache();
				parentObj.channel2envelopeSweepsLast = (nr22 & 0x7) - 1;
				if (parentObj.channel2totalLength == 0) {
					parentObj.channel2totalLength = 0x40;
				}
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x2;
				}
			}
			parentObj.channel2consecutive = ((data & 0x40) == 0x0);
			parentObj.channel2frequency = ((data & 0x7) << 8) | (parentObj.channel2frequency & 0xFF);
			parentObj.channel2FrequencyTracker = (0x800 - parentObj.channel2frequency) << 2;
			parentObj.memory[0xFF19] = data;
			parentObj.channel2EnableCheck();
		}
	}
	this.memoryHighWriter[0x1A] = this.memoryWriter[0xFF1A] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (!parentObj.channel3canPlay && data >= 0x80) {
				parentObj.channel3lastSampleLookup = 0;
				parentObj.channel3UpdateCache();
			}
			parentObj.channel3canPlay = (data > 0x7F);
			if (parentObj.channel3canPlay && parentObj.memory[0xFF1A] > 0x7F && !parentObj.channel3consecutive) {
				parentObj.memory[0xFF26] |= 0x4;
			}
			parentObj.memory[0xFF1A] = data;
		}
	}
	this.memoryHighWriter[0x1B] = this.memoryWriter[0xFF1B] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			parentObj.channel3totalLength = 0x100 - data;
			parentObj.channel3EnableCheck();
		}
	}
	this.memoryHighWriter[0x1C] = this.memoryWriter[0xFF1C] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			data &= 0x60;
			parentObj.memory[0xFF1C] = data;
			parentObj.channel3patternType = (data == 0) ? 4 : ((data >> 5) - 1);
		}
	}
	this.memoryHighWriter[0x1D] = this.memoryWriter[0xFF1D] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel3frequency = (parentObj.channel3frequency & 0x700) | data;
			parentObj.channel3FrequencyPeriod = (0x800 - parentObj.channel3frequency) << 1;
		}
	}
	this.memoryHighWriter[0x1E] = this.memoryWriter[0xFF1E] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (data > 0x7F) {
				if (parentObj.channel3totalLength == 0) {
					parentObj.channel3totalLength = 0x100;
				}
				parentObj.channel3lastSampleLookup = 0;
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x4;
				}
			}
			parentObj.channel3consecutive = ((data & 0x40) == 0x0);
			parentObj.channel3frequency = ((data & 0x7) << 8) | (parentObj.channel3frequency & 0xFF);
			parentObj.channel3FrequencyPeriod = (0x800 - parentObj.channel3frequency) << 1;
			parentObj.memory[0xFF1E] = data;
			parentObj.channel3EnableCheck();
		}
	}
	this.memoryHighWriter[0x1F] = this.memoryWriter[0xFF1F] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x20] = this.memoryWriter[0xFF20] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			parentObj.channel4totalLength = 0x40 - (data & 0x3F);
			parentObj.channel4EnableCheck();
		}
	}
	this.memoryHighWriter[0x21] = this.memoryWriter[0xFF21] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel4Enabled && parentObj.channel4envelopeSweeps == 0) {
				if (((parentObj.memory[0xFF21] ^ data) & 0x8) == 0x8) {
					if ((parentObj.memory[0xFF21] & 0x8) == 0) {
						if ((parentObj.memory[0xFF21] & 0x7) == 0x7) {
							parentObj.channel4envelopeVolume += 2;
						}
						else {
							++parentObj.channel4envelopeVolume;
						}
					}
					parentObj.channel4envelopeVolume = (16 - parentObj.channel4envelopeVolume) & 0xF;
				}
				else if ((parentObj.memory[0xFF21] & 0xF) == 0x8) {
					parentObj.channel4envelopeVolume = (1 + parentObj.channel4envelopeVolume) & 0xF;
				}
				parentObj.channel4currentVolume = parentObj.channel4envelopeVolume << parentObj.channel4VolumeShifter;
			}
			parentObj.channel4envelopeType = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF21] = data;
			parentObj.channel4UpdateCache();
			parentObj.channel4VolumeEnableCheck();
		}
	}
	this.memoryHighWriter[0x22] = this.memoryWriter[0xFF22] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel4FrequencyPeriod = Math.max((data & 0x7) << 4, 8) << (data >> 4);
			var bitWidth = (data & 0x8);
			if ((bitWidth == 0x8 && parentObj.channel4BitRange == 0x7FFF) || (bitWidth == 0 && parentObj.channel4BitRange == 0x7F)) {
				parentObj.channel4lastSampleLookup = 0;
				parentObj.channel4BitRange = (bitWidth == 0x8) ? 0x7F : 0x7FFF;
				parentObj.channel4VolumeShifter = (bitWidth == 0x8) ? 7 : 15;
				parentObj.channel4currentVolume = parentObj.channel4envelopeVolume << parentObj.channel4VolumeShifter;
				parentObj.noiseSampleTable = (bitWidth == 0x8) ? parentObj.LSFR7Table : parentObj.LSFR15Table;
			}
			parentObj.memory[0xFF22] = data;
			parentObj.channel4UpdateCache();
		}
	}
	this.memoryHighWriter[0x23] = this.memoryWriter[0xFF23] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.memory[0xFF23] = data;
			parentObj.channel4consecutive = ((data & 0x40) == 0x0);
			if (data > 0x7F) {
				var nr42 = parentObj.memory[0xFF21];
				parentObj.channel4envelopeVolume = nr42 >> 4;
				parentObj.channel4currentVolume = parentObj.channel4envelopeVolume << parentObj.channel4VolumeShifter;
				parentObj.channel4envelopeSweepsLast = (nr42 & 0x7) - 1;
				if (parentObj.channel4totalLength == 0) {
					parentObj.channel4totalLength = 0x40;
				}
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x8;
				}
			}
			parentObj.channel4EnableCheck();
		}
	}
	this.memoryHighWriter[0x24] = this.memoryWriter[0xFF24] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled && parentObj.memory[0xFF24] != data) {
			parentObj.audioJIT();
			parentObj.memory[0xFF24] = data;
			parentObj.VinLeftChannelMasterVolume = ((data >> 4) & 0x07) + 1;
			parentObj.VinRightChannelMasterVolume = (data & 0x07) + 1;
			parentObj.mixerOutputLevelCache();
		}
	}
	this.memoryHighWriter[0x25] = this.memoryWriter[0xFF25] = function (parentObj, address, data) {
		if (parentObj.soundMasterEnabled && parentObj.memory[0xFF25] != data) {
			parentObj.audioJIT();
			parentObj.memory[0xFF25] = data;
			parentObj.rightChannel1 = ((data & 0x01) == 0x01);
			parentObj.rightChannel2 = ((data & 0x02) == 0x02);
			parentObj.rightChannel3 = ((data & 0x04) == 0x04);
			parentObj.rightChannel4 = ((data & 0x08) == 0x08);
			parentObj.leftChannel1 = ((data & 0x10) == 0x10);
			parentObj.leftChannel2 = ((data & 0x20) == 0x20);
			parentObj.leftChannel3 = ((data & 0x40) == 0x40);
			parentObj.leftChannel4 = (data > 0x7F);
			parentObj.channel1OutputLevelCache();
			parentObj.channel2OutputLevelCache();
			parentObj.channel3OutputLevelCache();
			parentObj.channel4OutputLevelCache();
		}
	}
	this.memoryHighWriter[0x26] = this.memoryWriter[0xFF26] = function (parentObj, address, data) {
		parentObj.audioJIT();
		if (!parentObj.soundMasterEnabled && data > 0x7F) {
			parentObj.memory[0xFF26] = 0x80;
			parentObj.soundMasterEnabled = true;
			parentObj.initializeAudioStartState();
		}
		else if (parentObj.soundMasterEnabled && data < 0x80) {
			parentObj.memory[0xFF26] = 0;
			parentObj.soundMasterEnabled = false;
			for (var index = 0xFF10; index < 0xFF26; index++) {
				parentObj.memoryWriter[index](parentObj, index, 0);
			}
		}
	}
	this.memoryHighWriter[0x27] = this.memoryWriter[0xFF27] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x28] = this.memoryWriter[0xFF28] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x29] = this.memoryWriter[0xFF29] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2A] = this.memoryWriter[0xFF2A] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2B] = this.memoryWriter[0xFF2B] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2C] = this.memoryWriter[0xFF2C] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2D] = this.memoryWriter[0xFF2D] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2E] = this.memoryWriter[0xFF2E] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2F] = this.memoryWriter[0xFF2F] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x30] = this.memoryWriter[0xFF30] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0, data);
	}
	this.memoryHighWriter[0x31] = this.memoryWriter[0xFF31] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x1, data);
	}
	this.memoryHighWriter[0x32] = this.memoryWriter[0xFF32] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x2, data);
	}
	this.memoryHighWriter[0x33] = this.memoryWriter[0xFF33] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x3, data);
	}
	this.memoryHighWriter[0x34] = this.memoryWriter[0xFF34] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x4, data);
	}
	this.memoryHighWriter[0x35] = this.memoryWriter[0xFF35] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x5, data);
	}
	this.memoryHighWriter[0x36] = this.memoryWriter[0xFF36] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x6, data);
	}
	this.memoryHighWriter[0x37] = this.memoryWriter[0xFF37] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x7, data);
	}
	this.memoryHighWriter[0x38] = this.memoryWriter[0xFF38] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x8, data);
	}
	this.memoryHighWriter[0x39] = this.memoryWriter[0xFF39] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0x9, data);
	}
	this.memoryHighWriter[0x3A] = this.memoryWriter[0xFF3A] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0xA, data);
	}
	this.memoryHighWriter[0x3B] = this.memoryWriter[0xFF3B] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0xB, data);
	}
	this.memoryHighWriter[0x3C] = this.memoryWriter[0xFF3C] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0xC, data);
	}
	this.memoryHighWriter[0x3D] = this.memoryWriter[0xFF3D] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0xD, data);
	}
	this.memoryHighWriter[0x3E] = this.memoryWriter[0xFF3E] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0xE, data);
	}
	this.memoryHighWriter[0x3F] = this.memoryWriter[0xFF3F] = function (parentObj, address, data) {
		parentObj.channel3WriteRAM(0xF, data);
	}
	this.memoryHighWriter[0x42] = this.memoryWriter[0xFF42] = function (parentObj, address, data) {
		if (parentObj.backgroundY != data) {
			parentObj.midScanLineJIT();
			parentObj.backgroundY = data;
		}
	}
	this.memoryHighWriter[0x43] = this.memoryWriter[0xFF43] = function (parentObj, address, data) {
		if (parentObj.backgroundX != data) {
			parentObj.midScanLineJIT();
			parentObj.backgroundX = data;
		}
	}
	this.memoryHighWriter[0x44] = this.memoryWriter[0xFF44] = function (parentObj, address, data) {
		if (parentObj.LCDisOn) {
			parentObj.modeSTAT = 2;
			parentObj.midScanlineOffset = -1;
			parentObj.totalLinesPassed = parentObj.currentX = parentObj.queuedScanLines = parentObj.lastUnrenderedLine = parentObj.LCDTicks = parentObj.STATTracker = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
		}
	}
	this.memoryHighWriter[0x45] = this.memoryWriter[0xFF45] = function (parentObj, address, data) {
		if (parentObj.memory[0xFF45] != data) {
			parentObj.memory[0xFF45] = data;
			if (parentObj.LCDisOn) {
				parentObj.matchLYC();
			}
		}
	}
	this.memoryHighWriter[0x4A] = this.memoryWriter[0xFF4A] = function (parentObj, address, data) {
		if (parentObj.windowY != data) {
			parentObj.midScanLineJIT();
			parentObj.windowY = data;
		}
	}
	this.memoryHighWriter[0x4B] = this.memoryWriter[0xFF4B] = function (parentObj, address, data) {
		if (parentObj.memory[0xFF4B] != data) {
			parentObj.midScanLineJIT();
			parentObj.memory[0xFF4B] = data;
			parentObj.windowX = data - 7;
		}
	}
	this.memoryHighWriter[0x72] = this.memoryWriter[0xFF72] = function (parentObj, address, data) {
		parentObj.memory[0xFF72] = data;
	}
	this.memoryHighWriter[0x73] = this.memoryWriter[0xFF73] = function (parentObj, address, data) {
		parentObj.memory[0xFF73] = data;
	}
	this.memoryHighWriter[0x75] = this.memoryWriter[0xFF75] = function (parentObj, address, data) {
		parentObj.memory[0xFF75] = data;
	}
	this.memoryHighWriter[0x76] = this.memoryWriter[0xFF76] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x77] = this.memoryWriter[0xFF77] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xFF] = this.memoryWriter[0xFFFF] = function (parentObj, address, data) {
		parentObj.interruptsEnabled = data;
		parentObj.checkIRQMatching();
	}
	this.recompileModelSpecificIOWriteHandling();
	this.recompileBootIOWriteHandling();
}
GameBoyCore.prototype.recompileModelSpecificIOWriteHandling = function () {
	if (this.cGBC) {
		this.memoryHighWriter[0x2] = this.memoryWriter[0xFF02] = function (parentObj, address, data) {
			if (((data & 0x1) == 0x1)) {
				parentObj.memory[0xFF02] = (data & 0x7F);
				parentObj.serialTimer = ((data & 0x2) == 0) ? 4096 : 128;
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = ((data & 0x2) == 0) ? 512 : 16;
			}
			else {
				parentObj.memory[0xFF02] = data;
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = parentObj.serialTimer = 0;
			}
		}
		this.memoryHighWriter[0x40] = this.memoryWriter[0xFF40] = function (parentObj, address, data) {
			if (parentObj.memory[0xFF40] != data) {
				parentObj.midScanLineJIT();
				var temp_var = (data > 0x7F);
				if (temp_var != parentObj.LCDisOn) {
					parentObj.LCDisOn = temp_var;
					parentObj.memory[0xFF41] &= 0x78;
					parentObj.midScanlineOffset = -1;
					parentObj.totalLinesPassed = parentObj.currentX = parentObj.queuedScanLines = parentObj.lastUnrenderedLine = parentObj.STATTracker = parentObj.LCDTicks = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
					if (parentObj.LCDisOn) {
						parentObj.modeSTAT = 2;
						parentObj.matchLYC();
						parentObj.LCDCONTROL = parentObj.LINECONTROL;
					}
					else {
						parentObj.modeSTAT = 0;
						parentObj.LCDCONTROL = parentObj.DISPLAYOFFCONTROL;
						parentObj.DisplayShowOff();
					}
					parentObj.interruptsRequested &= 0xFD;
				}
				parentObj.gfxWindowCHRBankPosition = ((data & 0x40) == 0x40) ? 0x400 : 0;
				parentObj.gfxWindowDisplay = ((data & 0x20) == 0x20);
				parentObj.gfxBackgroundBankOffset = ((data & 0x10) == 0x10) ? 0 : 0x80;
				parentObj.gfxBackgroundCHRBankPosition = ((data & 0x08) == 0x08) ? 0x400 : 0;
				parentObj.gfxSpriteNormalHeight = ((data & 0x04) == 0);
				parentObj.gfxSpriteShow = ((data & 0x02) == 0x02);
				parentObj.BGPriorityEnabled = ((data & 0x01) == 0x01);
				parentObj.priorityFlaggingPathRebuild();
				parentObj.memory[0xFF40] = data;
			}
		}
		this.memoryHighWriter[0x41] = this.memoryWriter[0xFF41] = function (parentObj, address, data) {
			parentObj.LYCMatchTriggerSTAT = ((data & 0x40) == 0x40);
			parentObj.mode2TriggerSTAT = ((data & 0x20) == 0x20);
			parentObj.mode1TriggerSTAT = ((data & 0x10) == 0x10);
			parentObj.mode0TriggerSTAT = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF41] = data & 0x78;
		}
		this.memoryHighWriter[0x46] = this.memoryWriter[0xFF46] = function (parentObj, address, data) {
			parentObj.memory[0xFF46] = data;
			if (data < 0xE0) {
				data <<= 8;
				address = 0xFE00;
				var stat = parentObj.modeSTAT;
				parentObj.modeSTAT = 0;
				var newData = 0;
				do {
					newData = parentObj.memoryReader[data](parentObj, data++);
					if (newData != parentObj.memory[address]) {
						parentObj.modeSTAT = stat;
						parentObj.graphicsJIT();
						parentObj.modeSTAT = 0;
						parentObj.memory[address++] = newData;
						break;
					}
				} while (++address < 0xFEA0);
				if (address < 0xFEA0) {
					do {
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
					} while (address < 0xFEA0);
				}
				parentObj.modeSTAT = stat;
			}
		}
		this.memoryHighWriter[0x4D] = this.memoryWriter[0xFF4D] = function (parentObj, address, data) {
			parentObj.memory[0xFF4D] = (data & 0x7F) | (parentObj.memory[0xFF4D] & 0x80);
		}
		this.memoryHighWriter[0x4F] = this.memoryWriter[0xFF4F] = function (parentObj, address, data) {
			parentObj.currVRAMBank = data & 0x01;
			if (parentObj.currVRAMBank > 0) {
				parentObj.BGCHRCurrentBank = parentObj.BGCHRBank2;
			}
			else {
				parentObj.BGCHRCurrentBank = parentObj.BGCHRBank1;
			}
		}
		this.memoryHighWriter[0x51] = this.memoryWriter[0xFF51] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF51] = data;
			}
		}
		this.memoryHighWriter[0x52] = this.memoryWriter[0xFF52] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF52] = data & 0xF0;
			}
		}
		this.memoryHighWriter[0x53] = this.memoryWriter[0xFF53] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF53] = data & 0x1F;
			}
		}
		this.memoryHighWriter[0x54] = this.memoryWriter[0xFF54] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF54] = data & 0xF0;
			}
		}
		this.memoryHighWriter[0x55] = this.memoryWriter[0xFF55] = function (parentObj, address, data) {
			if (!parentObj.hdmaRunning) {
				if ((data & 0x80) == 0) {
					parentObj.DMAWrite((data & 0x7F) + 1);
					parentObj.memory[0xFF55] = 0xFF;
				}
				else {
					parentObj.hdmaRunning = true;
					parentObj.memory[0xFF55] = data & 0x7F;
				}
			}
			else if ((data & 0x80) == 0) {
				parentObj.hdmaRunning = false;
				parentObj.memory[0xFF55] |= 0x80;
			}
			else {
				parentObj.memory[0xFF55] = data & 0x7F;
			}
		}
		this.memoryHighWriter[0x68] = this.memoryWriter[0xFF68] = function (parentObj, address, data) {
			parentObj.memory[0xFF69] = parentObj.gbcBGRawPalette[data & 0x3F];
			parentObj.memory[0xFF68] = data;
		}
		this.memoryHighWriter[0x69] = this.memoryWriter[0xFF69] = function (parentObj, address, data) {
			parentObj.updateGBCBGPalette(parentObj.memory[0xFF68] & 0x3F, data);
			if (parentObj.memory[0xFF68] > 0x7F) {
				var next = ((parentObj.memory[0xFF68] + 1) & 0x3F);
				parentObj.memory[0xFF68] = (next | 0x80);
				parentObj.memory[0xFF69] = parentObj.gbcBGRawPalette[next];
			}
			else {
				parentObj.memory[0xFF69] = data;
			}
		}
		this.memoryHighWriter[0x6A] = this.memoryWriter[0xFF6A] = function (parentObj, address, data) {
			parentObj.memory[0xFF6B] = parentObj.gbcOBJRawPalette[data & 0x3F];
			parentObj.memory[0xFF6A] = data;
		}
		this.memoryHighWriter[0x6B] = this.memoryWriter[0xFF6B] = function (parentObj, address, data) {
			parentObj.updateGBCOBJPalette(parentObj.memory[0xFF6A] & 0x3F, data);
			if (parentObj.memory[0xFF6A] > 0x7F) {
				var next = ((parentObj.memory[0xFF6A] + 1) & 0x3F);
				parentObj.memory[0xFF6A] = (next | 0x80);
				parentObj.memory[0xFF6B] = parentObj.gbcOBJRawPalette[next];
			}
			else {
				parentObj.memory[0xFF6B] = data;
			}
		}
		this.memoryHighWriter[0x70] = this.memoryWriter[0xFF70] = function (parentObj, address, data) {
			var addressCheck = (parentObj.memory[0xFF51] << 8) | parentObj.memory[0xFF52];
			if (!parentObj.hdmaRunning || addressCheck < 0xD000 || addressCheck >= 0xE000) {
				parentObj.gbcRamBank = Math.max(data & 0x07, 1);
				parentObj.gbcRamBankPosition = ((parentObj.gbcRamBank - 1) << 12) - 0xD000;
				parentObj.gbcRamBankPositionECHO = parentObj.gbcRamBankPosition - 0x2000;
			}
			parentObj.memory[0xFF70] = data;
		}
		this.memoryHighWriter[0x74] = this.memoryWriter[0xFF74] = function (parentObj, address, data) {
			parentObj.memory[0xFF74] = data;
		}
	}
	else {
		this.memoryHighWriter[0x2] = this.memoryWriter[0xFF02] = function (parentObj, address, data) {
			if (((data & 0x1) == 0x1)) {
				parentObj.memory[0xFF02] = (data & 0x7F);
				parentObj.serialTimer = 4096;
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = 512;
			}
			else {
				parentObj.memory[0xFF02] = data;
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = parentObj.serialTimer = 0;
			}
		}
		this.memoryHighWriter[0x40] = this.memoryWriter[0xFF40] = function (parentObj, address, data) {
			if (parentObj.memory[0xFF40] != data) {
				parentObj.midScanLineJIT();
				var temp_var = (data > 0x7F);
				if (temp_var != parentObj.LCDisOn) {
					parentObj.LCDisOn = temp_var;
					parentObj.memory[0xFF41] &= 0x78;
					parentObj.midScanlineOffset = -1;
					parentObj.totalLinesPassed = parentObj.currentX = parentObj.queuedScanLines = parentObj.lastUnrenderedLine = parentObj.STATTracker = parentObj.LCDTicks = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
					if (parentObj.LCDisOn) {
						parentObj.modeSTAT = 2;
						parentObj.matchLYC();
						parentObj.LCDCONTROL = parentObj.LINECONTROL;
					}
					else {
						parentObj.modeSTAT = 0;
						parentObj.LCDCONTROL = parentObj.DISPLAYOFFCONTROL;
						parentObj.DisplayShowOff();
					}
					parentObj.interruptsRequested &= 0xFD;
				}
				parentObj.gfxWindowCHRBankPosition = ((data & 0x40) == 0x40) ? 0x400 : 0;
				parentObj.gfxWindowDisplay = (data & 0x20) == 0x20;
				parentObj.gfxBackgroundBankOffset = ((data & 0x10) == 0x10) ? 0 : 0x80;
				parentObj.gfxBackgroundCHRBankPosition = ((data & 0x08) == 0x08) ? 0x400 : 0;
				parentObj.gfxSpriteNormalHeight = ((data & 0x04) == 0);
				parentObj.gfxSpriteShow = (data & 0x02) == 0x02;
				parentObj.bgEnabled = ((data & 0x01) == 0x01);
				parentObj.memory[0xFF40] = data;
			}
		}
		this.memoryHighWriter[0x41] = this.memoryWriter[0xFF41] = function (parentObj, address, data) {
			parentObj.LYCMatchTriggerSTAT = ((data & 0x40) == 0x40);
			parentObj.mode2TriggerSTAT = ((data & 0x20) == 0x20);
			parentObj.mode1TriggerSTAT = ((data & 0x10) == 0x10);
			parentObj.mode0TriggerSTAT = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF41] = data & 0x78;
			if ((!parentObj.usedBootROM || !parentObj.usedGBCBootROM) && parentObj.LCDisOn && parentObj.modeSTAT < 2) {
				parentObj.interruptsRequested |= 0x2;
				parentObj.checkIRQMatching();
			}
		}
		this.memoryHighWriter[0x46] = this.memoryWriter[0xFF46] = function (parentObj, address, data) {
			parentObj.memory[0xFF46] = data;
			if (data > 0x7F && data < 0xE0) {
				data <<= 8;
				address = 0xFE00;
				var stat = parentObj.modeSTAT;
				parentObj.modeSTAT = 0;
				var newData = 0;
				do {
					newData = parentObj.memoryReader[data](parentObj, data++);
					if (newData != parentObj.memory[address]) {
						parentObj.modeSTAT = stat;
						parentObj.graphicsJIT();
						parentObj.modeSTAT = 0;
						parentObj.memory[address++] = newData;
						break;
					}
				} while (++address < 0xFEA0);
				if (address < 0xFEA0) {
					do {
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
					} while (address < 0xFEA0);
				}
				parentObj.modeSTAT = stat;
			}
		}
		this.memoryHighWriter[0x47] = this.memoryWriter[0xFF47] = function (parentObj, address, data) {
			if (parentObj.memory[0xFF47] != data) {
				parentObj.midScanLineJIT();
				parentObj.updateGBBGPalette(data);
				parentObj.memory[0xFF47] = data;
			}
		}
		this.memoryHighWriter[0x48] = this.memoryWriter[0xFF48] = function (parentObj, address, data) {
			if (parentObj.memory[0xFF48] != data) {
				parentObj.midScanLineJIT();
				parentObj.updateGBOBJPalette(0, data);
				parentObj.memory[0xFF48] = data;
			}
		}
		this.memoryHighWriter[0x49] = this.memoryWriter[0xFF49] = function (parentObj, address, data) {
			if (parentObj.memory[0xFF49] != data) {
				parentObj.midScanLineJIT();
				parentObj.updateGBOBJPalette(4, data);
				parentObj.memory[0xFF49] = data;
			}
		}
		this.memoryHighWriter[0x4D] = this.memoryWriter[0xFF4D] = function (parentObj, address, data) {
			parentObj.memory[0xFF4D] = data;
		}
		this.memoryHighWriter[0x4F] = this.memoryWriter[0xFF4F] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x55] = this.memoryWriter[0xFF55] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x68] = this.memoryWriter[0xFF68] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x69] = this.memoryWriter[0xFF69] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x6A] = this.memoryWriter[0xFF6A] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x6B] = this.memoryWriter[0xFF6B] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x6C] = this.memoryWriter[0xFF6C] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x70] = this.memoryWriter[0xFF70] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x74] = this.memoryWriter[0xFF74] = this.cartIgnoreWrite;
	}
}
GameBoyCore.prototype.recompileBootIOWriteHandling = function () {
	if (this.inBootstrap) {
		this.memoryHighWriter[0x50] = this.memoryWriter[0xFF50] = function (parentObj, address, data) {
			cout("Boot ROM reads blocked: Bootstrap process has ended.", 0);
			parentObj.inBootstrap = false;
			parentObj.disableBootROM();
			parentObj.memory[0xFF50] = data;
		}
		if (this.cGBC) {
			this.memoryHighWriter[0x6C] = this.memoryWriter[0xFF6C] = function (parentObj, address, data) {
				if (parentObj.inBootstrap) {
					parentObj.cGBC = ((data & 0x1) == 0);
					if (parentObj.name + parentObj.gameCode + parentObj.ROM[0x143] == "Game and Watch 50") {
						parentObj.cGBC = true;
						cout("Created a boot exception for Game and Watch Gallery 2 (GBC ID byte is wrong on the cartridge).", 1);
					}
					cout("Booted to GBC Mode: " + parentObj.cGBC, 0);
				}
				parentObj.memory[0xFF6C] = data;
			}
		}
	}
	else {
		this.memoryHighWriter[0x50] = this.memoryWriter[0xFF50] = this.cartIgnoreWrite;
	}
}
GameBoyCore.prototype.toTypedArray = function (baseArray, memtype) {
	try {
		if (settings[5]) {
			return baseArray;
		}
		if (!baseArray || !baseArray.length) {
			return [];
		}
		var length = baseArray.length;
		switch (memtype) {
			case "uint8":
				var typedArrayTemp = new Uint8Array(length);
				break;
			case "int8":
				var typedArrayTemp = new Int8Array(length);
				break;
			case "int32":
				var typedArrayTemp = new Int32Array(length);
				break;
			case "float32":
				var typedArrayTemp = new Float32Array(length);
		}
		for (var index = 0; index < length; index++) {
			typedArrayTemp[index] = baseArray[index];
		}
		return typedArrayTemp;
	}
	catch (error) {
		cout("Could not convert an array to a typed array: " + error.message, 1);
		return baseArray;
	}
}
GameBoyCore.prototype.fromTypedArray = function (baseArray) {
	try {
		if (!baseArray || !baseArray.length) {
			return [];
		}
		var arrayTemp = [];
		for (var index = 0; index < baseArray.length; ++index) {
			arrayTemp[index] = baseArray[index];
		}
		return arrayTemp;
	}
	catch (error) {
		cout("Conversion from a typed array failed: " + error.message, 1);
		return baseArray;
	}
}
GameBoyCore.prototype.getTypedArray = function (length, defaultValue, numberType) {
	try {
		if (settings[5]) {
			throw (new Error("Settings forced typed arrays to be disabled."));
		}
		switch (numberType) {
			case "int8":
				var arrayHandle = new Int8Array(length);
				break;
			case "uint8":
				var arrayHandle = new Uint8Array(length);
				break;
			case "int32":
				var arrayHandle = new Int32Array(length);
				break;
			case "float32":
				var arrayHandle = new Float32Array(length);
		}
		if (defaultValue != 0) {
			var index = 0;
			while (index < length) {
				arrayHandle[index++] = defaultValue;
			}
		}
	}
	catch (error) {
		cout("Could not convert an array to a typed array: " + error.message, 1);
		var arrayHandle = [];
		var index = 0;
		while (index < length) {
			arrayHandle[index++] = defaultValue;
		}
	}
	return arrayHandle;
}
