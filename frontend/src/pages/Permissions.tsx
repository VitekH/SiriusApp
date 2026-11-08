import { useEffect, useState } from "react";
import "../css/Permissions.css";
import { useAuth } from "../auth/AuthContext";
import { permissionLevel } from "../config/types";

interface MemberPermissions {
  id: number;
  first_name: string;
  nickname: string | null;
  permissions: Record<string, number>;
}

interface Module {
  id: number;
  name: string;
  label: string | null;
}

function selectContent(element: HTMLElement) {
  const selection = window.getSelection();
  const range = document.createRange();

  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export default function Permissions() {
  const [permissions, setPermissions] = useState<MemberPermissions[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { checkAuth, user } = useAuth();

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch("/api/database/get-permissions", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    }
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
    fetchPermissions();
    fetchModules();
    setLoading(false);
  }, []);

  const handlePermissionBlur = async (
    event: React.FocusEvent<HTMLTableCellElement>,
    member: MemberPermissions,
    module: Module,
  ) => {
    const value = Number(event.currentTarget.textContent);

    if (!Number.isInteger(value) || value < 0 || value > 3) {
      event.currentTarget.classList.add("invalid");
      return;
    }

    event.currentTarget.classList.remove("invalid");

    try {
      await updatePermission(member.id, module.id, value);

      setPermissions((previous) =>
        previous.map((item) =>
          item.id === member.id
            ? {
                ...item,
                permissions: {
                  ...item.permissions,
                  [module.id]: value,
                },
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updatePermission = async (
    memberId: number,
    moduleId: number,
    permission: number,
  ) => {
    const response = await fetch("/api/database/update-permission", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId,
        moduleId,
        permission,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update permission.");
    }

    await checkAuth();
  };

  return (
    <>
      <h1>Práva</h1>
      {loading && <p>Načítání...</p>}
      {!loading && permissions.length == 0 && <p>Chyba na serveru</p>}
      {!loading && permissions.length > 0 && (
        <div className="p-table-container">
          <table>
            <thead>
              <tr>
                <th>Jméno</th>
                {Object.values(modules).map((module) => (
                  <th key={module.name}>{module.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {permissions.map((member) => (
                <tr key={member.id}>
                  <td>{member.nickname || member.first_name}</td>

                  {Object.values(modules).map((module) => (
                    <td
                      key={module.name}
                      contentEditable={
                        (user?.permissions.database ?? permissionLevel.none) >=
                        permissionLevel.write
                      }
                      suppressContentEditableWarning
                      onBlur={(event) =>
                        handlePermissionBlur(event, member, module)
                      }
                      onFocus={(event) => selectContent(event.currentTarget)}
                    >
                      {member.permissions[module.id] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
