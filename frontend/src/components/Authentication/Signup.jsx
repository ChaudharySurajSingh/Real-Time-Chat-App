import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import apiClient from "../../config/apiClient";
import { notify } from "../../utils/toast";
import { isValidEmail, requiredMessage, validatePassword } from "../../utils/validation";
import Icon from "../Icon";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = ChatState();
  const nameError = !name.trim() ? requiredMessage("Name") : "";
  const emailError = !email.trim()
    ? requiredMessage("Email")
    : !isValidEmail(email)
      ? "Enter a valid email address."
      : "";
  const passwordError = !password ? requiredMessage("Password") : validatePassword(password);
  const confirmPasswordError = !confirmpassword
    ? requiredMessage("Confirm password")
    : password !== confirmpassword
      ? "Passwords do not match."
      : "";
  const canSubmit =
    !nameError && !emailError && !passwordError && !confirmPasswordError && !loading;

  const submitHandler = async (event) => {
    event.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmpassword: true,
    });

    if (!canSubmit) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post(
        "/api/user",
        {
          name: name.trim(),
          email: email.trim(),
          password,
        },
        { headers: { "Content-type": "application/json" } }
      );
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      notify({
        title: "Error occurred",
        description: error.response?.data?.message || "Unable to sign up",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-stack" onSubmit={submitHandler} noValidate>
      <label className="field">
        <span>Name</span>
        <input
          autoComplete="name"
          placeholder="Enter your name"
          value={name}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          onChange={(e) => setName(e.target.value)}
        />
        {touched.name && nameError && <small className="field-error">{nameError}</small>}
      </label>
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
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter password"
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            onChange={(e) => setPassword(e.target.value)}
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
      <label className="field">
        <span>Confirm Password</span>
        <div className="input-with-action password-field">
          <input
            value={confirmpassword}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm password"
            onBlur={() =>
              setTouched((current) => ({ ...current, confirmpassword: true }))
            }
            onChange={(e) => setConfirmpassword(e.target.value)}
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
        {(touched.confirmpassword || confirmpassword) && confirmPasswordError && (
          <small className="field-error">{confirmPasswordError}</small>
        )}
      </label>
      <button className="primary-button" type="submit" disabled={!canSubmit}>
        {loading ? "Please wait..." : "Sign Up"}
      </button>
    </form>
  );
};

export default Signup;
