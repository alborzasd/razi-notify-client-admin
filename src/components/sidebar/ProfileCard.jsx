import styles from './ProfileCard.module.scss';

import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUserInfo } from '../../redux/authSlice';

import { toast } from 'react-toastify';
import { resolvedToastOptions } from '../shared/CustomToastContainer';
// import { notify } from '../../utilities/toastify';

import Image from '../shared/Image';
import avatar from '../../assets/images/user-avatar.png';

import {IoLogOutOutline} from 'react-icons/io5';

function ProfileCard() {
    const dispatch = useDispatch();

    const userInfo = useSelector(selectUserInfo);

    const handleLogout = async () => {
        let id;
        try {
            id = toast.loading('در حال خروج از حساب کاربری.');
            await dispatch(logout()).unwrap();
            toast.update(id, {...resolvedToastOptions, render: 'خارج شدید', type: 'info'});
            
        }
        catch(err) {
            toast.update(id, {...resolvedToastOptions, render: err.message, type: 'error'});
        }
    }


    const jobTitle = 
        userInfo.lecturer_position_persian 
        || userInfo.student_position_persian
        || userInfo.employee_position 

    return (
        <div className={styles.ProfileCard}>
            <Image
                className={styles.image}
                fallbackSrc={avatar}
                // src='https://picsum.photos/80'
                src=''
                alt='profile'
            />
            <h2 className={styles.name}>{userInfo.first_name + ' ' + userInfo.last_name}</h2>
            <h3 className={styles.jobTitle}>{jobTitle}</h3>
            <h3 className={styles.department}>دانشکده {userInfo?.department?.title}</h3>
            <button 
                className={styles.logout} 
                title='خروج'
                onClick={handleLogout}
            >
                <IoLogOutOutline/>
            </button>
        </div>
    )
}

export default ProfileCard;