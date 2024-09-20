import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../context/MyContext';

const PrivateRoute = ({ element: Component }) => {
    const { user, fetchUser } = useContext(MyContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If there's no user data but an access token, fetch the user info
        const token = localStorage.getItem('access-token');
        if (!user && token) {
            fetchUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, fetchUser]);

    // Display a loading message while fetching user data
    if (loading) {
        return <div>Loading...</div>;
    }

    // Check if the user exists, else redirect to login
    return user ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
