import styles from './TableSearch.module.scss';

import {useState} from 'react';

import {useDispatch} from 'react-redux';
import {setFilterConfig} from '../../../redux/filterConfigSlice';

import classNames from 'classnames';

import Dropdown from './Dropdown';
import Button from '../Button';

// import {BiSearch} from 'react-icons/bi';
import {HiOutlineSearch} from 'react-icons/hi';

function TableSearch({
  className,
  primaryDropdownConfig,
  inputComponents,
  tableInstanceName,
}) {
  const dispatch = useDispatch();

  // index of the input component to render (text, dropdown, datepicker, ...)
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(0);

  const [searchField, setSearchField] = useState(
    primaryDropdownConfig.options[selectedComponentIndex].value
  );
  const [displaySearchField, setDisplaySearchField] = useState(
    primaryDropdownConfig.options[selectedComponentIndex].text
  );
  const [searchValue, setSearchValue] = useState('');
  const [displaySearchValue, setDisplaySearchValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('submit', searchValue);
    if(searchField /*&& searchValue*/) {
      // console.log('searchField', searchField);
      // console.log('searchValue', searchValue);
      dispatch(setFilterConfig({
        instanceName: tableInstanceName,
        config: {
            searchField,
            displaySearchField,
            searchValue,
            displaySearchValue,
        }
    }));
    }
    // setSearchValue('');
  }

  const InputComponent = inputComponents[selectedComponentIndex].component;
  const inputComponentProps = inputComponents[selectedComponentIndex].props;

  return (
    <form 
      className={classNames(styles.TableSearch, className)}
      onSubmit={handleSubmit}>

      <InputComponent
        {...inputComponentProps}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        setDisplaySearchValue={setDisplaySearchValue}
        // each drop down must be unique component
        // so each dropdown has it's own query hook (no one dropdown with multiple query hooks)
        // if not specifying key
          // the first dropdown selected by user will call it's query hook to fetch items
          // but the query of second dropdown selected by user will freeze in loading state
          // (the first and second dropdown are same, but rerender with new query hook)
          // I don't know why it happens exactly
          // If between selecting first and second dropdown
          // user selects a textinput
          // the bug will not show
          // because the dropdown has unmounted and mounted between selection
        key={selectedComponentIndex} />

      <Dropdown 
        config={primaryDropdownConfig} 
        setSearchField={setSearchField}
        setDisplaySearchField={setDisplaySearchField}
        setSearchValue={setSearchValue}
        setDisplaySearchValue={setDisplaySearchValue}
        selectedComponentIndex={selectedComponentIndex}
        setSelectedComponentIndex={setSelectedComponentIndex} />

      <Button className={styles.searchButton}>
        <HiOutlineSearch />
      </Button>

    </form>
  );
}

export default TableSearch;