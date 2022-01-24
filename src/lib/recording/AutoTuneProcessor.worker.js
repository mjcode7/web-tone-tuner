import registerWebworker from 'webworker-promise/lib/register';
const SoundUtils = require('utils/SoundUtils').SoundUtils;
import createModule from 'wasm/out/tone_tuner.js';

/**
 * @param inputData Float32Array
 * @param numChannels
 * @param sampleRate
 * @returns {Float32Array}
 */
async function doTune(inputJSArray, numChannels, sampleRate) {
  if (numChannels !== 1) {
    throw new Error('Tuning multi-channel audio is not yet supported');
  }

  const module = await createModule();
  const toneTuner = new module.ToneTuner(sampleRate);

  const buffer = module._malloc(inputJSArray.length * inputJSArray.BYTES_PER_ELEMENT);
  /**
   The malloc function returns pointer to a memory address, but the typed array .set() function takes as the second parameter an index to the array that is being set. The index value refers to units of float32 (4 bytes in size) since HEAPF32 is a Float32Array, so the memory address needs to be divided by four. See the diagram on this page for an illustration: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
   */
  module.HEAPF32.set(inputJSArray, buffer >> 2);
  toneTuner.setSettings();

  // TODO do chunks and emit progress for large inputs
  toneTuner.processData(buffer, inputJSArray.length);

  const outputJSArray = [];
  for (let i = 0; i < inputJSArray.length; i++) {
    const memoryLocation = buffer / Float32Array.BYTES_PER_ELEMENT + i;
    // @ts-ignore
    outputJSArray.push(module.HEAPF32[memoryLocation])
  }

  module._free(buffer);
  toneTuner.delete();

  return new Float32Array(outputJSArray);
}

registerWebworker(async (message) => {
  const {
    arrayBuffers,
    numChannels,
    sampleRate,
  } = message;

  const floatArrays = SoundUtils.arrayBuffersToFloatArrays(arrayBuffers);
  const floatArray0 = floatArrays[0];
  const tunedFloatArray = await doTune(floatArray0, numChannels, sampleRate);
  const tunedBuffers = SoundUtils.floatArraysToArrayBuffers([tunedFloatArray]);
  const response = {
    tunedBuffers,
    originalBuffers: arrayBuffers,
  };
  return new registerWebworker.TransferableResponse(response, [...response.tunedBuffers, ...response.originalBuffers]);
});