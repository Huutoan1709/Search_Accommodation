import React, { useState } from "react";
import API, { authApi, endpoints } from "../../API";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@material-ui/core";

const Login = () => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      let res = await API.post(endpoints["login"], {
        username: username,
        password: password,
        client_id: "7gS8oCrdq9x2rfSnqgPG27zdPWsPbA82erZThYH0",
        client_secret:
          "NwUGjlwU12WU7wxyWjv6tbbEK7oV8dl3CHoXNRIBruwT3cPZc8lpc5RJzJhBCdfKQKpy2F6xUzIxlVgb9m0gBphmVHLSupWIFTBkdWU6R8hNrJNOacOA6tEH220Hk9i0",
        grant_type: "password",
      });
      localStorage.setItem("access-token", res.data.access_token);

      let user = await authApi(res.data.access_token).get(
        endpoints["current_user"]
      );
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login();
      window.location.href = "/"; // Redirect to home page after successful login
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h4">Login</Typography>
      <TextField
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
    </form>
  );
};

export default Login;
