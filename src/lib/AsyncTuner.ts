import WebworkerPromise from 'webworker-promise';
import TunerWorker from 'lib/Tuner.worker.js';
import {AutoTalentCppSettings, TunerSettings} from 'reducers/tuner';
import {SoundUtils} from 'utils/SoundUtils';

export type ProgressCallback = (percentDone: number) => void;

interface WorkerTuneInput {
  channelFloat32Arrays: Float32Array[];
  autoTalentCppSettings: AutoTalentCppSettings;
  sampleRate: number;
}

interface WorkerTuneOutput {
  channelFloat32Arrays: Float32Array[];
}

export default class AsyncTuner {
  private worker: WebworkerPromise;

  public constructor() {
    this.worker = new WebworkerPromise(new TunerWorker());
  }

  public tune = async (audioBuffer: AudioBuffer, tunerSettings: TunerSettings, onProgress: ProgressCallback): Promise<Float32Array[]> => {
    const numChannels = tunerSettings.enableMultiChannels ? audioBuffer.numberOfChannels : 1;
    const inputAudioData: Float32Array[] = [];
    for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
      inputAudioData.push(audioBuffer.getChannelData(channelIndex));
    }
    const eventsHandler = (eventName, data) => {
      if (eventName !== 'percentDone') {
        return;
      }
      console.log('handleEncodeEvents', data);
      const {
        percentDone,
      } = data;
      onProgress(percentDone);
    };
    const tuneInput: WorkerTuneInput = {
      sampleRate: audioBuffer.sampleRate,
      channelFloat32Arrays: inputAudioData,
      autoTalentCppSettings: tunerSettings,
    };
    /**
     * Note, we don't send the input audio buffers a 'transferrable', because
     * the main thread still needs to access them in the future for
     * re-tunes and playing the input data.
     */
    return this.worker.exec('tune', tuneInput, [], eventsHandler)
      .then((data: WorkerTuneOutput) => {
        return data.channelFloat32Arrays;
      });
  };

  public cancel = (): void => {
    // TODO
  };
}
