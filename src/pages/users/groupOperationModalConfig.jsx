// this file will export 3 config objects for 3 <GroupOperationModal/>

import styles from "./groupOperationModalConfig.module.scss";

import { useRef, useState, useEffect } from "react";

import {
  useAddManyUsersMutation,
  useEditManyUsersMutation,
  useDeleteManyUsersMutation,
} from "../../redux/apiSlice";

import Button from "../../components/shared/Button";
import RtlScrollbars from "../../components/shared/RtlScrollbars";

import { useGetDepartmentsQuery } from "../../redux/apiSlice";
import DropdownInput from "../../components/shared/table-search/DropdownInput";

import { CircleSpinner } from "react-spinners-kit";

import { HiOutlineDocumentAdd } from "react-icons/hi";
import { LuFileEdit } from "react-icons/lu";
import { HiOutlineDocumentRemove } from "react-icons/hi";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { SiMicrosoftexcel } from "react-icons/si";
import { FiChevronLeft } from "react-icons/fi";

import { errorMessages } from "../../config";

import addManyUsersImageSample from "../../assets/content-images/add-many-users-sample.png";
import editManyUsersImageSample from "../../assets/content-images/edit-many-users-sample.png";
import deleteManyUsersImageSample from "../../assets/content-images/delete-many-users-sample.png";

import ExcelToJsonWorker from '../../workers/xlsx/excelToJsonWorker?worker';

////////////////////////////////////////////////////////////////

const departmnetsDropdownConfig = {
  initText: "دانشکده",
  queryHook: useGetDepartmentsQuery,
  idFieldName: "_id", // property of data to set on filter config
  valueFieldName: "title", // property of data to show inside list of options
};

export const modalInstanceNames = {
  addManyUsers: "addManyUsers",
  editManyUsers: "editManyUsers",
  deleteManyUsers: "deleteManyUsers",
};

// like typescript enum
const fileChangeStatusEnum = {
  init: "init",
  processing: "processing", // processing file, check if it's valid file and extract data
  success: "success", // converted to json, user can hit continue
  error: "error", // file is invalid or nothing is uploaded
};

// modal body components
function AddManyUsersModalBody({ closeModal }) {
  const excelToJsonWorkerRef = useRef(null);
  const fileInputRef = useRef(null);
  const hiddenDownloadLinkRef = useRef(null);

  // handle init and terminate worker
  useEffect(() => {
    // excelToJsonWorkerRef.current = new Worker(
    //   new URL("../../workers/xlsx/excelToJsonWorker", import.meta.url),
    //   { type: "module" }
    // );
    excelToJsonWorkerRef.current = new ExcelToJsonWorker();
    return () => {
      excelToJsonWorkerRef.current.terminate();
    };
  }, []);

  const [fileChangeStatus, setFileChangeStatus] = useState({
    enum: fileChangeStatusEnum.init,
    error: null,
  });

  // user json data to submit with query
  const [usersJson, setUsersJson] = useState([]);

  // department _id to submit with query
  const [departmentId, setDepartmentId] = useState(null);
  const [departmentValidationErrorText, setDepartmentValidationErrorText] =
    useState("");

  useEffect(() => {
    if (departmentId) {
      setDepartmentValidationErrorText("");
    }
  }, [departmentId]);

  const [
    triggerAddMany,
    { data, isLoading, isSuccess, isError, error, isUninitialized },
  ] = useAddManyUsersMutation();

  const handleCancelClick = () => {
    closeModal();
  };

  const handleImportBtnClick = () => {
    if (!departmentId) {
      setDepartmentValidationErrorText(
        "قبل از بارگزاری فایل، دانشکده را انتخاب کنید."
      );
      return;
    }

    // forward click event to hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExportBtnClick = async () => {
    let workerResult;
    let objectUrl;
    let workerError;

    // this will resolve when the message from web worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      excelToJsonWorkerRef.current.postMessage({
        action: "generateTemplateExcel",
        data: null,
        // generate template excel file for add many users operation
        meta: { type: "add-many-users" },
      });

      // define message event
      excelToJsonWorkerRef.current.onmessage = (event) => {
        workerResult = event?.data?.result;
        objectUrl = event?.data?.data;
        workerError = event?.data?.error;
        // console.log("jsonData", objectUrl);
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
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    let workerResult;
    let jsonData;
    let workerError;

    // set status to 'processing'
    setFileChangeStatus((prev) => ({
      ...prev,
      enum: fileChangeStatusEnum.processing,
      error: null,
    }));

    // this will resolve when the message from web worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      excelToJsonWorkerRef.current.postMessage({
        action: "excelToJson",
        data: { file, departmentId }, // department id will be attached to rach json row
        // XLSX expects the full specification for each user row
        meta: { type: "userschema-full" },
      });

      // define message event
      excelToJsonWorkerRef.current.onmessage = (event) => {
        workerResult = event?.data?.result;
        jsonData = event?.data?.data;
        workerError = event?.data?.error;
        // console.log("jsonData", jsonData);
        res();
      };
    });

    // if message was error set status to 'error' 'not valid file'
    if (workerResult === "error") {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: workerError,
      }));
    }
    // if message was data set status to 'success'
    else if (workerResult === "success") {
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
        error: errorMessages.internalAppError,
      }));
    }

    // reset the file input value
    // so uploading the same file can be processed again
    e.target.value = null;

    setUsersJson(jsonData);
  };

  const handleContinueClick = async () => {
    if (!departmentId) {
      setDepartmentValidationErrorText(
        "قبل از بارگزاری فایل، دانشکده را انتخاب کنید."
      );
      return;
    }

    if (fileChangeStatus.enum === fileChangeStatusEnum.init) {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: "هیچ فایلی بارگذاری نشده است",
      }));
    } else if (fileChangeStatus.enum === fileChangeStatusEnum.success) {
      // console.log("submit");
      try {
        await triggerAddMany(usersJson).unwrap();
        // we dont need to dispatch any thing here
        // the data is taken from query hook
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
            username: نام کاربری. باید غیر تکراری باشد. نمیتواند خالی باشد.
          </li>
          <li className={styles.tip}>
            password: رمز عبور. نمیتواند خالی باشد.
          </li>
          <li className={styles.tip}>first_name: نام. نمیتواند خالی باشد.</li>
          <li className={styles.tip}>
            last_name: نام خانوادگی. نمیتواند خالی باشد.
          </li>
          <li className={styles.tip}>
            system_role: سطح کاربری. عدد 1 برای کاربر عادی عدد 2 برای مدیر
            کانال. اگر خالی باشد یا مقادیر دیگری باشد. کاربر عادی در نظر گرفته
            می شود.
          </li>
          <li className={styles.tip}>
            student_position: موقعیت دانشجو. عدد 1 برای کارشناسی عدد 2 برای
            ارشد. عدد 3 برای دکتری اگر موقعیت های دانشجو، مدرس و کارمند هر سه
            خالی باشند. پیغام خطا نمایش داده میشود.
          </li>
          <li className={styles.tip}>
            lecturer_position: موقعیت مدرس. عدد 1 برای حق التدریس عدد 2 برای
            مربی. عدد 3 برای استادیار. عدد 4 برای دانشیار. عدد 5 برای استاد
            تمام.
          </li>
          <li className={styles.tip}>
            employee_position: موقعیت کارمند. هر مقداری میتواند داشته باشد. برای
            مثال 'کارشناس آموزش'.
          </li>
          <li className={styles.tip}>
            description: توضیحات. شامل توضیحات اضافه مخصوص یک کاربر که ستونی
            برای آن تعریف نشده است. مثلا سال تولد.
          </li>
          <li className={styles.tip}>email: ایمیل کاربر. اجباری نیست</li>
          <li className={styles.tip}>
            phone_number: شماره همراه کاربر. می تواند خالی باشد. حتما باید در
            قالب 09123456789 باشد. پیامک فقط به اعضایی که شماره همراه آنها ثبت
            شده ارسال خواهد شد.
          </li>
        </ul>

        <br />

        <h3 className={styles.section}>نمونه:</h3>
        <div className={styles.imgContainer}>
          <img
            className={styles.img}
            src={addManyUsersImageSample}
            alt="addManyUsersImageSample"
          />
        </div>

        <br />

        <h3 className={styles.section}>نکات:</h3>
        <ul className={styles.ul}>
          <li className={styles.tip}>
            فقط نام کاربری افرادی که عضو سامانه نباشند به سامانه اضافه خواهد شد.
            نام کاربری هایی که قبلا ثبت شده اند، پردازش نخواهند شد.
          </li>
          <li className={styles.tip}>
            نام گذاری ستون ها باید دقیقا مانند قالب باشد. ترتیب ستون ها مهم نیست
          </li>
          <li className={styles.tip}>
            در هر عملیات افزودن، فقط یک دانشکده را میتوانید انتخاب کنید.
          </li>
          <li className={styles.tip}>
            ستون هایی مثل نام کاربری یا رمز عبور که میتوانند با کاراکتر 0 شروع
            شوند. باید از نوع داده رشته در فایل ورودی ذخیره شوند. در غیر اینصورت
            ممکن است به عنوان عدد پردازش شده و 0 شروع حذف شود.
          </li>
        </ul>

        <br />

        <DropdownInput
          config={departmnetsDropdownConfig}
          searchValue={departmentId}
          setSearchValue={setDepartmentId}
          // this callback will change filter config
          // data table displays the filtered department name
          // from that filter config
          // we don't need this callback here
          setDisplaySearchValue={() => {}}
          containerClassname={styles.departmentsDropdown}
        />

        <br />

        <div className={styles.fileButtons}>
          <Button onClick={handleImportBtnClick} className={styles.uploadBtn}>
            <SiMicrosoftexcel className={styles.icon} />
            بارگذاری فایل
          </Button>
          <Button onClick={handleExportBtnClick} className={styles.downloadBtn}>
            <HiOutlineDocumentDownload className={styles.icon} />
            دانلود فایل قالب
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <a
          ref={hiddenDownloadLinkRef}
          download="add-many-users-template.xlsx"
          href="/"
          style={{ display: "none" }}
        >
          hidden download link
        </a>

        {departmentValidationErrorText ? (
          <p
            className={
              styles.departmentValidationErrorText + " " + styles.error
            }
          >
            {departmentValidationErrorText}
          </p>
        ) : (
          <p
            className={
              styles.departmentValidationErrorText + " " + styles.error
            }
          ></p>
        )}

        {fileChangeStatus.enum === fileChangeStatusEnum.error ? (
          <p className={styles.fileChangeStatusText + " " + styles.error}>
            {fileChangeStatus.error}
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.success ? (
          <p className={styles.fileChangeStatusText + " " + styles.success}>
            پردازش فایل انجام شد.
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.processing ? (
          <p className={styles.fileChangeStatusText}>در حال پردازش فایل</p>
        ) : (
          <p className={styles.fileChangeStatusText}></p>
        )}
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
        <p>{error?.responseData?.message}</p>
        <p>{error?.responseData?.messagePersian}</p>
      </div>
    );
  } else if (isSuccess) {
    const entities = data?.entities || [];
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          <span className={styles.tip}>{entities?.length}</span>&nbsp; کاربر به
          سامانه اضافه شده است. برای اضافه کردن کاربران به لیست موقت میتوانید
          همین فایل را در صفحه لیست موقت آپلود کنید
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
  } else if (isLoading) {
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
    <div className={styles.AddManyUsersModalBody}>
      <div className={styles.mainWrapper}>
        <RtlScrollbars>{content}</RtlScrollbars>
      </div>

      {buttonsContent}
    </div>
  );
}

function EditManyUsersModalBody({ closeModal }) {
  const excelToJsonWorkerRef = useRef(null);
  const fileInputRef = useRef(null);
  const hiddenDownloadLinkRef = useRef(null);

  // handle init and terminate worker
  useEffect(() => {
    // excelToJsonWorkerRef.current = new Worker(
    //   new URL("../../workers/xlsx/excelToJsonWorker", import.meta.url),
    //   { type: "module" }
    // );
    excelToJsonWorkerRef.current = new ExcelToJsonWorker();
    return () => {
      excelToJsonWorkerRef.current.terminate();
    };
  }, []);

  const [fileChangeStatus, setFileChangeStatus] = useState({
    enum: fileChangeStatusEnum.init,
    error: null,
  });

  // user json data to submit with query
  const [usersJson, setUsersJson] = useState([]);

  // department _id to submit with query
  const [departmentId, setDepartmentId] = useState(null);
  const [departmentValidationErrorText, setDepartmentValidationErrorText] =
    useState("");

  useEffect(() => {
    if (departmentId) {
      setDepartmentValidationErrorText("");
    }
  }, [departmentId]);

  const [
    triggerEditMany,
    { data, isLoading, isSuccess, isError, error, isUninitialized },
  ] = useEditManyUsersMutation();

  const handleCancelClick = () => {
    closeModal();
  };

  const handleImportBtnClick = () => {
    if (!departmentId) {
      setDepartmentValidationErrorText(
        "قبل از بارگزاری فایل، دانشکده را انتخاب کنید."
      );
      return;
    }

    // forward click event to hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExportBtnClick = async () => {
    let workerResult;
    let objectUrl;
    let workerError;

    // this will resolve when the message from web worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      excelToJsonWorkerRef.current.postMessage({
        action: "generateTemplateExcel",
        data: null,
        // generate template excel file for edit many users operation
        meta: { type: "edit-many-users" },
      });

      // define message event
      excelToJsonWorkerRef.current.onmessage = (event) => {
        workerResult = event?.data?.result;
        objectUrl = event?.data?.data;
        workerError = event?.data?.error;
        // console.log("jsonData", objectUrl);
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
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    let workerResult;
    let jsonData;
    let workerError;

    // set status to 'processing'
    setFileChangeStatus((prev) => ({
      ...prev,
      enum: fileChangeStatusEnum.processing,
      error: null,
    }));

    // this will resolve when the message from web worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      excelToJsonWorkerRef.current.postMessage({
        action: "excelToJson",
        data: { file, departmentId }, // department id will be attached to each json row
        // XLSX expects the partial specification for each user row
        // username col is required but other cols are optional
        meta: { type: "userschema-partial" },
      });

      // define message event
      excelToJsonWorkerRef.current.onmessage = (event) => {
        workerResult = event?.data?.result;
        jsonData = event?.data?.data;
        workerError = event?.data?.error;
        // console.log("jsonData", jsonData);
        res();
      };
    });

    // if message was error set status to 'error' 'not valid file'
    if (workerResult === "error") {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: workerError,
      }));
    }
    // if message was data set status to 'success'
    else if (workerResult === "success") {
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
        error: errorMessages.internalAppError,
      }));
    }

    // reset the file input value
    // so uploading the same file can be processed again
    e.target.value = null;

    setUsersJson(jsonData);
  };

  const handleContinueClick = async () => {
    if (!departmentId) {
      setDepartmentValidationErrorText(
        "قبل از بارگزاری فایل، دانشکده را انتخاب کنید."
      );
      return;
    }

    if (fileChangeStatus.enum === fileChangeStatusEnum.init) {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: "هیچ فایلی بارگذاری نشده است",
      }));
    } else if (fileChangeStatus.enum === fileChangeStatusEnum.success) {
      // console.log("submit");
      try {
        await triggerEditMany(usersJson).unwrap();
        // we dont need to dispatch any thing here
        // the data is taken from query hook
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
            username: نام کاربری. باید غیر تکراری باشد. نمیتواند خالی باشد.
          </li>
          <li className={styles.tip}>
            new_username: نام کاربری جدید. باید غیر تکراری باشد. اگر خالی باشد
            نام کاربری قبلی ویرایش نخواهد شد..
          </li>
          <li className={styles.tip}>
            password: رمز عبور. اگر خالی باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            first_name: نام. اگر خالی باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            last_name: نام خانوادگی. اگر خالی باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            system_role: سطح کاربری. عدد 1 برای کاربر عادی عدد 2 برای مدیر
            کانال. اگر خالی باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            student_position: موقعیت دانشجو. عدد 0 برای خالی کردن مقدار قبلی.
            عدد 1 برای کارشناسی عدد 2 برای ارشد. عدد 3 برای دکتری. اگر موقعیت
            های دانشجو، مدرس و کارمند هر سه مقدار 0 داشته باشند. پیغام خطا نمایش
            داده میشود. اگر خالی باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            lecturer_position: موقعیت مدرس. عدد 0 برای خالی کردن مقدار قبلی. عدد
            1 برای حق التدریس عدد 2 برای مربی. عدد 3 برای استادیار. عدد 4 برای
            دانشیار. عدد 5 برای استاد تمام. اگر خالی باشد یا هر مقدار دیگری باشد
            ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            employee_position: موقعیت کارمند. عدد 0 برای خالی کردن مقدار قبلی.
            هر مقداری میتواند داشته باشد. برای مثال 'کارشناس آموزش'. اگر خالی
            باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            description: توضیحات. عدد 0 برای خالی کردن مقدار قبلی. شامل توضیحات
            اضافه مخصوص یک کاربر که ستونی برای آن تعریف نشده است. مثلا سال تولد.
            اگر خالی باشد ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            email: ایمیل کاربر. عدد 0 برای خالی کردن مقدار قبلی. اگر خالی باشد
            ویرایش نخواهد شد.
          </li>
          <li className={styles.tip}>
            phone_number: شماره همراه کاربر. می تواند خالی باشد. حتما باید در
            قالب 09123456789 باشد. پیامک فقط به اعضایی که شماره همراه آنها ثبت
            شده ارسال خواهد شد. عدد 0 برای خالی کردن مقدار قبلی. اگر خالی باشد
            ویرایش نخواهد شد.
          </li>
        </ul>

        <br />

        <h3 className={styles.section}>نمونه:</h3>
        <div className={styles.imgContainer}>
          <img
            className={styles.img}
            src={editManyUsersImageSample}
            alt="editManyUsersImageSample"
          />
        </div>

        <br />

        <h3 className={styles.section}>نکات:</h3>
        <ul className={styles.ul}>
          <li className={styles.tip}>
            فقط ردیف های نام کاربری افرادی که در سامانه عضو باشند ویرایش خواهد
            شد. ردیف هایی که نام کاربری آنها ثبت نشده پردازش نخواهند شد.
          </li>
          <li className={styles.tip}>
            نام گذاری ستون ها باید دقیقا مانند قالب باشد. ترتیب ستون ها مهم نیست
          </li>
          <li className={styles.tip}>
            در هر عملیات ویرایش، فقط یک دانشکده را میتوانید انتخاب کنید. دانشکده
            قبلی کاربران ویرایش خواهد شد.
          </li>
          <li className={styles.tip}>
            برای خالی کردن مقدار ستون هایی که میتوانند خالی باشند (مثلا ایمیل)
            باید حتما عدد 0 وارد شود. اگر مقداری وارد نشود. مقدار قبلی که در
            سامانه ثبت شده است ویرایش نخواهد شد..
          </li>
          <li className={styles.tip}>
            ستون هایی مثل نام کاربری یا رمز عبور که میتوانند با کاراکتر 0 شروع
            شوند. باید از نوع داده رشته در فایل ورودی ذخیره شوند. در غیر اینصورت
            ممکن است به عنوان عدد پردازش شده و 0 شروع حذف شود.
          </li>
        </ul>

        <br />

        <DropdownInput
          config={departmnetsDropdownConfig}
          searchValue={departmentId}
          setSearchValue={setDepartmentId}
          // this callback will change filter config
          // data table displays the filtered department name
          // from that filter config
          // we don't need this callback here
          setDisplaySearchValue={() => {}}
          containerClassname={styles.departmentsDropdown}
        />

        <br />

        <div className={styles.fileButtons}>
          <Button onClick={handleImportBtnClick} className={styles.uploadBtn}>
            <SiMicrosoftexcel className={styles.icon} />
            بارگذاری فایل
          </Button>
          <Button onClick={handleExportBtnClick} className={styles.downloadBtn}>
            <HiOutlineDocumentDownload className={styles.icon} />
            دانلود فایل قالب
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <a
          ref={hiddenDownloadLinkRef}
          download="edit-many-users-template.xlsx"
          href="/"
          style={{ display: "none" }}
        >
          hidden download link
        </a>

        {departmentValidationErrorText ? (
          <p
            className={
              styles.departmentValidationErrorText + " " + styles.error
            }
          >
            {departmentValidationErrorText}
          </p>
        ) : (
          <p
            className={
              styles.departmentValidationErrorText + " " + styles.error
            }
          ></p>
        )}

        {fileChangeStatus.enum === fileChangeStatusEnum.error ? (
          <p className={styles.fileChangeStatusText + " " + styles.error}>
            {fileChangeStatus.error}
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.success ? (
          <p className={styles.fileChangeStatusText + " " + styles.success}>
            پردازش فایل انجام شد.
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.processing ? (
          <p className={styles.fileChangeStatusText}>در حال پردازش فایل</p>
        ) : (
          <p className={styles.fileChangeStatusText}></p>
        )}
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
        <p>{JSON.stringify(error?.responseData)}</p>
        {/* <p>{error?.responseData?.message}</p> */}
        {/* <p>{error?.responseData?.messagePersian}</p> */}
      </div>
    );
  } else if (isSuccess) {
    const entities = data?.entities || [];
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          <span className={styles.tip}>{entities?.length}</span>&nbsp; کاربر در
          سامانه ویرایش شده است. برای اضافه کردن کاربران به لیست موقت میتوانید
          همین فایل را در صفحه لیست موقت آپلود کنید
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
  } else if (isLoading) {
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
    <div className={styles.EditManyUsersModalBody}>
      <div className={styles.mainWrapper}>
        <RtlScrollbars>{content}</RtlScrollbars>
      </div>

      {buttonsContent}
    </div>
  );
}

function DeleteManyUsersModalBody({ closeModal }) {
  const excelToJsonWorkerRef = useRef(null);
  const fileInputRef = useRef(null);
  // const hiddenDownloadLinkRef = useRef(null);

  // handle init and terminate worker
  useEffect(() => {
    // excelToJsonWorkerRef.current = new Worker(
    //   new URL("../../workers/xlsx/excelToJsonWorker", import.meta.url),
    //   { type: "module" }
    // );
    excelToJsonWorkerRef.current = new ExcelToJsonWorker();
    return () => {
      excelToJsonWorkerRef.current.terminate();
    };
  }, []);

  const [fileChangeStatus, setFileChangeStatus] = useState({
    enum: fileChangeStatusEnum.init,
    error: null,
  });

  // user json data to submit with query
  // in this case usersJson is array of usernames
  const [usersJson, setUsersJson] = useState([]);

  // department _id to submit with query
  // const [departmentId, setDepartmentId] = useState(null);
  // const [departmentValidationErrorText, setDepartmentValidationErrorText] =
  //   useState("");

  // useEffect(() => {
  //   if (departmentId) {
  //     setDepartmentValidationErrorText("");
  //   }
  // }, [departmentId]);

  const [
    triggerDeleteMany,
    { data, isLoading, isSuccess, isError, error, isUninitialized },
  ] = useDeleteManyUsersMutation();

  const handleCancelClick = () => {
    closeModal();
  };

  const handleImportBtnClick = () => {
    // if (!departmentId) {
    //   setDepartmentValidationErrorText(
    //     "قبل از بارگزاری فایل، دانشکده را انتخاب کنید."
    //   );
    //   return;
    // }

    // forward click event to hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // const handleExportBtnClick = async () => {
  //   let workerResult;
  //   let objectUrl;
  //   let workerError;

  //   // this will resolve when the message from web worker is received
  //   await new Promise((res, rej) => {
  //     // send file to service worker
  //     excelToJsonWorkerRef.current.postMessage({
  //       action: "generateTemplateExcel",
  //       data: null,
  //       // generate template excel file for edit many users operation
  //       meta: { type: "edit-many-users" },
  //     });

  //     // define message event
  //     excelToJsonWorkerRef.current.onmessage = (event) => {
  //       workerResult = event?.data?.result;
  //       objectUrl = event?.data?.data;
  //       workerError = event?.data?.error;
  //       // console.log("jsonData", objectUrl);
  //       res();
  //     };
  //   });

  //   if (workerResult === "error") {
  //     console.log(workerError?.message);
  //   } else if (workerResult === "success") {
  //     if (hiddenDownloadLinkRef.current) {
  //       hiddenDownloadLinkRef.current.href = objectUrl;
  //       hiddenDownloadLinkRef.current.click();
  //     }
  //   }
  //   // if not any value is assigned to result
  //   // an unexpected error happened
  //   else {
  //     console.log(errorMessages.internalAppError);
  //   }
  // };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    let workerResult;
    let jsonData;
    let workerError;

    // set status to 'processing'
    setFileChangeStatus((prev) => ({
      ...prev,
      enum: fileChangeStatusEnum.processing,
      error: null,
    }));

    // this will resolve when the message from web worker is received
    await new Promise((res, rej) => {
      // send file to service worker
      excelToJsonWorkerRef.current.postMessage({
        action: "excelToJson",
        data: file,
        meta: { type: "username-only" },
      });

      // define message event
      excelToJsonWorkerRef.current.onmessage = (event) => {
        workerResult = event?.data?.result;
        jsonData = event?.data?.data;
        workerError = event?.data?.error;
        // console.log("jsonData", jsonData);
        res();
      };
    });

    // if message was error set status to 'error' 'not valid file'
    if (workerResult === "error") {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: workerError,
      }));
    }
    // if message was data set status to 'success'
    else if (workerResult === "success") {
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
        error: errorMessages.internalAppError,
      }));
    }

    // reset the file input value
    // so uploading the same file can be processed again
    e.target.value = null;

    setUsersJson(jsonData);
  };

  const handleContinueClick = async () => {
    // if (!departmentId) {
    //   setDepartmentValidationErrorText(
    //     "قبل از بارگزاری فایل، دانشکده را انتخاب کنید."
    //   );
    //   return;
    // }

    if (fileChangeStatus.enum === fileChangeStatusEnum.init) {
      setFileChangeStatus((prev) => ({
        ...prev,
        enum: fileChangeStatusEnum.error,
        error: "هیچ فایلی بارگذاری نشده است",
      }));
    } else if (fileChangeStatus.enum === fileChangeStatusEnum.success) {
      // console.log("submit");
      try {
        await triggerDeleteMany(usersJson).unwrap();
        // we dont need to dispatch any thing here
        // the data is taken from query hook
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
            src={deleteManyUsersImageSample}
            alt="deleteManyUsersImageSample"
          />
        </div>

        <br />

        <h3 className={styles.section}>نکات:</h3>
        <ul className={styles.ul}>
          <li className={styles.tip + " " + styles.danger}>
            با حذف هر کاربر تمام کانال ها و پیام های ایجاد شده توسط آن کاربر حذف
            خواهد شد.
          </li>
          <li className={styles.tip}>
            فقط نام کاربری های ثبت شده حذف خواهند شد.
          </li>
          <li className={styles.tip}>
            ستون های اضافی غیر از username پردازش نخواهند شد. میتوانید فایلی که
            برای افزودن یا ویرایش کاربران ساخته اید را در این قسمت نیز آپلود
            کنید. تا کاربران اضافه شده یا ویرایش شده به سامانه، از این طریق حذف
            شوند..
          </li>
          <li className={styles.tip}>
            نام کاربری به صورت نوع داده رشته وارد شود. در غیر این صورت اگر با
            صفر شروع شود در نظر گرفته نخواهد شد
          </li>
        </ul>

        {/* <br />

        <DropdownInput
          config={departmnetsDropdownConfig}
          searchValue={departmentId}
          setSearchValue={setDepartmentId}
          // this callback will change filter config
          // data table displays the filtered department name
          // from that filter config
          // we don't need this callback here
          setDisplaySearchValue={() => {}}
          containerClassname={styles.departmentsDropdown}
        /> */}

        <br />

        <div className={styles.fileButtons}>
          <Button onClick={handleImportBtnClick} className={styles.uploadBtn}>
            <SiMicrosoftexcel className={styles.icon} />
            بارگذاری فایل
          </Button>
          {/* <Button onClick={handleExportBtnClick} className={styles.downloadBtn}>
            <HiOutlineDocumentDownload className={styles.icon} />
            دانلود فایل قالب
          </Button> */}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {/* <a
          ref={hiddenDownloadLinkRef}
          download="edit-many-users-template.xlsx"
          href="/"
          style={{ display: "none" }}
        >
          hidden download link
        </a> */}

        {/* {departmentValidationErrorText ? (
          <p
            className={
              styles.departmentValidationErrorText + " " + styles.error
            }
          >
            {departmentValidationErrorText}
          </p>
        ) : (
          <p
            className={
              styles.departmentValidationErrorText + " " + styles.error
            }
          ></p>
        )} */}

        {fileChangeStatus.enum === fileChangeStatusEnum.error ? (
          <p className={styles.fileChangeStatusText + " " + styles.error}>
            {fileChangeStatus.error}
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.success ? (
          <p className={styles.fileChangeStatusText + " " + styles.success}>
            پردازش فایل انجام شد.
          </p>
        ) : fileChangeStatus.enum === fileChangeStatusEnum.processing ? (
          <p className={styles.fileChangeStatusText}>در حال پردازش فایل</p>
        ) : (
          <p className={styles.fileChangeStatusText}></p>
        )}
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
        <p>{JSON.stringify(error?.responseData)}</p>
        {/* <p>{error?.responseData?.message}</p> */}
        {/* <p>{error?.responseData?.messagePersian}</p> */}
      </div>
    );
  } else if (isSuccess) {
    const entities = data?.entities || [];
    content = (
      <div className={styles.main}>
        <h3 className={styles.section}>
          <span className={styles.tip}>{entities?.length}</span>&nbsp; کاربر از
          سامانه حذف شده است.
        </h3>
        {entities.map((user, index) => (
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
    <div className={styles.DeleteManyUsersModalBody}>
      <div className={styles.mainWrapper}>
        <RtlScrollbars>{content}</RtlScrollbars>
      </div>

      {buttonsContent}
    </div>
  );
}

export const addManyUsersModalConfig = {
  classNames: {
    header: styles.header,
  },
  headerTitle: "افزودن کاربر به سامانه",
  headerIconElement: <HiOutlineDocumentAdd />,
  bodyComponent: AddManyUsersModalBody,
};

export const editManyUsersModalConfig = {
  classNames: {
    header: styles.header,
  },
  headerTitle: "ویرایش کاربران",
  headerIconElement: <LuFileEdit />,
  bodyComponent: EditManyUsersModalBody,
};

export const deleteManyUsersModalConfig = {
  classNames: {
    header: styles.header,
  },
  headerTitle: "حذف کاربر از سامانه",
  headerIconElement: <HiOutlineDocumentRemove />,
  bodyComponent: DeleteManyUsersModalBody,
};
