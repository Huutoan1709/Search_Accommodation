import React, { useReducer, useEffect, useCallback } from 'react';
import MyUserReducer from '../reducers/MyUserReducer';
import MyContext from './MyContext';
import API, { endpoints, authApi } from '../API';
import { notifySuccess } from '../components/ToastManager';

const UserProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    const fetchUser = useCallback(async () => {
        try {
            const result = await authApi().get(endpoints.currentuser);
            dispatch({ type: 'login', payload: result.data });

            localStorage.setItem('user', JSON.stringify(result.data));
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access-token');

        if (storedUser) {
            dispatch({ type: 'login', payload: JSON.parse(storedUser) });
        } else if (token) {
            fetchUser();
        } else {
            logout();
        }
    }, [fetchUser]);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token);
        dispatch({ type: 'login', payload: userData });
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access-token');
        localStorage.removeItem('favorites');
        dispatch({ type: 'logout' });
    };

    return <MyContext.Provider value={{ user, login, logout, fetchUser }}>{children}</MyContext.Provider>;
};

export default UserProvider;
