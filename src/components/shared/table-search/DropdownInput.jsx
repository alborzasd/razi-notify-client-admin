import styles from "./DropdownInput.module.scss";

import { useState, useRef, useEffect, useCallback } from "react";
import classNames from "classnames";

import { CircleSpinner } from "react-spinners-kit";
import { HiOutlineChevronDown } from "react-icons/hi";
import RtlScrollbars from "../RtlScrollbars";

function DropdownInput({
  config,
  searchValue,
  setSearchValue,
  setDisplaySearchValue,
  containerClassname,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState();

  const dropDownRef = useRef(null);

  const toggleDropdown = useCallback(() => {
    // console.log('toggle');
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    // console.log('close');
    setIsOpen(false);
  }, []);

  const handleDocumentClick = useCallback(
    (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [handleDocumentClick]);

  useEffect(() => {
    // searchValue is reset onSubmit
    // so we need to reset dropdown also
    if (!searchValue) {
      setSelectedIndex(-1);
    }
  }, [searchValue]);

  // useEffect(() => {
  //   setSearchValue(''); // clear previous values saved in TextInput
  // }, [setSearchValue]);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    config.queryHook(undefined, {
      // skip: !isOpen, // fetch data only if the dropdown gets opened
    });
  // console.log('data', data, 'isLoading', isLoading, 'isFetching', isFetching);

  const optionsContainerClassname = classNames(styles.optionsContainer, {
    [styles.hidden]: !isOpen,
  });
  const iconClassname = classNames(styles.icon, { [styles.rotate]: isOpen });
  // console.log(isOpen);

  const renderedOptions = (data || []).map((option, index) => {
    const handleClick = () => {
      // option.onClick();
      setSelectedIndex(index);
      setSearchValue(option?.[config.idFieldName]);
      setDisplaySearchValue(option?.[config.valueFieldName]);
    };
    return (
      <div key={index} className={styles.option} onClick={handleClick}>
        {option?.[config.valueFieldName]}
      </div>
    );
  });

  let content;
  if (isLoading || isFetching) {
    content = (
      <StatusContainer>
        {" "}
        <CircleSpinner color={styles.primaryColor} />{" "}
      </StatusContainer>
    );
  } else if (isError) {
    content = (
      <StatusContainer>
        {" "}
        <p className={styles.errorMessage}>{error?.message}</p>{" "}
      </StatusContainer>
    );
  } else if (isSuccess && (data?.length === 0 || !data)) {
    content = (
      <StatusContainer>
        {" "}
        <p>موردی یافت نشد.</p>{" "}
      </StatusContainer>
    );
  } else {
    content = (
      <div className={styles.optionsScrollContainer}>
        <RtlScrollbars>{renderedOptions}</RtlScrollbars>
      </div>
    );
  }

  return (
    <div
      className={styles.DropdownInput + ' ' + containerClassname}
      onClick={toggleDropdown}
      ref={dropDownRef}
    >
      <HiOutlineChevronDown className={iconClassname} />
      <div className={styles.selectedOption}>
        {selectedIndex >= 0
          ? data?.[selectedIndex]?.[config.valueFieldName]
          : config.initText}
      </div>
      <div className={optionsContainerClassname}>{content}</div>
    </div>
  );
}

function StatusContainer({ children }) {
  return <div className={styles.StatusContainer}>{children}</div>;
}

export default DropdownInput;
