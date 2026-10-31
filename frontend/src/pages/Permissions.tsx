import { useEffect, useState } from "react";
import { Modules, type Module } from "../config/permissions.ts";
import "../css/Permissions.css";

interface MemberPermissions {
  id: number;
  first_name: string;
  nickname: string | null;
  permissions: Record<string, number>;
}

async function updatePermission(
  memberId: number,
  module: Module,
  permission: number,
) {
  const response = await fetch("/api/database/update-permission", {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      memberId,
      module,
      permission,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update permission.");
  }
}

export default function Permissions() {
  const [permissions, setPermissions] = useState<MemberPermissions[]>([]);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch("/api/database/get-permissions", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
          return;
        }

        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    }
    fetchPermissions();
  }, []);

  const handlePermissionBlur = async (
    event: React.FocusEvent<HTMLTableCellElement>,
    member: MemberPermissions,
    module: Module,
  ) => {
    const value = Number(event.currentTarget.textContent);

    if (![0, 1, 2, 4].includes(value)) {
      return;
    }

    try {
      await updatePermission(member.id, module, value);

      setPermissions((previous) =>
        previous.map((item) =>
          item.id === member.id
            ? {
                ...item,
                permissions: {
                  ...item.permissions,
                  [module]: value,
                },
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1>Práva</h1>
      <div className="p-table-container">
        {permissions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Jméno</th>
                {Object.values(Modules).map((module) => (
                  <th key={module.value}>{module.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {permissions.map((member) => (
                <tr key={member.id}>
                  <td>{member.nickname || member.first_name}</td>

                  {Object.values(Modules).map((module) => (
                    <td
                      key={module.value}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(event) =>
                        handlePermissionBlur(event, member, module.value)
                      }
                    >
                      {member.permissions[module.value] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Chyba na serveru</p>
        )}
      </div>
    </>
  );
}
