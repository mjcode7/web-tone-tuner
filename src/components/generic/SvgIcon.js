import PropTypes from 'prop-types';
import React from 'react';

import style from './SvgIcon.less';

// http://nicolasgallagher.com/canvas-fix-svg-scaling-in-internet-explorer/
export class SvgIcon extends React.Component {
  static propTypes = {
    sizeClass: PropTypes.string.isRequired, // class with width and height defined
    children: PropTypes.node.isRequired, // should be svg
  };

  render() {
    const {
      sizeClass,
      children,
    } = this.props;

    return (
      <p className={style.icon}>
        <canvas className={sizeClass}/>
        {children}
      </p>
    );
  }
}
