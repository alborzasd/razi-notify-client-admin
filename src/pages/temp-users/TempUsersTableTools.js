import styles from "./TempUsersTableTools.module.scss";

import { useMemo, useState } from "react";

import { useDispatch } from "react-redux";
import { clearTempUsersTable } from "../../redux/tempUsersSlice";

import Button, { ButtonDropdown } from "../../components/shared/Button";

import { LuFilterX } from "react-icons/lu";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { FiUserPlus } from "react-icons/fi";
import { FiUserMinus } from "react-icons/fi";

import {
  addMembersToChannelModalConfig,
  removeMembersFromChannelModalConfig,
  addMembersToTempUsersTableModalConfig,
  modalInstanceNames,
} from "./groupOperationModalConfig";
import { GroupOperationModal } from "../../components/shared/Modal";

function TempUsersTableTools() {
  return (
    <div className={styles.TempUsersTableTools}>
      <GroupOperationsDropdown />
      <ExportTempUsersToExcelButton />
      <ClearTempListButton />
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
          text: "افزودن اعضا به کانال (از لیست موقت)",
          icon: {
            component: FiUserPlus,
            props: { className: styles.addMemberIcon },
          },
          onClick: () => {
            setOpenedModalInstanceName(modalInstanceNames.addMembersToChannel);
          },
        },
        {
          text: "حذف اعضا از کانال (از لیست موقت)",
          icon: {
            component: FiUserMinus,
            props: { className: styles.removeMemberIcon },
          },
          onClick: () => {
            setOpenedModalInstanceName(
              modalInstanceNames.removeMembersFromChannel
            );
          },
        },
        {
          text: "افزودن اعضا به لیست موقت (از فایل)",
          icon: {
            component: HiOutlineDocumentAdd,
            props: { className: styles.addToTempListIcon },
          },
          onClick: () => {
            setOpenedModalInstanceName(
              modalInstanceNames.addMembersToTempUsersTable
            );
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
        config={addMembersToChannelModalConfig}
        isModalOpen={
          openedModalInstanceName === modalInstanceNames.addMembersToChannel
        }
        closeModal={closeModal}
      />
      <GroupOperationModal
        config={removeMembersFromChannelModalConfig}
        isModalOpen={
          openedModalInstanceName ===
          modalInstanceNames.removeMembersFromChannel
        }
        closeModal={closeModal}
      />
      <GroupOperationModal
        config={addMembersToTempUsersTableModalConfig}
        isModalOpen={
          openedModalInstanceName ===
          modalInstanceNames.addMembersToTempUsersTable
        }
        closeModal={closeModal}
      />
    </>
  );
}

function ExportTempUsersToExcelButton() {

  const handleExportToExcel = () => {

  };

  return (
    <Button onClick={handleExportToExcel} className={styles.exportTempUsersToExcelBtn}>
      <HiOutlineDocumentDownload className={styles.downloadIcon} />
      ذخیره لیست موقت
    </Button>
  );
}

function ClearTempListButton() {
  const dispatch = useDispatch();

  const handleClear = () => {
    dispatch(clearTempUsersTable());
  };
  return (
    <Button onClick={handleClear} className={styles.clearTempListBtn}>
      <LuFilterX className={styles.clearIcon} />
      پاک کردن لیست موقت
    </Button>
  );
}

export default TempUsersTableTools;
