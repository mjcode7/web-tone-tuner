import {changePage} from 'actions/page';
import {analytics} from 'lib/Analytics';
import {PageId} from 'reducers/page';

export const reduxErrorHandler = (error) => {
  console.error('Redux error handler caught error', error); // write the error to the console
  analytics.logError(error);
  return (dispatch, getState) => {
    dispatch(changePage(PageId.Error));
  };
};