import { useEffect } from "react";

// https://javascript.info/size-and-scroll
// The offsetParent is the nearest ancestor that the browser uses for calculating coordinates during rendering

function useDropdownPosition(toolbarButtonRef, menuContainerRef, menuWidth) {
  useEffect(() => {
    if (!toolbarButtonRef || !menuContainerRef || !menuWidth) return;

    const toolbarButtonElement = toolbarButtonRef?.current;
    // toolbar is the first positioned ancestor (sticky)
    // if there is no positioned ancestor, it would be body
    // the offsetLeft property is relative to that parent

    const menuContainerElement = menuContainerRef?.current;

    if (!toolbarButtonElement || !menuContainerElement) return;

    // console.log(toolbarButtonElement, toolbarElement, menuContainerElement);

    // calculate distance between right edge of toolbar button
    // and it's positioned parent (left edge of toolbar)
    const distance =
      toolbarButtonElement.offsetLeft + toolbarButtonElement.offsetWidth;

    // by default the right edge of menu is aligned with the right edge of toolbar button
    // (position: absolute, right: 0)
    // if distance is more than menu width
    // it means the menu has enough space to put in the default position
    // if not
    // the right property should have a negative value
    // a value in which the left edge of menu is aligned with the left edge of toolbar
    if (distance > menuWidth) {
      menuContainerElement.style.right = "0px";
    } else {
      menuContainerElement.style.right = `-${menuWidth - distance}px`;
    }
  }, []);
}

export default useDropdownPosition;
