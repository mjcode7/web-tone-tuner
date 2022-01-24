import {
  START_TUNER,
  StartTunerAction, TUNER_FINISHED,
  TunerFinishedAction,
  UPDATE_TUNER_PROGRESS,
  UpdateTunerProgressAction,
} from 'actions/tuner';
import {InputAudioType} from 'reducers/page';
import {CoreState} from 'redux_modules/core_state';
import {selectTunerInputAudioUrl, selectTunerOutputAudioUrl, toTunerRootState} from 'selectors/tuner';
import {revokeObjectUrl} from 'utils/MemoryUtils';

export interface ActiveTuning {
  percentDone: number;
}

export interface AutoTalentCppSettings {
  key: string;
}

export interface AsyncTunerSettings {
  enableMultiChannels: boolean;
}

export type TunerSettings = AsyncTunerSettings & AutoTalentCppSettings;

const DEFAULT_SETTINGS: TunerSettings = {
  enableMultiChannels: false,
  key: 'C',
};

export interface TunerInput {
  basename: string; // (e.g. 'myfile' if the user selected 'myfile.mp3')
  audioBuffer: AudioBuffer;
  audioUrl: string;
}

export interface TunerOutput {
  audioUrl: string;
  sampleRate: number;
  audioData: Float32Array[];
}

export type TunerInputs = {
  [type in InputAudioType]?: TunerInput;
};

export type TunerOutputs = {
  [type in InputAudioType]?: TunerOutput;
};

export interface TunerState {
  activeTuning?: ActiveTuning;
  inputs: TunerInputs;
  outputs: TunerOutputs;
  settings: TunerSettings;
  previewSettings?: {
    length: number;
    offset: number;
  };
}

export const INITIAL_STATE: TunerState = {
  inputs: {},
  outputs: {},
  settings: DEFAULT_SETTINGS,
};

type ReducerAction = StartTunerAction | UpdateTunerProgressAction | TunerFinishedAction;

const tunerReducer = function(state: TunerState = INITIAL_STATE, action: ReducerAction): TunerState {
  switch(action.type) {
    case START_TUNER: {
      const {
        inputAudioType,
        tunerInput,
      } = action;
      const oldInputUrl = selectTunerInputAudioUrl(toTunerRootState(state), inputAudioType);
      const oldOutputUrl = selectTunerOutputAudioUrl(toTunerRootState(state), inputAudioType);
      revokeObjectUrl(oldInputUrl);
      revokeObjectUrl(oldOutputUrl);
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [inputAudioType]: tunerInput,
        },
        outputs: {
          ...state.outputs,
          [inputAudioType]: {},
        },
        activeTuning: {
          percentDone: 0,
        },
      };
    }
    case TUNER_FINISHED: {
      const {
        tunerOutput,
        inputAudioType,
      } = action;
      return {
        ...state,
        activeTuning: undefined,
        outputs: {
          ...state.outputs,
          [inputAudioType]: tunerOutput,
        },
      }
    }
    case UPDATE_TUNER_PROGRESS: {
      const {
        percentDone,
      } = action;
      return {
        ...state,
        activeTuning: {
          ...state.activeTuning,
          percentDone,
        },
      }
    }
    default:
      return state;
  }
};

export const sanitizeTuner = (state: CoreState) => {
  return {
    ...state,
    tuner: {
      ...state.tuner,
      // TODO, don't hide everything; only the AudioBuffers
      inputs: '<<SANITIZED>>',
      outputs: '<<SANITIZED>>',
    },
  }
};

export default tunerReducer;
