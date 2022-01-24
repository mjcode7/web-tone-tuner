import * as React from 'react';
import { classCombo } from 'utils/Utils';

import * as style from './Spinner.less';
import {CoreState} from 'redux_modules/core_state';

interface OwnProps {
  size: 'small' | 'base' | 'medium' | 'large';
  // if true, shows 'Loading...' to right of spinner
  showLabel?: boolean;
  label?: string;
  className?: string;
}

type Props = OwnProps;

class Spinner extends React.Component<Props, CoreState> {
  public constructor(props: Props) {
    super(props);
  }

  private _renderLabel = () => {
    const {
      size,
      label,
    } = this.props;
    return (
      <div className={style.labelContainer}>
        <span className={classCombo(style[size])()}>{label || 'Loading...'}</span>
      </div>
    );
  };

  public render = () => {
    const {
      size,
      showLabel,
    } = this.props;
    return (
      <div className={classCombo(style.container)(this.props.className)()}>
        {showLabel ? this._renderLabel() : null}
        <div className={classCombo(style.spinner)(style[size])()}>
        </div>
      </div>
    );
  }
}

export default Spinner;
