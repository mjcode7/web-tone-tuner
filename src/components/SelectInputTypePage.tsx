import {connect} from 'react-redux';
import {CoreState} from 'redux_modules/core_state';
import {bindActionCreators} from 'redux';
import * as React from 'react';
import InputFileSelector from 'components/InputFileSelector';
import {InputAudioType, PageId} from 'reducers/page';
import {selectTunerOutput} from 'selectors/tuner';
import {changePage} from 'actions/page';

export const mapStateToProps = (state: CoreState) => {
  const hasTunedFile = selectTunerOutput(state, InputAudioType.File);
  return {
    hasTunedFile,
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

class SelectInputTypePage extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);
  }

  private renderFileOption = () => {
    const {
      hasTunedFile,
      changePage,
    } = this.props;
    if (hasTunedFile) {
      return <a onClick={() => changePage(PageId.PlayTunedFileAudio)}><span>File</span></a>
    } else {
      return <InputFileSelector />
    }
  };

  public render = () => {
    return (
      <div>
        {this.renderFileOption()}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectInputTypePage);
