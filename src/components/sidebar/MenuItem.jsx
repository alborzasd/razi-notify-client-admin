import styles from "./MenuItem.module.scss";
import React from "react";

import classnames from "classnames";

import { useContext } from "react";
import { sidebarState } from "../../contexts/SidebarStateProvider";

import { NavLink } from "react-router-dom";

function MenuItem({ linkTo, iconElement, title }) {
  const { closeSidebar } = useContext(sidebarState);

  // NavLink accepts callback for className prop. to customize the class name for active and pending state
  const classNameCallback = ({ isActive }) => {
    return classnames(styles.link, {
      [styles.active]: isActive,
    });
  };

  const clonedIcon = React.cloneElement(iconElement, {
    className: styles.icon + ' ' + iconElement?.props?.className,
  });

  return (
    <li onClick={() => closeSidebar()}>
      <NavLink to={linkTo} className={classNameCallback}>
        {clonedIcon}
        {title}
      </NavLink>
    </li>
  );
}

export default MenuItem;
