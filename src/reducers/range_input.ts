import {
  RANGE_INPUT_ADD,
  RANGE_INPUT_REMOVE,
  RANGE_INPUT_UPDATE_UI_VALUE,
  RangeInputActionTypes,
} from 'actions/range_input';

// map name of a range input to its ui value
export interface RangeInputState {
  [name: string]: number;
}

const INITIAL_STATE: RangeInputState = {};

type ActionTypes = RangeInputActionTypes;

export default function(state: RangeInputState = INITIAL_STATE, action: ActionTypes): RangeInputState {
  switch(action.type) {
    case RANGE_INPUT_ADD:
    {
      const {
        name,
        uiValue,
      } = action;
      return {
        ...state,
        [name]: uiValue,
      };
    }
    case RANGE_INPUT_REMOVE:
    {
      const {
        name,
      } = action;
      const newState = {...state};
      delete newState[name];
      return newState;
    }
    case RANGE_INPUT_UPDATE_UI_VALUE:
    {
      const {
        name,
        uiValue,
      } = action;
      return {
        ...state,
        [name]: uiValue,
      }
    }
		default:
			return state;
  }
}
