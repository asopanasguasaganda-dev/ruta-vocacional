export function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <span className={"brand " + (inverse ? "brand--inverse" : "")}>
      <img src="/media/brain-book-icon.png" alt="" width={48} height={48} />
      {!compact && (
        <span>
          <strong>
            Ruta Vocacional <em>360°</em>
          </strong>
          <small>ORIENTACIÓN ACADÉMICA Y PROFESIONAL</small>
        </span>
      )}
    </span>
  );
}
