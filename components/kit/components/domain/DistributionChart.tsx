export function DistributionChart({
  items,
  label,
}: {
  items: { label: string; value: number }[];
  label: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <figure style={{ margin: 0 }} aria-label={label}>
      <div className="bar-chart">
        {items.map((item) => (
          <div className="bar-column" key={item.label}>
            <b>{item.value}</b>
            <span style={{ height: Math.max(1, (item.value / max) * 125) }} />
            <small>{item.label}</small>
          </div>
        ))}
      </div>
      <figcaption className="small muted" style={{ marginTop: 18 }}>
        {label}
      </figcaption>
    </figure>
  );
}
