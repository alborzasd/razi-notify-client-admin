import styles from "./UsersTableTools.module.scss";

import { useMemo, useState } from "react";

import { useInvalidateUsersMutation } from "../../redux/apiSlice";

import { useSelector, useDispatch } from "react-redux";
import { useGetUsersQuery } from "../../redux/apiSlice";
import { selectAllUsersFilterConfig } from "../../redux/filterConfigSlice";
import { addManyUsersToTempUsersTable } from "../../redux/tempUsersSlice";
import { selectIsUserRootAdmin } from "../../redux/authSlice";

import TableSearch from "../../components/shared/table-search/TableSearch";
import Button, { ButtonDropdown } from "../../components/shared/Button";

import { IoMdRefresh } from "react-icons/io";
import { HiOutlineClipboardList } from "react-icons/hi";
// import { HiPlus } from "react-icons/hi";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { LuFileEdit } from "react-icons/lu";
import { HiOutlineDocumentRemove } from "react-icons/hi";

import { tableInstanceNames } from "../../redux/tableInstances";

import classNames from "classnames";

import {
  primaryDropdownConfig,
  inputComponents,
} from "./usersTableSearchConfig";

import { 
  addManyUsersModalConfig,
  editManyUsersModalConfig,
  deleteManyUsersModalConfig,
  modalInstanceNames
} from "./groupOperationModalConfig";
import { GroupOperationModal } from "../../components/shared/Modal";

function UsersTableTools() {

  const isRootAdmin = useSelector(selectIsUserRootAdmin);

  const userTableToolsClassname = classNames(styles.UsersTableTools, {
    [styles.noDropdown]: !isRootAdmin
  });

  return (
    <div className={userTableToolsClassname}>
      {isRootAdmin && <GroupOperationsDropdown />}

      <TableSearch
        className={styles.tableSearch}
        primaryDropdownConfig={primaryDropdownConfig}
        inputComponents={inputComponents}
        tableInstanceName={tableInstanceNames.allUsers}
      />

      <RefreshButton />

      <AddResultToTempListBtn />
    </div>
  );
}

function GroupOperationsDropdown() {

  // stores name of the modal that must be open
  const [openedModalInstanceName, setOpenedModalInstanceName] = useState(false);

  const closeModal = () => setOpenedModalInstanceName(false);

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
            setOpenedModalInstanceName(modalInstanceNames.addManyUsers);
          },
        },
        {
          text: "ویرایش کاربران",
          icon: {
            component: LuFileEdit,
            props: { className: styles.editIcon },
          },
          onClick: () => {
            setOpenedModalInstanceName(modalInstanceNames.editManyUsers);
          },
        },
        {
          text: "حذف کاربر از سامانه",
          icon: {
            component: HiOutlineDocumentRemove,
            props: { className: styles.deleteIcon },
          },
          onClick: () => {
            setOpenedModalInstanceName(modalInstanceNames.deleteManyUsers);
          },
        },
      ],
    }),
    []
  );

  return (
    <>
      <ButtonDropdown config={buttonDropdownConfig} />
      <GroupOperationModal
        config={addManyUsersModalConfig}
        isModalOpen={
          openedModalInstanceName === modalInstanceNames.addManyUsers
        }
        closeModal={closeModal}
      />
      <GroupOperationModal
        config={editManyUsersModalConfig}
        isModalOpen={
          openedModalInstanceName ===
          modalInstanceNames.editManyUsers
        }
        closeModal={closeModal}
      />
      <GroupOperationModal
        config={deleteManyUsersModalConfig}
        isModalOpen={
          openedModalInstanceName ===
          modalInstanceNames.deleteManyUsers
        }
        closeModal={closeModal}
      />
    </>
  );
}

function RefreshButton() {
  const [trigger] = useInvalidateUsersMutation();

  const handleReload = () => {
    trigger();
  };

  return (
    <Button onClick={handleReload} className={styles.refreshBtn}>
      <IoMdRefresh className={styles.icon} />
      بارگیری مجدد
    </Button>
  );
}

function AddResultToTempListBtn() {
  const dispatch = useDispatch();

  const usersTableFilterConfig = useSelector(selectAllUsersFilterConfig);

  // does not need skip callback
  const { data, isFetching, isSuccess } = useGetUsersQuery(
    usersTableFilterConfig
  );

  const handleClick = () => {
    const users = data?.entities ?? [];
    if (users?.length > 0 && isSuccess && !isFetching) {
      dispatch(addManyUsersToTempUsersTable(users));
    }
  };

  return (
    <Button onClick={handleClick} className={styles.addToTempListBtn}>
      <HiOutlineClipboardList className={styles.icon} />
      افزودن نتایج به لیست موقت
    </Button>
  );
}

export default UsersTableTools;
