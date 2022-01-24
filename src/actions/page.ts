import {PageId} from 'reducers/page';

export const CHANGE_PAGE = 'CHANGE_PAGE';
export interface ChangePageAction {
  type: typeof CHANGE_PAGE;
  newPageId: PageId;
}
export const changePage = (newPageId: PageId): ChangePageAction => {
  return {
    type: CHANGE_PAGE,
    newPageId,
  }
};
