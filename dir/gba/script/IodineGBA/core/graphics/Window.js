"use strict";
function GameBoyAdvanceWindowRenderer(compositor) {
    this.compositor = compositor;
}
GameBoyAdvanceWindowRenderer.prototype.initialize = function () {
    this.compositor.initialize();
    this.WINXCoordRight = 0;
    this.WINXCoordLeft = 0;
    this.WINYCoordBottom = 0;
    this.WINYCoordTop = 0;
    this.windowDisplayControl = 0;
    this.preprocess();
}
GameBoyAdvanceWindowRenderer.prototype.renderScanLine = function (line, toRender) {
    line = line | 0;
    toRender = toRender | 0;
    toRender = toRender & this.windowDisplayControl;
    if (this.checkYRange(line | 0)) {
        var right = this.WINXCoordRight | 0;
        var left = this.WINXCoordLeft | 0;
        if ((left | 0) <= (right | 0)) {
            left = Math.min(left | 0, 240) | 0;
            right = Math.min(right | 0, 240) | 0;
            this.compositor.renderScanLine(left | 0, right | 0, toRender | 0);
        }
        else {
            left = Math.min(left | 0, 240) | 0;
            right = Math.min(right | 0, 240) | 0;
            this.compositor.renderScanLine(0, right | 0, toRender | 0);
            this.compositor.renderScanLine(left | 0, 240, toRender | 0);
        }
    }
}
GameBoyAdvanceWindowRenderer.prototype.checkYRange = function (line) {
    line = line | 0;
    var bottom = this.WINYCoordBottom | 0;
    var top = this.WINYCoordTop | 0;
    if ((top | 0) <= (bottom | 0)) {
        return ((line | 0) >= (top | 0) && (line | 0) < (bottom | 0));
    }
    else {
        return ((line | 0) < (top | 0) || (line | 0) >= (bottom | 0));
    }
}
GameBoyAdvanceWindowRenderer.prototype.preprocess = function () {
    this.compositor.preprocess(this.windowDisplayControl & 0x20);
}
GameBoyAdvanceWindowRenderer.prototype.writeWINXCOORDRight8 = function (data) {
    data = data | 0;
    this.WINXCoordRight = data | 0;
}
GameBoyAdvanceWindowRenderer.prototype.writeWINXCOORDLeft8 = function (data) {
    data = data | 0;
    this.WINXCoordLeft = data | 0;
}
GameBoyAdvanceWindowRenderer.prototype.writeWINYCOORDBottom8 = function (data) {
    data = data | 0;
    this.WINYCoordBottom = data | 0;
}
GameBoyAdvanceWindowRenderer.prototype.writeWINYCOORDTop8 = function (data) {
    data = data | 0;
    this.WINYCoordTop = data | 0;
}
GameBoyAdvanceWindowRenderer.prototype.writeWINXCOORD16 = function (data) {
    data = data | 0;
    this.WINXCoordRight = data & 0xFF;
    this.WINXCoordLeft = data >> 8;
}
GameBoyAdvanceWindowRenderer.prototype.writeWINYCOORD16 = function (data) {
    data = data | 0;
    this.WINYCoordBottom = data & 0xFF;
    this.WINYCoordTop = data >> 8;
}
GameBoyAdvanceWindowRenderer.prototype.writeWININ8 = function (data) {
    data = data | 0;
    this.windowDisplayControl = data | 0;
    this.preprocess();
}