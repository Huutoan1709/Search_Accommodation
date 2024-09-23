import React, { useState } from 'react';
import API, { endpoints } from '../../../API';
import { useNavigate } from 'react-router-dom';
import './RegisterStyle.scss';
import Header from '../../DefaultLayout/Header';
import { FaEye } from 'react-icons/fa';
import * as yup from 'yup';
import Footer from '../../DefaultLayout/footer';
import { notifySuccess, notifyWarning } from '../../../components/ToastManager';

function Register() {
    const [first_name, setFirstname] = useState('');
    const [last_name, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State để ẩn/hiện mật khẩu
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
            // Gửi yêu cầu đăng ký
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
            // Kiểm tra xem lỗi có liên quan đến ràng buộc unique không
            if (err.response && err.response.status === 400) {
                const errors = err.response.data;
                if (errors.email) {
                    setError('Email đã tồn tại.');
                } else if (errors.phone) {
                    setError('Số điện thoại đã tồn tại.');
                } else {
                    setError('Có lỗi xảy ra khi đăng ký: ' + err.response.data.message);
                }
            } else {
                setError('Có lỗi xảy ra khi đăng ký: ' + err.message);
            }
        }
    };

    return (
        <div>
            <Header />
            <div className="register-container">
                <h2>Đăng Ký</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-group">
                        <div>
                            <label>Họ:</label>
                            <input
                                type="text"
                                placeholder="Nhập họ"
                                value={first_name}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Tên:</label>
                            <input
                                type="text"
                                placeholder="Nhập tên"
                                value={last_name}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label>Số điện thoại:</label>
                        <input
                            type="text"
                            placeholder="Nhập số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Tên đăng nhập:</label>
                        <input
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Mật khẩu:</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <FaEye onClick={() => setShowPassword(!showPassword)} className="toggle-password" />
                        </div>
                    </div>

                    <div>
                        <label>Nhập lại mật khẩu:</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <FaEye onClick={() => setShowPassword(!showPassword)} className="toggle-password" />
                        </div>
                    </div>
                    <div>
                        <label>Giới tính:</label>
                        <div className="radio-group">
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
                        <label>Vai trò:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="CUSTOMER">Khách hàng</option>
                            <option value="LANDLORD">Chủ nhà</option>
                        </select>
                    </div>
                    <button type="submit">Đăng ký</button>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default Register;
