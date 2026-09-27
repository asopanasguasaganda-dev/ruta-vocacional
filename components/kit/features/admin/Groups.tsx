import { useSession, flush, previewAction, refreshSession } from "../../lib/session";
import { useState } from "react";
import { Building2, Download, Plus, Users as UsersIcon } from "lucide-react";
import { useUsers } from "../../lib/useUsers";
import { downloadCSV, isStringArray, useLocalState } from "../../lib/storage";
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
} from "../../components/ui/primitives";
import { Dialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
export function Groups() {
  const [users] = useUsers();
  const session = useSession();
  const institution = session.values["rv360:admin-settings"] as Record<string,string> | undefined;
  const [custom, setCustom] = useLocalState<string[]>(
    "rv360:admin-groups",
    [],
    isStringArray,
  );
  const groups = [
    ...new Set([
      ...users.filter((u) => u.role === "Estudiante" && u.group).map((u) => u.group),
      ...custom,
    ]),
  ];
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const toast = useToast();
  return (
    <>
      <PageHeader
        eyebrow="COMUNIDAD EDUCATIVA"
        title="Institución y grupos"
        description={institution?.name || "Estudiantes y grupos de tu institución"}
        actions={
          <Button
            icon={<Plus size={17} />}
            onClick={() => {
              setEditing("");
              setNewName("");
              setError("");
            }}
          >
            Crear grupo
          </Button>
        }
      />
      <div className="stack">
        <Card className="row">
          <span className="icon-tile">
            <Building2 size={25} />
          </span>
          <div className="grow">
            <h2>{institution?.name || 'Tu institución'}</h2>
            <p className="muted small">
              {institution?.code ? `Código ${institution.code} · ` : ''}{groups.length} grupos ·{" "}
              {users.filter((u) => u.role === "Estudiante").length} estudiantes
            </p>
          </div>
          <Badge tone="primary">Institución</Badge>
        </Card>
        <div className="grid grid-3">
          {groups.map((group) => (
            <Card className="feature-card" key={group}>
              <span className="icon-tile teal">
                <UsersIcon />
              </span>
              <h3>{group}</h3>
              <p className="muted">
                {users.filter((u) => u.group === group).length} integrantes
              </p>
              <div className="row">
                <Button variant="secondary" onClick={() => setDetail(group)}>
                  Ver grupo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(group);
                    setNewName(group);
                    setError("");
                  }}
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? "Editar grupo" : "Crear grupo"}
      >
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const name = newName.trim();
            if (name.length < 2) {
              setError("Escribe un nombre de al menos dos caracteres.");
              return;
            }
            if (
              groups.some(
                (g) => g.toLowerCase() === name.toLowerCase() && g !== editing,
              )
            ) {
              setError("Ya existe un grupo con este nombre.");
              return;
            }
            try { await flush();
            if (editing) {
              await previewAction('admin/groups/rename', {method: 'POST', body: JSON.stringify({previous: editing, name})});
              await refreshSession();
            } else await setCustom((prev) => [
              ...new Set([...prev.filter((g) => g !== editing), name]),
            ]);
            await flush();
            setEditing(null);
            toast("Grupo guardado"); } catch(error) { setError((error as Error).message); }
          }}
        >
          <Field
            label="Nombre del grupo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            error={error}
            placeholder="Ej. 3.º Bachillerato C"
          />
          <Notice tone="neutral">
            Al renombrarlo, se actualizan sus integrantes y asignaciones de tests. Las entregas anteriores se conservan.
          </Notice>
          <Button type="submit">Guardar grupo</Button>
        </form>
      </Dialog>
      <Dialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail || "Grupo"}
        wide
      >
        <div className="stack">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.group === detail)
                  .map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.status}</td>
                    </tr>
                  ))}
                {!users.some((u) => u.group === detail) && (
                  <tr>
                    <td colSpan={3}>
                      Este grupo todavía no tiene integrantes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={() =>
              downloadCSV("grupo.csv", [
                ["Grupo", "Nombre", "Correo", "Estado"],
                ...users
                  .filter((u) => u.group === detail)
                  .map((u) => [u.group, u.name, u.email, u.status]),
              ])
            }
          >
            Descargar integrantes
          </Button>
        </div>
      </Dialog>
    </>
  );
}
