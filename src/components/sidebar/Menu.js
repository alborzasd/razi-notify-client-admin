import styles from './Menu.module.scss';

// import classnames from 'classnames';

// import { NavLink } from 'react-router-dom';

import MenuItem from './MenuItem';

import { IoHomeOutline } from 'react-icons/io5';
import { TbSpeakerphone } from 'react-icons/tb';
import { FiUsers } from 'react-icons/fi';

function Menu() {

    // // NavLink accepts callback for className prop. to customize the class name for active and pending state
    // const classNameCallback = ({isActive}) => {
    //     return classnames(styles.link ,{
    //         [styles.active]: isActive
    //     })
    // }

    return (
        <nav className={styles.Menu}>
            <ul className={styles.navlist}>
                <MenuItem
                    linkTo='/'
                    Icon={IoHomeOutline}
                    title='صفحه اصلی'
                />
                <MenuItem
                    linkTo='/channels'
                    Icon={TbSpeakerphone}
                    title='کانال ها'
                />
                <MenuItem
                    linkTo='/users'
                    Icon={FiUsers}
                    title='مدیریت کاربران'
                />
            </ul>
        </nav>
    );
}

export default Menu;