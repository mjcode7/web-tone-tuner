import {
  ActiveTuning,
  TunerInput,
  TunerInputs,
  TunerOutput,
  TunerOutputs,
  TunerSettings,
  TunerState,
} from 'reducers/tuner';
import {CoreState} from 'redux_modules/core_state';
import {AUDIO_TYPE, AudioUrlsMap, InputAudioType} from 'reducers/page';
import {createSelector} from 'reselect';

export const selectTunerState = (state: TunerRootState): TunerState => state.tuner;
export const selectTunerSettings = (state: CoreState): TunerSettings => selectTunerState(state).settings;
export const selectActiveTuning = (state: CoreState): ActiveTuning|undefined => selectTunerState(state).activeTuning;
export const selectActiveTuningPercentDone = (state: CoreState): number => {
  const activeTuning = selectActiveTuning(state);
  return activeTuning ? activeTuning.percentDone : 0;
};
export const selectTunerInputs = (state: TunerRootState): TunerInputs => selectTunerState(state).inputs;
export const selectTunerInput = (state: TunerRootState, inputAudioType: InputAudioType): TunerInput|undefined => selectTunerInputs(state)[inputAudioType];
export const selectTunerInputBasename = (state: TunerRootState, inputAudioType: InputAudioType): string|undefined => {
  const input = selectTunerInput(state, inputAudioType);
  return input ? input.basename : undefined;
};
export const selectTunerInputAudioUrl = (state: TunerRootState, inputAudioType: InputAudioType): string|undefined => {
  const input = selectTunerInput(state, inputAudioType);
  return input ? input.audioUrl : undefined;
};
export const selectTunerOutputs = (state: TunerRootState): TunerOutputs => selectTunerState(state).outputs;
export const selectTunerOutput = (state: TunerRootState, inputAudioType: InputAudioType): TunerOutput|undefined => selectTunerOutputs(state)[inputAudioType];
export const selectTunerOutputAudioUrl = (state: TunerRootState, inputAudioType: InputAudioType): string|undefined => {
  const output = selectTunerOutput(state, inputAudioType);
  return output ? output.audioUrl : undefined;
};
export const selectAudioURLs = createSelector(
  selectTunerInputAudioUrl,
  selectTunerOutputAudioUrl,
  (tunerInputAudioUrl: string|undefined, tunerOutputAudioUrl: string|undefined): AudioUrlsMap|undefined => {
    if (tunerInputAudioUrl === undefined || tunerOutputAudioUrl === undefined) return undefined;
    return {
      [AUDIO_TYPE.ORIGINAL]: tunerInputAudioUrl,
      [AUDIO_TYPE.TUNED]: tunerOutputAudioUrl,
    }
  }
);

export interface TunerRootState {
  tuner: TunerState;
}

// so we can use the selectors from the reducer (which only operates on a slice of the state)
export const toTunerRootState = (tunerState: TunerState): TunerRootState => {
  return {
    tuner: tunerState,
  };
};

