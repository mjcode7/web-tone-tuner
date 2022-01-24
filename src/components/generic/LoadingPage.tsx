import * as React from 'react';
import Spinner from './Spinner';
import {CoreState} from 'redux_modules/core_state';

interface OwnProps {
  className?: string;
}

type Props = OwnProps;

class LoadingPage extends React.Component<Props, CoreState> {

  public constructor(props: Props) {
    super(props);
  }

  public render = () => {
    const {
      className,
    } = this.props;
    return (
      <Spinner
        size="medium"
        className={className}
        showLabel={true}
      />
    );
  }
}

export default LoadingPage;
