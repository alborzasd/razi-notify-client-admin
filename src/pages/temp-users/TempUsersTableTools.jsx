import styles from "./TempUsersTableTools.module.scss";

import { useMemo, useState, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { clearTempUsersTable, selectAllTempUsers } from "../../redux/tempUsersSlice";

import Button, { ButtonDropdown } from "../../components/shared/Button";

import { CircleSpinner } from "react-spinners-kit";

import { LuFilterX } from "react-icons/lu";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { FiUserPlus } from "react-icons/fi";
import { FiUserMinus } from "react-icons/fi";

import { errorMessages } from "../../config";

import {
  addMembersToChannelModalConfig,
  removeMembersFromChannelModalConfig,
  addMembersToTempUsersTableModalConfig,
  modalInstanceNames,
} from "./groupOperationModalConfig";
import { GroupOperationModal } from "../../components/shared/Modal";

import ExcelToJsonWorker from '../../workers/xlsx/excelToJsonWorker?worker';

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
  const hiddenDownloadLinkRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tempUsers = useSelector(selectAllTempUsers);

  const handleExportToExcel = async () => {
    // start worker
    // const worker = new Worker(
    //   new URL("../../workers/xlsx/excelToJsonWorker", import.meta.url),
    //   { type: "module" }
    // );
    const worker = new ExcelToJsonWorker();
    // show loading spinner inside button
    setIsProcessing(true);

    
    let workerResult;
    let objectUrl;
    let workerError;

    // this will resolve when the message from web worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      worker.postMessage({
        action: "generateDataExcel",
        data: tempUsers,
        // generate template excel file for add many users operation
        meta: { type: "from-temp-users-table" },
      });

      // define message event
      worker.onmessage = (event) => {
        workerResult = event?.data?.result;
        objectUrl = event?.data?.data;
        workerError = event?.data?.error;
        res();
      };
    });

    if (workerResult === "error") {
      console.log(workerError?.message);
    } else if (workerResult === "success") {
      if (hiddenDownloadLinkRef.current) {
        hiddenDownloadLinkRef.current.href = objectUrl;
        hiddenDownloadLinkRef.current.click();
      }
    }
    // if not any value is assigned to result
    // an unexpected error happened
    else {
      console.log(errorMessages.internalAppError);
    }


    // terminate worker
    worker.terminate();
    // hide loading spinner
    setIsProcessing(false);
  };

  return (
    <>
      <Button
        onClick={handleExportToExcel}
        className={styles.exportTempUsersToExcelBtn}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <CircleSpinner size={17} color={styles.spinnerColor} />
        ) : (
          <>
            <HiOutlineDocumentDownload className={styles.downloadIcon} />
            ذخیره لیست موقت
          </>
        )}
      </Button>
      <a
        ref={hiddenDownloadLinkRef}
        download="temp-users.xlsx"
        href="/"
        style={{ display: "none" }}
      >
        hidden download link
      </a>
    </>
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
