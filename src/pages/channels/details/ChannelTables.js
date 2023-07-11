import styles from "./ChannelTables.module.scss";

import { useState, useRef } from "react";
import classNames from "classnames";

import DataTable from "../../../components/shared/data-table/DataTable";
import Button from "../../../components/shared/Button";

import { config as messagesTableConfig } from "./messagesTableConfig";
import { config as usersTableConfig } from "./usersTableConfig";

import { FiUsers } from "react-icons/fi";
import { FiMessageSquare } from "react-icons/fi";
import { tableInstanceNames } from "../../../redux/tableInstances";

function ChannelTables() {
  const tabsRef = useRef();

  const tabsEnum = {
    messages: "messages",
    users: "users",
  };
  const [activeTab, setActiveTab] = useState(tabsEnum.messages);

  const messagesTabClassName = classNames(styles.tab, {
    [styles.active]: activeTab === tabsEnum.messages,
  });
  const usersTabClassName = classNames(styles.tab, {
    [styles.active]: activeTab === tabsEnum.users,
  });

  const scrollToTabs = () => {
    const offset = -(parseFloat(styles.topbarHeight) * 16);
    const scrollPosition =
      tabsRef.current.getBoundingClientRect().top + window.scrollY + offset;
    if (tabsRef.current) {
      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const showMessagesTable = () => {
    setActiveTab(tabsEnum.messages);
    scrollToTabs();
  };
  const showUsersTable = () => {
    setActiveTab(tabsEnum.users);
    scrollToTabs();
  };

  return (
    <div className={styles.ChannelTables}>
      <div ref={tabsRef} className={styles.tabs}>
        <Button className={messagesTabClassName} onClick={showMessagesTable}>
          <FiMessageSquare />
          پیام ها
        </Button>
        <Button className={usersTabClassName} onClick={showUsersTable}>
          <FiUsers />
          اعضای کانال
        </Button>
      </div>
      {/* if not specifying keys for data tables.
        some number of undefined rows is shown in users table 
        (same as number of rows in messages) */}
      <div className={styles.dataTableWrapper}>
        {activeTab === tabsEnum.messages ? (
          <DataTable
            key={tableInstanceNames.messagesOfChannel}
            config={messagesTableConfig}
          />
        ) : (
          <DataTable
            key={tableInstanceNames.usersOfChannel}
            config={usersTableConfig}
          />
        )}
      </div>
    </div>
  );
}

export default ChannelTables;
