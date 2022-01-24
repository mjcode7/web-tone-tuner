import React, { Component } from 'react';
import PlayButton from 'components/generic/audio_player/PlayButton';
import Timer from 'components/generic/audio_player/Timer';
import Progress from 'components/generic/audio_player/Progress';
import {connect} from 'react-redux';
import style from 'components/generic/audio_player/AudioPlayer.less';
import {bindActionCreators} from 'redux';
import {AppDispatch} from 'models/app_redux';
import {PreloadType, register, setActiveUrlType, unregister} from 'actions/audio_player';
import VolumeControl from 'components/generic/audio_player/VolumeControl';
import {classCombo} from 'utils/Utils';
import {CoreState} from 'redux_modules/core_state';
import {AUDIO_TYPE, AudioUrlsMap} from 'reducers/page';
import {selectActiveUrlType} from 'selectors/audio_player';

/**
 * Originally, this was based on https://github.com/kosmetism/react-soundplayer
 * Notable changes:
 * * styles changed
 * * hold state for whether volue is collapsed/expanded. Previously just in CSS hover which didn't work for mobile
 * * allow drag the progress bar
 * * expose error if fail to play
 * * state is in redux so we stop all sounds from one 'group' before playing another
 * * no external dependencies
 */

const mapStateToProps = (state: CoreState, ownProps: OwnProps) => {
  const {
    playerId,
  } = ownProps;
  return {
    activeUrlType: selectActiveUrlType(state, playerId),
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) =>
  bindActionCreators({
    setActiveUrlType,
    register,
    unregister,
  }, dispatch);

interface OwnProps {
  playerId: string;
  syncedPlayerId?: string;
  loop: boolean;
  hideTime: boolean;
  allowParallelPlay: boolean;
  urls: AudioUrlsMap;
  preloadType: PreloadType;
  initialVolume: number;
  className?: string;
  onChangeVolume?: (value: number) => void;
  volumeContClassName?: string;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class AudioPlayer extends Component<Props> {
  public static defaultProps = {
    allowParallelPlay: false,
    loop: false,
    hideTime: false,
    initialVolume: 1,
  };

  public constructor(props: Props) {
    super(props);
    this.registerAudioPlayer();
  }

  private registerAudioPlayer = () => {
    const {
      loop,
      register,
      syncedPlayerId,
      urls,
      activeUrlType,
      preloadType,
      allowParallelPlay,
      initialVolume,
      playerId,
    } = this.props;
    register(playerId, urls, activeUrlType, preloadType, loop, allowParallelPlay, initialVolume, syncedPlayerId);
  };

  public componentWillUnmount() {
    const {
      unregister,
      playerId,
    } = this.props;
    unregister(playerId);
  }

  public componentDidUpdate = (prevProps: Props) => {
    const {
      urls,
      unregister,
      playerId,
    } = this.props;
    const urlChanged = urls !== prevProps.urls;
    if (urlChanged) {
      unregister(playerId);
      this.registerAudioPlayer();
    }
  };

  private handleChangeAudioType = (e) => {
    const {
      setActiveUrlType,
      playerId,
    } = this.props;
    setActiveUrlType(playerId, e.target.value);
  };

  public render() {
    const {
      className,
      hideTime,
      playerId,
      onChangeVolume,
      activeUrlType,
    } = this.props;
    return (
      <div className={classCombo(style.cont)(hideTime, style.noTime)(className)()}>
        <div className={style.row}>
          <div className={style.btnCont}>
            <PlayButton playerId={playerId} />
          </div>
          <div>
            <VolumeControl onChange={onChangeVolume} playerId={playerId} />
          </div>
          {!hideTime && <Timer playerId={playerId}/>}
        </div>
        {!hideTime &&
          <div className={style.row}>
            <Progress playerId={playerId}/>
          </div>
        }
        <div className={style.choose_output_row}>
          <div className={style.left}>
            <span>Output:</span>
          </div>
          <div className={style.right}>
            <div className={style.right_row}>
              <input
                type="radio"
                id="audio_output_tuned"
                name="url_type"
                value={AUDIO_TYPE.TUNED}
                checked={activeUrlType === AUDIO_TYPE.TUNED}
                onChange={this.handleChangeAudioType}
              />
              <label htmlFor="audio_output_tuned">
                <span>Tuned</span>
              </label>
            </div>
            <div className={style.right_row}>
              <input
                type="radio"
                id="audio_output_original"
                name="url_type"
                value={AUDIO_TYPE.ORIGINAL}
                checked={activeUrlType === AUDIO_TYPE.ORIGINAL}
                onChange={this.handleChangeAudioType}
              />
              <label htmlFor="audio_output_original">
                <span>Original</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AudioPlayer);
