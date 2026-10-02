// Reference directories shown on the plan's category tabs. Real organisations,
// listed for reference only: no partnerships, not ranked, no prices.

import logoManifest from "./provider-logos.json";
import { answerLabel, type Answers } from "./questions";
import type { Plan, TaskId } from "./plan";

export interface Provider {
  /** Which task or step it serves, e.g. "B08 · HEALTH COVER". */
  forStep: string;
  name: string;
  type: string;
  why: string;
  website: string;
}

export interface ProviderLogo {
  /** Path under public/, e.g. "/logos/adgm.png". */
  src: string;
  /** Reversed (light) logo that needs a dark tile. */
  onDark?: boolean;
  /** Where the file was downloaded from (see scripts/fetch-logos.mjs). */
  source: string;
}

/** Logos keyed by provider name; regenerate with `node scripts/fetch-logos.mjs`. */
const LOGOS: Record<string, ProviderLogo> = logoManifest;

export const providerLogo = (name: string): ProviderLogo | null => LOGOS[name] ?? null;

const p = (forStep: string, name: string, type: string, why: string, website = "—"): Provider => ({
  forStep, name, type, why, website,
});

const BANK_STEP = "{STEP}";
const BANK_NOTE = "{NOTE}";

export const PROVIDERS = {
  company: [
    p("A01–A06 · LICENSING", "TAMM", "Government services portal", "Single front door for trade name, initial approval and licence applications.", "tamm.abudhabi"),
    p("A01 · MAINLAND", "ADDED", "Mainland licensing authority", "Issues mainland licences — the route if you invoice UAE customers directly.", "added.gov.ae"),
    p("A01 · FREE ZONE", "ADGM", "Financial free zone · Al Maryah Island", "Common-law jurisdiction; also home to Hub71.", "adgm.com"),
    p("A01 · FREE ZONE", "KEZAD", "Industrial & logistics free zone", "Relevant if you need warehouse or industrial premises.", "kezad.ae"),
    p("A01 · FREE ZONE", "Masdar City Free Zone", "Tech & sustainability free zone", "Shortlist option for tech and cleantech activities."),
    p("A01 · FREE ZONE", "twofour54", "Media free zone", "Relevant only for media, gaming and content activities.", "twofour54.com"),
    p("A01 · ECOSYSTEM", "Hub71", "Tech startup programme", "Incentive programme, not a licence — you still need a jurisdiction.", "hub71.com"),
    p("A06 · TAX", "Federal Tax Authority", "VAT & corporate tax registration", "Registration follows the issued licence.", "tax.gov.ae"),
    p("B01 · WORK PERMITS", "MOHRE", "Ministry of Human Resources", "Mainland employment contracts and work permits for your hires.", "mohre.gov.ae"),
  ],
  banking: [
    p(BANK_STEP, "First Abu Dhabi Bank (FAB)", "Conventional · Abu Dhabi HQ", BANK_NOTE, "bankfab.com"),
    p(BANK_STEP, "Abu Dhabi Commercial Bank (ADCB)", "Conventional · Abu Dhabi HQ", BANK_NOTE, "adcb.com"),
    p(BANK_STEP, "Abu Dhabi Islamic Bank (ADIB)", "Islamic · Abu Dhabi HQ", BANK_NOTE, "adib.ae"),
    p(BANK_STEP, "Wio Bank", "Digital · Abu Dhabi-based", "Digital onboarding; confirm which licence types it accepts.", "wio.io"),
    p(BANK_STEP, "Emirates NBD", "Conventional · national network", BANK_NOTE, "emiratesnbd.com"),
    p(BANK_STEP, "Mashreq", "Conventional · NEO digital range", BANK_NOTE, "mashreq.com"),
    p(BANK_STEP, "RAKBANK", "Conventional · SME focus", BANK_NOTE, "rakbank.ae"),
  ],
  insurance: [
    p("B08 · HEALTH COVER", "Daman", "Health insurer · Abu Dhabi HQ", "Large Abu Dhabi health insurer with individual and employer plans.", "damanhealth.ae"),
    p("B08 · HEALTH COVER", "ADNIC", "Multi-line insurer · Abu Dhabi HQ", "Health, home and motor under one provider.", "adnic.ae"),
    p("B08 · HEALTH COVER", "Abu Dhabi National Takaful", "Takaful (Sharia-compliant)", "Option if you want Islamic-compliant cover.", "takaful.ae"),
    p("B08 · HEALTH COVER", "Sukoon", "Multi-line insurer (formerly Oman Insurance)", "UAE-wide health and home cover.", "sukoon.com"),
    p("B08 · HEALTH COVER", "GIG Gulf", "Multi-line insurer (formerly AXA Gulf)", "UAE-wide health cover, individual and group.", "gig-gulf.com"),
    p("B08 · INTERNATIONAL", "Allianz Care", "International health plans", "Worth comparing if you travel often or keep cover abroad.", "allianzcare.com"),
    p("B08 · INTERNATIONAL", "Bupa Global", "International health plans", "International cover; check it satisfies Abu Dhabi visa rules.", "bupaglobal.com"),
    p("B08 · INTERNATIONAL", "Cigna Global", "International health plans", "International cover; check it satisfies Abu Dhabi visa rules.", "cignaglobal.com"),
  ],
  schools: [
    p("B07 · SAADIYAT", "Cranleigh Abu Dhabi", "British curriculum", "Saadiyat Island — closest to your chosen area if you picked Saadiyat.", "via adek.gov.ae"),
    p("B07 · AL BATEEN", "Brighton College Abu Dhabi", "British curriculum", "City-side; longer commute from the islands.", "via adek.gov.ae"),
    p("B07 · AL MUSHRIF", "The British School Al Khubairat", "British curriculum", "Long-established city school; places can be competitive.", "via adek.gov.ae"),
    p("B07 · AL REEM", "Repton Abu Dhabi", "British & IB", "On Al Reem Island.", "via adek.gov.ae"),
    p("B07 · KHALIFA CITY", "Raha International School", "IB", "Near Khalifa City and Al Raha.", "via adek.gov.ae"),
    p("B07 · KHALIFA CITY", "GEMS American Academy", "American curriculum", "Near Khalifa City.", "via adek.gov.ae"),
    p("B07 · CITY", "Lycée Louis Massignon", "French curriculum", "French system; check campus location.", "via adek.gov.ae"),
  ],
  logistics: [
    p("B09 · HOUSEHOLD MOVE", "Crown Relocations", "International mover", "Door-to-door household shipping and destination services.", "crownrelo.com"),
    p("B09 · HOUSEHOLD MOVE", "Santa Fe Relocation", "International mover", "Household moves, immigration support and home search.", "santaferelo.com"),
    p("B09 · HOUSEHOLD MOVE", "Allied Pickfords", "International mover", "Household goods shipping."),
    p("B09 · HOUSEHOLD MOVE", "Writer Relocations", "International mover", "Household goods shipping, strong on India–UAE routes."),
    p("B09 · FLIGHTS", "Etihad Airways", "Abu Dhabi flag carrier", "Book against your residence visa date, not your target month.", "etihad.com"),
    p("B01 · DOCUMENTS", "Aramex", "Courier", "Ship attested certificates ahead of you.", "aramex.com"),
    p("B01 · ATTESTATION", "UAE Ministry of Foreign Affairs", "Document attestation", "Degree and marriage certificates must be attested before visa steps.", "mofa.gov.ae"),
    p("B09 · PETS", "MOCCAE", "Pet import permits", "Apply for the import permit before booking a pet on any flight.", "moccae.gov.ae"),
  ],
  settling: [
    p("B02 · MEDICAL", "SEHA", "Visa medical screening centres", "Where the medical fitness test is usually taken.", "seha.ae"),
    p("B03 · EMIRATES ID", "ICP", "Identity & residency authority", "Biometrics, Emirates ID and residence visa status.", "icp.gov.ae"),
    p("B06 · TENANCY", "Tawtheeq (via TAMM)", "Tenancy registration", "Abu Dhabi’s tenancy register. Ejari is Dubai’s and does not apply.", "tamm.abudhabi"),
    p("B06 · ELECTRICITY & WATER", "TAQA Distribution", "Utility", "Account is set up automatically once your tenancy is registered in Tawtheeq.", "taqadistribution.com"),
    p("B06 · PROPERTY SEARCH", "Bayut", "Property portal", "Listings to shortlist — always verify the landlord and the Tawtheeq status.", "bayut.com"),
    p("B06 · PROPERTY SEARCH", "Property Finder", "Property portal", "Second source for the same shortlist.", "propertyfinder.ae"),
    p("B06 · PROPERTY SEARCH", "dubizzle", "Classifieds & property", "Also useful for second-hand furniture and cars.", "dubizzle.com"),
    p("B10 · MOBILE & INTERNET", "e&", "Telecom (formerly Etisalat)", "Mobile and home fibre; needs your Emirates ID.", "etisalat.ae"),
    p("B10 · MOBILE & INTERNET", "du", "Telecom", "Mobile and home fibre; needs your Emirates ID.", "du.ae"),
    p("B10 · MOBILE", "Virgin Mobile UAE", "Mobile", "App-based mobile plans.", "virginmobile.ae"),
    p("B10 · DRIVING", "Abu Dhabi Police (via TAMM)", "Driving licence conversion", "Some licences convert directly; others need driving lessons.", "tamm.abudhabi"),
    p("B10 · TRANSPORT", "Abu Dhabi Mobility — Darb & Hafilat", "Road tolls & bus card · formerly ITC", "Register your car for Darb tolls; Hafilat for public buses.", "admobility.gov.ae"),
  ],
} satisfies Record<string, Provider[]>;

export type DirectoryTab = keyof typeof PROVIDERS;

export const isDirectoryTab = (tab: string): tab is DirectoryTab => Object.hasOwn(PROVIDERS, tab);

export interface Directory {
  title: string;
  /** "ON YOUR PLAN · …" line linking the directory back to a task. */
  task: string;
  why: string;
  providers: Provider[];
}

export function directory(tab: DirectoryTab, plan: Plan): Directory {
  const founder = plan.profile === "founder_new";
  const onPlan = (id: TaskId) => {
    const t = plan.byId[id];
    return t ? { task: `ON YOUR PLAN · ${id} ${t.title.toUpperCase()}`, why: t.why } : { task: "", why: "" };
  };
  const bankStep = founder ? "A08 · CORPORATE ACCOUNT" : "B03 → SALARY ACCOUNT";
  const bankNote = founder
    ? "Corporate accounts ask for the issued licence, MoA and registered tenancy — confirm the list with the bank."
    : "Personal accounts open against your Emirates ID; ask about salary-transfer packages.";
  const providers = PROVIDERS[tab].map((r) => ({
    ...r,
    forStep: r.forStep === BANK_STEP ? bankStep : r.forStep,
    why: r.why === BANK_NOTE ? bankNote : r.why,
  }));

  switch (tab) {
    case "company":
      return { title: "Company setup", task: "ON YOUR PLAN · LAYER A", why: plan.byId.A01?.why ?? "", providers };
    case "banking":
      return founder
        ? { title: "Corporate banking", ...onPlan("A08"), providers }
        : {
            title: "Personal banking",
            task: "AFTER · B03 EMIRATES ID BIOMETRICS",
            why: "Banks open personal accounts against an Emirates ID, so your salary account follows biometrics — leave a few days of slack before your first salary.",
            providers,
          };
    case "insurance":
      return { title: "Health cover", ...onPlan("B08"), providers };
    case "schools":
      return { title: "Schools", ...onPlan("B07"), providers };
    case "logistics":
      return { title: "Moving & logistics", ...onPlan("B09"), providers };
    case "settling":
      return {
        title: "Settling in",
        task: "ON YOUR PLAN · B02 · B03 · B06 · B10",
        why: "Most of these ask for one of two documents: your Emirates ID or your registered Tawtheeq tenancy. Get those two right and the rest follows in days.",
        providers,
      };
  }
}

/** Employer package checklist. Every value is a sample to confirm against the offer letter. */
export function hrSheet(a: Answers) {
  return [
    { k: "SPONSOR", v: "EMPLOYER", n: "Files entry permit and residence visa with ICP." },
    { k: "VISA COSTS", v: "EMPLOYER-PAID", n: "Your own visa. Dependents are usually yours — confirm." },
    { k: "HOUSING", v: answerLabel("allowance", a).toUpperCase() || "—", n: "Sample: AED 90,000–150,000 / year." },
    { k: "HEALTH COVER", v: "EMPLOYER POLICY", n: "Covers you. Dependent cover: check policy." },
    { k: "RELOCATION", v: "AED 10,000–30,000", n: "One-off, sample range." },
    { k: "FLIGHTS", v: "1 RETURN / YEAR", n: "Sample policy." },
    { k: "PROBATION", v: "6 MONTHS", n: "Sample — confirm in your offer letter." },
    { k: "CONTRACT", v: "MOHRE", n: "Employment contract registered with MOHRE." },
  ];
}
