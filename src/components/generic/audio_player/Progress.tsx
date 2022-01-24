import * as React from 'react';
import {AppDispatch} from 'models/app_redux';
import {selectCurrentTime, selectDuration, selectIsDragging} from 'selectors/audio_player';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as style from './Progress.less';
import {startDrag, stopDrag} from 'actions/audio_player';
import {CoreState} from 'redux_modules/core_state';

interface OwnProps {
  playerId: string;
}

const mapStateToProps = (state: CoreState, ownProps: OwnProps) => {
  const {
    playerId,
  } = ownProps;
  return {
    isDragging: selectIsDragging(state, playerId),
    currentTime: selectCurrentTime(state, playerId),
    duration: selectDuration(state, playerId),
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) =>
  bindActionCreators({
    startDrag,
    stopDrag,
  }, dispatch);

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

interface ComponentState {
  dragPercentOfSong?: number;
  progressPageLeft?: number;
  progressWidth?: number;
}

class Progress extends React.Component <Props, ComponentState> {
  private INITIAL_STATE: Readonly<ComponentState> = {
    dragPercentOfSong: undefined,
    progressPageLeft: undefined,
    progressWidth: undefined,
  };
  private ref: HTMLDivElement | null;

  public constructor(props: Props) {
    super(props);
    this.state = this.INITIAL_STATE;
  }

  public componentDidMount(): void {
    if (this.ref) {
      this.ref.addEventListener('touchstart', this.onTouchStart, {passive: false});
    }
  }

  public componentDidUpdate = (prevProps: Props) => {
    const {
      isDragging: wasDragging,
    } = prevProps;
    const {
      isDragging,
    } = this.props;
    const startedDragging = isDragging && !wasDragging;
    const finishedDragging = !isDragging && wasDragging;
    if (startedDragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('touchmove', this.onTouchMove, {passive: false});
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('touchend', this.onMouseUp, {passive: false});
    } else if (finishedDragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('touchmove', this.onTouchMove);
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('touchend', this.onMouseUp);
    }
  };

  public componentWillUnmount = () => {
    const {
      isDragging,
    } = this.props;
    if (isDragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('touchmove', this.onTouchMove);
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('touchend', this.onMouseUp);
    }
    if (this.ref) {
      this.ref.removeEventListener('touchstart', this.onTouchStart);
    }
  };

  private onTouchMove = (e) => {
    console.log('touch moved', e);
    e.stopPropagation();
    e.preventDefault();
    this.onTouchOrMouseMove(e.touches[0].pageX);
  };

  public onMouseMove = (e) => {
    console.log('mouse moved', e);
    this.onTouchOrMouseMove(e.pageX);
  };

  private onTouchOrMouseMove = (pageX) => {
    const {
      progressPageLeft,
      progressWidth,
    } = this.state;
    this.setState({
      dragPercentOfSong: this.calculatePercent(pageX, progressPageLeft, progressWidth),
    });
  };

  private onTouchStart = (e) => {
    console.log('touch start', e);
    e.stopPropagation();
    e.preventDefault();
    this.onMouseOrTouchDown(e, e.touches[0].pageX);
  };

  private onMouseDown = (e) => {
    this.onMouseOrTouchDown(e, e.pageX);
  };

  private onMouseOrTouchDown = (e, pageX) => {
    if (!this.ref) return;
    const {
      startDrag,
      playerId,
    } = this.props;
    const outerProgressRect = this.ref.getBoundingClientRect();
    const progressPageLeft = outerProgressRect.left;
    const progressWidth = outerProgressRect.width;
    this.setState({
      dragPercentOfSong: this.calculatePercent(pageX, progressPageLeft, progressWidth),
      progressPageLeft,
      progressWidth,
    });
    startDrag(playerId);
  };

  private calculatePercent = (cursorPageLeft: number, progressPageLeft: number|undefined, progressWidth: number|undefined): number => {
    console.log('calculate percent. cursor page left=', cursorPageLeft, 'progresspageLeft=', progressPageLeft, 'progress width,', progressWidth);
    if (progressPageLeft === undefined || progressWidth === undefined) return 0;
    const percentOfSong = (cursorPageLeft - progressPageLeft) / progressWidth;
    let sanitizedPercent = Math.min(1, percentOfSong);
    sanitizedPercent = Math.max(0, sanitizedPercent);
    console.log('return ', sanitizedPercent);
    return sanitizedPercent;
  };

  private onMouseUp = (e) => {
    console.log('mouse up');
    e.stopPropagation();
    e.preventDefault();
    const {
      playerId,
      stopDrag,
    } = this.props;
    const {
      dragPercentOfSong,
    } = this.state;
    stopDrag(playerId, dragPercentOfSong || 0);
    this.setState(this.INITIAL_STATE);
  };

  public render = () => {
    const {
      currentTime,
      duration,
      isDragging,
    } = this.props;

    const {
      dragPercentOfSong,
    } = this.state;

    let percentOfSong = 0;
    if (isDragging && dragPercentOfSong !== undefined) {
      // drag is active
      percentOfSong = dragPercentOfSong;
    } else if(duration !== undefined && duration > 0) {
      // use actual song state
      percentOfSong = (currentTime / duration);
    }
    percentOfSong = Math.min(1, percentOfSong);
    percentOfSong = Math.max(0, percentOfSong);

    const innerStyle = {width: `${percentOfSong * 100}%`};

    return (
      <div ref={el => this.ref=el} className={style.progressTouchCont} onMouseDown={this.onMouseDown}>
        <div className={style.progressTotal}>
          <div className={style.progressInner} style={innerStyle} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Progress);
