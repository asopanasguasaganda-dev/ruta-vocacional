import { Bookmark, ArrowUpRight, GraduationCap } from "lucide-react";
import type { Career } from "../../types";
import { Badge, Button, Card, IconButton } from "../ui/primitives";
export function CareerCard({
  career,
  saved,
  onSave,
  onOpen,
  highlight,
}: {
  career: Career;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  highlight?: string;
}) {
  return (
    <Card className="career-card">
      {({software:"software",psicologia:"psychology",docencia:"teaching"} as Record<string,string>)[career.id] && <img className="card-image" src={`/assets/${({software:"software",psicologia:"psychology",docencia:"teaching"} as Record<string,string>)[career.id]}.webp`} alt=""/>}
      <div className="row between">
        <span className="icon-tile">
          <GraduationCap size={23} />
        </span>
        <IconButton
          label={
            saved
              ? "Quitar " + career.name + " de guardadas"
              : "Guardar " + career.name
          }
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark
            size={18}
            fill={saved ? "currentColor" : "none"}
            color={saved ? "#5b4bdb" : "currentColor"}
          />
        </IconButton>
      </div>
      <div>
        <Badge tone="neutral">{career.area}</Badge>
        <h3 style={{ marginTop: 12 }}>{career.name}</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          {career.description}
        </p>
      </div>
      {highlight && <Badge tone="primary">{highlight}</Badge>}
      <div className="career-actions">
        <span className="small muted">Explora sus posibilidades</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          icon={<ArrowUpRight size={17} />}
        >
          Ver carrera
        </Button>
      </div>
    </Card>
  );
}
