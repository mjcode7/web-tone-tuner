import {connect} from 'react-redux';
import {CoreState} from 'redux_modules/core_state';
import {bindActionCreators} from 'redux';
import * as React from 'react';
import {InputAudioType} from 'reducers/page';
import {selectTunerInputBasename, selectTunerOutputAudioUrl} from 'selectors/tuner';
import {changePage} from 'actions/page';
import {selectPreviousPageId} from 'selectors/page';
import {FileType} from 'reducers/audio_converter';

export const mapStateToProps = (state: CoreState) => {
  return {
    previousPageId: selectPreviousPageId(state),
    wavUrl: selectTunerOutputAudioUrl(state, InputAudioType.File), // TODO, dynamic type
    inputBasename: selectTunerInputBasename(state, InputAudioType.File),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      changePage,
    }, dispatch),
  };
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class SaveTunedAudioPage extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);
  }

  private save = (outputFileType: FileType) => {

  };

  public render = () => {
    const {
      changePage,
      previousPageId,
      wavUrl,
      inputBasename,
    } = this.props;
    if (previousPageId === undefined || wavUrl === undefined || inputBasename === undefined) return null;
    const outputBasename = `${inputBasename}_tuned`;
    const outputWAVName = outputBasename + '.wav';
    const outputMP3Name = outputBasename + '.mp3';
    return (
      <div>
        Select a file format:<br/>
        <a href={wavUrl} target="_blank" download={outputWAVName} onClick={() => changePage(previousPageId)}>.wav</a><br/>
        <a onClick={() => this.save(FileType.MP3)}><span>.mp3</span></a>
        <a onClick={() => changePage(previousPageId)}><span>Cancel</span></a>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SaveTunedAudioPage);
