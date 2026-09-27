import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { Badge, Button, Card, Progress } from "../ui/primitives";
export function AssessmentCard({
  title,
  description,
  icon: Icon,
  answered,
  total,
  duration,
  onStart,
  optional = false,
  submitted = false,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  answered: number;
  total: number;
  duration: string;
  onStart: () => void;
  optional?: boolean;
  submitted?: boolean;
}) {
  const complete = submitted;
  return (
    <Card className="assessment-card">
      <div className="assessment-heading">
        <span className={"icon-tile " + (complete ? "teal" : "")}>
          <Icon size={23} />
        </span>
        <div className="assessment-copy"><h3>{title}</h3><p className="muted">{description}</p></div>
        <Badge tone={complete ? "success" : answered ? "primary" : "neutral"}>
          {complete
            ? "Entregado"
            : answered === total && total > 0 ? "Listo para entregar"
            : answered
              ? "En progreso"
              : optional
                ? "Opcional"
                : "Por comenzar"}
        </Badge>
      </div>
      <div className="row muted small">
        <Clock size={14} />
        {duration}
        {total > 0 && <span>· {total} preguntas</span>}
      </div>
      {total > 0 && (
        <Progress
          value={answered}
          total={total}
          label={answered + " de " + total + " respondidas"}
        />
      )}
      <Button
        variant={complete || !answered ? "secondary" : "primary"}
        onClick={onStart}
        icon={complete ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
      >
        {complete ? "Ver resultados" : answered === total && total > 0 ? "Revisar y entregar" : answered ? "Continuar" : "Comenzar"}
      </Button>
    </Card>
  );
}
