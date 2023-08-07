import "react-toastify/dist/ReactToastify.css";
import styles from "./CustomToastContainer.module.scss";

import { ToastContainer, Slide } from "react-toastify";

const autoClose = 3000;

// options for a toast that represents a resolved promise (fulfilled or rejected)
// used by logout toast (in ProfileCard.js), delete toast
export const resolvedToastOptions = {
  isLoading: false,
  autoClose,
  closeOnClick: true,
  draggable: true,
};

// these toast Ids are used to prevent duplicate toast
// if user presses submit multiple times
export const customToastIds = {
  // Id of the toast that is fired when user hits submit with empty input
  emptyInput: "emptyInput",
  // Id of the toast that is fired when user hits submit but input is same as current data
  unchangedInput: "unchangedInput",
};

function CustomToastContainer() {
  return (
    <ToastContainer
      toastClassName={styles.toast}
      transition={Slide}
      position="bottom-left"
      autoClose={autoClose}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}

export default CustomToastContainer;
