import * as React from 'react';

import {connect} from 'react-redux';
import {selectCurrentTime, selectDuration} from 'selectors/audio_player';
import {CoreState} from 'redux_modules/core_state';

import * as style from './Timer.less';

interface OwnProps {
  playerId: string;
}

const mapStateToProps = (state: CoreState, ownProps: OwnProps) => {
  const {
    playerId,
  } = ownProps;
  return {
    currentTime: selectCurrentTime(state, playerId),
    duration: selectDuration(state, playerId),
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class Timer extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);
  }

  private static prettyTime = (time: number|undefined) => {
    const ZERO_TIME = '00:00';
    if (time === undefined) return ZERO_TIME;
    let hours = Math.floor(time / 3600);
    let mins = '0' + Math.floor((time % 3600) / 60);
    let secs = '0' + Math.floor((time % 60));

    mins = mins.substr(mins.length - 2);
    secs = secs.substr(secs.length - 2);

    if (!isNaN(parseInt(secs))) {
      if (hours) {
        return `${hours}:${mins}:${secs}`;
      }
      return `${mins}:${secs}`;
    }
    return ZERO_TIME;
  };

  public render = () => {
    const {
      currentTime,
      duration,
    } = this.props;
    return (
      <div className={style.timer}>
        <span>{Timer.prettyTime(currentTime)} / {Timer.prettyTime(duration)}</span>
      </div>
    );
  }
}

export default connect(mapStateToProps, undefined)(Timer);
