import { Pencil } from "lucide-react";
import type { User } from "../../types";
import { Avatar, Badge, IconButton } from "../ui/primitives";
export function UserTable({
  users,
  onEdit,
}: {
  users: User[];
  onEdit: (user: User) => void;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <caption>
          Usuarios de la plataforma · {users.length} en esta página
        </caption>
        <thead>
          <tr>
            <th scope="col">Usuario</th>
            <th scope="col">Rol</th>
            
            <th scope="col">Estado</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.length ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="person">
                    <Avatar name={user.name} small />
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                </td>
                <td>{user.role}</td>
                
                <td>
                  <Badge
                    tone={
                      user.status === "Activo"
                        ? "success"
                        : user.status === "Suspendido"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {user.status}
                  </Badge>
                </td>
                <td>
                  <IconButton
                    label={"Editar " + user.name}
                    onClick={() => onEdit(user)}
                  >
                    <Pencil size={16} />
                  </IconButton>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="center muted">
                No hay usuarios con estos filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
