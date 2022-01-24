import * as React from 'react';
import {classCombo} from 'utils/Utils';
import {Link} from 'react-router-dom';
import * as style from './Button.less'
import {CoreState} from 'redux_modules/core_state';

export enum ButtonSize {
  Custom = 'custom',
  Tiny = 'tiny',
  Small = 'small',
  Medium = 'medium',
  MediumLarge = 'mediumLarge',
  Large = 'large'
}

interface Props {
  // custom size means allow the className to set
  text?: string;
  onClick: (e?: any) => void;
  size?: ButtonSize;
  href?: string;
  className?: string;
  iconClassName?: string;
  title?: string;
  icon?: React.ReactNode;
  contents?: React.ReactNode;
}

class Button extends React.Component<Props, CoreState> {
  public constructor(props: Props) {
    super(props);
  }

  public render() {
    const {
      onClick,
      title,
      text,
      className,
      iconClassName,
      href,
      size='medium',
      icon,
      contents,
    } = this.props;
    if (onClick !== undefined && href === undefined) {
      // onClick is supplied but href is not
      return (
        <button
          // prevent default so btns can be clicked in react-form without triggering the form as touched
          onClick={(evt) => {
            evt.preventDefault();
            onClick(evt);
          }}
          onMouseUp={(evt) => {
            evt.preventDefault();
          }}
          title={title}
          className={classCombo(style.btn)(size !== 'custom', style[size])(className)()}>
          {contents}
          {text && <span>{text}</span>}
          {icon && <div className={classCombo(style.icon)(iconClassName)()}>{icon}</div>}
        </button>
      );
    }
    if (href !== undefined) {
      // link, with optional onClick
      const onClickProps = onClick ?
        {
          onClick: (evt) => {
            evt.preventDefault();
            onClick && onClick(evt);
          },
          onMouseUp: (evt) => {
            evt.preventDefault();
          },
        } : {};
      return (
        <Link
          to={href}
          {...onClickProps}
          className={classCombo(style.btn)(size !== 'custom', style[size])(className)()}
          title={title}>
          {contents}
          {text && <span>{text}</span>}
          {icon && <div className={style.icon}>{icon}</div>}
        </Link>
      )
    } else {
      // gives the look of a button without it being a link or button (in case we wrap this component in a larger Link)
      return (
        <div className={classCombo(style.btn)(style.mockBtn)(size !== 'custom', style[size])(className)()}>
          {contents}
          {text && <span>{text}</span>}
          {icon && <div className={style.icon}>{icon}</div>}
        </div>
      )
    }
  }
}

export default Button;
