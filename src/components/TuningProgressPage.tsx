import {connect} from 'react-redux';
import {CoreState} from 'redux_modules/core_state';
import {bindActionCreators} from 'redux';
import * as React from 'react';
import {ProgressBar} from 'components/generic/ProgressBar';
import {selectActiveTuningPercentDone} from 'selectors/tuner';

export const mapStateToProps = (state: CoreState) => {
  return {
    percentDone: selectActiveTuningPercentDone(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
    }, dispatch),
  };
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class TuningProgressPage extends React.Component<Props> {
  public constructor(props: Props) {
    super(props);
  }

  public render = () => {
    const {
      percentDone,
    } = this.props;
    return (
      <div>
        <ProgressBar percent={percentDone} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TuningProgressPage);
