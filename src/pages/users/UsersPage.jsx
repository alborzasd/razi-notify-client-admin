import styles from './UsersPage.module.scss';

import UsersTableTools from './UsersTableTools';
import DataTable from '../../components/shared/data-table/DataTable';

import {config} from './usersTableConfig';

function UsersPage() {
    return (
        <div className={styles.UsersPage}>
            <UsersTableTools />
            <DataTable config={config} />
        </div>
    )
}

export default UsersPage;