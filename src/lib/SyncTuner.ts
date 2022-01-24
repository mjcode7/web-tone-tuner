import createModule from 'wasm/out/tone_tuner.js';
import {AutoTalentCppSettings, TunerSettings} from 'reducers/tuner';

export type ProgressCallback = (percentDone: number) => void;


interface ToneTunerCpp {
  setSettings();
  processData(float32pointer: number, arrSize: number);
  delete();
  add(n1: number, n2: number);
  doubleArray(float32pointer: number, arrSize: number);
}

export class SyncTuner {
  private module;
  private toneTunerCpp: ToneTunerCpp;
  private memoryPointerCpp: number;
  private bytesReservedCpp: number;

  public constructor(module, toneTunerCpp: ToneTunerCpp) {
    this.module = module;
    this.toneTunerCpp = toneTunerCpp;
    this.bytesReservedCpp = 0;
  }

  public setAutoTalentSettings = (autoTalentSettings: AutoTalentCppSettings) => {
    this.toneTunerCpp.setSettings();
  };

  public freeMemory = () => {
    if (this.memoryPointerCpp !== undefined) {
      this.module._free(this.memoryPointerCpp);
    }
    this.toneTunerCpp.delete();
  };

  public tune = (inputChannelFloat32Arrays: Float32Array[], outputChannelAudioDataArrays: number[], startIndex: number = 0, endIndexOpt?: number) => {
    const endIndex = endIndexOpt !== undefined ? endIndexOpt : inputChannelFloat32Arrays[0].length;
    const numFloatsToTune = endIndex-startIndex;
    this.ensureMemoryIsReserved(numFloatsToTune * Float32Array.BYTES_PER_ELEMENT);

    const numChannels = inputChannelFloat32Arrays.length;
    for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
      const channelFloat32Array: Float32Array = inputChannelFloat32Arrays[channelIndex];
      /**
       The malloc function returns pointer to a memory address, but the
       typed array .set() function takes as the second parameter an index to the
       array that is being set. The index value refers to units of float32
       (4 bytes in size) since HEAPF32 is a Float32Array, so the memory address
       needs to be divided by four. See the diagram on this page for an illustration:
       https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
       */
      this.module.HEAPF32.set(channelFloat32Array.subarray(startIndex, endIndex), this.memoryPointerCpp >> 2);

      console.log(`Tuning channel index ${channelIndex} of ${numChannels}...`);
      this.toneTunerCpp.processData(this.memoryPointerCpp, numFloatsToTune);
      for (let floatIndex=0; floatIndex<numFloatsToTune; floatIndex++) {
        const memoryLocation: number = this.memoryPointerCpp/Float32Array.BYTES_PER_ELEMENT+floatIndex;
        // @ts-ignore
        outputChannelAudioDataArrays[channelIndex].push(this.module.HEAPF32[memoryLocation]);
      }
    }
  };

  private ensureMemoryIsReserved = (numFloatsPerChunk) => {
    const desiredNumberOfBytes = numFloatsPerChunk * Float32Array.BYTES_PER_ELEMENT;
    if (this.bytesReservedCpp < desiredNumberOfBytes) {
      if (this.memoryPointerCpp !== undefined) {
        this.module._free(this.memoryPointerCpp);
      }
      this.memoryPointerCpp = this.module._malloc(desiredNumberOfBytes);
      this.bytesReservedCpp = desiredNumberOfBytes;
    }
  };

}

export const createSyncTuner = async (sampleRate: number): Promise<SyncTuner> => {
  const module = await createModule();
  const toneTuner = new module.ToneTuner(sampleRate); // TODO, rename ToneTuner  to ToneTunerCpp
  return new SyncTuner(module, toneTuner);
};
