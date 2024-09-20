import React, { useReducer, useEffect, useCallback } from 'react';
import MyUserReducer from '../reducers/MyUserReducer';
import MyContext from './MyContext';
import API, { endpoints, authApi } from '../API';

const UserProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    // Fetch user info from API
    const fetchUser = useCallback(async () => {
        try {
            const result = await authApi().get(endpoints.currentuser);
            dispatch({ type: 'login', payload: result.data });
            // Save user info to localStorage after fetching from API
            localStorage.setItem('user', JSON.stringify(result.data));
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        }
    }, []);

    useEffect(() => {
        // Check if there's user info in localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access-token'); // Ensure correct token key

        if (storedUser) {
            // If user is already in localStorage, log them in
            dispatch({ type: 'login', payload: JSON.parse(storedUser) });
        } else if (token) {
            // If no user but there's a token, fetch user info from the API
            fetchUser();
        } else {
            // Handle logout if no token or user
            logout();
        }
    }, [fetchUser]);

    // Login function
    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token); // Save token with correct key
        dispatch({ type: 'login', payload: userData });
    };

    // Logout function
    const logout = () => {
        // Clear user and token from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('access-token'); // Correct token key
        localStorage.removeItem('favorites');
        dispatch({ type: 'logout' });
    };

    return <MyContext.Provider value={{ user, login, logout, fetchUser }}>{children}</MyContext.Provider>;
};

export default UserProvider;
