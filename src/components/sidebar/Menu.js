import styles from "./Menu.module.scss";

// import classnames from 'classnames';

// import { NavLink } from 'react-router-dom';

import MenuItem from "./MenuItem";

import TextOverflow from '../shared/TextOverflow';

import { IoHomeOutline } from "react-icons/io5";
import { TbSpeakerphone } from "react-icons/tb";
import { FiUsers } from "react-icons/fi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { LiaHandPaperSolid } from "react-icons/lia";

function Menu() {
  return (
    <nav className={styles.Menu}>
      <ul className={styles.navlist}>
        <MenuItem
          linkTo="/"
          iconElement={<IoHomeOutline />}
          title="صفحه اصلی"
        />
        <MenuItem
          linkTo="/channels"
          iconElement={<TbSpeakerphone />}
          title="کانال ها"
        />
        <MenuItem
          linkTo="/users"
          iconElement={<FiUsers />}
          title="مدیریت کاربران"
        />
        <MenuItem
          linkTo="/requests"
          iconElement={<LiaHandPaperSolid className={styles.requestsIcon} />}
          title={<RequestsMenuItem />}
        />
        <MenuItem
          linkTo="/temp-users"
          iconElement={
            <HiOutlineClipboardList className={styles.tempUsersIcon} />
          }
          title={<TempUsersMenuItem />}
        />
      </ul>
    </nav>
  );
}

function RequestsMenuItem() {
  const number = 78;
  return (
    <div className={styles.menuItem}>
      <div>درخواست ها</div>
      {number > 0 && <div className={styles.numberBadge}>
        <TextOverflow>{number}</TextOverflow>
      </div>}
    </div>
  );
}

function TempUsersMenuItem() {
  const number = 65;
  return (
    <div className={styles.menuItem}>
      <div>لیست موقت</div>
      {number > 0 && <div className={styles.numberBadge}>
        <TextOverflow>{number}</TextOverflow>
      </div>}
    </div>
  );
}

export default Menu;
