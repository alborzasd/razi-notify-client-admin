import "react-toastify/dist/ReactToastify.css";
import styles from "./CustomToastContainer.module.scss";

import { ToastContainer, Slide } from "react-toastify";

const autoClose = 3000;

// options for a toast that represents a resolved promise (fulfilled or rejected)
// used by logout toast (in ProfileCard.js), delete toast
export const resolvedToastOptions = {
  isLoading: false,
  autoClose,
  closeOnClick: true,
  draggable: true,
};

// these toast Ids are used to prevent duplicate toast
// if user presses submit multiple times
export const customToastIds = {
  // Id of the toast that is fired when user hits submit with empty input
  emptyInput: "emptyInput",
  // Id of the toast that is fired when user hits submit but input is same as current data
  unchangedInput: "unchangedInput",
};

function CustomToastContainer() {
  return (
    <ToastContainer
      toastClassName={styles.toast}
      transition={Slide}
      position="bottom-left"
      autoClose={autoClose}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}

export default CustomToastContainer;

// specific custom toasts

export const ChannelSuccessToast = ({ channelTitle, crudOperationType }) => {
  const messageSlice = `کانال ${channelTitle} با موفقیت `;
  const whatHappened =
    crudOperationType === "added"
      ? messageSlice + "افزوده شد."
      : crudOperationType === "edited"
      ? messageSlice + "ویرایش شد."
      : crudOperationType === "deleted"
      ? messageSlice + "حذف شد."
      : "عملیات با موفقیت انجام شد";
  return <p>{whatHappened}</p>;
};

export const ChannelErrorToast = ({ err }) => {
  const errorMessage = err?.message;
  const errorDetails =
    err?.responseData?.title ??
    err?.responseData?.identifier ??
    err?.responseData?.description ??
    err?.responseData?.messagePersian ??
    err?.responseData?.message;

  return (
    <>
      <p>{errorMessage}</p>
      <pre>{errorDetails}</pre>
    </>
  );
};

export const MessageSuccessToast = ({ messageTitle, crudOperationType }) => {
  const messageSlice = `پیام '${messageTitle}' با موفقیت `;
  const whatHappened =
    crudOperationType === "added"
      ? messageSlice + "ارسال شد."
      : crudOperationType === "edited"
      ? messageSlice + "ویرایش شد."
      : crudOperationType === "deleted"
      ? messageSlice + "حذف شد."
      : "عملیات با موفقیت انجام شد";
  return <p>{whatHappened}</p>;
};

export const MessageErrorToast = ({ err }) => {
  const errorMessage = err?.message;
  const errorDetails =
    err?.responseData?.title ??
    err?.responseData?.body ??
    err?.responseData?.messagePersian ??
    err?.responseData?.message;

  return (
    <>
      <p>{errorMessage}</p>
      <pre>{errorDetails}</pre>
    </>
  );
};

export const UserSuccessToast = ({ userFullname, crudOperationType }) => {
  const messageSlice = `کاربر ${userFullname} با موفقیت `;
  const whatHappened =
    crudOperationType === "added"
      ? messageSlice + "افزوده شد."
      : crudOperationType === "edited"
      ? messageSlice + "ویرایش شد."
      : crudOperationType === "deleted"
      ? messageSlice + "حذف شد."
      : "عملیات با موفقیت انجام شد";
  return <p>{whatHappened}</p>;
};

export const UserErrorToast = ({ err }) => {
  const errorMessage = err?.message;
  // TODO: refactor this garbage
  const errorDetails =
    err?.responseData?.username ??
    err?.responseData?.password ??
    err?.responseData?.first_name ??
    err?.responseData?.last_name ??
    err?.responseData?.system_role ??
    err?.responseData?.student_position ??
    err?.responseData?.lecturer_position ??
    err?.responseData?.employee_position ??
    err?.responseData?.department_id ??
    err?.responseData?.description ??
    err?.responseData?.phone_number ??
    err?.responseData?.email ??
    err?.responseData?.profile_image_url ??
    err?.responseData?.messagePersian ??
    err?.responseData?.message;

  return (
    <>
      <p>{errorMessage}</p>
      <pre>{errorDetails}</pre>
    </>
  );
};