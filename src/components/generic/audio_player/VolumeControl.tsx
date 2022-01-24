import * as React from 'react';
import {connect} from 'react-redux';
import { VolumeIconLoudSVG, VolumeIconMuteSVG } from './Icons';
import {CoreState} from 'redux_modules/core_state';

import * as style from './VolumeControl.less';
import {selectIsMuted, selectVolume} from 'selectors/audio_player';
import {setVolume, toggleMute} from 'actions/audio_player';

interface OwnProps {
  playerId: string;
  onChange?: (value: number) => void;
}

const mapStateToProps = (state: CoreState, ownProps: OwnProps) => {
  const {
    playerId,
  } = ownProps;
  return {
    volume: selectVolume(state, playerId),
    isMuted: selectIsMuted(state, playerId),
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class VolumeControl extends React.Component<Props> {
  public constructor(props: Props) {
    super(props);
  }

  // when the volume is dragged.
  private handleEachVolumeChange = (e) => {
    const {
      playerId,
      isMuted,
      onChange,
    } = this.props;
    const value = (e.target.value / 100);
    const mute = (value <= 0 && !isMuted);

    setVolume(playerId, value);
    toggleMute(playerId, mute);
    onChange && onChange(value);
  };

  private clickIcon = (e) => {
    console.log('click icon');
    e.stopPropagation();
    e.preventDefault();
    const {
      isMuted,
      playerId,
      volume,
      onChange,
    } = this.props;
    const newIsMuted = !isMuted;
    toggleMute(playerId, newIsMuted);
    const newVolume = newIsMuted ? 0 : volume;
    onChange && onChange(newVolume);
  };

  public render = () => {
    const { volume, isMuted } = this.props;

    let value = volume * 100 || 0;

    if (value < 0 || isMuted) {
      value = 0;
    }

    if (value > 100) {
      value = 100;
    }

    return (
      <div className={style.volumeControl}>
        <button className={style.volumeControlButton}
                onClick={this.clickIcon}>
          {isMuted ? <VolumeIconMuteSVG /> : <VolumeIconLoudSVG />}
        </button>
        <div>
          <input className={style.rangeInput}
                 type="range"
                 min="0"
                 max="100"
                 step="1"
                 value={value}
                 onInput={this.handleEachVolumeChange}
                 onChange={this.handleEachVolumeChange}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, undefined)(VolumeControl);