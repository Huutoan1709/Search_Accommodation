import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../context/MyContext';

const PrivateRoute = ({ element: Component }) => {
    const { user } = useContext(MyContext);
    return user ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
