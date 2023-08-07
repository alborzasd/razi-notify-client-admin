import styles from './LoginForm.module.scss';

import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
// import { notify } from '../../utilities/toastify';

import { useDispatch, useSelector } from 'react-redux';
import { login, statusEnum } from '../../redux/authSlice';

import {CircleSpinner} from 'react-spinners-kit';
import { RiUser3Fill } from 'react-icons/ri';
import { RiLockPasswordFill } from 'react-icons/ri';


const toastOptions = {
    position: "top-center",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
}

function LoginForm() {
    // TODO: validation: check not empty (show red message if empty)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [isFormEmpty, setIsFormEmpty] = useState(true);

    const {status, error} = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const onSubmit = async (e) => {
        e.preventDefault();
        if(username && password){
            const action = await dispatch(login({username, password}));
            if(login.fulfilled.match(action)){
                toast.success('ورود موفقیت آمیز');
            }
        }
    }


    useEffect(() => {
        // we only want the toast from previous render (error message)
        // so when user logs out and redirects to here. the logout toast will not close because of
        // the cleanup here  
        // if id is null or undefined, then toast.dismiss will clear all toasts
        // first toast have id of 1, and with id of 0 no toast will be closed
        let id = 0; 
        if(status === statusEnum.FAILED){
            id = toast.error(error?.message, toastOptions);
        }
        return () => {
            // success toast has autoClose
            if(status !== statusEnum.LOGGED_IN) {
                toast.dismiss(id); // clear previous notification instantly
            }
        }
    }, [status, error?.message]);

    
    // render logic
    let buttonContent;
    let buttonDisabled;
    if(status === statusEnum.LOADING){
        buttonContent = <CircleSpinner size={26} />;
        buttonDisabled = true;
    }
    else {
        buttonContent = 'ورود به پنل مدیریت';
        const isFormEmpty = !(username && password);
        if(isFormEmpty) {
            buttonDisabled = true;
        }
        else {
            buttonDisabled = false;
        }
    }

    return (
        <form className={styles.LoginForm} onSubmit={onSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor='username' className={styles.label}>
                    <RiUser3Fill className={styles.icon}/>
                    نام کاربری:
                </label>
                <input 
                    type='text' 
                    id='username' 
                    className={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <p className={styles.error}>{error?.username}</p>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor='password' className={styles.label}>
                    <RiLockPasswordFill className={styles.icon} />
                    رمز عبور:
                </label>
                <input 
                    type='password' 
                    id='password' 
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <p className={styles.error}>{error?.password}</p>
            </div>
            <button className={styles.button} disabled={buttonDisabled}>
                {buttonContent}
            </button>
        </form>
    );
}

export default LoginForm;