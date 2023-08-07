import {useState, useMemo} from 'react';

import TextInput from '../../components/shared/table-search/TextInput';
import DropdownInput from '../../components/shared/table-search/DropdownInput';

import { useGetDepartmentsQuery } from '../../redux/apiSlice';

export default function useTableSearchConfig() {
//   const [inputComponentIndex, setInputComponentIndex] = useState(0);

  const primaryDropdownConfig = useMemo(() => ({
      initText: 'بر اساس...',
      options: [
        {
            value: 'title',
            text: 'نام کانال',
            // onClick: () => {
            //     setInputComponentIndex(1)
            // }
        },
        {
            value: 'identifier',
            text: 'شناسه کانال',
            // onClick: () => {
            //     setInputComponentIndex(2);
            // }
        },
        {
            value: 'owner',
            text: 'مدیر کانال',
            // onClick: () => {
            //     setInputComponentIndex(3);
            // }
        },
        {
            value: 'department',
            text: 'دانشکده',
            // onClick: () => {
            //     setInputComponentIndex(4);
            // }
        },
      ],
  }), []);

  const departmentsDropdownConfig = useMemo(() => ({
      initText: 'دانشکده',
      queryHook: useGetDepartmentsQuery,
      idFieldName: '_id', // property of data to set on filter config
      valueFieldName: 'title', // property of data to show inside list of options
  }), []);

  const inputComponents = useMemo(() => {
    return [
        // {component: TextInput, props: {placeholder: 'جست و جو'}},
        {component: TextInput, props: {placeholder: 'نام کانال'}},
        {component: TextInput, props: {placeholder: 'شناسه کانال'}},
        {component: TextInput, props: {placeholder: 'نام یا نام کابری مدیر کانال'}},
        // {component: TextInput, props: {placeholder: 'دانشکده'}},
        {component: DropdownInput, props: {config: departmentsDropdownConfig}},
    ];
}, [departmentsDropdownConfig]);

  return {
    primaryDropdownConfig,
    inputComponents,
  }
}