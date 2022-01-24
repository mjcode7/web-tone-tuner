import {CoreState} from 'redux_modules/core_state';
import AudioPlayersReducer from 'reducers/audio_players';
import RangeInputReducer from 'reducers/range_input';
import pageReducer from 'reducers/page';
import tunerReducer from 'reducers/tuner';

/**
 * note this cannot be defined in redux_modules/core or it causes a circular dependency and vague typescript compiler error
 * it also cannot be in the same file as core_state or code splitting will
 * include the create code in the main app bundle
 */
export interface CoreState {
  audioPlayers: ReturnType<typeof AudioPlayersReducer>;
  rangeInput: ReturnType<typeof RangeInputReducer>;
  page: ReturnType<typeof pageReducer>;
  tuner: ReturnType<typeof tunerReducer>;
}
