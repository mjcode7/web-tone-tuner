import {connect} from 'react-redux';
import {CoreState} from 'redux_modules/core_state';
import {bindActionCreators} from 'redux';
import * as React from 'react';
import style from './InputFileSelector.less';
import {selectedNewFile} from 'actions/input_file_selector';
import { TwoColumnPrimaryButton } from 'components/generic/PrimaryButton';
import FileFolder from 'images/create/audio-file-folder.svg';

export const mapStateToProps = (state: CoreState) => {
  return {
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      selectedNewFile,
    }, dispatch),
  };
};

interface OwnProps {
  text?: string;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class InputFileSelector extends React.Component<Props> {
  private fileInput: any;

  public constructor(props: Props) {
    super(props);
  }

  private handleFileChange = async (e) => {
    const blob = e.target.files[0];
    this.props.selectedNewFile(blob);
  };

  public render = () => {
    const {
      text,
    } = this.props;
    const defaultOrCustomText = text || 'Choose an input file';
    return (
      <>
        <TwoColumnPrimaryButton
          text={defaultOrCustomText}
          onClick={() => this.fileInput && this.fileInput.click()}
          svgIcon={<FileFolder/>}
          svgIconSizeClass={style.fileFolderIconSize}
        />
        <input accept=".mp3,.wav" ref={el => this.fileInput = el} className={style.hiddenInput} type="file" onChange={this.handleFileChange} />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputFileSelector);
