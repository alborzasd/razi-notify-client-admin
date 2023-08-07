import styles from './ChannelsPage.module.scss';

import ChannelsTableTools from './ChannelsTableTools';
import DataTable from '../../components/shared/data-table/DataTable';

import {config} from './ChannelRow';

function ChannelsPage() {    
    return (
        <div className={styles.ChannelsPage}>
            <ChannelsTableTools />
            <DataTable config={config} />
        </div>
    )
}

export default ChannelsPage;
