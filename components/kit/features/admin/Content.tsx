import { dimensions } from '../../data/instruments';
import type { ContentFields } from '../../lib/content-fields';
import { flush } from '../../lib/session';
import { PublicationCenter } from "./Publication";
import { useState } from "react";
import { Plus, Pencil, BookOpen, GraduationCap } from "lucide-react";
import { careers } from "../../data/careers";
import { resources } from "../../data/resources";
import { useLocalState } from "../../lib/storage";
import {
  Badge,
  Button,
  Card,
  Field,
  PageHeader,
  SelectField,
  TextareaField,
  Tabs,
  Notice,
} from "../../components/ui/primitives";
import { Dialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
interface ContentItem extends ContentFields {
  id: string;
  title: string;
  kind: string;
  category: string;
  description: string;
  status: string;
}
const initial: ContentItem[] = [
  ...careers.map((c) => ({
    id: c.id,
    interests:c.interests,activities:c.activities,skills:c.skills,investigate:c.investigate,
    title: c.name,
    kind: "Carrera",
    category: c.area,
    description: c.description,
    status: "Referencia",
  })),
  ...resources.map((r) => ({
    id: r.id,
    steps:r.steps,minutes:r.minutes,
    title: r.title,
    kind: "Recurso",
    category: r.category,
    description: r.intro,
    status: "Referencia",
  })),
];
const valid = (x: unknown): x is ContentItem[] =>
  Array.isArray(x) &&
  x.every(
    (v) =>
      v &&
      ["id", "title", "kind", "category", "description", "status"].every(
        (k) => typeof v[k] === "string",
      ),
  );
export function ContentManager() {
  const [items, setItems] = useLocalState<ContentItem[]>(
    "rv360:admin-content",
    initial,
    valid,
  );
  const [tab, setTab] = useState("Carrera");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const toast = useToast();
  const list = items.filter(
    (i) =>
      i.kind === tab && i.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="CONTENIDO PARA ORIENTAR"
        title="Carreras y recursos"
        description="Organiza fichas informativas y materiales de acompañamiento."
        actions={
          <Button
            icon={<Plus size={17} />}
            onClick={() =>
              setEditing({
                id: crypto.randomUUID(),
                title: "",
                kind: tab,
                category: "",
                description: "",
                status: "Borrador",
              })
            }
          >
            Crear {tab.toLowerCase()}
          </Button>
        }
      />
      <div className="stack">
        <Notice tone="neutral">
          Los cambios se guardan como borradores. Usa Revisión y publicación para ponerlos a disposición de los estudiantes de tu institución.
        </Notice>
        <Tabs
          items={[
            { id: "Carrera", label: "Carreras" },
            { id: "Recurso", label: "Recursos" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Field
          label="Buscar contenido"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título del contenido"
        />
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Contenido</th>
                <th scope="col">Categoría</th>
                <th scope="col">Estado</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="row">
                      <span className="icon-tile">
                        {tab === "Carrera" ? (
                          <GraduationCap size={19} />
                        ) : (
                          <BookOpen size={19} />
                        )}
                      </span>
                      <strong>{item.title}</strong>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <Badge
                      tone={item.status === "Borrador" ? "warning" : "neutral"}
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Pencil size={15} />}
                      onClick={() => {const original=initial.find(i=>i.id===item.id);setEditing({...original,...item});}}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={4} className="center muted">
                    No hay contenidos con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{marginTop:24}}><PublicationCenter kind="content" items={items.map(item=>({id:item.id,title:item.title}))}/></div>
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.title ? "Editar contenido" : "Crear borrador"}
      >
        {editing && (
          <ContentForm
            key={editing.id}
            item={editing}
            onSave={async (item) => {
              await setItems((prev) =>
                prev.some((i) => i.id === item.id)
                  ? prev.map((i) => (i.id === item.id ? item : i))
                  : [...prev, item],
              );
              await flush(); setEditing(null);
              toast("Borrador de contenido guardado");
            }}
          />
        )}
      </Dialog>
    </>
  );
}
export function ContentForm({
  item,
  onSave,
}: {
  item: ContentItem;
  onSave: (item: ContentItem) => void | Promise<void>;
}) {
  const [form, setForm] = useState(item);
  const [error, setError] = useState("");
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          form.title.trim().length < 3 ||
          !form.category.trim() ||
          form.description.trim().length < 15
        ) {
          setError(
            "Completa un título, una categoría y una descripción de al menos 15 caracteres.",
          );
          return;
        }
        try { await onSave({ ...form, status: "Borrador" }); } catch(e){setError((e as Error).message);}
      }}
    >
      <Field
        label="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Field
        label="Categoría"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <TextareaField
        label="Descripción"
        rows={5}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      {form.kind==='Carrera'?<><fieldset className="preview-question"><legend>Relaciones con intereses RIASEC</legend><p className="small muted">Estas etiquetas explican por qué se sugiere una carrera. Configúralas a partir de sus actividades y revisa su pertinencia.</p><div className="preview-options">{dimensions.map(d=><label key={d.code}><input type="checkbox" checked={(form.interests||[]).includes(d.code)} onChange={e=>setForm({...form,interests:e.target.checked?[...(form.interests||[]),d.code]:(form.interests||[]).filter(c=>c!==d.code)})}/>{d.name}</label>)}</div></fieldset><TextareaField label="Actividades de la carrera" value={form.activities||''} onChange={e=>setForm({...form,activities:e.target.value})}/><TextareaField label="Habilidades y requisitos" value={form.skills||''} onChange={e=>setForm({...form,skills:e.target.value})}/><TextareaField label="Qué investigar antes de decidir" value={form.investigate||''} onChange={e=>setForm({...form,investigate:e.target.value})}/></>:<><TextareaField label="Pasos de la guía (uno por línea)" rows={6} value={(form.steps||[]).join('\n')} onChange={e=>setForm({...form,steps:e.target.value.split('\n')})}/><Field label="Lectura estimada en minutos (0 = sin estimación)" type="number" min={0} max={480} value={form.minutes||0} onChange={e=>setForm({...form,minutes:Number(e.target.value)})}/></>}<Field label="Fuente oficial (URL HTTPS, opcional)" type="url" value={form.sourceUrl||''} onChange={e=>setForm({...form,sourceUrl:e.target.value})}/><Field label="Fecha de consulta de la fuente" type="date" required={!!form.sourceUrl} value={form.sourceDate||''} onChange={e=>setForm({...form,sourceDate:e.target.value})}/>
{error && <Notice tone="danger">{error}</Notice>}
      <Button type="submit">Guardar borrador</Button>
    </form>
  );
}
