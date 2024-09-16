import React, { useReducer, useEffect } from 'react';
import MyUserReducer from '../reducers/MyUserReducer';
import MyContext from './MyContext';

const UserProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    useEffect(() => {
        // On initial render, check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            dispatch({ type: 'login', payload: JSON.parse(storedUser) });
        }
    }, []);

    const login = (userData) => {
        // Save user data to localStorage and update context state
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch({ type: 'login', payload: userData });
    };

    const logout = () => {
        // Remove user data from localStorage and reset state
        localStorage.removeItem('user');
        dispatch({ type: 'logout' });
    };

    return <MyContext.Provider value={{ user, login, logout }}>{children}</MyContext.Provider>;
};

export default UserProvider;
