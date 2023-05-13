import 'react-toastify/dist/ReactToastify.css';
import styles from './CustomToastContainer.module.scss';

import { ToastContainer, Slide } from 'react-toastify';

const autoClose = 3000;

export const toastOptions = {
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