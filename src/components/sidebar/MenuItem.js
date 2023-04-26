import styles from './MenuItem.module.scss';

import classnames from 'classnames';

import { useContext } from 'react';
import { sidebarState } from '../../contexts/SidebarStateProvider';

import { NavLink } from 'react-router-dom';

function MenuItem({linkTo, Icon, title}) {
    const {closeSidebar} = useContext(sidebarState);

    // NavLink accepts callback for className prop. to customize the class name for active and pending state
    const classNameCallback = ({isActive}) => {
        return classnames(styles.link ,{
            [styles.active]: isActive
        })
    }

    return (
        <li onClick={() => closeSidebar()}>
            <NavLink to={linkTo} className={classNameCallback}>
                <Icon className={styles.icon} />
                {title}
            </NavLink>
        </li>
    );
}

export default MenuItem;