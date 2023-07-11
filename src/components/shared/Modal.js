import styles from './Modal.module.scss';

import ReactDom from 'react-dom';

import Button from './Button';

// import {PiWarning} from "react-icons/pi";
import {CgDanger} from "react-icons/cg";

function Modal({children, isOpen, setIsOpen}) {
  if(!isOpen) {
    return null;
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  return ReactDom.createPortal(
    <>
      <div onClick={closeModal} className={styles.overlay}></div>
      {children}      
    </>,
    document.getElementById('modal')
  );
}

function WarningModal({
  data,
  WarningParagraph,
  onConfirmClick,
  isOpen,
  setIsOpen,
  confirmButtonText,
}) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className={styles.WarningModal}>
        <div className={styles.title}>
          <CgDanger className={styles.icon} />
          <h2>هشدار</h2>
        </div>
        <div className={styles.body}>
          <WarningParagraph data={data} />
        </div>        
        <Button 
          onClick={() => {setIsOpen(false); onConfirmClick();}}
          className={styles.deleteBtn}>
          {confirmButtonText}
        </Button>
        <Button 
          onClick={() => setIsOpen(false)}
          className={styles.cancelBtn}>
          انصرف
        </Button>
      </div>
    </Modal>
  );
}

export {WarningModal};
