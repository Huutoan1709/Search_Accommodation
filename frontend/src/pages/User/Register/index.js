import React, { useState } from 'react';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';
import Header from '../../DefaultLayout/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import * as yup from 'yup';
import Footer from '../../DefaultLayout/footer';
import { notifyError, notifySuccess, notifyWarning } from '../../../components/ToastManager';

function Register() {
    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [gender, setGender] = useState('MALE');
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
                'Mật khẩu tối thiểu phải chứa 8 ký tự, có ít nhất 1 ký tự thường, hoa và số',
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
                gender,
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
            <div className="flex justify-center items-center bg-gray-100">
                <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg mt-10">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Đăng Ký</h2>
                    {error && <p className="text-lg text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-2xl font-medium text-gray-700 mb-2">Họ:</label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ"
                                    value={first_name}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-2xl font-medium text-gray-700 mb-2">Tên:</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên"
                                    value={last_name}
                                    onChange={(e) => setLastname(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Số điện thoại:</label>
                            <input
                                type="text"
                                placeholder="Nhập số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Email:</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Tên đăng nhập:</label>
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Mật khẩu:</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={20} />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Nhập lại mật khẩu:</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={20} />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Mục đích sử dụng:</label>
                            <div className="flex space-x-4">
                                <label>
                                    <input
                                        type="radio"
                                        value="CUSTOMER"
                                        checked={role === 'CUSTOMER'}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                    Tìm trọ
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="LANDLORD"
                                        checked={role === 'LANDLORD'}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                    Cho thuê
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-2xl font-medium text-gray-700 mb-2">Giới tính:</label>
                            <div className="flex space-x-4">
                                <label>
                                    <input
                                        type="radio"
                                        value="MALE"
                                        checked={gender === 'MALE'}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    Nam
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="FEMALE"
                                        checked={gender === 'FEMALE'}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    Nữ
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="OTHER"
                                        checked={gender === 'OTHER'}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    Khác
                                </label>
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-red-500 text-white font-semibold py-3 rounded-md hover:bg-red-600 transition duration-200"
                            >
                                Đăng Ký
                            </button>
                        </div>
                    </form>
                    <p className="text-center mt-4">
                        Bạn đã có tài khoản?{' '}
                        <a href="/login" className="text-red-600">
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
