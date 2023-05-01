var XAudioJSResampledBuffer = [];
var XAudioJSOutputBuffer = [];
var XAudioJSResampleBufferStart = 0;
var XAudioJSResampleBufferEnd = 0;
var XAudioJSResampleBufferSize = 0;
var XAudioJSChannelsAllocated = 1;
self.onmessage = function (event) {
	var data = event.data;
	switch (data[0]) {
		case 0:
			var resampledResult = data[1];
			var length = resampledResult.length;
			for (var i = 0; i < length; ++i) {
				XAudioJSResampledBuffer[XAudioJSResampleBufferEnd++] = resampledResult[i];
				if (XAudioJSResampleBufferEnd == XAudioJSResampleBufferSize) {
					XAudioJSResampleBufferEnd = 0;
				}
				if (XAudioJSResampleBufferStart == XAudioJSResampleBufferEnd) {
					XAudioJSResampleBufferStart += XAudioJSChannelsAllocated;
					if (XAudioJSResampleBufferStart == XAudioJSResampleBufferSize) {
						XAudioJSResampleBufferStart = 0;
					}
				}
			}
			break;
		case 1:
			XAudioJSResampleBufferSize = data[1];
			XAudioJSChannelsAllocated = data[2];
			XAudioJSResampledBuffer = new Float32Array(XAudioJSResampleBufferSize);
	}
}
self.onprocessmedia = function (event) {
	var apiBufferLength = event.audioLength;
	var apiBufferLengthAll = apiBufferLength * event.audioChannels;
	if (apiBufferLengthAll > XAudioJSOutputBuffer.length) {
		XAudioJSOutputBuffer = new Float32Array(apiBufferLengthAll);
	}
	var sampleFramesCount = Math.min(apiBufferLength, XAudioJSResampledSamplesLeft() / XAudioJSChannelsAllocated);
	for (var sampleFramePosition = 0, channelOffset = 0; sampleFramePosition < sampleFramesCount; ++sampleFramePosition) {
		for (channelOffset = sampleFramePosition; channelOffset < apiBufferLengthAll; channelOffset += apiBufferLength) {
			XAudioJSOutputBuffer[channelOffset] = XAudioJSResampledBuffer[XAudioJSResampleBufferStart++];
			if (XAudioJSResampleBufferStart == XAudioJSResampleBufferSize) {
				XAudioJSResampleBufferStart = 0;
			}
		}
	}
	while (sampleFramePosition < apiBufferLength) {
		for (channelOffset = sampleFramePosition++; channelOffset < apiBufferLengthAll; channelOffset += apiBufferLength) {
			XAudioJSOutputBuffer[channelOffset] = 0;
		}
	}
	event.writeAudio(XAudioJSOutputBuffer.subarray(0, apiBufferLengthAll));
	self.postMessage(event.audioLength);
}
function XAudioJSResampledSamplesLeft() {
	return ((XAudioJSResampleBufferStart <= XAudioJSResampleBufferEnd) ? 0 : XAudioJSResampleBufferSize) + XAudioJSResampleBufferEnd - XAudioJSResampleBufferStart;
}