import styles from './Dropdown.module.scss';

import {useState, useRef, useEffect, useCallback} from 'react';
import classNames from 'classnames';

import {HiOutlineChevronDown} from 'react-icons/hi';

function Dropdown({
  config,
  setSearchField,
  setDisplaySearchField,
  setSearchValue,
  setDisplaySearchValue,
  selectedComponentIndex,
  setSelectedComponentIndex,
}) {
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedText, setSelectedText] = useState(config.initText);
  // const [selectedIndex, setSelectedIndex] = useState(0);

  const dropDownRef = useRef(null);

  const toggleDropdown = useCallback(() => {
    // console.log('toggle');
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    // console.log('close');
    setIsOpen(false);
  }, []);

  const handleDocumentClick = useCallback((event) => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      closeDropdown();
    }
  }, [closeDropdown]);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [handleDocumentClick]);

  const optionsContainerClassname = classNames(styles.optionsContainer, {
    [styles.hidden]: !isOpen,
  });
  const iconClassname = classNames(styles.icon, {[styles.rotate]: isOpen});
  // console.log(isOpen);

  const renderedOptions = config.options.map((option, index) => {
    const handleClick = () => {
      // option.onClick();
      // setSelectedText(option.text);
      setSelectedComponentIndex(index);
      setSearchField(option.value);
      setDisplaySearchField(option.text);
      setSearchValue('');
      setDisplaySearchValue('');
    };
    return (
      <div key={index} className={styles.option} onClick={handleClick}>
        {option.text}
      </div>
    )
  });

  return (
    <div className={styles.Dropdown} onClick={toggleDropdown} ref={dropDownRef}>
      <HiOutlineChevronDown className={iconClassname} />
      <div className={styles.selectedOption}>
        {
          selectedComponentIndex >= 0 ? 
            config.options[selectedComponentIndex].text 
            : config.initText
        }
      </div>
      <div className={optionsContainerClassname}>
        {renderedOptions}
      </div>
    </div>
  );
}

export default Dropdown;