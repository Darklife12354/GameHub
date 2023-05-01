"use strict";
function GameBoyAdvanceBGMatrixRenderer(gfx, BGLayer) {
    BGLayer = BGLayer | 0;
    this.gfx = gfx;
    this.BGLayer = BGLayer | 0;
}
GameBoyAdvanceBGMatrixRenderer.prototype.initialize = function () {
    this.VRAM = this.gfx.VRAM;
    this.palette = this.gfx.palette256;
    if ((this.BGLayer & 0x1) == 0) {
        this.bgAffineRenderer = this.gfx.bgAffineRenderer0;
    }
    else {
        this.bgAffineRenderer = this.gfx.bgAffineRenderer1;
    }
    this.screenSizePreprocess();
    this.screenBaseBlockPreprocess();
    this.characterBaseBlockPreprocess();
    this.displayOverflowProcess(0);
}
GameBoyAdvanceBGMatrixRenderer.prototype.renderScanLine = function (line) {
    line = line | 0;
    this.bgAffineRenderer.renderScanLine(line | 0, this);
}
if (typeof Math.imul == "function") {
    GameBoyAdvanceBGMatrixRenderer.prototype.fetchTile = function (x, y) {
        x = x | 0;
        y = y | 0;
        var tileNumber = ((x | 0) + Math.imul(y | 0, this.mapSize | 0)) | 0;
        return this.VRAM[((tileNumber | 0) + (this.BGScreenBaseBlock | 0)) & 0xFFFF] | 0;
    }
}
else {
    GameBoyAdvanceBGMatrixRenderer.prototype.fetchTile = function (x, y) {
        var tileNumber = x + (y * this.mapSize);
        return this.VRAM[(tileNumber + this.BGScreenBaseBlock) & 0xFFFF];
    }
}
GameBoyAdvanceBGMatrixRenderer.prototype.computeScreenAddress = function (x, y) {
    x = x | 0;
    y = y | 0;
    var address = this.fetchTile(x >> 3, y >> 3) << 6;
    address = ((address | 0) + (this.BGCharacterBaseBlock | 0)) | 0;
    address = ((address | 0) + ((y & 0x7) << 3)) | 0;
    address = ((address | 0) + (x & 0x7)) | 0;
    return address | 0;
}
GameBoyAdvanceBGMatrixRenderer.prototype.fetchPixelOverflow = function (x, y) {
    x = x | 0;
    y = y | 0;
    var address = this.computeScreenAddress(x & this.mapSizeComparer, y & this.mapSizeComparer) | 0;
    return this.palette[this.VRAM[address & 0xFFFF] & 0xFF] | 0;
}
GameBoyAdvanceBGMatrixRenderer.prototype.fetchPixelNoOverflow = function (x, y) {
    x = x | 0;
    y = y | 0;
    if ((x | 0) != (x & this.mapSizeComparer) || (y | 0) != (y & this.mapSizeComparer)) {
        return 0x3800000;
    }
    var address = this.computeScreenAddress(x | 0, y | 0) | 0;
    return this.palette[this.VRAM[address & 0xFFFF] & 0xFF] | 0;
}
GameBoyAdvanceBGMatrixRenderer.prototype.screenBaseBlockPreprocess = function () {
    this.BGScreenBaseBlock = this.gfx.BGScreenBaseBlock[this.BGLayer & 3] << 11;
}
GameBoyAdvanceBGMatrixRenderer.prototype.characterBaseBlockPreprocess = function () {
    this.BGCharacterBaseBlock = this.gfx.BGCharacterBaseBlock[this.BGLayer & 3] << 14;
}
GameBoyAdvanceBGMatrixRenderer.prototype.screenSizePreprocess = function () {
    this.mapSize = 0x10 << (this.gfx.BGScreenSize[this.BGLayer & 3] | 0);
    this.mapSizeComparer = ((this.mapSize << 3) - 1) | 0;
}
GameBoyAdvanceBGMatrixRenderer.prototype.displayOverflowPreprocess = function (doOverflow) {
    doOverflow = doOverflow | 0;
    if ((doOverflow | 0) != (this.BGDisplayOverflow | 0)) {
        this.displayOverflowProcess(doOverflow | 0);
    }
}
GameBoyAdvanceBGMatrixRenderer.prototype.displayOverflowProcess = function (doOverflow) {
    doOverflow = doOverflow | 0;
    this.BGDisplayOverflow = doOverflow | 0;
    if ((doOverflow | 0) != 0) {
        this.fetchPixel = this.fetchPixelOverflow;
    }
    else {
        this.fetchPixel = this.fetchPixelNoOverflow;
    }
}