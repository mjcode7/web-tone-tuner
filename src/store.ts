import {CoreState} from 'redux_modules/core_state';
import { createStore, IModuleStore } from 'redux-dynamic-modules';
import {getCoreModule} from 'redux_modules/core';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxSanitizers from 'redux-sanitizers';

const dynamicStore: IModuleStore<CoreState> = createStore(
  {
    initialState: {},
    advancedComposeEnhancers: composeWithDevTools({
      stateSanitizer: ReduxSanitizers.stateSanitizer,
      actionSanitizer: ReduxSanitizers.actionSanitizer,
    }),
    enhancers: [
    ],
    extensions: [
    ],
  },
  getCoreModule(),
);

export default dynamicStore;
