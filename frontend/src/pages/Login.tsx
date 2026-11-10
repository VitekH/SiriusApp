import { useState } from "react";
import { useAuth } from "../auth/AuthContext.tsx";
import "../css/Login.css";
import { useLocation, useNavigate } from "react-router";
import PasswordInput from "../components/PasswordInput.tsx";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isWrong, setIsWrong] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporarilyDisabled, setTemporarilyDisabled] =
    useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (temporarilyDisabled) return;
    setIsWrong(false);
    setError(null);
    const result = await login(username, password);

    if (result.status == 401 && !result.success) {
      setIsWrong(true);
      return;
    }

    if (result.status == 429 && !result.success) {
      setIsWrong(true);
      setTemporarilyDisabled(true);
      return;
    }

    if (!result.success) {
      setError(result.error!);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <main className="lo-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="lo-form">
        <label htmlFor="name">Jméno:</label>
        <input
          id="username"
          className={isWrong ? "lo-shake" : ""}
          name="username"
          required={true}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={temporarilyDisabled}
        />
        <label htmlFor="password">Heslo:</label>
        <PasswordInput
          id="password"
          className={isWrong ? "lo-shake" : ""}
          name="password"
          required={true}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={temporarilyDisabled}
        />
        {temporarilyDisabled ? (
          <p>{"Překročen maximální počet pokusů. Zkuste to znovu později."}</p>
        ) : (
          <button type="submit">Přihlásit</button>
        )}
      </form>
    </main>
  );
}
