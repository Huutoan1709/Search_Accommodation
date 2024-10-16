import React, { useState, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';
import Header from '../../DefaultLayout/Header';
import MyContext from '../../../context/MyContext';
import { notifySuccess, notifyWarning } from '../../../components/ToastManager';
import Footer from '../../DefaultLayout/footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useContext(MyContext);

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
                const userData = response.data;
                localStorage.setItem('access-token', userData.access_token);
                notifySuccess('Đăng nhập thành công');
                login(userData);

                const userInfoResponse = await API.get(endpoints['currentuser'], {
                    headers: {
                        Authorization: `Bearer ${userData.access_token}`,
                    },
                });

                const userInfo = userInfoResponse.data;
                login(userInfo);

                if (userInfo.is_staff || userInfo.role === 'WEBMASTER') {
                    navigate('/admin/overview');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            notifyWarning('Vui lòng kiểm tra thông tin');
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
    };

    const handleGoogleLoginSuccess = async (response) => {
        const googleToken = response.credential;
        console.log('Google Token:', googleToken);

        try {
            // 1. Giải mã token JWT (id_token) để lấy thông tin người dùng
            const decodedToken = jwtDecode(googleToken);
            console.log('Decoded Google User Info:', decodedToken);

            // 2. Lưu thông tin người dùng từ Google
            const googleUserInfo = {
                first_name: decodedToken.given_name,
                last_name: decodedToken.family_name,
                email: decodedToken.email,
                avatar: decodedToken.picture,
            };

            // 3. Chuyển token Google tới backend để xác thực
            const formData = new FormData();
            formData.append('token', googleToken);
            formData.append('client_id', '7gS8oCrdq9x2rfSnqgPG27zdPWsPbA82erZThYH0');
            formData.append(
                'client_secret',
                'NwUGjlwU12WU7wxyWjv6tbbEK7oV8dl3CHoXNRIBruwT3cPZc8lpc5RJzJhBCdfKQKpy2F6xUzIxlVgb9m0gBphmVHLSupWIFTBkdWU6R8hNrJNOacOA6tEH220Hk9i0',
            );
            formData.append('grant_type', 'convert_token');
            formData.append('backend', 'google-oauth2');

            const response = await API.post(endpoints['login'], formData);

            if (response.status === 200) {
                const userData = response.data;

                // Lưu thông tin người dùng từ Google và từ backend
                const user = {
                    ...userData,
                    ...googleUserInfo,
                };

                localStorage.setItem('access-token', userData.access_token);
                localStorage.setItem('user', JSON.stringify(user)); // Lưu thông tin người dùng trong localStorage

                notifySuccess('Đăng nhập thành công với Google');
                login(user);
                navigate('/');
            }
        } catch (error) {
            notifyWarning('Đăng nhập bằng Google thất bại');
            console.error('Google login failed:', error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <GoogleOAuthProvider clientId="523523903240-ukrka3u9ki6i991qcc0nb04st1pjpmhl.apps.googleusercontent.com">
            <div>
                <Header />
                <div className="flex justify-center items-center bg-gray-100">
                    <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg mt-10">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Đăng Nhập</h2>
                        {error && <p className="text-lg text-red-500 mb-4">{error}</p>}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Existing username/password fields */}
                            <div>
                                <label className="block text-2xl font-medium text-gray-700 mb-2">Tên đăng nhập:</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-2xl font-medium text-gray-700 mb-2">Mật khẩu:</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer mt-8"
                                    onClick={togglePasswordVisibility}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={30} />
                                </span>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 text-2xl font-semibold text-white bg-red-500 rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                Đăng nhập
                            </button>
                        </form>

                        {/* Google Login Button */}
                        <div className="mt-6 text-lg text-center">
                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={() => notifyWarning('Đăng nhập Google thất bại')}
                            />
                        </div>

                        <p className="mt-6 text-lg text-center">
                            Bạn quên mật khẩu?{' '}
                            <a href="/reset-password" className="text-red-600 hover:text-red-500">
                                Đặt lại mật khẩu
                            </a>
                        </p>
                        <p className="mt-4 text-lg text-center">
                            Bạn chưa có tài khoản?{' '}
                            <a href="/register" className="text-red-600 hover:text-red-500">
                                Đăng ký
                            </a>
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        </GoogleOAuthProvider>
    );
}

export default Login;
