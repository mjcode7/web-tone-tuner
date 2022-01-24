import {connect} from 'react-redux';
import {CoreState} from 'redux_modules/core_state';
import {bindActionCreators} from 'redux';
import * as React from 'react';
import {InputAudioType, PageId} from 'reducers/page';
import {selectAudioURLs} from 'selectors/tuner';
import AudioPlayer from 'components/generic/audio_player/AudioPlayer';
import {PreloadType} from 'actions/audio_player';
import InputFileSelector from 'components/InputFileSelector';
import {changePage} from 'actions/page';
import {uuid} from 'lib/idgen';
import style from './PlayTunedAudioPage.less';
import {TwoColumnPrimaryButton} from 'components/generic/PrimaryButton';
import DownloadIcon from 'images/download-icon.svg';
import {selectTunerInputBasename, selectTunerOutputAudioUrl} from 'selectors/tuner';
import {analytics, EventAction} from 'lib/Analytics';

export const mapStateToProps = (state: CoreState) => {
  return {
    audioUrls: selectAudioURLs(state, InputAudioType.File),
    wavUrl: selectTunerOutputAudioUrl(state, InputAudioType.File), // TODO, dynamic type
    inputBasename: selectTunerInputBasename(state, InputAudioType.File),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      changePage,
    }, dispatch),
  };
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class PlayTunedAudioPage extends React.Component<Props> {
  private playerId: string;
  private downloadLink;

  public constructor(props: Props) {
    super(props);
    this.playerId = uuid();
  }

  private changeInputType = () => {
    const {
      changePage,
    } = this.props;
    changePage(PageId.SelectInputType);
  };

  private handleClickedSave = () => {
    // this.props.changePage(PageId.SaveTunedAudio);
    if (this.downloadLink) {
      analytics.logEvent(EventAction.ClickDownloadFile);
      this.downloadLink.click();
    }
  };

  public render = () => {
    const {
      audioUrls,
      wavUrl,
      inputBasename,
    } = this.props;
    if (wavUrl === undefined || inputBasename === undefined) return null;
    const outputBasename = `${inputBasename}_tuned`;
    const outputWAVName = outputBasename + '.wav';
    if (audioUrls === undefined) return null;
    return (
      <div>
        <div className={style.row}>
          <AudioPlayer
            urls={audioUrls}
            playerId={this.playerId}
            preloadType={PreloadType.Auto} />
        </div>
        <div className={style.row}>
          <TwoColumnPrimaryButton
            text="Download tuned audio"
            onClick={this.handleClickedSave}
            svgIcon={<DownloadIcon/>}
            svgIconSizeClass={style.downloadIconSize}
          />
          <a ref={el => this.downloadLink = el} className={style.hiddenLink} href={wavUrl} target="_blank" download={outputWAVName}>.wav</a>
        </div>
        <div className={style.row}>
          <InputFileSelector text="Choose a new file"/>
        </div>
        {
          /*
        <div>
          <a onClick={this.changeInputType}><span>Change input type</span></a>
        </div>
           */
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayTunedAudioPage);
