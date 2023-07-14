// this file will export 3 config objects for 3 <GroupOperationModal/>

import styles from "./groupOperationModalConfig.module.scss";

import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  useAddManyUsersToChannelMutation,
  useRemoveManyUsersFromChannelMutation,
  useLazyFindUsersByUsernamesQuery,
} from "../../redux/apiSlice";

import { selectAllTempUsersToChangeMembership } from "../../redux/tempUsersSlice";

import { addManyUsersToTempUsersTable } from "../../redux/tempUsersSlice";

import Button from "../../components/shared/Button";
import RtlScrollbars from "../../components/shared/RtlScrollbars";

import { CircleSpinner } from "react-spinners-kit";

import { HiOutlineDocumentAdd } from "react-icons/hi";
import { FiUserPlus } from "react-icons/fi";
import { FiUserMinus } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";
import { SiMicrosoftexcel } from "react-icons/si";

import addMembersToTempUsersListImageSample from "../../assets/content-images/add-member-to-temp-users-table-sample.png";

////////////////////////////////////////////////////////////////

export const modalInstanceNames = {
  addMembersToChannel: "addMembersToChannel",
  removeMembersFromChannel: "removeMembersFromChannel",
  addMembersToTempUsersTable: "addMembersToTempUsersTable",
};

// const excelToJsonWorkerInstnce = new Worker(
//   new URL("../../workers/xlsx/excelToJsonWorker", import.meta.url)
// );

// like typescript enum
const fileChangeStatusEnum = {
  init: "init",
  processing: "processing", // processing file, check if it's valid file and extract data
  success: "success", // converted to json, user can hit continue
  error: "error", // file is invalid or nothing is uploaded
};

// the latter two components will use this component
// with actionType="add" or actionType="remove" props
function ChangeMemberhipOfChannelModalBody({
  actionType,
  useMutationHook,
  closeModal,
}) {
  const [channelIdentifierInput, setChannelIdentifierInput] = useState("");
  const [inputValidationErrorText, setInputValidationErrorText] = useState("");

  const tempUsers = useSelector(selectAllTempUsersToChangeMembership);

  const [
    triggerAddOrRemove,
    { data, isLoading, isSuccess, isError, isUninitialized, error },
  ] = useMutationHook();

  const handleCancelClick = () => {
    closeModal();
  };

  const handleContinueClick = () => {
    if (!channelIdentifierInput) {
      setInputValidationErrorText("شناسه وارد نشده است.");
      return;
    }
    try {
      triggerAddOrRemove({
        channelIdentifier: channelIdentifierInput,
        users: tempUsers,
      });
    } catch (err) {
      // console.log(err);
    }
  };

  let content;
  if (isUninitialized) {
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          شناسه کانال متعلق به خود را وارد کنید.
        </h3>

        <br />

        <h3 className={styles.section}>نکات:</h3>
        <ul className={styles.ul}>
          <li className={styles.tip}>
            {actionType === "add" ? (
              <span>
                از کاربران لیست موقت، آنهایی که قبلا عضو کانال مورد نظر نبودند،
                به کانال شما اضافه خواهند شد.
              </span>
            ) : (
              // actionType === "remove"
              <span>
                از کاربران لیست موقت، آنهایی که قبلا عضو کانال مورد نظر بوده
                اند. از کانال حذف خواهند شد.
              </span>
            )}
          </li>
          <li className={styles.tip}>
            نیاز به رعایت بزرگ یا کوچک بودن حروف نیست.
          </li>
        </ul>

        <br />

        <input
          className={styles.textInput}
          placeholder="شناسه کانال"
          type="text"
          value={channelIdentifierInput}
          onChange={(e) => setChannelIdentifierInput(e.target.value)}
        />
        <p className={styles.inputValidationErrorText}>
          {inputValidationErrorText}
        </p>
      </div>
    );
  } else if (isLoading) {
    content = (
      <div className={styles.statusContainer}>
        <CircleSpinner color={styles.primaryColor} />
      </div>
    );
  } else if (isError) {
    content = (
      <div className={styles.statusContainer + " " + styles.error}>
        <p>{error?.message}</p>
        <p>{error?.responseData?.messagePersian}</p>
        <p>{error?.responseData?.message}</p>
      </div>
    );
  } else if (isSuccess) {
    const newMovedUsers = data?.movedUsers || [];
    const length = newMovedUsers?.length;
    const channelTitle = data?.channel?.title;
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          {actionType === "add" ? (
            <>
              <span className={styles.tip}>{length}</span>&nbsp; کاربر جدید به
              کانال &nbsp;
              <span className={styles.tip}>{channelTitle}</span>&nbsp; اضافه شد.
            </>
          ) : (
            // actionType === "remove"
            <>
              <span className={styles.tip}>{length}</span>&nbsp; کاربر از کانال
              &nbsp;
              <span className={styles.tip}>{channelTitle}</span>&nbsp; حذف شد.
            </>
          )}
        </h3>
        {newMovedUsers.map((user, index) => (
          <ul key={index} className={styles.ul}>
            <li className={styles.tip}>
              {user?.username}: {user?.fullname}
            </li>
          </ul>
        ))}
      </div>
    );
  }

  let buttonsContent;
  if (isUninitialized) {
    buttonsContent = (
      <>
        <Button onClick={handleCancelClick} className={styles.cancelBtn}>
          انصراف
        </Button>
        <Button onClick={handleContinueClick} className={styles.continueBtn}>
          ادامه
          <FiChevronLeft />
        </Button>
      </>
    );
  } else if (isLoading) {
    buttonsContent = (
      <Button
        onClick={handleCancelClick}
        className={styles.cancelBtn + " " + styles.row}
      >
        بستن
      </Button>
    );
  } else if (isError || isSuccess) {
    buttonsContent = (
      <Button
        onClick={handleCancelClick}
        className={styles.cancelBtn + " " + styles.row}
      >
        بستن
      </Button>
    );
  }

  return (
    <div className={styles.AddMemberToChannelModalBody}>
      <div className={styles.mainWrapper}>
        <RtlScrollbars>{content}</RtlScrollbars>
      </div>

      {buttonsContent}
    </div>
  );
}

// modal body components
function AddMembersToChannelModalBody({ closeModal }) {
  return (
    <ChangeMemberhipOfChannelModalBody
      actionType="add"
      useMutationHook={useAddManyUsersToChannelMutation}
      closeModal={closeModal}
    />
  );
}

function RemoveMembersFromChannelModalBody({ closeModal }) {
  return (
    <ChangeMemberhipOfChannelModalBody
      actionType="remove"
      useMutationHook={useRemoveManyUsersFromChannelMutation}
      closeModal={closeModal}
    />
  );
}

function AddMembersToTempUsersTableModalBody({ closeModal }) {
  const dispatch = useDispatch();

  const excelToJsonWorkerRef = useRef(null);
  const fileInputRef = useRef(null);

  // handle init and terminate worker
  useEffect(() => {
    excelToJsonWorkerRef.current = new Worker(
      new URL("../../workers/xlsx/excelToJsonWorker", import.meta.url)
    );
    return () => {
      excelToJsonWorkerRef.current.terminate();
    };
  }, []);

  const [fileChangeStatus, setFileChangeStatus] = useState({
    enum: fileChangeStatusEnum.init,
    error: null,
  });

  // usernames to submit with query
  const [usernames, setUsernames] = useState([]);

  const [
    triggerFind,
    { data, isLoading, isFetching, isSuccess, isError, error, isUninitialized },
  ] = useLazyFindUsersByUsernamesQuery();

  const handleCancelClick = () => {
    closeModal();
  };

  const handleFileBtnClick = () => {
    // forward click event to hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    let result;
    let jsonData;
    let error;

    // set status to 'processing'
    setFileChangeStatus((prev) => ({
      ...prev,
      enum: fileChangeStatusEnum.processing,
      error: null,
    }));

    // this will resolve when the message from we worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      excelToJsonWorkerRef.current.postMessage({
        action: "excelToJson",
        data: file,
        meta: { type: "username-only" },
      });

      // define message event
      excelToJsonWorkerRef.current.onmessage = (event) => {
        result = event?.data?.result;
        jsonData = event?.data?.data;
        error = event?.data?.error;
        // console.log('result', result);
        console.log("jsonData", jsonData);
        // console.log('error', error);
        res();
      };
    });

    // if message was error set status to 'error' 'not valid file'
    if (result === "error") {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: error,
      }));
    }
    // if message was data set status to 'success'
    else if (result === "success") {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.success,
        error: null,
      }));
    }
    // if not any value is assigned to result
    // an unexpected error happened
    else {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: "خطای داخلی برنامه",
      }));
    }

    // reset the file input value
    // so uploading the same file can be processed again
    e.target.value = null;

    setUsernames(jsonData);
  };

  const handleContinueClick = async () => {
    if (fileChangeStatus.enum === fileChangeStatusEnum.init) {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: "هیچ فایلی بارگذاری نشده است",
      }));
    } else if (fileChangeStatus.enum === fileChangeStatusEnum.success) {
      // console.log("submit");
      try {
        const data = await triggerFind(usernames).unwrap();
        dispatch(addManyUsersToTempUsersTable(data?.entities || []));
      } catch (err) {
        // console.log(err);
      }
    }
  };

  let content;
  if (isUninitialized) {
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          یک فایل اکسل در قالب زیر بارگذاری کنید:
        </h3>
        <ul className={styles.ul}>
          <li className={styles.tip}>
            یک ستون دقیقا با اسم username و در زیر آن نام کاربری اعضای سامانه
          </li>
        </ul>

        <br />

        <h3 className={styles.section}>نمونه:</h3>
        <div className={styles.imgContainer}>
          <img
            className={styles.img}
            src={addMembersToTempUsersListImageSample}
            alt="addMembersToTempUsersListImageSample"
          />
        </div>

        <br />

        <h3 className={styles.section}>نکات:</h3>
        <ul className={styles.ul}>
          <li className={styles.tip}>
            فقط نام کاربری افرادی که عضو سامانه باشند به لیست موقت اضافه خواهد
            شد.
          </li>
          <li className={styles.tip}>
            ستون های اضافی غیر از username پردازش نخواهند شد. میتوانید فایلی که
            برای افزودن یا ویرایش کاربران ساخته اید را در این قسمت نیز آپلود کنید. تا
            کاربران اضافه شده یا ویرایش شده به سامانه، به لیست موقت نیز اضافه شوند.
          </li>
          <li className={styles.tip}>
            نام کاربری به صورت نوع داده رشته وارد شود. در غیر این صورت اگر با
            صفر شروع شود در نظر گرفته نخواهد شد
          </li>
        </ul>

        <br />

        <Button onClick={handleFileBtnClick} className={styles.fileBtn}>
          <SiMicrosoftexcel />
          بارگذاری فایل
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {fileChangeStatus.enum === fileChangeStatusEnum.error ? (
          <p className={styles.fileChangeStatusText + " " + styles.error}>
            {fileChangeStatus.error}
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.success ? (
          <p className={styles.fileChangeStatusText + " " + styles.success}>
            پردازش فایل انجام شد. روی ادامه کلیک کنید.
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.processing ? (
          <p className={styles.fileChangeStatusText}>در حال پردازش فایل</p>
        ) : (
          <p className={styles.fileChangeStatusText}></p>
        )}
      </div>
    );
  } else if (isLoading || isFetching) {
    content = (
      <div className={styles.statusContainer}>
        <CircleSpinner color={styles.primaryColor} />
      </div>
    );
  } else if (isError) {
    content = (
      <div className={styles.statusContainer + " " + styles.error}>
        <p>{error?.message}</p>
        <p>{error?.responseData?.message}</p>
      </div>
    );
  } else if (isSuccess) {
    const entities = data?.entities || [];
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          <span className={styles.tip}>{entities?.length}</span>&nbsp; کاربر به
          لیست موقت اضافه شدند. میتوانید از این لیست برای افزودن یا حذف اعضا از
          کانال های خود استفاده نمایید.
        </h3>
        {entities.map((user, index) => (
          <ul key={index} className={styles.ul}>
            <li className={styles.tip}>
              {user?.username}: {user?.first_name} {user?.last_name}
            </li>
          </ul>
        ))}
      </div>
    );
  }

  let buttonsContent;
  if (isUninitialized) {
    buttonsContent = (
      <>
        <Button onClick={handleCancelClick} className={styles.cancelBtn}>
          انصراف
        </Button>
        <Button onClick={handleContinueClick} className={styles.continueBtn}>
          ادامه
          <FiChevronLeft />
        </Button>
      </>
    );
  } else if (isLoading || isFetching) {
    // what happens if user hits cancel in the middle of request?
    // nothing will be added to temp users table (?)
    // the query process continues and the result will be stored in the cache
    // but result remains only 60 seconds, until user opens modal and
    // inserts same input data
    // so every thing is safe (you sure?)
    buttonsContent = (
      <Button
        onClick={handleCancelClick}
        className={styles.cancelBtn + " " + styles.row}
      >
        انصراف
      </Button>
    );
  } else if (isError || isSuccess) {
    buttonsContent = (
      <Button
        onClick={handleCancelClick}
        className={styles.cancelBtn + " " + styles.row}
      >
        بستن
      </Button>
    );
  }

  return (
    <div className={styles.AddMembersToTempUsersTableModalBody}>
      <div className={styles.mainWrapper}>
        <RtlScrollbars>{content}</RtlScrollbars>
      </div>

      {buttonsContent}
    </div>
  );
}

export const addMembersToChannelModalConfig = {
  classNames: {
    header: styles.header,
  },
  headerTitle: "افزودن اعضا به کانال (از لیست موقت)",
  headerIconElement: <FiUserPlus />,
  bodyComponent: AddMembersToChannelModalBody,
};

export const removeMembersFromChannelModalConfig = {
  classNames: {
    header: styles.header,
  },
  headerTitle: "حذف اعضا از کانال (از لیست موقت)",
  headerIconElement: <FiUserMinus />,
  bodyComponent: RemoveMembersFromChannelModalBody,
};

export const addMembersToTempUsersTableModalConfig = {
  classNames: {
    header: styles.header,
  },
  headerTitle: "افزودن اعضا به لیست موقت (از فایل)",
  headerIconElement: <HiOutlineDocumentAdd />,
  bodyComponent: AddMembersToTempUsersTableModalBody,
};
