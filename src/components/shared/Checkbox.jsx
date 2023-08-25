import styles from "./Checkbox.module.scss";

import { useState, useCallback } from "react";

import { FaCheck } from "react-icons/fa";

function Checkbox({ className, label, onClick, isCheckedProp }) {
  // why we made internal state ?
  // why not make this a controlled component ? (determined by parent state)
  // because in message details page (<MessageInfo/>)
  // we used ref (not state) to store check status
  // I call it semi controlled component :/
  const [isChecked, setIsChecked] = useState(Boolean(isCheckedProp));

  const handleClick = useCallback(() => {
    setIsChecked((prev) => {
      if (typeof onClick === "function") {
        onClick(!prev);
      }
      return !prev;
    });
  }, [onClick]);

  return (
    <div className={className + " " + styles.Checkbox} onClick={handleClick}>
      <div className={styles.check}>
        {isChecked && <FaCheck className={styles.checkIcon} />}
      </div>
      {label}
    </div>
  );
}

export default Checkbox;
