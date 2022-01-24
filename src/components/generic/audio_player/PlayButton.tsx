import * as React from 'react';
import {connect} from 'react-redux';
import { PlayIconSVG, PauseIconSVG } from './Icons';
import { selectIsPlaying } from 'selectors/audio_player';
import * as style from './PlayButton.less';
import {pause, play} from 'actions/audio_player';
import {CoreState} from 'redux_modules/core_state';

interface OwnProps {
  playerId: string;
}

const mapStateToProps = (state: CoreState, ownProps: OwnProps) => {
  const {
    playerId,
  } = ownProps;
  return {
    isPlaying: selectIsPlaying(state, playerId),
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class PlayButton extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);
  }

  public handleClick = (e) => {
    const {
      playerId,
      isPlaying,
    } = this.props;
    if (isPlaying) {
      pause(playerId);
    } else {
      play(playerId);
    }
  };

  public render = () => {
    const { isPlaying } = this.props;

    let iconNode;
    if (isPlaying) {
      iconNode = <PauseIconSVG />;
    } else {
      iconNode = <PlayIconSVG />;
    }

    return (
      <button type="button" className={style.playButton} onClick={this.handleClick}>
        {iconNode}
      </button>
    );
  }
}

export default connect(mapStateToProps, undefined)(PlayButton);
