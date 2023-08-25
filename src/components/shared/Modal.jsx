import styles from "./Modal.module.scss";

import React, { useState } from "react";

import ReactDom from "react-dom";

import Button from "./Button";

// import {PiWarning} from "react-icons/pi";
import { CgDanger } from "react-icons/cg";
// import { FiChevronLeft } from "react-icons/fi";

function Modal({ children, isModalOpen, closeModal }) {
  if (!isModalOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    closeModal();
  };

  return ReactDom.createPortal(
    <>
      <div onClick={handleOverlayClick} className={styles.overlay}></div>
      {children}
    </>,
    document.getElementById("modal")
  );
}

function WarningModal({
  data,
  WarningParagraph,
  onConfirmClick,
  isModalOpen,
  closeModal,
  confirmButtonText,
}) {
  return (
    <Modal isModalOpen={isModalOpen} closeModal={closeModal}>
      <div className={styles.WarningModal}>
        <div className={styles.title}>
          <CgDanger className={styles.icon} />
          <h2>هشدار</h2>
        </div>
        <div className={styles.bodyContainer}>
          <WarningParagraph data={data} />
        </div>
        <Button onClick={() => closeModal()} className={styles.cancelBtn}>
          انصرف
        </Button>
        <Button
          onClick={() => {
            closeModal();
            onConfirmClick();
          }}
          className={styles.deleteBtn}
        >
          {confirmButtonText}
        </Button>
      </div>
    </Modal>
  );
}

// modal to take a group of data from file
// then send request to server
// show loading, result data or error based on state
// show cancel/continue button
function GroupOperationModal({ config, isModalOpen, closeModal }) {
  const headerIconElement = config?.headerIconElement;
  const headerIconElementCloned = React.cloneElement(headerIconElement, {
    ...headerIconElement?.props,
    className: headerIconElement?.props?.className + " " + styles.icon,
  });

  const Body = config?.bodyComponent;

  // const handleCancelClick = () => {
  //   closeModal();
  // };

  return (
    // an empty callback is passed to closeModal prop for the <Modal/>
    // because we want the modal being closed only when clicking the cancel button
    // when sending request to server, the cancel button is hidden
    <Modal isModalOpen={isModalOpen} closeModal={() => null}>
      <div className={styles.GroupOperationModal}>
        <div className={styles.header + " " + config?.classNames?.header}>
          {headerIconElementCloned}
          <h2 className={styles.title}>{config?.headerTitle}</h2>
        </div>
        <div className={styles.bodyContainer}>
          <Body closeModal={closeModal} />
        </div>
        {/* <Button onClick={handleCancelClick} className={styles.cancelBtn}>
          انصراف
        </Button>
        <Button className={styles.continueBtn}>
          ادامه
          <FiChevronLeft />
        </Button> */}
      </div>
    </Modal>
  );
}

export { WarningModal, GroupOperationModal };

// warning message paragraph

export const MessageDeleteWarning = ({ data: message }) => {
  return (
    <>
      <p className={styles.modalWarningText}>
        <span>آیا از حذف پیام</span>&nbsp;
        <span className={styles.specialText}>{message?.title}</span>&nbsp;
        <span>مطمئن هستید؟</span>
      </p>
    </>
  );
};

export const ChannelDeleteWarning = ({ data: channel }) => {
  return (
    <>
      <p className={styles.modalWarningText}>
        با حذف این کانال، محتوا و پیام های آن نیز پاک خواهد شد.
      </p>
      <p className={styles.modalWarningText}>
        <span>آیا از حذف کانال</span>&nbsp;
        <span className={styles.specialText}>{channel?.title}</span>&nbsp;
        <span>مطمئن هستید؟</span>
      </p>
    </>
  );
};

export const UserDeleteWarning = ({ data: user }) => {
  return (
    <>
      <p className={styles.modalWarningText}>
        <span className={styles.specialText}>
          با حذف هر کاربر تمام کانال ها و پیام های ایجاد شده توسط آن کاربر حذف
          خواهد شد.
        </span>
      </p>
      <p className={styles.modalWarningText}>
        آیا از حذف این کاربر مطمئن هستید؟
      </p>
      <p className={styles.modalWarningText}>
        <span className={styles.specialText}>
          {user?.first_name + " " + user?.last_name}
        </span>
      </p>
    </>
  );
};
