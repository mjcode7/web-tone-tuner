export const RANGE_INPUT_ADD = 'RANGE_INPUT_ADD';
export interface AddRangeInputAction {
  type: typeof RANGE_INPUT_ADD;
  name: string;
  uiValue: number;
}
export const addRangeInput = (name: string, uiValue: number): AddRangeInputAction => {
  return {
    type: RANGE_INPUT_ADD,
    name,
    uiValue,
  }
};

export const RANGE_INPUT_REMOVE = 'RANGE_INPUT_REMOVE';
export interface RemoveRangeInputAction {
  type: typeof RANGE_INPUT_REMOVE;
  name: string;
}
export const removeRangeInput = (name: string): RemoveRangeInputAction => {
  return {
    type: RANGE_INPUT_REMOVE,
    name,
  }
};

export const RANGE_INPUT_UPDATE_UI_VALUE = 'RANGE_INPUT_UPDATE_UI_VALUE';
export interface UpdateRangeInputUiValueAction {
  type: typeof RANGE_INPUT_UPDATE_UI_VALUE;
  name: string;
  uiValue: number;
}
export const updateRangeInputUiValue = (name: string, uiValue: number): UpdateRangeInputUiValueAction => {
  return {
    type: RANGE_INPUT_UPDATE_UI_VALUE,
    name,
    uiValue,
  }
};

export type RangeInputActionTypes = AddRangeInputAction |
  RemoveRangeInputAction |
  UpdateRangeInputUiValueAction;
