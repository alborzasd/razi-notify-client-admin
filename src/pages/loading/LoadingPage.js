import styles from './LoadingPage.module.scss';

import { useSelector } from "react-redux";
import { statusEnum } from '../../redux/authSlice';

import { ImpulseSpinner } from 'react-spinners-kit';

function LoadingPage() {
    const {status: authStatus, autoLoginError} = useSelector(state => state.auth);

    let content;
    if(authStatus === statusEnum.INIT || authStatus === statusEnum.CHECKING_AUTH) {
        content = (
            <ImpulseSpinner
                frontColor={styles.primaryColor}
                backColor={styles.backColor}
            />
        );
    }
    else { // INITTIAL_FAIL
        content = (
            <div className={styles.error}>
                <p>{autoLoginError.message}</p>
            </div>
        );
    }
    return (
        <div className={styles.LoadingPage}>
            {content}
        </div>
    );
}

export default LoadingPage;