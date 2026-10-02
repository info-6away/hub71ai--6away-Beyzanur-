// Downloads each directory provider's logo from its own website and normalises
// it to a 192×192 PNG in public/logos/. Writes lib/provider-logos.json, which
// maps provider name → logo path, flags light (reversed) logos that need a dark
// tile, and records where each file came from.
//
//   node scripts/fetch-logos.mjs            fetch every logo
//   node scripts/fetch-logos.mjs adgm kezad fetch only these slugs
//
// Logos are the trademarks of their owners and are shown only to identify
// each provider; listing implies no partnership or endorsement.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "logos");
const MANIFEST = path.join(ROOT, "lib", "provider-logos.json");
const SIZE = 192;
const MIN_SOURCE_PX = 64;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

/**
 * `name` must match the provider name in lib/catalogue.ts. `site` is the
 * provider's own website. `icon` pins one or more exact files (tried in order)
 * when automatic discovery fails or picks the wrong image; `inlineSvg` extracts
 * a logo embedded as <svg> in the site's HTML.
 */
export const SOURCES = [
  // Company setup
  { slug: "tamm", name: "TAMM", site: "https://www.tamm.abudhabi" },
  { slug: "added", name: "ADDED", site: "https://added.gov.ae" },
  { slug: "adgm", name: "ADGM", site: "https://www.adgm.com", inlineSvg: /<svg\b[^>]*slot="logo"[^>]*>[\s\S]*?<\/svg>/i },
  { slug: "kezad", name: "KEZAD", site: "https://www.kezad.ae" },
  { slug: "masdar-city-free-zone", name: "Masdar City Free Zone", site: "https://masdarcityfreezone.com" },
  { slug: "twofour54", name: "twofour54", site: "https://www.twofour54.com" },
  { slug: "hub71", name: "Hub71", site: "https://www.hub71.com" },
  { slug: "fta", name: "Federal Tax Authority", site: "https://tax.gov.ae", icon: "https://tax.gov.ae/en/images/header/logo-fta.webp" },
  { slug: "mohre", name: "MOHRE", site: "https://www.mohre.gov.ae", icon: "https://www.mohre.gov.ae/favicon.ico" },
  // Banking
  { slug: "fab", name: "First Abu Dhabi Bank (FAB)", site: "https://www.bankfab.com", icon: "https://www.bankfab.com/-/media/project/fab2/fab2/data/media/img/fab-logo.svg" },
  { slug: "adcb", name: "Abu Dhabi Commercial Bank (ADCB)", site: "https://www.adcb.com" },
  { slug: "adib", name: "Abu Dhabi Islamic Bank (ADIB)", site: "https://www.adib.ae", icon: "https://www.adib.ae/-/media/project/adib/adibsite/header/logo.svg" },
  { slug: "wio", name: "Wio Bank", site: "https://www.wio.io" },
  { slug: "emirates-nbd", name: "Emirates NBD", site: "https://www.emiratesnbd.com" },
  { slug: "mashreq", name: "Mashreq", site: "https://www.mashreq.com" },
  { slug: "rakbank", name: "RAKBANK", site: "https://www.rakbank.ae", icon: "https://www.rakbank.ae/globalassets/rakbank/header/logos/logo-dark.png/" },
  // Health cover
  { slug: "daman", name: "Daman", site: "https://www.damanhealth.ae" },
  { slug: "adnic", name: "ADNIC", site: "https://www.adnic.ae" },
  { slug: "takaful", name: "Abu Dhabi National Takaful", site: "https://www.takaful.ae" },
  { slug: "sukoon", name: "Sukoon", site: "https://www.sukoon.com" },
  { slug: "gig-gulf", name: "GIG Gulf", site: "https://www.gig-gulf.com", icon: ["https://www.gig-gulf.com/o/gig-latest-theme/images/favicon.ico", "https://www.gig-gulf.com/documents/554082/25192913/gig-fairfax-logo.png"] },
  { slug: "allianz-care", name: "Allianz Care", site: "https://www.allianzcare.com" },
  { slug: "bupa-global", name: "Bupa Global", site: "https://www.bupaglobal.com" },
  { slug: "cigna-global", name: "Cigna Global", site: "https://www.cignaglobal.com" },
  // Schools
  { slug: "cranleigh", name: "Cranleigh Abu Dhabi", site: "https://www.aldar.com/education/schools/cranleigh-abu-dhabi", icon: "https://images4.cmp.optimizely.com/assets/cranleigh-logo.png/Zz0zZjA5ZTM5YTk0NzYxMWYwYjU2NTJlYWVlYWZiYmNjZg==/" },
  { slug: "brighton-college", name: "Brighton College Abu Dhabi", site: "https://www.brightoncollege.ae" },
  { slug: "bsak", name: "The British School Al Khubairat", site: "https://www.britishschool.sch.ae" },
  { slug: "repton", name: "Repton Abu Dhabi", site: "https://www.reptonabudhabi.org", icon: "https://www.reptonabudhabi.org/wp-content/uploads/sites/16/2024/09/RAD_IVORY-cropped.png" },
  { slug: "raha", name: "Raha International School", site: "https://www.ris.ae" },
  { slug: "gems-american-academy", name: "GEMS American Academy", site: "https://www.gemsaa-abudhabi.com" },
  { slug: "lycee-massignon", name: "Lycée Louis Massignon", site: "https://llm.education" },
  // Moving & logistics
  { slug: "crown", name: "Crown Relocations", site: "https://www.crownrelo.com", icon: "https://cdn-ildjlpj.nitrocdn.com/heEDkVnxcGGiRuKpNlQCvxvfHkshnglj/assets/images/optimized/rev-56b6379/www.crownrelo.com/uae/wp-content/themes/crown/dist/images/logo.svg" },
  { slug: "santa-fe", name: "Santa Fe Relocation", site: "https://www.santaferelo.com" },
  { slug: "allied-pickfords", name: "Allied Pickfords", site: "https://www.allied.com/ae/", icon: "https://www.allied.com/images/default-source/allied-images/logos/allied_logo.png" },
  { slug: "writer", name: "Writer Relocations", site: "https://writerrelocations.com" },
  { slug: "etihad", name: "Etihad Airways", site: "https://www.etihad.com" },
  { slug: "aramex", name: "Aramex", site: "https://www.aramex.com", icon: "https://dotcomaramexprod.blob.core.windows.net/default/docs/default-source/logo/aramex-logo-english.webp" },
  { slug: "mofa", name: "UAE Ministry of Foreign Affairs", site: "https://www.mofa.gov.ae" },
  { slug: "moccae", name: "MOCCAE", site: "https://www.moccae.gov.ae" },
  // Settling in
  { slug: "seha", name: "SEHA", site: "https://www.seha.ae", icon: "https://www.seha.ae/img/logo.png" },
  { slug: "icp", name: "ICP", site: "https://icp.gov.ae" },
  { slug: "tawtheeq-dmt", name: "Tawtheeq (via TAMM)", site: "https://www.dmt.gov.ae", icon: "https://www.dmt.gov.ae/-/media/Project/DMT/DMT/Header/DMT-Logo.svg" },
  { slug: "taqa-distribution", name: "TAQA Distribution", site: "https://www.taqadistribution.com", icon: "https://taqadistribution.com/favicon.ico" },
  { slug: "bayut", name: "Bayut", site: "https://www.bayut.com" },
  { slug: "property-finder", name: "Property Finder", site: "https://www.propertyfinder.ae" },
  { slug: "dubizzle", name: "dubizzle", site: "https://www.dubizzle.com" },
  { slug: "eand", name: "e&", site: "https://www.etisalat.ae" },
  { slug: "du", name: "du", site: "https://www.du.ae" },
  { slug: "virgin-mobile", name: "Virgin Mobile UAE", site: "https://www.virginmobile.ae" },
  { slug: "ad-police", name: "Abu Dhabi Police (via TAMM)", site: "https://www.adpolice.gov.ae" },
  { slug: "ad-mobility", name: "Abu Dhabi Mobility — Darb & Hafilat", site: "https://admobility.gov.ae", icon: "https://admobility.gov.ae/-/media/feature/itc-revamp/header/ad-mobility-master-bilingual-identity-full-colour-v2.png" },
];

async function get(url, { timeout = 20_000 } = {}) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,image/*,*/*;q=0.8", "accept-language": "en" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1];

/** Icon candidates from <link> tags and the web app manifest, best first. */
async function candidates(site) {
  const res = await get(site);
  const base = res.url;
  const html = await res.text();
  const found = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href");
    if (!href || href.startsWith("data:")) continue;
    const url = new URL(href, base).href;
    if (rel === "manifest") {
      try {
        const manifest = await (await get(url)).json();
        for (const icon of manifest.icons ?? []) {
          const size = Math.max(...String(icon.sizes ?? "0").split(/\s+/).map((s) => Number.parseInt(s, 10) || 0));
          found.push({ url: new URL(icon.src, url).href, score: size, via: "manifest" });
        }
      } catch {}
      continue;
    }
    if (!/icon/.test(rel) || rel.includes("mask-icon")) continue;
    const sizes = Number.parseInt(attr(tag, "sizes") ?? "", 10) || 0;
    const svg = /\.svg(\?|$)/i.test(url) || attr(tag, "type") === "image/svg+xml";
    const score = svg ? 1000 : sizes || (rel.includes("apple-touch") ? 180 : 32);
    found.push({ url, score, via: rel });
  }
  found.push({ url: new URL("/apple-touch-icon.png", base).href, score: 170, via: "apple-touch-icon guess" });
  found.push({ url: new URL("/favicon.ico", base).href, score: 1, via: "favicon guess" });
  return found.sort((a, b) => b.score - a.score);
}

/** A 32-bit BMP frame from an .ico file as raw RGBA (rows are stored bottom-up, BGRA). */
function rgbaFromBmpFrame(frame) {
  const headerSize = frame.readUInt32LE(0);
  const width = frame.readInt32LE(4);
  const height = frame.readInt32LE(8) / 2; // XOR image + AND mask
  if (frame.readUInt16LE(14) !== 32) return null;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = headerSize + ((height - 1 - y) * width + x) * 4;
      const dst = (y * width + x) * 4;
      rgba[dst] = frame[src + 2];
      rgba[dst + 1] = frame[src + 1];
      rgba[dst + 2] = frame[src];
      rgba[dst + 3] = frame[src + 3];
    }
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } });
}

/** The largest frame inside a .ico file, as a sharp image; null if not an .ico. */
function imageFromIco(buf) {
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) return null;
  let best = null;
  for (let i = 0; i < buf.readUInt16LE(4); i++) {
    const entry = 6 + i * 16;
    const width = buf[entry] || 256;
    const [size, offset] = [buf.readUInt32LE(entry + 8), buf.readUInt32LE(entry + 12)];
    if (!best || width > best.width) best = { width, frame: buf.subarray(offset, offset + size) };
  }
  if (!best) return null;
  return best.frame.subarray(1, 4).toString() === "PNG" ? sharp(best.frame) : rgbaFromBmpFrame(best.frame);
}

/**
 * A reversed logo: transparent background with mostly near-white marks, made
 * for a dark header. Logos with their own opaque background never qualify.
 */
async function isReversed(trimmed) {
  const { data } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  let nearWhite = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    opaque++;
    if ((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255 > 0.85) nearWhite++;
  }
  const hasTransparency = opaque < data.length / 4;
  return hasTransparency && opaque > 0 && nearWhite / opaque > 0.6;
}

/** Decodes, trims and normalises an image; returns null if it is unusable. */
async function normalise(buf) {
  const ico = imageFromIco(buf);
  if (ico) buf = await ico.png().toBuffer();
  const isSvg = /^\s*(<\?xml|<svg)/i.test(buf.subarray(0, 200).toString());
  const img = sharp(buf, isSvg ? { density: 400 } : {});
  const meta = await img.metadata();
  if (!isSvg && Math.max(meta.width ?? 0, meta.height ?? 0) < MIN_SOURCE_PX) return null;
  let trimmed = await img.png().toBuffer();
  try {
    trimmed = await sharp(trimmed).trim({ threshold: 12 }).toBuffer();
  } catch {}
  const png = await sharp(trimmed)
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return { png, onDark: await isReversed(trimmed) };
}

async function fetchLogo(source) {
  const tried = [];
  let list = [];
  try {
    if (source.inlineSvg) {
      const svg = (await (await get(source.site)).text()).match(source.inlineSvg)?.[0];
      if (svg) {
        const logo = await normalise(Buffer.from(svg));
        if (logo) return { ...logo, url: source.site, via: "inline svg" };
      }
    }
    list = source.icon
      ? [source.icon].flat().map((url) => ({ url, via: "pinned" }))
      : await candidates(source.site);
  } catch (e) {
    tried.push(`site: ${e.message}`);
  }
  const host = new URL(source.site).hostname.replace(/^www\./, "");
  list.push({ url: `https://www.google.com/s2/favicons?domain=${host}&sz=256`, via: "google favicon service" });
  for (const c of list) {
    try {
      const logo = await normalise(Buffer.from(await (await get(c.url)).arrayBuffer()));
      if (logo) return { ...logo, url: c.url, via: c.via };
      tried.push(`too small: ${c.url}`);
    } catch (e) {
      tried.push(`${e.message.slice(0, 80)}: ${c.url}`);
    }
  }
  return { tried };
}

const only = process.argv.slice(2);
const manifest = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));
await mkdir(OUT_DIR, { recursive: true });

const results = await Promise.all(
  SOURCES.filter((s) => !only.length || only.includes(s.slug)).map(async (s) => [s, await fetchLogo(s)]),
);
for (const [s, r] of results) {
  if (r.png) {
    await writeFile(path.join(OUT_DIR, `${s.slug}.png`), r.png);
    manifest[s.name] = { src: `/logos/${s.slug}.png`, ...(r.onDark && { onDark: true }), source: r.url };
    console.log(`ok    ${s.slug.padEnd(24)} ${r.via} · ${r.url}`);
  } else {
    delete manifest[s.name];
    console.log(`FAIL  ${s.slug.padEnd(24)} ${r.tried.join(" | ")}`);
  }
}
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
