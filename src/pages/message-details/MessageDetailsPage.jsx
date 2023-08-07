import styles from "./MessageDetailsPage.module.scss";

import MessageInfo from "./MessageInfo";

function MessageDetailsPage() {
  return (
    <div className={styles.MessageDetailsPage}>
      <MessageInfo />
    </div>
  );
}

export default MessageDetailsPage;
