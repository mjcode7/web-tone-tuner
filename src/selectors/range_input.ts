import {RangeInputState} from 'reducers/range_input';
import {CoreState} from 'redux_modules/core_state';

export const selectRangeInputValues = (state: CoreState): RangeInputState => {
  return state.rangeInput;
};
export const selectRangeInputValue = (state: CoreState, name: string): undefined|number => {
  return selectRangeInputValues(state)[name];
};
