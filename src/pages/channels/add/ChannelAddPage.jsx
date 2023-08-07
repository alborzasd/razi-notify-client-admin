import styles from './ChannelAddPage.module.scss';

import ChannelInfo from '../details/ChannelInfo';

function ChannelAddPage() {
  return (
    <div className={styles.ChannelAddPage}>
      <ChannelInfo />
    </div>
  );
}

export default ChannelAddPage;