import React, { useState } from "react";
import API, { endpoints } from "../../../API";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./LoginStyle.scss";
import Header from "../../DefaultLayout/Header";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    // Create a new FormData object
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("client_id", "7gS8oCrdq9x2rfSnqgPG27zdPWsPbA82erZThYH0");
    formData.append(
      "client_secret",
      "NwUGjlwU12WU7wxyWjv6tbbEK7oV8dl3CHoXNRIBruwT3cPZc8lpc5RJzJhBCdfKQKpy2F6xUzIxlVgb9m0gBphmVHLSupWIFTBkdWU6R8hNrJNOacOA6tEH220Hk9i0"
    );
    formData.append("grant_type", "password");

    try {
      const response = await API.post(endpoints["login"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        localStorage.setItem("access-token", response.data.access_token);
        alert("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (err) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <h2>Đăng Nhập</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="password-container">
          <label>Mật khẩu:</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="password-toggle" onClick={togglePasswordVisibility}>
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <p className="register-link">
        Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
      </p>
    </div>
  );
}

export default Login;
