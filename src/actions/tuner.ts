import {InputAudioType, PageId} from 'reducers/page';
import {TunerInput, TunerOutput, TunerSettings} from 'reducers/tuner';
import AsyncTuner, {ProgressCallback} from 'lib/AsyncTuner';
import {changePage} from 'actions/page';
import {WavConverter} from 'lib/audio/WavConverter';
import {logTime, TimeVariable} from 'lib/Analytics';

export const TUNER_FINISHED = 'TUNER_FINISHED';
export interface TunerFinishedAction {
  type: typeof TUNER_FINISHED;
  inputAudioType: InputAudioType;
  tunerOutput: TunerOutput;
}
export const tunerFinished = (inputAudioType: InputAudioType, tunerOutput: TunerOutput): TunerFinishedAction => {
  return {
    type: TUNER_FINISHED,
    inputAudioType,
    tunerOutput,
  };
};

export const UPDATE_TUNER_PROGRESS = 'UPDATE_TUNER_PROGRESS';
export interface UpdateTunerProgressAction {
  type: typeof UPDATE_TUNER_PROGRESS;
  percentDone: number;
}
export const updateTunerProgress = (percentDone: number): UpdateTunerProgressAction => {
  return {
    type: UPDATE_TUNER_PROGRESS,
    percentDone,
  };
};

export const START_TUNER = 'START_TUNER';
export interface StartTunerAction {
  type: typeof START_TUNER;
  inputAudioType: InputAudioType;
  tunerInput: TunerInput;
  tunerSettings: TunerSettings;
  afterTunePageId: PageId;
}
export const startTuner = (inputAudioType: InputAudioType, basename: string, inputAudio: AudioBuffer, inputAudioUrl: string, tunerSettings: TunerSettings, afterTunePageId: PageId) => {
  return async (dispatch, getState) => {

    // Update the UI to reflect that tuning has started
    const startTunerAction: StartTunerAction = {
      type: START_TUNER,
      inputAudioType,
      tunerInput: {
        basename,
        audioBuffer: inputAudio,
        audioUrl: inputAudioUrl,
      },
      tunerSettings,
      afterTunePageId,
    };
    dispatch(startTunerAction);

    const asyncTuner = new AsyncTuner();
    const progressCallback: ProgressCallback = (percentDone: number) => {
      console.log('my progress callback is called with percent done', percentDone);
      dispatch(updateTunerProgress(percentDone));
    };
    console.log("Starting tuning...");
    const outputAudioData: Float32Array[] = await logTime(
      TimeVariable.TunedInput,
      () => {return asyncTuner.tune(inputAudio, tunerSettings, progressCallback)}
    );
    console.log("Finished tuning. Starting to create a data url...");
    // TODO emit some action that we're performing some conversion

    const wavConverter = new WavConverter();
    const outputAudioUrl = await logTime(
      TimeVariable.ConvertTunedOutputToWAV,
      () => {return wavConverter.convertFromFloatArrays(outputAudioData, inputAudio.sampleRate)}
    );
    console.log("Finished creating a data url for tuned audio:", outputAudioUrl);
    const tunerOutput: TunerOutput = {
      audioUrl: outputAudioUrl,
      audioData: outputAudioData,
      sampleRate: inputAudio.sampleRate,
    };
    dispatch(tunerFinished(inputAudioType, tunerOutput));
    dispatch(changePage(afterTunePageId))
  };
};

export const sanitizeStartTuner = (action) => {
  const {
    type,
  } = action;
  if (type !== START_TUNER) {
    return action;
  }
  return {
    ...action,
    tunerInput: {
      ...action.tunerInput,
      channelFloat32Arrays: '<<SANITIZED ARRAY>>',
    },
  };
};

export const sanitizeTunerFinished = (action) => {
  const {
    type,
  } = action;
  if (type !== TUNER_FINISHED) {
    return action;
  }
  return {
    ...action,
    tunerOutput: {
      ...action.tunerOutput,
      audioData: '<<SANITIZED ARRAY>>',
    },
  };
};
