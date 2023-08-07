import TextInput from "../../components/shared/table-search/TextInput";
import DropdownInput from "../../components/shared/table-search/DropdownInput";

import {
  useGetDepartmentsQuery,
  useGetLecturerPositionsQuery,
  useGetStudentPositionsQuery,
  useGetSystemRolesQuery,
} from "../../redux/apiSlice";

export const primaryDropdownConfig = {
  initText: "بر اساس",
  options: [
    {
      value: "username",
      text: "نام کاربری",
    },
    {
      value: "fullname",
      text: "نام و نام خانوادگی",
    },
    {
      value: "system_role",
      text: "سطح کاربری",
    },
    {
      value: "student_position",
      text: "موقعیت دانشجو",
    },
    {
      value: "lecturer_position",
      text: "موقعیت مدرس",
    },
    {
      value: "employee_position",
      text: "موقعیت کارمند",
    },
    {
      value: "department_id",
      text: "دانشکده",
    },
  ],
};

const systemRoleDropdownConfig = {
  initText: "سطح کاربری",
  queryHook: useGetSystemRolesQuery,
  idFieldName: "title", // property of data to set on filter config
  valueFieldName: "title_persian", // property of data to show inside list of options
};

const studentPositionDropdownConfig = {
  initText: "موقعیت دانشجو",
  queryHook: useGetStudentPositionsQuery,
  idFieldName: "title", // property of data to set on filter config
  valueFieldName: "title_persian", // property of data to show inside list of options
};

const lecturerPositionDropdownConfig = {
  initText: "موقعیت مدرس",
  queryHook: useGetLecturerPositionsQuery,
  idFieldName: "title", // property of data to set on filter config
  valueFieldName: "title_persian", // property of data to show inside list of options
};

const departmnetsDropdownConfig = {
  initText: "دانشکده",
  queryHook: useGetDepartmentsQuery,
  idFieldName: "_id", // property of data to set on filter config
  valueFieldName: "title", // property of data to show inside list of options
};

export const inputComponents = [
  {component: TextInput, props: {placeholder: 'نام کاربری'}},
  {component: TextInput, props: {placeholder: 'نام و نام خانوادگی'}},
  {component: DropdownInput, props: {config: systemRoleDropdownConfig}},
  {component: DropdownInput, props: {config: studentPositionDropdownConfig}},
  {component: DropdownInput, props: {config: lecturerPositionDropdownConfig}},
  {component: TextInput, props: {placeholder: 'موقعیت کارمند'}},
  {component: DropdownInput, props: {config: departmnetsDropdownConfig}},
];
