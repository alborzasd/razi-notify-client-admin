import styles from './TempUsersTableTools.module.scss';

import { useMemo } from 'react';

import Button, {ButtonDropdown} from '../../components/shared/Button';

import {LuFilterX} from 'react-icons/lu';
import { HiOutlineDocumentAdd } from "react-icons/hi";
import {FiUserPlus} from 'react-icons/fi';
import { FiUserMinus } from "react-icons/fi";

function TempUsersTableTools() {
  const buttonDropdownConfig = useMemo(
    () => ({
      initText: "عملیات گروهی",
      classNames: {
        dropdownClassname: styles.buttonDropdown,
        buttonsContainerClassname: styles.buttonsContainer,
        buttonItemClassname: styles.buttonItem,
      },
      buttons: [
        {
          text: "افزودن اعضا به کانال (از لیست موقت)",
          icon: {
            component: FiUserPlus,
            props: { className: styles.addMemberIcon },
          },
          onClick: () => {
            console.log("add");
          },
        },
        {
          text: "حذف اعضا از کانال (از لیست موقت)",
          icon: {
            component:  FiUserMinus,
            props: { className: styles.removeMemberIcon },
          },
          onClick: () => {
            console.log("edit");
          },
        },
        {
          text: "افزودن اعضا به لیست موقت (از فایل)",
          icon: {
            component: HiOutlineDocumentAdd,
            props: { className: styles.addToTempListIcon },
          },
          onClick: () => {
            console.log("delete");
          },
        },
      ],
    }),
    []
  );

  return (
    <div className={styles.TempUsersTableTools}>
      <ButtonDropdown config={buttonDropdownConfig} />
      <Button className={styles.clearTempListBtn}>
        <LuFilterX className={styles.clearIcon}/>
        پاک کردن لیست موقت
      </Button>
    </div>
  );
}

export default TempUsersTableTools;