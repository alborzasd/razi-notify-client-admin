import styles from './Topbar.module.scss';

import { useContext } from 'react';
import { sidebarState } from '../../contexts/SidebarStateProvider';

import {IoMenuSharp} from 'react-icons/io5';

function Topbar() {
    const {openSidebar} = useContext(sidebarState);

    return (
        <header className={styles.Topbar}>
            <button
                className={styles.sidebarOpen}
                onClick={() => openSidebar()}
            >
                <IoMenuSharp />
            </button>
            <h1 className={styles.title}>سامانه اطلاع رسانی رازی</h1>
        </header>
    );
}

export default Topbar;