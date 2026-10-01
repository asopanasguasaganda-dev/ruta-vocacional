import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { db, fail } from "./store";
type Offer = {
  id: string;
  institution: string;
  funding: string;
  title: string;
  location: string;
  modality: string;
  accreditation: string;
  institutionId?: string;
  campus?: string;
  province?: string;
  canton?: string;
  level?: string;
  status?: string;
  sourceUrl?: string;
  sourceDate?: string;
};
type Career = {
  id: string;
  name: string;
  interests: string[];
  description: string;
  area: string;
  activities: string;
  skills: string;
  investigate: string;
  offers: Offer[];
  sourceUrl?: string;
  sourceDate?: string;
  aliases?: string[];
};
const data: {
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  sha256: string;
  careerCount: number;
  offerCount: number;
  filter: string;
  careers: Career[];
} = JSON.parse(
  readFileSync(
    join(process.cwd(), "lib/server/data/ecuador-offer.json"),
    "utf8",
  ),
);
export const catalogSource = {
  source: data.source,
  sourceUrl: data.sourceUrl,
  date: data.retrievedAt,
  version: data.sha256,
  careerCount: data.careerCount,
  offerCount: data.offerCount,
  scope: data.filter,
};
export const ecuadorCareers = data.careers.map(({ offers, ...career }) => ({
  ...career,
  sourceUrl: career.sourceUrl || data.sourceUrl,
  sourceDate: career.sourceDate || data.retrievedAt,
  offerCount: offers.length,
}));
export function careerOffers(ids: string[]) {
  return Object.fromEntries(
    data.careers.filter((c) => ids.includes(c.id)).map((c) => [c.id, c.offers]),
  );
}

function installCatalog(next: typeof data) {
  Object.assign(data, next);
  Object.assign(catalogSource, {
    source: data.source,
    sourceUrl: data.sourceUrl,
    date: data.retrievedAt,
    version: data.sha256,
    careerCount: data.careers.length,
    offerCount: data.careers.reduce((n, c) => n + c.offers.length, 0),
    scope: data.filter,
  });
  ecuadorCareers.splice(
    0,
    ecuadorCareers.length,
    ...data.careers.map(({ offers, ...career }) => ({
      ...career,
      sourceUrl: career.sourceUrl || data.sourceUrl,
      sourceDate: career.sourceDate || data.retrievedAt,
      offerCount: offers.length,
    })),
  );
}
export async function loadStoredCatalog() {
  const stored = (await db
    .prepare(
      "SELECT content FROM academic_catalog_versions ORDER BY rowid DESC LIMIT 1",
    )
    .get()) as { content: string } | undefined;
  if (stored) installCatalog(JSON.parse(stored.content));
}

export function previewCatalog(input: any) {
  if (
    !input ||
    !Array.isArray(input.careers) ||
    !input.careers.length ||
    !input.source?.trim() ||
    !/^https:\/\//.test(input.sourceUrl) ||
    !Number.isFinite(Date.parse(input.retrievedAt)) ||
    Date.parse(input.retrievedAt) > Date.now()
  )
    fail(
      "Adjunta un JSON verificable con carreras, fuente HTTPS y fecha de consulta.",
    );
  const ids = new Set<string>(),
    offerIds = new Set<string>();
  for (const c of input.careers) {
    if (
      !c.id ||
      ids.has(c.id) ||
      !c.name?.trim() ||
      !c.area?.trim() ||
      !Array.isArray(c.offers) ||
      !Array.isArray(c.interests) ||
      ["description", "activities", "skills", "investigate"].some(
        (k) => typeof c[k] !== "string",
      )
    )
      fail("Carrera incompleta o identidad duplicada.");
    ids.add(c.id);
    for (const o of c.offers) {
      if (
        !o.id ||
        offerIds.has(o.id) ||
        [
          "institution",
          "funding",
          "title",
          "location",
          "modality",
          "accreditation",
        ].some((k) => typeof o[k] !== "string") ||
        !o.institution.trim() ||
        !o.title.trim()
      )
        fail("Oferta incompleta o identidad duplicada.");
      const previous = data.careers.find((x) =>
        x.offers.some((y) => y.id === o.id),
      );
      if (previous && previous.id !== c.id)
        fail(
          "Una oferta existente no puede cambiar de carrera en una actualización por lotes.",
        );
      offerIds.add(o.id);
    }
  }
  const added = input.careers
    .filter((c: Career) => !data.careers.some((x) => x.id === c.id))
    .map((c: Career) => ({ id: c.id, name: c.name }));
  const changed = input.careers
    .filter((c: Career) =>
      data.careers.some(
        (x) => x.id === c.id && JSON.stringify(x) !== JSON.stringify(c),
      ),
    )
    .map((c: Career) => ({ id: c.id, name: c.name }));
  const absent = data.careers
    .filter((c) => !ids.has(c.id))
    .map((c) => ({ id: c.id, name: c.name }));
  const missingOffers = data.careers.flatMap((c) =>
    c.offers
      .filter((o) => !offerIds.has(o.id))
      .map((o) => ({ id: o.id, careerId: c.id, title: o.title })),
  );
  return {
    baseVersion: data.sha256,
    added,
    changed,
    absent,
    missingOffers,
    note: "Las ausencias se conservan. No se fusionan carreras ni se borran ofertas automáticamente.",
  };
}
export async function applyCatalog(
  input: any,
  baseVersion: string,
  actor: string,
) {
  if (baseVersion !== data.sha256)
    fail("El catálogo cambió. Genera una vista previa nueva.", 409);
  const diff = previewCatalog(input);
  const merged = data.careers.map((old) => {
    const update = input.careers.find((c: Career) => c.id === old.id);
    return update
      ? {
          ...old,
          ...update,
          sourceUrl: input.sourceUrl,
          sourceDate: input.retrievedAt,
          offers: [
            ...old.offers.filter(
              (o) => !update.offers.some((x: Offer) => x.id === o.id),
            ),
            ...update.offers.map((o: Offer) => ({
              ...o,
              sourceUrl: input.sourceUrl,
              sourceDate: input.retrievedAt,
            })),
          ],
        }
      : {
          ...old,
          sourceUrl: old.sourceUrl || data.sourceUrl,
          sourceDate: old.sourceDate || data.retrievedAt,
        };
  });
  merged.push(
    ...input.careers
      .filter((c: Career) => !data.careers.some((x) => x.id === c.id))
      .map((c: Career) => ({
        ...c,
        sourceUrl: input.sourceUrl,
        sourceDate: input.retrievedAt,
      })),
  );
  const next = {
    ...data,
    source: input.source,
    sourceUrl: input.sourceUrl,
    retrievedAt: input.retrievedAt,
    careers: merged,
    careerCount: merged.length,
    offerCount: merged.reduce((n, c) => n + c.offers.length, 0),
    sha256: createHash("sha256").update(JSON.stringify(merged)).digest("hex"),
  };
  if (next.sha256 === data.sha256) return { ...diff, version: data.sha256 };
  await db
    .prepare("INSERT INTO academic_catalog_versions VALUES(?,?,?,?)")
    .run(next.sha256, JSON.stringify(next), actor, new Date().toISOString());
  installCatalog(next);
  return { ...diff, version: next.sha256 };
}
