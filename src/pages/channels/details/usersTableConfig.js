import styles from "./usersTableConfig.module.scss";

import { tableInstanceNames } from "../../../redux/tableInstances";
import { useGetUsersOfChannelQuery } from "../../../redux/apiSlice";
import { selectUsersOfChannelFilterConfig } from "../../../redux/filterConfigSlice";

import TextOverflow from "../../../components/shared/TextOverflow";

import { toPersianDateStr } from "../../../utilities/utilities";

// cell components are same as cell components inside allUsers table
// so we import them here
import {
  RowIndex,
  ProfileImage,
  Username,
  Fullname,
  SystemRole,
  OrginazationPosition,
  Department,
  Actions as AllUsersTableActions,
  HeaderColumn,
} from "../../users/usersTableConfig";

// Other cell components that are specific to this table (usersOfChannel)
function JoinedAt({ data: user }) {
  const dateStr = user?.joined_at;
  return <TextOverflow>{toPersianDateStr(dateStr)}</TextOverflow>;
}

function MemberRole({ data: user }) {
  return <TextOverflow>{user?.member_role_persian}</TextOverflow>;
}

// prevent showing delete user button in actions cell
// because admin maybe think this button is meant to remove user from his channel
// but this button removes user from database
function Actions({ data: user }) {
  return (
    <AllUsersTableActions
      className={styles.buttons}
      data={user}
      showDeleteBtn={false}
    />
  );
}

export const config = {
  tableInstanceName: tableInstanceNames.usersOfChannel,
  tableInstanceNameText: 'اعضای کانال',
  queryHook: useGetUsersOfChannelQuery,
  selectors: {
    selectFilterConfig: selectUsersOfChannelFilterConfig
  },

  // takes filterConfig (when called inside data table) and returns
  // boolean to decide skip query or not
  // the query will skip if channel_id is not initialized
  // NOTE: skip option should be used on any component
  // that uses the query hook (DataTable, TableFooter)
  skipQueryCallback: (filterConfig) => filterConfig?.channelId === null,

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
      headerComponentProps: { title: "تاریخ عضویت" },
      rowComponent: JoinedAt,
    },
    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "نوع عضویت" },
      rowComponent: MemberRole,
    },

    {
      headerComponent: HeaderColumn,
      headerComponentProps: { title: "عملیات" },
      rowComponent: Actions,
    },
  ],
}
