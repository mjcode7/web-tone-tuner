import * as React from 'react';
import { classCombo } from 'utils/Utils';

import * as style from './ProgressBar.less';

interface OwnProps {
  percent: number;
  className?: string;
}

type Props = OwnProps;

export class ProgressBar extends React.Component<Props> {
  public constructor(props: Props) {
    super(props);
  }

  public render = () => {
    const {
      percent,
      className,
    } = this.props;
    const innerStyle = {
      width: percent + '%',
    };
    return (
      <div className={classCombo(style.cont)(className)()}>
        <p className={style.labelCont}>
          <span>{percent}%</span>
        </p>
        <div className={style.innerCont} style={innerStyle}></div>
      </div>
    );
  }
}
