import styles from './MainLayout.module.scss';

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { statusEnum } from '../redux/authSlice';

// import {useState} from 'react';
import SidebarStateProvider from '../contexts/SidebarStateProvider';
// TODO: prevent rerender outlet when sidebar state changes

import { Outlet } from 'react-router-dom';
import Topbar from '../components/topbar/Topbar';
import Sidebar from '../components/sidebar/Sidebar';

function MainLayout() {

    const {status} = useSelector(state => state.auth);
    if(status !== statusEnum.LOGGED_IN){
        return <Navigate to='/login' replace />;
    }

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