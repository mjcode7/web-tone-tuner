import registerWebworker from 'webworker-promise/lib/register';

const Mp3Encoder = require('lamejs').Mp3Encoder;
const SoundUtils = require('utils/SoundUtils').SoundUtils;
import * as throttle from 'lodash.throttle';
import {createSyncTuner} from 'lib/SyncTuner';
import {sync} from 's3-deploy/src/deploy';
import {input} from 'create/editable_server_text/EditableServerText.less';

let syncTuner;
let mp3Encoder;
let maxSamples = 1152;
let samplesMono;
let config;
let dataBuffer;

const clearBuffer = () => {
  dataBuffer = [];
};

const appendToBuffer = (mp3Buf) => {
  dataBuffer.push(new Int8Array(mp3Buf));
};

const floatTo16BitPCM = (input, output) => {
  //var offset = 0;
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
  }
};

const convertBuffer = (arrayBuffer) => {
  const data = new Float32Array(arrayBuffer);
  const out = new Int16Array(data.length);
  floatTo16BitPCM(data, out);
  return out;
};

const emitProgress = (emit, percentDone) => {
  emit('percentDone', {percentDone});
};
const PROGRESS_UPDATE_FREQUENCY_MS = 250;
const throttledEmitProgress = throttle(emitProgress, PROGRESS_UPDATE_FREQUENCY_MS);

const CHUNK_SIZE_KB = 200;
const CHUNK_SIZE_FLOATS = CHUNK_SIZE_KB * 256;

const tuneAllChunks = (syncTuner, inputChannelFloat32Arrays, onProgressCallback) => {
  const numInputFloats = inputChannelFloat32Arrays[0].length;
  console.log(`Number of floats in the channel's array: ${numInputFloats}`);
  const numChunks = Math.ceil(numInputFloats / CHUNK_SIZE_FLOATS);
  const outputChannelAudioDataArrays = [];
  const numChannels = inputChannelFloat32Arrays.length;
  for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
    outputChannelAudioDataArrays.push([]);
  }
  for (let chunkIndex=0; chunkIndex < numChunks; chunkIndex++) {
    const chunkStartIndex = chunkIndex * CHUNK_SIZE_FLOATS;
    const chunkEndIndex = Math.min(chunkStartIndex + CHUNK_SIZE_FLOATS, numInputFloats);
    console.log(`Tuning chunk index ${chunkIndex} of ${numChunks}...`);
    syncTuner.tune(inputChannelFloat32Arrays, outputChannelAudioDataArrays, chunkStartIndex, chunkEndIndex)
    onProgressCallback(Math.round(chunkIndex / numChunks * 100));
  }
  const outputChannelFloat32Arrays = [];
  for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
    outputChannelFloat32Arrays.push(new Float32Array(outputChannelAudioDataArrays[channelIndex]))
  }
  return outputChannelFloat32Arrays;
};

registerWebworker()
  .operation('tune', async (msg, emit) => {
    emitProgress(emit, 0);
    const {
      channelFloat32Arrays,
      autoTalentCppSettings,
      sampleRate,
    } = msg;

    const syncTuner = await createSyncTuner(sampleRate);
    let outputChannelFloat32Arrays;
    try {
      syncTuner.setAutoTalentSettings(autoTalentCppSettings);
      // TODO, what if exception is thrown in here? do we go to error page?
      const onProgressCallback = (percentDone) => throttledEmitProgress(emit, percentDone);
      outputChannelFloat32Arrays = tuneAllChunks(syncTuner, channelFloat32Arrays, onProgressCallback);
    } finally {
      syncTuner.freeMemory();
    }
    throttledEmitProgress.flush();
    emitProgress(emit, 100);
    const resultMessage = {
      channelFloat32Arrays: outputChannelFloat32Arrays,
    };
    const arrayBuffers = SoundUtils.floatArraysToArrayBuffers(resultMessage.channelFloat32Arrays);
    return new registerWebworker.TransferableResponse(resultMessage, arrayBuffers);
  });

// Expose the right type when imported via worker-loader.
export default () => {};
