import styles from './LoginPage.module.scss';

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { statusEnum } from '../../redux/authSlice';

import LoginForm from './LoginForm';

function LoginPage() {
    const {status} = useSelector(state => state.auth);

    if(status === statusEnum.LOGGED_IN) {
        return <Navigate to='/' replace />;
    }

    return (
        <div className={styles.LoginPage}>
            <div className={styles.container}>
                <h1 className={styles.title}>سامانه اطلاع رسانی رازی</h1>
                <LoginForm />
            </div>
        </div>
    );
}

export default LoginPage;