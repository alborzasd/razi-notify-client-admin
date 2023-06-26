import styles from './TableTools.module.scss';

import { useDispatch } from 'react-redux';

import Button, { ButtonGroup } from '../../components/shared/Button';
import {HiPlus} from 'react-icons/hi';
import {IoMdRefresh} from 'react-icons/io';

import { fetchChannels } from '../../redux/channelsSlice';

function TableTools() {
    const dispatch = useDispatch();

    const handleReload = () => {
        dispatch(fetchChannels());
    }

    return (
        <div className={styles.TableTools}>
            <ButtonGroup className={styles.buttonGroup}>
                <Button className={styles.selectorButton + ' ' + styles.active}>
                    کانال های من
                </Button>
                <Button className={styles.selectorButton}>
                    همه کانال ها
                </Button>
            </ButtonGroup>
            <Button className={styles.addButton}>
                <HiPlus className={styles.icon} />
                افزودن کانال جدید
            </Button>
            <Button className={styles.refreshButton} onClick={handleReload}>
                <IoMdRefresh className={styles.icon} />
                بارگیری مجدد
            </Button>
        </div>
    );
}

export default TableTools;