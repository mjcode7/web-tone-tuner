import {CHANGE_PAGE, ChangePageAction} from 'actions/page';

export enum PageId {
  SelectInputType = 'select-input-type',
  TuningProgress = 'tuning-progress',
  PlayTunedFileAudio = 'play-tuned-file-audio',
  // PlayTunedRecordingAudio = 'play-tuned-recording-audio',
  SaveTunedAudio = 'save-tuned-audio',
  // ChangeTuneSettings = 'save-tune-settings',
  // LiveTuning = 'live-tuning',
  Error = 'error',
}

export enum InputAudioType {
  File = 'file',
  Recording = 'recording',
  Preview = 'preview'
}

export enum AUDIO_TYPE {
  ORIGINAL = 'ORIGINAL',
  TUNED = 'TUNED',
}
export type AudioUrlsMap = {
  [audioType in AUDIO_TYPE]: string;
};

export interface PageState {
  currentPageId: PageId;
  previousPageId?: PageId;
}

export const INITIAL_STATE: PageState = {
  currentPageId: PageId.SelectInputType,
  previousPageId: undefined,
};

type ReducerAction = ChangePageAction;

const pageReducer = function(state: PageState = INITIAL_STATE, action: ReducerAction): PageState {
  switch(action.type) {
    case CHANGE_PAGE:
      return {
        ...state,
        currentPageId: action.newPageId,
        previousPageId: state.currentPageId,
      };
    default:
      return state;
  }
};

export default pageReducer;
