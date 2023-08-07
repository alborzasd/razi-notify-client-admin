import styles from './HomePage.module.scss';

import NewMessage from './NewMessage';

function HomePage() {
    return (
        <div className={styles.HomePage}>
            <NewMessage />
        </div>
    )
}

export default HomePage;