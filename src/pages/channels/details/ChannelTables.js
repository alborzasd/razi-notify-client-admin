import styles from './ChannelTables.module.scss';

import { useState } from 'react';
import classNames from 'classnames';

import Button from '../../../components/shared/Button';

import { FiUsers } from 'react-icons/fi';
import { FiMessageSquare } from 'react-icons/fi';

function ChannelTables(){
    const tabsEnum = {
        messages: 'messages',
        members: 'members'
    }
    const [activeTab, setActiveTab] = useState(tabsEnum.messages);

    const messagesTabClassName = classNames(styles.tab, {
        [styles.active]: activeTab === tabsEnum.messages
    });
    const membersTabClassName = classNames(styles.tab, {
        [styles.active]: activeTab === tabsEnum.members
    });

    const showMessages = () => {
        setActiveTab(tabsEnum.messages);
    }
    const showMembers = () => {
        setActiveTab(tabsEnum.members);
    }

    return (
        <div className={styles.ChannelTables}>
            <div className={styles.tabs}>
                <Button className={messagesTabClassName} onClick={showMessages}>
                    <FiMessageSquare />
                    پیام ها
                </Button>
                <Button className={membersTabClassName} onClick={showMembers}>
                    <FiUsers />
                    اعضای کانال
                </Button>
            </div>
        </div>
    );
}

export default ChannelTables;