import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import "../css/PasswordInput.css";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput({
  className = "",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pi-password-input">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={className}
      />

      <button
        type="button"
        id="password-input-toggle"
        onClick={() => setVisible((previous) => !previous)}
        aria-label={visible ? "Skrýt heslo" : "Zobrazit heslo"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
