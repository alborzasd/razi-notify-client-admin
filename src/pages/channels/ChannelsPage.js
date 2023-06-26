import styles from './ChannelsPage.module.scss';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChannels, statusEnum } from '../../redux/channelsSlice';

import TableTools from './TableTools';
import DataTable from '../../components/shared/data-table/DataTable';

import {config} from './ChannelRow';

function ChannelsPage() {

    const channelsLoadingStatus = useSelector(state => state.channels.status);

    const dispatch = useDispatch();
    useEffect(() => {
        if(channelsLoadingStatus === statusEnum.INIT) {
            dispatch(fetchChannels());
        }
    }, [dispatch, channelsLoadingStatus]);
    
    return (
        <div className={styles.ChannelsPage}>
            <TableTools />
            <DataTable config={config} />
        </div>
    )
}

export default ChannelsPage;
