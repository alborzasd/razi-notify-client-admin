import styles from "./UsersTableTools.module.scss";

import { useMemo } from "react";

import { useInvalidateUsersMutation } from "../../redux/apiSlice";

import TableSearch from "../../components/shared/table-search/TableSearch";
import Button, { ButtonDropdown } from "../../components/shared/Button";

import { IoMdRefresh } from "react-icons/io";
import { HiOutlineClipboardList } from "react-icons/hi";
// import { HiPlus } from "react-icons/hi";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { LuFileEdit } from "react-icons/lu";
import { HiOutlineDocumentRemove } from "react-icons/hi";

import { tableInstanceNames } from "../../redux/tableInstances";

import {
  primaryDropdownConfig,
  inputComponents,
} from "./usersTableSearchConfig";

function UsersTableTools() {
  const [trigger] = useInvalidateUsersMutation();

  const handleReload = () => {
    trigger();
  };

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
          text: "افزودن کاربر به سامانه",
          icon: {
            component: HiOutlineDocumentAdd,
            props: { className: styles.addIcon },
          },
          onClick: () => {
            console.log("add");
          },
        },
        {
          text: "ویرایش کاربران",
          icon: {
            component: LuFileEdit,
            props: { className: styles.editIcon },
          },
          onClick: () => {
            console.log("edit");
          },
        },
        {
          text: "حذف کاربر از سامانه",
          icon: {
            component: HiOutlineDocumentRemove,
            props: { className: styles.deleteIcon },
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
    <div className={styles.UsersTableTools}>
      <ButtonDropdown config={buttonDropdownConfig} />

      {/* <div className={styles.tableSearch}>table search</div> */}
      <TableSearch
        className={styles.tableSearch}
        primaryDropdownConfig={primaryDropdownConfig}
        inputComponents={inputComponents}
        tableInstanceName={tableInstanceNames.allUsers}
      />

      <Button onClick={handleReload} className={styles.refreshBtn}>
        <IoMdRefresh className={styles.icon} />
        بارگیری مجدد
      </Button>
      {/* TODO: this button needs query hook in order to add result data to tempUsers slice */}
      <Button className={styles.addToTempListBtn}>
        <HiOutlineClipboardList className={styles.icon} />
        افزودن نتایج به لیست موقت
      </Button>
    </div>
  );
}

export default UsersTableTools;
