import styles from "./usersTableConfig.module.scss";

import { useState } from "react";
import classNames from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { canCurrentUserModifyThisUser } from "../../redux/authSlice";
import {
  selectIsUserIdInsideTempUsers,
  addUserToTempUsersTable,
  removeUserIdFromTempUsersTable,
} from "../../redux/tempUsersSlice";

import { useGetUsersQuery, useDeleteUserMutation } from "../../redux/apiSlice";

import { tableInstanceNames } from "../../redux/tableInstances";
import { selectAllUsersFilterConfig } from "../../redux/filterConfigSlice";

import { toast } from "react-toastify";
import { resolvedToastOptions } from "../../components/shared/CustomToastContainer";

import Button, { NavLinkButton } from "../../components/shared/Button";
import TextOverflow from "../../components/shared/TextOverflow";
import Image from "../../components/shared/Image";
import { WarningModal } from "../../components/shared/Modal";

import { BsInfoSquare } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiOutlineClipboardList } from "react-icons/hi";
import { PiStudent } from "react-icons/pi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
// import { FaUserTie } from "react-icons/fa";
import { LiaUserTieSolid } from "react-icons/lia";
import { RxViewNone } from "react-icons/rx";

import userAvatar from "../../assets/images/user-avatar.png";

// cell components
export function RowIndex({ data: user }) {
  return <TextOverflow>{user?.rowNum}</TextOverflow>;
}

export function ProfileImage({ data: user }) {
  return (
    <Image
      className={styles.profile}
      fallbackSrc={userAvatar}
      src={user?.profil_image_url}
      alt="user profile image"
    />
  );
}

export function Username({ data: user }) {
  return <TextOverflow>{user?.username}</TextOverflow>;
}

export function Fullname({ data: user }) {
  return (
    <TextOverflow>{user?.first_name + " " + user?.last_name}</TextOverflow>
  );
}

export function SystemRole({ data: user }) {
  return <TextOverflow>{user?.system_role_persian}</TextOverflow>;
}

export function OrginazationPosition({ data: user }) {
  return (
    <div className={styles.cellMultiRow}>
      <div className={styles.row} title="موقعیت دانشجو">
        <PiStudent className={styles.icon} />
        {user?.student_position_persian ? (
          <TextOverflow className={styles.content}>
            {"دانشجوی " + user?.student_position_persian}
          </TextOverflow>
        ) : (
          <div className={styles.content}>
            <RxViewNone />
          </div>
        )}
      </div>

      <div className={styles.row} title="موقعیت مدرس">
        <LiaChalkboardTeacherSolid className={styles.icon} />
        {user?.lecturer_position_persian ? (
          <TextOverflow className={styles.content}>
            {user?.lecturer_position_persian}
          </TextOverflow>
        ) : (
          <div className={styles.content}>
            <RxViewNone />
          </div>
        )}
      </div>

      <div className={styles.row} title="موقعیت کارمند">
        <LiaUserTieSolid className={styles.icon} />
        {user?.employee_position ? (
          <TextOverflow className={styles.content}>
            {user?.employee_position}
          </TextOverflow>
        ) : (
          <div className={styles.content}>
            <RxViewNone />
          </div>
        )}
      </div>
    </div>
  );
}

export function Department({ data: user }) {
  return <TextOverflow>{user?.department?.title}</TextOverflow>;
}

export function Actions({ data: user, showDeleteBtn, className }) {
  const dispatch = useDispatch();

  const canModify = useSelector((state) =>
    canCurrentUserModifyThisUser(state, user)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  // const [isAddedToTempList, setIsAddedToTempList] = useState(false);
  const isUserIdInsideTempUsersTable = useSelector((state) =>
    selectIsUserIdInsideTempUsers(state, user._id)
  );

  const toggleAddedToTempList = () => {
    // setIsAddedToTempList((prev) => !prev);
    if(isUserIdInsideTempUsersTable){
      dispatch(removeUserIdFromTempUsersTable(user._id));
    } else {
      dispatch(addUserToTempUsersTable(user));
    }
  };

  const addToTempListBtnClassname = classNames(styles.addToTempListBtn, {
    [styles.active]: isUserIdInsideTempUsersTable,
  });

  const [triggerDelete] = useDeleteUserMutation();

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
      await triggerDelete(user?._id).unwrap();
      toast.success(
        <UserSuccessToast
          userFullname={user?.first_name + " " + user?.last_name}
          crudOperationType="deleted"
        />,
        resolvedToastOptions
      );
    } catch (err) {
      toast.error(<UserErrorToast err={err} />, resolvedToastOptions);
    } finally {
      toast.dismiss(id);
    }
  };

  // TODO: add to tempUsers button, show tick icon below list icon aff added already
  return (
    <div className={styles.buttons + " " + className}>
      <Button
        title="افزودن به لیست موقت"
        className={addToTempListBtnClassname}
        onClick={toggleAddedToTempList}
      >
        <HiOutlineClipboardList />
      </Button>
      <NavLinkButton
        title="مشاهده/ویرایش"
        className={styles.detailsBtn}
        to={`/users/${user?.username}`}
      >
        <BsInfoSquare />
      </NavLinkButton>
      {canModify && showDeleteBtn !== false && (
        <Button onClick={openModal} title="حذف" className={styles.removeBtn}>
          <RiDeleteBin6Line />
        </Button>
      )}
      <WarningModal
        data={user}
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
export function HeaderColumn({ className, title }) {
  return <h2 className={className + " " + styles.colName}>{title}</h2>;
}

// other components
// also use by user details ?
export const WarningParagraph = ({ data: user }) => (
  <>
    <p className={styles.modalWarningText}>آیا از حذف این کاربر مطمئن هستید؟</p>
    <p className={styles.modalWarningText}>
      <span className={styles.specialText}>
        {user?.first_name + " " + user?.last_name}
      </span>
    </p>
  </>
);

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
      <pre className={styles.toastErrorDetails}>{errorDetails}</pre>
    </>
  );
};

export const config = {
  tableInstanceName: tableInstanceNames.allUsers,
  tableInstanceNameText: "کاربران سامانه",
  queryHook: useGetUsersQuery,
  selectors: {
    selectFilterConfig: selectAllUsersFilterConfig,
  },

  skipQueryCallback: (filterConfig) => false, // never skip

  dataTableClassname: null,
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
      headerComponentProps: { title: "نام کاربری" },
      rowComponent: Username,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "نام و نام خانوادگی" },
      rowComponent: Fullname,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "سطح کاربری" },
      rowComponent: SystemRole,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "نقش سازمانی" },
      rowComponent: OrginazationPosition,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "دانشکده" },
      rowComponent: Department,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "عملیات" },
      rowComponent: Actions,
    },
  ],
};
