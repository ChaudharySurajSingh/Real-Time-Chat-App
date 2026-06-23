import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import apiClient from "../../config/apiClient";
import Icon from "../Icon";
import { notify } from "../../utils/toast";
import { isValidEmail, requiredMessage, validatePassword } from "../../utils/validation";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();
  const emailError = !email.trim()
    ? requiredMessage("Email")
    : !isValidEmail(email)
      ? "Enter a valid email address."
      : "";
  const passwordError = !password ? requiredMessage("Password") : validatePassword(password);
  const canSubmit = !emailError && !passwordError && !loading;

  const submitHandler = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!canSubmit) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post(
        "/api/user/login",
        { email: email.trim(), password },
        { headers: { "Content-type": "application/json" } }
      );

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      notify({
        title: "Error occurred",
        description: error.response?.data?.message || "Unable to log in",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const guestHandler = async () => {
    try {
      setGuestLoading(true);
      const { data } = await apiClient.post("/api/user/guest");

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      notify({
        title: "Guest login failed",
        description: error.response?.data?.message || "Unable to start guest session",
        status: "error",
      });
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <form className="form-stack" onSubmit={submitHandler} noValidate>
      <label className="field">
        <span>Email Address</span>
        <input
          value={email}
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          onChange={(e) => setEmail(e.target.value)}
        />
        {(touched.email || email) && emailError && (
          <small className="field-error">{emailError}</small>
        )}
      </label>
      <label className="field">
        <span>Password</span>
        <div className="input-with-action password-field">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter password"
          />
          <button
            className="password-toggle"
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            title={show ? "Hide password" : "Show password"}
            onClick={() => setShow((current) => !current)}
          >
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        </div>
        {(touched.password || password) && passwordError && (
          <small className="field-error">{passwordError}</small>
        )}
      </label>
      <button className="primary-button" type="submit" disabled={!canSubmit}>
        {loading ? "Logging in..." : "Login"}
      </button>
      <button
        className="secondary-button"
        type="button"
        onClick={guestHandler}
        disabled={guestLoading || loading}
      >
        <Icon name="guest" />
        {guestLoading ? "Opening guest..." : "Continue as Guest"}
      </button>
    </form>
  );
};

export default Login;
