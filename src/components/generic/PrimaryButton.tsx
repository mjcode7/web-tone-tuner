import React from 'react';
import Button, {ButtonSize} from 'components/generic/Button';
import {SvgIcon} from 'components/generic/SvgIcon';
import * as style from './PrimaryButton.less';
import {classCombo} from 'utils/Utils';

interface TwoColumnStandardProps {
  text: string;
  onClick: () => void;
  className?: string;
  leftContClassName?: string;
  rightContClassName?: string;
}

interface TwoColumnWithIconProps extends TwoColumnStandardProps {
  svgIcon: React.ReactNode;
  svgIconSizeClass: string;
}

interface TwoColumnWithContentProps extends TwoColumnStandardProps {
  content: React.ReactNode;
}

type TwoColumnProps = TwoColumnWithIconProps | TwoColumnWithContentProps;

/**
 * column 1 is either an svg image or custom content.
 * column 2 is text
 */
export class TwoColumnPrimaryButton extends React.Component<TwoColumnProps> {

  public constructor(props: TwoColumnProps) {
    super(props);
  }

  private renderButtonContents = () => {
    const {
      text,
      svgIcon,
      svgIconSizeClass,
      leftContClassName,
      rightContClassName,
    } = this.props as TwoColumnWithIconProps;

    let leftContent;
    if (svgIcon !== undefined && svgIconSizeClass !== undefined) {
      leftContent = <SvgIcon sizeClass={svgIconSizeClass}>{svgIcon}</SvgIcon>;
    } else {
      const {
        content,
      } = this.props as TwoColumnWithContentProps;
      leftContent = content;
    }
    return (
      <div className={style.innerCont}>
        <div className={classCombo(style.leftCont)(leftContClassName)()}>{leftContent}</div>
        <div className={classCombo(style.textCont)(rightContClassName)()}>
          <span>{text}</span>
        </div>
      </div>
    );
  };

  public render = () => {
    const {
      onClick,
      className,
    } = this.props;
    return (
      <Button
        className={classCombo(style.primaryButton)(className)()}
        onClick={onClick}
        size={ButtonSize.Custom}
        contents={this.renderButtonContents()}
        />
    )
  }
}

interface OneColumnProps {
  onClick: () => void;
  className?: string;
  content: React.ReactNode;
  innerContClassName: string;
}

/**
 * column 1 is custom content.
 */
export class OneColumnPrimaryButton extends React.Component<OneColumnProps> {

  public constructor(props: OneColumnProps) {
    super(props);
  }

  private renderButtonContents = () => {
    const {
      content,
      innerContClassName,
    } = this.props;
    return (
      <div className={classCombo(style.innerCont)(innerContClassName)()}>
        {content}
      </div>
    );
  };

  public render = () => {
    const {
      onClick,
      className,
    } = this.props;
    return (
      <Button
        className={classCombo(style.primaryButton)(className)()}
        onClick={onClick}
        size={ButtonSize.Custom}
        contents={this.renderButtonContents()}
      />
    )
  }
}
