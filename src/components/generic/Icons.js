import PropTypes from 'prop-types';
import React from 'react';
import style from './Icons.less';
import {classCombo} from 'utils/Utils';

export class ButtonIconSVG extends React.Component {
  static propTypes = {
    viewBox: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  static defaultProps = {
    viewBox: '0 0 32 32',
  };

  render() {
    const {
      viewBox,
      children,
      className,
    } = this.props;
    return (
      <svg
        className={classCombo(style.icon)(className)()}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="currentColor"
      >
        {children}
      </svg>
    );
  }
}

/*
  height: 1.5em;
  width: 1.5em;
  color: #386fad;
 */
export class RightArrowSVG extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <ButtonIconSVG className={style.navArrow} viewBox="0 0 180.28 208.13">
        <path d="M180.28,104.06L0,208.13,60.19,104.06,0,0Z" />
      </ButtonIconSVG>
    );
  }
}

export class LeftArrowSVG extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <ButtonIconSVG className={style.navArrow} viewBox="0 0 180.28 208.13">
        <path d="M180.28,0L120.09,104.06l60.19,104.06L0,104.06Z" transform="translate(0 0)" />
      </ButtonIconSVG>
    );
  }
}
