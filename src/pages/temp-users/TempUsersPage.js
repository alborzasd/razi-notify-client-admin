import styles from './TempUsersPage.module.scss';

import TempUsersTableTools from './TempUsersTableTools';
import DataTable from '../../components/shared/data-table/DataTable';

import {config} from './tempUsersTableConfig';

function TempUsersPage() {
  return (
    <div className={styles.TempUsersPage}>
      <TempUsersTableTools />
      <DataTable config={config} />
    </div>
  );
}

export default TempUsersPage;
