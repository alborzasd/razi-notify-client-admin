import styles from './MainLayout.module.scss';

// import {useState} from 'react';
import SidebarStateProvider from '../contexts/SidebarStateProvider';
// TODO: prevent rerender outlet when sidebar state changes

import { Outlet } from 'react-router-dom';
import Topbar from '../components/topbar/Topbar';
import Sidebar from '../components/sidebar/Sidebar';

function MainLayout() {

    // const [sidebarIsActive, setSidebarIsActive] = useState(false);
    // const openSidebar = () => setSidebarIsActive(true);
    // const closeSidebar = () => setSidebarIsActive(false);

    return (
        <div className={styles.MainLayout}>
            <SidebarStateProvider>
                <Topbar />
                <Sidebar />
            </SidebarStateProvider>
            <Outlet />
        </div>
    );
}

export default MainLayout;