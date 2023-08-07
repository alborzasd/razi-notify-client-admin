import styles from './ChannelDetailsPage.module.scss';
import ChannelInfo from './ChannelInfo';
import ChannelTables from './ChannelTables';

function ChannelDetailsPage() {
    return (
        <div className={styles.ChannelDetailsPage}>
            <ChannelInfo />
            <ChannelTables />
        </div>
    );
}

export default ChannelDetailsPage;