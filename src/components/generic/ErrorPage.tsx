import * as React from 'react';
import Helmet from 'react-helmet';
import {classCombo} from 'utils/Utils';

import * as style from './ErrorPage.less';
import {CoreState} from 'redux_modules/core_state';

interface OwnProps {
  className?: string;
  errorMsg?: string;
  hideRetry?: boolean; // set to false to override default behavior of showing a retry link
}

type Props = OwnProps;

class ErrorPage extends React.Component<Props, CoreState> {

  public constructor(props: Props) {
    super(props);
  }

  private _renderRetryLink = () => {
    const location = window.location;
    return (
      <p>
        <a className={style.retry} onClick={() => location.reload()}><span>Click here to retry.</span></a>
      </p>
    );
  };

  public render = () => {
    const {
      errorMsg,
      hideRetry,
      className,
    } = this.props;
    const defaultErrorMsg = 'Sorry, an error occurred.';
    return (
      <div className={classCombo(style.container)(className)()}>
        <p>
          <span className={style.msg}>
            {errorMsg || defaultErrorMsg}
          </span>
        </p>
        {!hideRetry ? this._renderRetryLink() : null}
      </div>
    );
  }
}

export default ErrorPage;
