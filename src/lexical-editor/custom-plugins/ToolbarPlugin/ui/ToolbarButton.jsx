import styles from "./ToolbarButton.module.scss";

import { useCallback } from "react";

import Button from "../../../../components/shared/Button";

import generateClassNames from "classnames";

function ToolbarButton({
  children,
  className,
  isDisabled,
  onClickProp,
  isActivated,
  // same style for hover and active state
  activatedStyleSameAsHover,
  ...rest
}) {
  const handleClick = useCallback(() => {
    // if button is disabled
    // it can not be activated
    // also the handler prop will not fire
    if (!isDisabled && onClickProp) {
      // toggleActivated();
      onClickProp();
    }
  }, [isDisabled, onClickProp]);

  const toolbarButtonClassName = generateClassNames(
    styles.ToolbarButton,
    className,
    {
      [styles.disabled]: isDisabled,
      [styles.activated]: isActivated && !activatedStyleSameAsHover,
      [styles.hoverActivated]:
        isActivated && activatedStyleSameAsHover === true,
    }
  );

  return (
    <Button {...rest} onClick={handleClick} className={toolbarButtonClassName}>
      {children}
    </Button>
  );
}

export default ToolbarButton;
