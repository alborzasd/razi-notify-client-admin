import {useState, createContext, useCallback} from 'react';

export const sidebarState = createContext();

export default function SidebarContextProvider({children}) {
    const [sidebarIsActive, setSidebarIsActive] = useState(false);

    const openSidebar = useCallback(() => {
        setSidebarIsActive(true);
    }, []);
    const closeSidebar = useCallback(() => {
        setSidebarIsActive(false);
    }, []);

    const value = {
        sidebarIsActive,
        openSidebar,
        closeSidebar
    }

    return (
        <sidebarState.Provider value={value}>
            {children}
        </sidebarState.Provider>
    );
}