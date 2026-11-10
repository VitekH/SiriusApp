import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  permissionLevel,
  type ModuleRecord,
  permissionLevelLabels,
} from "../config/types";
import "../css/User.css";
import PasswordInput from "../components/PasswordInput";

export default function User() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");

  const passwordsMatch = newPassword === newPasswordConfirm;
  const showPasswordError = newPasswordConfirm !== "" && !passwordsMatch;

  const { checkAuth } = useAuth();

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch("/api/database/get-modules", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      }
    }
    setLoading(true);
    fetchModules();
    setLoading(false);
  }, []);

  const handleChangePassword = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (
      !currentPassword ||
      !newPassword ||
      !newPasswordConfirm ||
      newPassword !== newPasswordConfirm ||
      currentPassword === newPassword
    ) {
      console.log("wtf");
      return;
    }
    const response = await fetch("/api/update-password", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update password.");
    }

    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  const handleSignOut = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to sign out.");
    }

    await checkAuth();
  };

  return (
    <>
      <h1>Účet</h1>
      {loading && <p>Načítání...</p>}
      {!loading && user && (
        <>
          <table>
            <tbody>
              <tr>
                <th>Jméno:</th>
                <td>{user.first_name}</td>
              </tr>
              <tr>
                <th>Příjmení:</th>
                <td>{user.last_name}</td>
              </tr>
              {user.nickname && (
                <tr>
                  <th>Přezdívka:</th>
                  <td>{user.nickname}</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2>Práva</h2>
          <table>
            <tbody>
              {modules
                .map(({ name, label }) => ({
                  name,
                  label,
                  permission: user.permissions[name] ?? permissionLevel.none,
                }))
                .filter(({ permission }) => permission >= permissionLevel.read)
                .map(({ name, label, permission }) => (
                  <tr key={name}>
                    <td>{label}</td>
                    <td>{permissionLevelLabels[permission]}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <h2>Změna hesla</h2>
          <form onSubmit={handleChangePassword} className="u-password-form">
            <label htmlFor="current-password">Současné heslo:</label>
            <PasswordInput
              required
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
              }}
              name="current-password"
            />
            <label htmlFor="new-password">Nové heslo:</label>
            <PasswordInput
              required
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
              }}
              name="new-password"
            />
            <label htmlFor="new-password-confirm">Nové heslo znovu:</label>
            <PasswordInput
              required
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              name="new-password-confirm"
              className={showPasswordError ? "u-invalid" : ""}
            />

            {showPasswordError && (
              <label htmlFor="new-password-confirm" className="u-invalid-text">
                Hesla se neshodují
              </label>
            )}

            <button type="submit" disabled={!passwordsMatch}>
              Potvrdit
            </button>
          </form>

          <button type="button" id="u-signout" onClick={handleSignOut}>
            Odhlásit se
          </button>
        </>
      )}
    </>
  );
}
