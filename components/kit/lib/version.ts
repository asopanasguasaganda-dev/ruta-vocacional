/** Keep historical storage identifiers stable while naming original instruments clearly. */
export function versionLabel(version: string) {
  return version === 'demo-1' ? 'Original 1' : version;
}
