// there is no ChannelRow compoenent (this file should be renamed)
// this file contains cell compoenets and configurations for DataTable

import styles from "./ChannelRow.module.scss";

import { useState } from "react";

import { useSelector } from "react-redux";

import { selectChannelsFilterConfig } from "../../redux/filterConfigSlice";
import {
  selectIsChannelForUser,
  selectIsUserRootAdmin,
} from "../../redux/authSlice";

import {
  useDeleteChannelMutation,
  useGetChannelsQuery,
} from "../../redux/apiSlice";
import { tableInstanceNames } from "../../redux/tableInstances";

import Image from "../../components/shared/Image";
import channelLogo from "../../assets/images/channel-logo.png";

import Button, { NavLinkButton } from "../../components/shared/Button";
import TextOverflow from "../../components/shared/TextOverflow";
import { WarningModal } from "../../components/shared/Modal";

import { BsInfoSquare } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";

import { toast } from "react-toastify";
import { resolvedToastOptions } from "../../components/shared/CustomToastContainer";

import { toPersianDateStr } from "../../utilities/utilities";

// coponents to render inside table cells

function RowIndex({ data }) {
  return <TextOverflow>{data?.rowNum}</TextOverflow>;
}

function ProfileImage({ data }) {
  return (
    <Image
      className={styles.profile}
      fallbackSrc={channelLogo}
      src={data?.profil_image_url}
      alt="channel profile image"
    />
  );
}

function Title({ data }) {
  return <TextOverflow>{data?.title}</TextOverflow>;
}

function Identifier({ data }) {
  return <TextOverflow>{data?.identifier}</TextOverflow>;
}

function Description({ data }) {
  return <TextOverflow>{data?.description}</TextOverflow>;
}

// function UsersNum({data}){
//     return (
//         <p className={styles.overflowHidden}>{data.count_users}</p>
//     );
// }

// function MessagesNum({data}){
//     return (
//         <p className={styles.overflowHidden}>{data.count_messages}</p>
//     );
// }

function CreatedAt({ data }) {
  const dateStr = data?.createdAt;
  return <TextOverflow>{toPersianDateStr(dateStr)}</TextOverflow>;
}

function Owner({ data }) {
  return (
    <TextOverflow>
      {data?.owner?.first_name + " " + data?.owner?.last_name}
    </TextOverflow>
  );
}

function Actions({ data }) {
  const isChannelForUser = useSelector((state) =>
    selectIsChannelForUser(state, data?.owner_id)
  );
  const isRootAdmin = useSelector(selectIsUserRootAdmin);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [triggerDelete] = useDeleteChannelMutation();

  const openModal = () => {
    setModalIsOpen(true);
  };

  const submitDelete = async () => {
    // console.log('deleted');
    let id;
    try {
      id = toast.loading(`در حال حذف کانال ${data?.title}`, { type: "info" });
      //   await new Promise((res, rej) => setTimeout(rej, 5000));
      await triggerDelete(data?._id).unwrap();
      toast.success(
        <ChannelSuccessToast
          channelTitle={data?.title}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
    } catch (err) {
      toast.error(<ChannelErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  };

  return (
    <div className={styles.buttons}>
      <NavLinkButton
        title="مشاهده/ویرایش"
        className={styles.detailsBtn}
        to={`/channels/${data?.identifier || ""}`}
      >
        <BsInfoSquare />
      </NavLinkButton>
      {(isChannelForUser || isRootAdmin) && (
        <Button onClick={openModal} title="حذف" className={styles.removeBtn}>
          <RiDeleteBin6Line />
        </Button>
      )}
      <WarningModal
        data={data}
        WarningParagraph={WarningParagraph}
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
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
// also use by channel details
export const WarningParagraph = ({ data }) => (
  <>
    <p className={styles.modalWarningText}>
      با حذف این کانال، محتوا و پیام های آن نیز پاک خواهد شد.
    </p>
    <p className={styles.modalWarningText}>
      <span>آیا از حذف کانال</span>&nbsp;
      <span className={styles.specialText}>{data?.title}</span>&nbsp;
      <span>مطمئن هستید؟</span>
    </p>
  </>
);

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
      <pre className={styles.toastErrorDetails}>{errorDetails}</pre>
    </>
  );
};

export const config = {
  tableInstanceName: tableInstanceNames.channels,
  tableInstanceNameText: "کانال ها",
  queryHook: useGetChannelsQuery,
  selectors: {
    selectFilterConfig: selectChannelsFilterConfig,
  },

  // takes filterConfig (when called inside data table) and returns
  // boolean to decide skip query or not
  // NOTE: skip option should be used on any component
  // that uses the query hook (DataTable, TableFooter)
  skipQueryCallback: (filterConfig) => false, // never skip

  dataTableClassname: styles.channelsTable, // empty
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
      headerComponentProps: { title: "پروفایل" },
      rowComponent: ProfileImage,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "نام کانال" },
      rowComponent: Title,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "شناسه کانال" },
      rowComponent: Identifier,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "توضیحات" },
      rowComponent: Description,
    },
    // {
    //     headerComponent: HeaderColumn,
    //     headerComponentProps: {title: 'تعداد کاربران'},
    //     rowComponent: UsersNum
    // },
    // {
    //     headerComponent: HeaderColumn,
    //     headerComponentProps: {title: 'تعداد پیام ها'},
    //     rowComponent: MessagesNum
    // },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "تاریخ ایجاد" },
      rowComponent: CreatedAt,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "مدیر کانال" },
      rowComponent: Owner,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "عملیات" },
      rowComponent: Actions,
    },
  ],
};
