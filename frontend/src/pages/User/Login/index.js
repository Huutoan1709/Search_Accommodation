import React, { useState, useContext } from 'react';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Header from '../../DefaultLayout/Header';
import MyContext from '../../../context/MyContext'; // Import context
import { notifySuccess } from '../../../components/ToastManager';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(MyContext); // Get login function from context

    const handleLogin = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('client_id', '7gS8oCrdq9x2rfSnqgPG27zdPWsPbA82erZThYH0');
        formData.append(
            'client_secret',
            'NwUGjlwU12WU7wxyWjv6tbbEK7oV8dl3CHoXNRIBruwT3cPZc8lpc5RJzJhBCdfKQKpy2F6xUzIxlVgb9m0gBphmVHLSupWIFTBkdWU6R8hNrJNOacOA6tEH220Hk9i0',
        );
        formData.append('grant_type', 'password');

        try {
            const response = await API.post(endpoints['login'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                const userData = response.data; // Get the user data from response
                localStorage.setItem('access-token', userData.access_token);
                notifySuccess('Đăng nhập thành công');
                login(userData); // Call login from context to save user data
                navigate('/');
            }
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <Header />
            <div className="flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg mt-[130px]">
                    <h2 className="text-xl font-bold text-center text-gray-900">Đăng Nhập</h2>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu:</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </span>
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-sm
                            font-medium text-white bg-yellow-500 rounded-md shadow hover focus "
                        >
                            {' '}
                            Đăng nhập{' '}
                        </button>{' '}
                    </form>{' '}
                    <p className="mt-4 text-sm text-center">
                        Bạn quên mật khẩu?{' '}
                        <a href="/reset-password" className="text-yellow-600 hover:text-yellow-500">
                            Đặt lại mật khẩu
                        </a>
                    </p>
                    <p className="mt-4 text-sm text-center">
                        {' '}
                        Bạn chưa có tài khoản?{' '}
                        <a href="/register" className="text-yellow-600 hover:text-yellow-500">
                            Đăng ký
                        </a>{' '}
                    </p>{' '}
                </div>{' '}
            </div>{' '}
        </div>
    );
}

export default Login;
