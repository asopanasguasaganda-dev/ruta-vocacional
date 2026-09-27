import { useId } from "react";
import { Progress } from "../ui/primitives";
export function ProfileChart({
  scores,
}: {
  scores: { code: string; name: string; value: number }[];
}) {
  const id = useId();
  const center = 170,
    radius = 105;
  const point = (i: number, value: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / scores.length;
    return [
      center + (Math.cos(a) * radius * value) / 5,
      center + (Math.sin(a) * radius * value) / 5,
    ];
  };
  return (
    <div className="radar-wrap">
      <svg
        className="radar-chart"
        viewBox="0 0 340 340"
        role="img"
        aria-labelledby={id}
      >
        <title id={id}>
          Perfil de intereses.{" "}
          {scores
            .map((s) => s.name + ": " + s.value.toFixed(1) + " de 5")
            .join(". ")}
        </title>
        {[1, 2, 3, 4, 5].map((level) => (
          <polygon
            key={level}
            points={scores.map((_, i) => point(i, level).join(",")).join(" ")}
            fill="none"
            stroke="#dfe5f0"
          />
        ))}
        {scores.map((s, i) => {
          const p = point(i, 5);
          const label = point(i, 6.15);
          return (
            <g key={s.code}>
              <line
                x1={center}
                y1={center}
                x2={p[0]}
                y2={p[1]}
                stroke="#e5e9f2"
              />
              <text
                x={label[0]}
                y={label[1] + 4}
                textAnchor="middle"
                fontSize="12"
                fill="#536178"
              >
                {s.name}
              </text>
            </g>
          );
        })}
        <polygon
          points={scores.map((s, i) => point(i, s.value).join(",")).join(" ")}
          fill="#5b4bdb26"
          stroke="#5b4bdb"
          strokeWidth="2.5"
        />
        {scores.map((s, i) => {
          const p = point(i, s.value);
          return (
            <circle key={s.code} cx={p[0]} cy={p[1]} r="4" fill="#5b4bdb" />
          );
        })}
      </svg>
    </div>
  );
}
export function ScoreList({
  scores,
}: {
  scores: { name: string; value: number }[];
}) {
  return (
    <div>
      {scores.map((s) => (
        <div className="score-row" key={s.name}>
          <span>{s.name}</span>
          <Progress value={s.value} total={5} label={s.name} />
          <strong>{s.value.toFixed(1)}/5</strong>
        </div>
      ))}
    </div>
  );
}
