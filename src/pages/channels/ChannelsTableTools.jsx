import styles from './ChannelsTableTools.module.scss';

import { useDispatch, useSelector } from 'react-redux';

import classNames from 'classnames';

import TableSearch from '../../components/shared/table-search/TableSearch';

import Button, { ButtonGroup, NavLinkButton } from '../../components/shared/Button';
import {HiPlus} from 'react-icons/hi';
import {IoMdRefresh} from 'react-icons/io';

import useTableSearchConfig from './useTableSearchConfig';

import {selectMyChannelsFilterEnabled, setFilterConfig} from '../../redux/filterConfigSlice';
import {tableInstanceNames} from '../../redux/tableInstances';
import {useInvalidateChannelsMutation} from '../../redux/apiSlice';

function TableTools() {
    const [trigger] = useInvalidateChannelsMutation();
    
    const handleReload = () => {
        trigger();
    }

    const {primaryDropdownConfig, inputComponents} = useTableSearchConfig();

    return (
        <div className={styles.ChannelsTableTools}>
            <ChannelButtonGroup />

            <TableSearch 
                className={styles.tableSearch} 
                primaryDropdownConfig={primaryDropdownConfig}
                inputComponents={inputComponents}
                tableInstanceName={tableInstanceNames.channels} />

            <NavLinkButton to='/channels/add' className={styles.addButton}>
                <HiPlus className={styles.icon} />
                افزودن کانال جدید
            </NavLinkButton>
            <Button className={styles.refreshButton} onClick={handleReload}>
                <IoMdRefresh className={styles.icon} />
                بارگیری مجدد
            </Button>
        </div>
    );
}

function ChannelButtonGroup() {
    const dispatch = useDispatch();

    const myChannelsFilterEnabled = useSelector(selectMyChannelsFilterEnabled);
    // console.log(myChannelsFilterEnabled);

    const myChannelsButtonClassname = classNames(styles.selectorButton, {
        [styles.active]: myChannelsFilterEnabled
    });
    const allChannelsButtonClassname = classNames(styles.selectorButton, {
        [styles.active]: !myChannelsFilterEnabled
    });

    const handleMyChannelsButton = () => {
        dispatch(setFilterConfig({
            instanceName: tableInstanceNames.channels,
            config: {
                myChannels: true
            }
        }));
    };
    const handleAllChannelsButton = () => {
        dispatch(setFilterConfig({
            instanceName: tableInstanceNames.channels,
            config: {
                myChannels: false
            }
        }));
    };

    return (
        <ButtonGroup className={styles.buttonGroup}>
            <Button 
            className={myChannelsButtonClassname}
            onClick={handleMyChannelsButton}>
                کانال های من
            </Button>
            <Button 
            className={allChannelsButtonClassname}
            onClick={handleAllChannelsButton}>
                همه کانال ها
            </Button>
        </ButtonGroup>
    );    
}

export default TableTools;