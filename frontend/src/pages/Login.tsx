import "../css/Login.css";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      console.log("Logged in:", data.user);

    } catch (error) {
      console.error("Login request failed:", error);
      alert("Nepodařilo se spojit se serverem.");
    }
  };

  return (
    <main className="lo-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="lo-form">
        <label htmlFor="name">Jméno:</label>
        <input
          id="username"
          name="username"
          required={true}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor="password">Heslo:</label>
        <input
          id="password"
          name="password"
          type="password"
          required={true}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Přihlásit</button>
      </form>
    </main>
  );
}
