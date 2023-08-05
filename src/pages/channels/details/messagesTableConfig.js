import styles from "./messagesTableConfig.module.scss";

import { useState } from "react";

import { useSelector } from "react-redux";
import { canUserModifyChannel } from "../../../redux/authSlice";

import { selectMessagesOfChannelFilterConfig } from "../../../redux/filterConfigSlice";
import { tableInstanceNames } from "../../../redux/tableInstances";

import {
  useGetMessagesOfChannelQuery,
  useDeleteMessageMutation,
} from "../../../redux/apiSlice";

import Button, { NavLinkButton } from "../../../components/shared/Button";
import TextOverflow from "../../../components/shared/TextOverflow";
import { WarningModal } from "../../../components/shared/Modal";

import { BsInfoSquare } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";

import { toast } from "react-toastify";
import { resolvedToastOptions } from "../../../components/shared/CustomToastContainer";

import { toPersianDateStr } from "../../../utilities/utilities";

// table cell components

function RowIndex({ data: message }) {
  return <TextOverflow>{message?.rowNum}</TextOverflow>;
}

function MessageTitle({ data: message }) {
  return <TextOverflow>{message?.title}</TextOverflow>;
}

function MessageBody({ data: message }) {
  return <TextOverflow>{message?.body}</TextOverflow>;
}

function CreatedAt({ data: message }) {
  const dateStr = message?.createdAt;
  return <TextOverflow>{toPersianDateStr(dateStr)}</TextOverflow>;
}

function UpdatedAt({ data: message }) {
  const dateStr = message?.updatedAt;
  const isUpdated = message?.updatedAt !== message?.createdAt;
  return (
    <TextOverflow>{isUpdated ? toPersianDateStr(dateStr) : "_"}</TextOverflow>
  );
}

function Actions({ data: message }) {
  const canModify = useSelector((state) =>
    canUserModifyChannel(state, message?.channel?.owner_id)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [triggerDelete] = useDeleteMessageMutation();

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const submitDelete = async () => {
    let id;
    try {
      id = toast.loading(`در حال ارسال درخواست...`, { type: "info" });
      await triggerDelete({
        channelId: message?.channel?._id,
        messageId: message?._id,
      }).unwrap();
      toast.success(
        <MessageSuccessToast
          messageTitle={message?.title}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
    } catch (err) {
      toast.error(<MessageErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  };

  return (
    <div className={styles.buttons}>
      <NavLinkButton
        title="مشاهده/ویرایش"
        className={styles.detailsBtn}
        to={`/channels/${message?.channel?.identifier}/messages/${message?._id || ""}`}
      >
        <BsInfoSquare />
      </NavLinkButton>
      {canModify && (
        <Button onClick={openModal} title="حذف" className={styles.removeBtn}>
          <RiDeleteBin6Line />
        </Button>
      )}
      <WarningModal
        data={message}
        WarningParagraph={WarningParagraph}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        onConfirmClick={submitDelete}
        confirmButtonText={"حذف"}
      />
    </div>
  );
}

// header components
function HeaderColumn({ className, title }) {
  return <h2 className={className + ' ' + styles.colName}>{title}</h2>;
}

// other components
// also use by message details
export const WarningParagraph = ({ data: message }) => (
  <>
    <p className={styles.modalWarningText}>آیا از حذف این پیام مطمئن هستید؟</p>
    <p className={styles.modalWarningText}>
      <span className={styles.specialText}>{message?.title}</span>
    </p>
  </>
);

export const MessageSuccessToast = ({ messageTitle, crudOperationType }) => {
  const messageSlice = `پیام ${messageTitle} با موفقیت `;
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

export const MessageErrorToast = ({ err }) => {
  const errorMessage = err?.message;
  const errorDetails =
    err?.responseData?.title ?? // title field of message
    err?.responseData?.body ?? // body field of message
    err?.responseData?.messagePersian ?? // persian translation of server error message
    err?.responseData?.message; // server error message

  return (
    <>
      <p>{errorMessage}</p>
      <pre className={styles.toastErrorDetails}>{errorDetails}</pre>
    </>
  );
};

export const config = {
  tableInstanceName: tableInstanceNames.messagesOfChannel,
  tableInstanceNameText: "پیام ها",
  queryHook: useGetMessagesOfChannelQuery,
  selectors: {
    selectFilterConfig: selectMessagesOfChannelFilterConfig,
  },

  // takes filterConfig (when called inside data table) and returns
  // boolean to decide skip query or not
  // the query will skip if channel_id is not initialized
  // NOTE: skip option should be used on any component
  // that uses the query hook (DataTable, TableFooter)
  skipQueryCallback: (filterConfig) => filterConfig?.channelId === null,

  dataTableClassname: styles.messagesTable, // empty
  tableHeaderClassname: styles.tableHeader,
  tableRowClassname: styles.tableRow,

  columns: [
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "ردیف" },
      rowComponent: RowIndex,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "عنوان پیام" },
      rowComponent: MessageTitle,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "متن پیام" },
      rowComponent: MessageBody,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "تاریخ ارسال" },
      rowComponent: CreatedAt,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "تاریخ آخرین ویرایش" },
      rowComponent: UpdatedAt,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "عملیات" },
      rowComponent: Actions,
    },
  ],
};
