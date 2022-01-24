import {IModule} from 'redux-dynamic-modules';
// import thunkMiddleware from 'redux-thunk';
import thunkMiddleware from 'redux-thunk-recursion-detect';
import AudioPlayersReducer from 'reducers/audio_players';
import RangeInputReducer from 'reducers/range_input';
import {CoreState} from 'redux_modules/core_state';
import pageReducer from 'reducers/page';
import tunerReducer from 'reducers/tuner';
import createThunkErrorHandlerMiddleware from 'redux-thunk-error-handler';
import {reduxErrorHandler} from 'lib/ErrorHandler';

export function getCoreModule(): IModule<CoreState> {
  return {
    id: 'Core',
    reducerMap: {
      audioPlayers: AudioPlayersReducer,
      rangeInput: RangeInputReducer,
      page: pageReducer,
      tuner: tunerReducer,
    },
    middlewares: [
      createThunkErrorHandlerMiddleware({ onError: reduxErrorHandler }),
      thunkMiddleware,
    ],
    // Actions to fire when this module is added/removed
    // initialActions: [],
    // finalActions: []
  };
}
