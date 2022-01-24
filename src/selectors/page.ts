import {PageId, PageState} from 'reducers/page';
import {CoreState} from 'redux_modules/core_state';

export const selectPageState = (state: CoreState): PageState => state.page;
export const selectCurrentPageId = (state: CoreState): PageId => selectPageState(state).currentPageId;
export const selectPreviousPageId = (state: CoreState): PageId|undefined => selectPageState(state).previousPageId;
