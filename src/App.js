import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import store from "./redux/store";
import {autoLogin, statusEnum} from './redux/authSlice';

import LoadingPage from "./pages/loading/LoadingPage";


store.dispatch(autoLogin());

function App(){
    const {status: authStatus} = useSelector(state => state.auth);
    
    // render logic
    let content;
    if(
        authStatus === statusEnum.INIT 
        || authStatus === statusEnum.CHECKING_AUTH
        || authStatus === statusEnum.INITIAL_FAIL){
        content = (
            <LoadingPage />
        );
    }
    else {
        content = (
            <Outlet />
        );
    }

    return (
        <>
            {content}
        </>
    ); 
}

export default App;