import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notifySuccess = (message) => {
    toast.success(message);
};

export const notifyError = (message) => {
    toast.error(message);
};

export const notifyWarning = (message) => {
    toast.warning(message);
};

export const ToastManager = () => {
    return <ToastContainer position="top-right" autoClose={2000} />;
};
