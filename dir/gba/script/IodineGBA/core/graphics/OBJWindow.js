"use strict";
function GameBoyAdvanceOBJWindowRenderer(compositor) {
    this.compositor = compositor;
}
GameBoyAdvanceOBJWindowRenderer.prototype.initialize = function () {
    this.compositor.initialize();
    this.WINOBJOutside = 0;
    this.preprocess();
}
GameBoyAdvanceOBJWindowRenderer.prototype.renderScanLine = function (line, toRender) {
    line = line | 0;
    toRender = toRender | 0;
    toRender = toRender & this.WINOBJOutside;
    this.compositor.renderScanLine(toRender | 0);
}
GameBoyAdvanceOBJWindowRenderer.prototype.writeWINOBJIN8 = function (data) {
    data = data | 0;
    this.WINOBJOutside = data | 0;
    this.preprocess();
}
GameBoyAdvanceOBJWindowRenderer.prototype.preprocess = function () {
    this.compositor.preprocess(this.WINOBJOutside & 0x20);
}