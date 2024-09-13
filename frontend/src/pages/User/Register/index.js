import React, { useState } from "react";
import API, { endpoints } from "../../../API";
import { useNavigate } from "react-router-dom";
import "./RegisterStyle.scss";
import Header from "../../DefaultLayout/Header";

function Register() {
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("MALE");
  const [role, setRole] = useState("CUSTOMER");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu và Nhập lại mật khẩu không khớp.");
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
        alert("Đăng ký thành công!");
        navigate("/login");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng ký: " + err.message);
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
                value={first_name}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Tên:</label>
              <input
                type="text"
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Tên đăng nhập:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Nhập lại mật khẩu:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Giới tính:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="MALE"
                  checked={gender === "MALE"}
                  onChange={(e) => setGender(e.target.value)}
                />
                Nam
              </label>
              <label>
                <input
                  type="radio"
                  value="FEMALE"
                  checked={gender === "FEMALE"}
                  onChange={(e) => setGender(e.target.value)}
                />
                Nữ
              </label>
              <label>
                <input
                  type="radio"
                  value="OTHER"
                  checked={gender === "OTHER"}
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
    </div>
  );
}

export default Register;
