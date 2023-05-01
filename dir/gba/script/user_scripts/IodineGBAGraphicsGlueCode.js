"use strict";
function GlueCodeGfx() {
    this.didRAF = false;
    this.graphicsFound = 0;
    this.offscreenWidth = 240;
    this.offscreenHeight = 160;
    this.doSmoothing = true;
    var offscreenRGBCount = this.offscreenWidth * this.offscreenHeight * 3;
    this.swizzledFrameFree = [getUint8Array(offscreenRGBCount), getUint8Array(offscreenRGBCount)];
    this.swizzledFrameReady = [];
    this.initializeGraphicsBuffer();
}
GlueCodeGfx.prototype.attachCanvas = function (canvas) {
    this.canvas = canvas;
    this.graphicsFound = this.initializeCanvasTarget();
    this.setSmoothScaling(this.doSmoothing);
}
GlueCodeGfx.prototype.detachCanvas = function () {
    this.canvas = null;
}
GlueCodeGfx.prototype.recomputeDimension = function () {
    this.canvasLastWidth = this.canvas.clientWidth;
    this.canvasLastHeight = this.canvas.clientHeight;
    if (window.mozRequestAnimationFrame) {
        this.onscreenWidth = this.canvas.width = this.offscreenWidth;
        this.onscreenHeight = this.canvas.height = this.offscreenHeight;
    }
    else {
        this.onscreenWidth = this.canvas.width = this.canvas.clientWidth;
        this.onscreenHeight = this.canvas.height = this.canvas.clientHeight;
    }
}
GlueCodeGfx.prototype.initializeCanvasTarget = function () {
    try {
        this.recomputeDimension();
        this.canvasOffscreen = document.createElement("canvas");
        this.canvasOffscreen.width = this.offscreenWidth;
        this.canvasOffscreen.height = this.offscreenHeight;
        this.drawContextOffscreen = this.canvasOffscreen.getContext("2d");
        this.drawContextOnscreen = this.canvas.getContext("2d");
        this.canvasBuffer = this.getBuffer(this.drawContextOffscreen, this.offscreenWidth, this.offscreenHeight);
        this.initializeAlpha(this.canvasBuffer.data);
        this.requestDraw();
        this.checkRAF();
        return true;
    }
    catch (error) {
        return false;
    }
}
GlueCodeGfx.prototype.setSmoothScaling = function (doSmoothing) {
    this.doSmoothing = doSmoothing;
    if (this.graphicsFound) {
        this.canvas.setAttribute("style", (this.canvas.getAttribute("style") || "") + "; image-rendering: " + ((doSmoothing) ? "auto" : "-webkit-optimize-contrast") + ";" +
            "image-rendering: " + ((doSmoothing) ? "optimizeQuality" : "-o-crisp-edges") + ";" +
            "image-rendering: " + ((doSmoothing) ? "optimizeQuality" : "-moz-crisp-edges") + ";" +
            "-ms-interpolation-mode: " + ((doSmoothing) ? "bicubic" : "nearest-neighbor") + ";");
        this.drawContextOnscreen.mozImageSmoothingEnabled = doSmoothing;
        this.drawContextOnscreen.webkitImageSmoothingEnabled = doSmoothing;
        this.drawContextOnscreen.imageSmoothingEnabled = doSmoothing;
    }
}
GlueCodeGfx.prototype.initializeAlpha = function (canvasData) {
    var length = canvasData.length;
    for (var indexGFXIterate = 3; indexGFXIterate < length; indexGFXIterate += 4) {
        canvasData[indexGFXIterate] = 0xFF;
    }
}
GlueCodeGfx.prototype.getBuffer = function (canvasContext, width, height) {
    var buffer = null;
    try {
        buffer = this.drawContextOffscreen.createImageData(width, height);
    }
    catch (error) {
        buffer = this.drawContextOffscreen.getImageData(0, 0, width, height);
    }
    return buffer;
}
GlueCodeGfx.prototype.copyBuffer = function (buffer) {
    if (this.graphicsFound) {
        if (this.swizzledFrameFree.length == 0) {
            if (this.didRAF) {
                this.requestDrawSingle();
            }
            else {
                this.swizzledFrameFree.push(this.swizzledFrameReady.shift());
            }
        }
        var swizzledFrame = this.swizzledFrameFree.shift();
        var length = swizzledFrame.length;
        if (buffer.buffer) {
            swizzledFrame.set(buffer);
        }
        else {
            for (var bufferIndex = 0; bufferIndex < length; ++bufferIndex) {
                swizzledFrame[bufferIndex] = buffer[bufferIndex];
            }
        }
        this.swizzledFrameReady.push(swizzledFrame);
        if (!window.requestAnimationFrame) {
            this.requestDraw();
        }
        else if (!this.didRAF) {
            var parentObj = this;
            window.requestAnimationFrame(function () {
                if (parentObj.canvas) {
                    parentObj.requestRAFDraw();
                }
            });
        }
    }
}
GlueCodeGfx.prototype.requestRAFDraw = function () {
    this.didRAF = true;
    this.requestDraw();
}
GlueCodeGfx.prototype.requestDrawSingle = function () {
    if (this.swizzledFrameReady.length > 0) {
        var canvasData = this.canvasBuffer.data;
        var bufferIndex = 0;
        var swizzledFrame = this.swizzledFrameReady.shift();
        var length = canvasData.length;
        for (var canvasIndex = 0; canvasIndex < length; ++canvasIndex) {
            canvasData[canvasIndex++] = swizzledFrame[bufferIndex++];
            canvasData[canvasIndex++] = swizzledFrame[bufferIndex++];
            canvasData[canvasIndex++] = swizzledFrame[bufferIndex++];
        }
        this.swizzledFrameFree.push(swizzledFrame);
        this.graphicsBlit();
    }
}
GlueCodeGfx.prototype.requestDraw = function () {
    this.requestDrawSingle();
    if (this.didRAF) {
        var parentObj = this;
        window.requestAnimationFrame(function () {
            if (parentObj.canvas) {
                parentObj.requestDraw();
            }
        });
    }
}
GlueCodeGfx.prototype.graphicsBlit = function () {
    if (this.canvasLastWidth != this.canvas.clientWidth || this.canvasLastHeight != this.canvas.clientHeight) {
        this.recomputeDimension();
        this.setSmoothScaling(this.doSmoothing);
    }
    if (this.offscreenWidth == this.onscreenWidth && this.offscreenHeight == this.onscreenHeight) {
        this.drawContextOnscreen.putImageData(this.canvasBuffer, 0, 0);
    }
    else {
        this.drawContextOffscreen.putImageData(this.canvasBuffer, 0, 0);
        this.drawContextOnscreen.drawImage(this.canvasOffscreen, 0, 0, this.onscreenWidth, this.onscreenHeight);
    }
}
GlueCodeGfx.prototype.initializeGraphicsBuffer = function () {
    var swizzledFrame = this.swizzledFrameFree.shift();
    var length = swizzledFrame.length;
    for (var bufferIndex = 0; bufferIndex < length; ++bufferIndex) {
        swizzledFrame[bufferIndex] = 0xF8;
    }
    this.swizzledFrameReady.push(swizzledFrame);
}
GlueCodeGfx.prototype.checkRAF = function () {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
}