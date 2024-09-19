import React, { useReducer, useEffect, useCallback } from 'react';
import MyUserReducer from '../reducers/MyUserReducer';
import MyContext from './MyContext';
import API, { endpoints, authApi } from '../API';

const UserProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    // Hàm lấy thông tin user từ API
    const fetchUser = useCallback(async () => {
        try {
            const result = await authApi().get(endpoints.currentuser);
            dispatch({ type: 'login', payload: result.data });
            // Lưu thông tin user vào localStorage sau khi lấy từ API
            localStorage.setItem('user', JSON.stringify(result.data));
        } catch (error) {
            console.error('Failed to fetch user', error);
            // Xử lý logout nếu không thể lấy thông tin user (ví dụ token hết hạn)
            logout();
        }
    }, []);

    useEffect(() => {
        // Kiểm tra xem có thông tin user trong localStorage hay không
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessoken');

        if (storedUser) {
            // Nếu đã có user trong localStorage thì login
            dispatch({ type: 'login', payload: JSON.parse(storedUser) });
        } else if (token) {
            // Nếu không có user nhưng có token, thì gọi API để lấy thông tin user
            fetchUser();
        } else {
            // Nếu không có token hoặc user thì xử lý logout (nếu cần)
            logout();
        }
    }, [fetchUser]);

    // Hàm login
    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token); // Lưu token nếu cần
        dispatch({ type: 'login', payload: userData });
    };

    // Hàm logout
    const logout = () => {
        // Xoá user và token từ localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        dispatch({ type: 'logout' });
    };

    return <MyContext.Provider value={{ user, login, logout, fetchUser }}>{children}</MyContext.Provider>;
};

export default UserProvider;
