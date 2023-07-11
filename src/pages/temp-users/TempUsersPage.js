import styles from './TempUsersPage.module.scss';

import TempUsersTableTools from './TempUsersTableTools';

function TempUsersPage() {
  return (
    <div className={styles.TempUsersPage}>
      <TempUsersTableTools />
    </div>
  );
}

export default TempUsersPage;
