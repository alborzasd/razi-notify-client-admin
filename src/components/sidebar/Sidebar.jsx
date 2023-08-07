import styles from './Sidebar.module.scss';

import {useEffect, useRef, useContext} from 'react';
import { sidebarState } from '../../contexts/SidebarStateProvider';

import classnames from 'classnames';

import ProfileCard from './ProfileCard';
import Menu from './Menu';

// import {MdArrowForwardIos} from 'react-icons/md';

function Sidebar() {
    const {sidebarIsActive, closeSidebar} = useContext(sidebarState);

    const sidebarEl = useRef();

    useEffect(() => {
        const handler = (e) => {
            if(!sidebarEl.current) return;

            if(!sidebarEl.current.contains(e.target)) {
                closeSidebar();
            }
        };
        document.addEventListener('click', handler, true); // true for call on capture phase

        return () => {
            document.removeEventListener('click', handler, true);
        }
    }, [closeSidebar]); // closeSidebar is defined by useCallback and never changed on context rerender (rerender? for context?)

    const sidebarClassName = classnames(styles.Sidebar, {
        [styles.active]: sidebarIsActive
    });

    return (
        <div className={sidebarClassName} ref={sidebarEl}>
            <ProfileCard />
            <div className={styles.hr}></div>
            <Menu />
        </div>
    )
}

export default Sidebar;