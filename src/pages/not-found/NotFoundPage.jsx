import styles from './NotFoundPage.module.scss';

import { Link, useRouteError } from 'react-router-dom';

import { IoHomeOutline } from 'react-icons/io5';

function NotFoundPage() {
    const error = useRouteError();
    console.error(error);
    
    return (
        <div className={styles.NotFoundPage}>
            <div className={styles.container}>
                <h2>آدرس وارد شده یافت نشد</h2>
                <Link to='/' className={styles.link}>
                    بازگشت به صفحه اصلی
                    <IoHomeOutline />
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage;