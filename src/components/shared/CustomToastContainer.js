import 'react-toastify/dist/ReactToastify.css';
import styles from './CustomToastContainer.module.scss';

import { ToastContainer, Slide } from 'react-toastify';

const autoClose = 3000;

// options for a toast that represents a resolved promise (fulfilled or rejected)
// used by logout toast (in ProfileCard.js), delete toast
export const resolvedToastOptions = {
    isLoading: false,
    autoClose,
    closeOnClick: true,
    draggable: true
}

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