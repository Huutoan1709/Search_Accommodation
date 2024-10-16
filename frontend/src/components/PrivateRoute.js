import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../context/MyContext';
import { notifyError } from '../components/ToastManager';

const PrivateRoute = ({ element: Component }) => {
    const { user, fetchUser } = useContext(MyContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access-token');
        if (!user && token) {
            fetchUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, fetchUser]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const isAuthenticated = user && (user.role === 'WEBMASTER' || user.is_staff || user.is_superuser);

    if (isAdminRoute && !isAuthenticated) {
        notifyError('Bạn không có quyền truy cập vào trang này.');
        return <Navigate to="/" />;
    }

    return user ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
