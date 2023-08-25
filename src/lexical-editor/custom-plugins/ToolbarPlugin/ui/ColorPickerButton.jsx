import styles from "./ColorPickerButton.module.scss";

import { useState, useRef, useCallback, useEffect } from "react";

import ToolbarButton from "./ToolbarButton";

import { SketchPicker } from "react-color";

import { HiOutlineChevronDown } from "react-icons/hi";

import generateClassName from "classnames";
import { rgbaObjectToString } from "../../../../utilities/utilities";

import useDropdownPosition from "./useDropdownPosition";

// passing some default colors to <SketchPicker/>

const presetTextColors = [
  { color: "rgba(0, 0, 0, 0)", title: "حذف کردن رنگ" },
  "rgba(208, 2, 27, 1)",
  "rgba(245, 166, 35, 1)",
  "rgba(248, 231, 28, 1)",
  "rgba(139, 87, 42, 1)",
  "rgba(126, 211, 33, 1)",
  "rgba(189, 16, 224, 1)",
  "rgba(74, 144, 226, 1)",
  "rgba(80, 227, 194, 1)",
  "rgba(184, 233, 134, 1)",
  "rgba(0, 0, 0, 1)",
  "rgba(155, 155, 155, 1)",
];

const presetBackgroundColors = [
  { color: "rgba(0, 0, 0, 0)", title: "حذف کردن رنگ" },
  "rgba(208, 2, 27, 0.5)",
  "rgba(245, 166, 35, 0.5)",
  "rgba(248, 231, 28, 0.5)",
  "rgba(139, 87, 42, 0.5)",
  "rgba(126, 211, 33, 0.5)",
  "rgba(189, 16, 224, 0.5)",
  "rgba(74, 144, 226, 0.5)",
  "rgba(80, 227, 194, 0.5)",
  "rgba(184, 233, 134, 0.5)",
  "rgba(0, 0, 0, 0.5)",
  "rgba(155, 155, 155, 0.5)",
];

function ColorPickerButton({
  currentSelectionColor,
  onChangeComplete,
  iconElement,
  // if true, preset colors will have alpha=0.5
  isForBackground,
  ...rest
}) {
  // is menu opened
  const [isOpen, setIsOpen] = useState(false);

  const toolbarButtonRef = useRef(null);
  const menuContainerRef = useRef(null);

  const { isDisabled } = rest;

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDocumentClick = useCallback(
    (e) => {
      if (!toolbarButtonRef.current) {
        return;
      }
      if (!toolbarButtonRef.current.contains(e.target)) {
        closeMenu();
      }
    },
    [toolbarButtonRef, toolbarButtonRef.current, closeMenu]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick, true);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick, true);
    };
  }, []);

  const handleChangeColorComplete = useCallback(
    (newColor) => {
      if (!isDisabled && onChangeComplete) {
        // passing null if alpha is 0
        // with passing null, color property is removed from dom
        // and also the node is merged with it's prev and next node
        const color =
          newColor?.rgb?.a > 0 ? rgbaObjectToString(newColor?.rgb) : null;
        onChangeComplete(color);
      }
    },
    [isDisabled, onChangeComplete]
  );

  const openCloseIconClassName = generateClassName(styles.openCloseIcon, {
    [styles.rotate]: isOpen,
  });

  const colorDisplayClassName = generateClassName(styles.colorDisplay, {
    [styles.inactive]: currentSelectionColor === "NULL",
  });

  return (
    <div ref={toolbarButtonRef} className={styles.ColorPickerButton}>
      <ToolbarButton
        {...rest}
        activatedStyleSameAsHover={true}
        isActivated={isOpen}
        onClickProp={toggleOpen}
      >
        <HiOutlineChevronDown className={openCloseIconClassName} />
        {iconElement}
        <div
          className={colorDisplayClassName}
          style={{
            backgroundColor:
              currentSelectionColor === "NULL" ? null : currentSelectionColor,
          }}
        ></div>
      </ToolbarButton>
      {/* IMPORTANT: the menu must be button or child of a button element
      otherwise when click on the menu, the selection is collpased */}
      {isOpen && (
        <button ref={menuContainerRef} className={styles.sketchPickerContainer}>
          <ColorPickerWrapper
            initialColor={currentSelectionColor}
            onChangeComplete={handleChangeColorComplete}
            isForBackground={isForBackground}
            //
            toolbarButtonRef={toolbarButtonRef}
            menuContainerRef={menuContainerRef}
          />
        </button>
      )}
    </div>
  );
}

function ColorPickerWrapper({
  initialColor,
  onChangeComplete,
  isForBackground,
  //
  toolbarButtonRef,
  menuContainerRef
}) {
  const [color, setColor] = useState(
    initialColor === "NULL" ? "rgba(255, 255, 255, 1)" : initialColor
  );

  // get from browser dev tools (dirty spaghetti way)
  const colorPickerMenuWidth = 220;

  useDropdownPosition(toolbarButtonRef, menuContainerRef, colorPickerMenuWidth);

  const handleChange = useCallback((newColor) => {
    // if passing newColor without specify rgb
    // the alpha value remains as 1 (not changable)
    setColor(newColor?.rgb);
  }, []);

  return (
    <SketchPicker
      color={color}
      onChange={handleChange}
      onChangeComplete={onChangeComplete}
      presetColors={isForBackground ? presetBackgroundColors : presetTextColors}
    />
  );
}

export default ColorPickerButton;
