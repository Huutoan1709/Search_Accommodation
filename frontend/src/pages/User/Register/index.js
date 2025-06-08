import React, { useState } from 'react';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';
import Header from '../../DefaultLayout/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import * as yup from 'yup';
import Footer from '../../DefaultLayout/footer';
import { notifyError, notifySuccess } from '../../../components/ToastManager';

function Register() {
    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('CUSTOMER');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const schema = yup.object().shape({
        email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
        phone: yup
            .string()
            .matches(/^[0-9]+$/, 'Số điện thoại phải là số từ 0-9')
            .required('Số điện thoại là bắt buộc'),
        password: yup
            .string()
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                'Mật khẩu tối thiểu phải chứa 8 ký tự, có ít nhất 1 ký tự thường, hoa và số, không chứa ký tự đặc biệt',
                
            )
            .required('Mật khẩu là bắt buộc'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp')
            .required('Xác nhận mật khẩu là bắt buộc'),
    });

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            await schema.validate({ email, phone, password, confirmPassword });
        } catch (error) {
            setError(error.message);
            return;
        }

        try {
            const response = await API.post(endpoints.register, {
                first_name,
                last_name,
                username,
                email,
                phone,
                password,
                role,
            });

            if (response.status === 201) {
                notifySuccess('Đăng ký thành công!');
                navigate('/login');
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                const errors = err.response.data;
                if (errors.email) {
                    setError('Email đã tồn tại.');
                    notifyError('Email đã tồn tại.Hãy đổi email khác');
                } else if (errors.phone) {
                    setError('Số điện thoại đã tồn tại.');
                    notifyError('Số điện thoại đã tồn tại.Hãy sử dụng số điện thoại khác');
                } else {
                    setError('Có lỗi xảy ra khi đăng ký: ' + err.response.data.message);
                }
            } else {
                setError('Có lỗi xảy ra khi đăng ký: ' + err.message);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center bg-gray-100 min-h-screen py-12">
                <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Đăng Ký Tài Khoản</h2>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Họ</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                                <input
                                    type="text"
                                    placeholder="Nhập họ"
                                    value={first_name}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div>
                            <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Tên</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                                <input
                                    type="text"
                                    placeholder="Nhập tên"
                                    value={last_name}
                                    onChange={(e) => setLastname(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                        <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Email</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                        <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                            <input
                                type="tel"
                                placeholder="0123456789"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                        <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center px-3"
                                    onClick={togglePasswordVisibility}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div>
                        <div className='flex items-center mb-1'>
                                <label className="block text-xl font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                                <label className="block text-xl text-red-700 font-bold mb-1">(*)</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xl font-medium text-gray-700 mb-2">Bạn là:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="CUSTOMER"
                                        checked={role === 'CUSTOMER'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <span className="ml-2">Người thuê trọ</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="LANDLORD"
                                        checked={role === 'LANDLORD'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <span className="ml-2">Chủ trọ</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                        >
                            Đăng Ký
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Đã có tài khoản?{' '}
                        <a href="/login" className="text-red-600 hover:text-red-700 font-medium">
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Register;
