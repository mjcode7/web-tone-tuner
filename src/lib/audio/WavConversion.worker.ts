// eslint-disable-next-line @typescript-eslint/no-var-requires
const registerWebworker = require('webworker-promise/lib/register');
const SoundUtils = require('utils/SoundUtils').SoundUtils;

// logic is adapted from https://www.npmjs.com/package/audiobuffer-to-wav

const USE_FLOAT_32_FORMAT = false; // false for PCM

function _encodeWAV (inputArray: Float32Array, format: 3|1, sampleRate: number, numChannels: number, bitDepth: 32|16): ArrayBuffer {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + inputArray.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  _writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + inputArray.length * bytesPerSample, true);
  /* RIFF type */
  _writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  _writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  _writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, inputArray.length * bytesPerSample, true);
  if (format === 1) { // Raw PCM
    _floatTo16BitPCM(view, 44, inputArray);
  } else {
    _writeFloat32(view, 44, inputArray);
  }

  return buffer
}

function _interleave (inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++
  }
  return result
}

function _writeFloat32 (output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function _floatTo16BitPCM (output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
}

function _writeString (view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

interface EncodeMsg {
  sampleRate: number;
  arrayBuffers: ArrayBuffer[];
}

const _sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Usage: sleep(2000).then(() => {your code})
 */
export const sleep = async (ms) => {
  await _sleep(ms);
};

const doEncode = (msg: EncodeMsg) => {
  const {
    sampleRate,
    arrayBuffers,
  } = msg;
  const floatArrays: Float32Array[] = SoundUtils.arrayBuffersToFloatArrays(arrayBuffers);

  const numChannels = floatArrays.length;

  const inputArray: Float32Array = (numChannels === 2) ?
    _interleave(floatArrays[0], floatArrays[1]) :
    floatArrays[0];
  const format = USE_FLOAT_32_FORMAT ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;
  const wavArrayBuffer: ArrayBuffer = _encodeWAV(inputArray, format, sampleRate, numChannels, bitDepth);

  return new registerWebworker.TransferableResponse({wavArrayBuffer}, wavArrayBuffer);
};

const SIMULATE_SLOW = false;

registerWebworker()
  .operation('encode', async (msg: EncodeMsg, emit) => {
    if (SIMULATE_SLOW) {
      return sleep(5000).then(() => {
        return doEncode(msg);
      });
    } else {
      return doEncode(msg);
    }
  });
