import React, { useReducer, useEffect, useCallback } from 'react';
import MyUserReducer from '../reducers/MyUserReducer';
import MyContext from './MyContext';
import APi, { endpoints, authApi } from '../API';

const UserProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    useEffect(() => {
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

    const fetchUser = useCallback(async () => {
        try {
            const result = await authApi().get(endpoints.currentuser);
            dispatch({ type: 'login', payload: result.data });
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    }, []);

    return <MyContext.Provider value={{ user, login, logout, fetchUser }}>{children}</MyContext.Provider>;
};

export default UserProvider;
