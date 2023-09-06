import styles from './HomePage.module.scss';

import NewMessage from './NewMessage';
import Departments from './Departments';

function HomePage() {
    return (
        <div className={styles.HomePage}>
            <NewMessage />
            <Departments />
        </div>
    )
}

export default HomePage;