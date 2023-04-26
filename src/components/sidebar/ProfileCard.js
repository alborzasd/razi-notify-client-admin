import styles from './ProfileCard.module.scss';

import Image from '../shared/Image';
import avatar from '../../assets/images/user-avatar.png';

import {IoLogOutOutline} from 'react-icons/io5';

function ProfileCard() {

    return (
        <div className={styles.ProfileCard}>
            <Image
                className={styles.image}
                fallbackSrc={avatar}
                src='https://picsum.photos/80'
                alt='profile'
            />
            <h2 className={styles.name}>دکتر چاله چاله</h2>
            <h3 className={styles.department}>دانشکده کامپیوتر</h3>
            <button className={styles.logout} title='خروج'><IoLogOutOutline/></button>
        </div>
    )
}

export default ProfileCard;