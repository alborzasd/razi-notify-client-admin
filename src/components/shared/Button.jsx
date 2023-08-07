import styles from "./Button.module.scss";

import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";

import { HiOutlineChevronDown } from "react-icons/hi";

import classNames from "classnames";

function Button({ children, className, ...rest }) {
  return (
    <button className={classNames(styles.Button, className)} {...rest}>
      {children}
    </button>
  );
}

function NavLinkButton({ children, className, ...rest }) {
  return (
    <NavLink className={classNames(styles.Button, className)} {...rest}>
      {children}
    </NavLink>
  );
}

function ButtonGroup({ children, className }) {
  return (
    <div className={classNames(styles.ButtonGroup, className)}>{children}</div>
  );
}

function ButtonDropdown({ config }) {
  const [isOpen, setIsOpen] = useState(false);

  const dropDownRef = useRef(null);

  const toggleDropdown = useCallback(() => {
    // console.log('toggle');
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    // console.log('close');
    setIsOpen(false);
  }, []);

  const handleDocumentClick = useCallback(
    (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [handleDocumentClick]);

  const buttonsContainerClassname = classNames(styles.buttonsContainer, {
    [styles.hidden]: !isOpen,
  });
  const iconClassname = classNames(styles.dropdownIcon, {
    [styles.rotate]: isOpen,
  });

  const renderedButtons = config.buttons.map((buttonConfig, index) => {
    const ButtonIcon = buttonConfig.icon.component;
    const buttonIconProps = buttonConfig.icon.props;
    const handleClick = () => {
      buttonConfig.onClick();
    };
    return (
      <div
        key={index}
        className={
          styles.button + " " + config?.classNames?.buttonItemClassname
        }
        onClick={handleClick}
      >
        <ButtonIcon {...buttonIconProps} />
        {buttonConfig.text}
      </div>
    );
  });

  return (
    <div
      className={styles.Dropdown + " " + config?.classNames?.dropdownClassname}
      onClick={toggleDropdown}
      ref={dropDownRef}
    >
      <HiOutlineChevronDown className={iconClassname} />
      <div className={styles.initText}>{config.initText}</div>
      <div
        className={
          buttonsContainerClassname +
          " " +
          config?.classNames?.buttonsContainerClassname
        }
      >
        {renderedButtons}
      </div>
    </div>
  );
}

export default Button;
export { NavLinkButton };
export { ButtonGroup };
export { ButtonDropdown };
