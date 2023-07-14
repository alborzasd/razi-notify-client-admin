import styles from "./tempUsersTableConfig.module.scss";

import { useDispatch } from "react-redux";
import {
  removeUserIdFromTempUsersTable,
  useSelectAllTempUsersQuery,
} from "../../redux/tempUsersSlice";

import { tableInstanceNames } from "../../redux/tableInstances";

import { selectTempUsersFilterConfig } from "../../redux/filterConfigSlice";

import Button, { NavLinkButton } from "../../components/shared/Button";

import { BsInfoSquare } from "react-icons/bs";
import { LuFilterX } from "react-icons/lu";

// import cell components that are used for allUsers table
import {
  RowIndex,
  ProfileImage,
  Username,
  Fullname,
  SystemRole,
  OrginazationPosition,
  Department,
  HeaderColumn,
} from "../users/usersTableConfig";

// cell components that are specific to this table
function Actions({ data: user }) {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeUserIdFromTempUsersTable(user?._id));
  };

  return (
    <div className={styles.buttons}>
      <NavLinkButton
        title="مشاهده/ویرایش"
        className={styles.detailsBtn}
        to={`/users/${user?.username}`}
      >
        <BsInfoSquare />
      </NavLinkButton>

      <Button
        onClick={handleRemove}
        title="حذف از لیست موقت"
        className={styles.removeFromTempListBtn}
      >
        <LuFilterX />
      </Button>
    </div>
  );
}

export const config = {
  // data source is from network or it's local
  // used to decied render footer or not
  dataSourceType: "local",

  tableInstanceName: tableInstanceNames.tempUsers,
  tableInstanceNameText: "لیست موقت",
  queryHook: useSelectAllTempUsersQuery,
  selectors: {
    selectFilterConfig: selectTempUsersFilterConfig,
  },

  skipQueryCallback: (filterConfig) => false,

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
