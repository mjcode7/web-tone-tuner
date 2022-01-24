import WebworkerPromise from 'webworker-promise';
import {SoundUtils} from 'utils/SoundUtils';

/**
 * we need to use an inline import to avoid postMessage is not a function error
 * https://github.com/webpack-contrib/worker-loader/issues/183
 */
// @ts-ignore
import WavConversionWorker from 'worker-loader!./WavConversion.worker';

export class WavConverter {

  private worker: WebworkerPromise;

  public constructor() {
    this.worker = new WebworkerPromise(new WavConversionWorker());
  }

  // returns object url to the wav
  public convertFromAudioBuffer = (
    audioBuffer: AudioBuffer
  ): Promise<string> => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples: Float32Array[] = (numChannels === 2) ?
      [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)] :
      [audioBuffer.getChannelData(0)];
    return this.convertFromFloatArrays(samples, sampleRate);
  };

  // returns object url to the wav
  public convertFromFloatArrays = (
    floatArrays: Float32Array[],
    sampleRate: number
  ): Promise<string> => {
    const arrayBuffers = SoundUtils.floatArraysToArrayBuffers(floatArrays);
    /**
     * don't send by transferrable reference because we want to keep the original data available
     * https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast
     */
    return this.worker.exec('encode', {arrayBuffers, sampleRate})
      .then((data) => {
        const {
          wavArrayBuffer,
        } = data;
        const blob = new Blob([ new DataView(wavArrayBuffer) ], {
          type: 'audio/wav',
        });
        const url = URL.createObjectURL(blob);
        console.log('created url with WAV:', url);
        return url;
      });
  };
}
