import styles from './ChannelInfo.module.scss';

import Image from '../../../components/shared/Image';
import channelLogo from '../../../assets/images/channel-logo.png';
import Button from '../../../components/shared/Button';

import { BiCommentDetail } from 'react-icons/bi';
import { BiEdit } from 'react-icons/bi';
import { FiUser } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';

function ChannelInfo(){
    return (
        <div className={styles.ChannelInfo}>

            <aside className={styles.aside}>
                <Image
                    className={styles.channelProfileImage}
                    src={''}
                    fallbackSrc={channelLogo}
                    alt={'channel profile'}
                />
                <div className={styles.buttons}>
                    <Button className={styles.editBtn}>
                        <BiEdit/>
                        ویرایش
                    </Button>
                    <Button className={styles.deleteBtn}>
                        <RiDeleteBin6Line/>
                        حذف
                    </Button>
                </div>
                <div className={styles.field + ' ' + styles.owner}>
                    <h2 className={styles.label}>
                        <FiUser/>
                        مدیر کانال:
                    </h2>
                    <p className={styles.value}>عبدالله چاله چاله</p>
                </div>
                <div className={styles.field + ' ' + styles.createdAt}>
                    <h2 className={styles.label}>
                        <FiCalendar/>
                        تاریخ ایجاد:
                    </h2>
                    <p className={styles.value}>1402/07/01</p>
                </div>
            </aside>

            <main className={styles.main}>
                <div className={styles.field + ' ' + styles.title}>
                    <h2 className={styles.label}>
                        <BiCommentDetail />
                        نام کانال:
                    </h2>
                    <p className={styles.value}>گروه مهندسی کامپیوتر</p>
                </div>
                <div className={styles.field + ' ' + styles.identifier}>
                    <h2 className={styles.label}>
                        <BiCommentDetail />
                        شناسه کانال:
                    </h2>
                    <p className={styles.value}>CE_Razi</p>
                </div>
                <div className={styles.field + ' ' + styles.description}>
                    <h2 className={styles.label}>
                        <BiCommentDetail />
                        توضیحات:
                    </h2>
                    <p className={styles.value}>
                        اطلاعیه های گروه مهندسی کامپیوتر دانشگاه رازی. مخصوص تمامی مقاطع تحصیلی
                    </p>
                </div>
            </main>
            
        </div>
    );
}

export default ChannelInfo;
