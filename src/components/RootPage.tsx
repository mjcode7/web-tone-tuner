import React, {Suspense} from 'react';
import style from './RootPage.less';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux'
import {ErrorBoundary} from 'components/generic/ErrorBoundary';
import ErrorPage from 'components/generic/ErrorPage';
import LoadingPage from 'components/generic/LoadingPage';
import {selectCurrentPageId} from 'selectors/page';
import {PageId} from 'reducers/page';
import SelectInputTypePage from 'components/SelectInputTypePage';
import TuningProgressPage from 'components/TuningProgressPage';
import PlayTunedAudioPage from 'components/PlayTunedAudioPage';
// import TunePage from 'components/TunePage';
import SaveTunedAudioPage from 'components/SaveTunedAudioPage';
import {analytics} from 'lib/Analytics';
import {CoreState} from 'redux_modules/core_state';

export const mapStateToProps = (state: CoreState) => {
  return {
    currentPageId: selectCurrentPageId(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
    }, dispatch),
  };
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class RootPage extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);
  }

  private getPageComponentClass = () => {
    const {
      currentPageId,
    } = this.props;
    type PageTypesToComponents = {
      [id in PageId]: any;
    };
    const pageIdToClassMapping: PageTypesToComponents = {
      [PageId.SelectInputType]: SelectInputTypePage,
      [PageId.TuningProgress]: TuningProgressPage,
      [PageId.PlayTunedFileAudio]: PlayTunedAudioPage,
      // [PageId.PlayTunedRecordingAudio]: TunePage,
      [PageId.SaveTunedAudio]: SaveTunedAudioPage,
      // [PageId.ChangeTuneSettings]: TunePage,
      // [PageId.LiveTuning]: TunePage,
      [PageId.Error]: ErrorPage, // TODO, check that this page is good.
    };
    return pageIdToClassMapping[currentPageId];
  };

  public componentDidMount(): void {
    this.logCurrentPage();
  }


  public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    const didPageChange = this.props.currentPageId !== prevProps.currentPageId;
    if (didPageChange) {
      this.logCurrentPage();
    }
  }

  private logCurrentPage() {
    const {
      currentPageId,
    } = this.props;
    analytics.logModalView(currentPageId);
  }

  public render = () => {
    const pageComponent = React.createElement(this.getPageComponentClass());
    return (
      <div className={style.contentWrapper}>
        <ErrorBoundary
          FallbackComponent={() => <div className={style.innerContentWrapper}><ErrorPage/></div>}
        >
          <Suspense
            fallback={<div className={style.innerContentWrapper}><LoadingPage /></div>}
          >
            <div className={style.innerContentWrapper}>
              {pageComponent}
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootPage);
