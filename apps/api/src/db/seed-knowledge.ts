/**
 * Seed script for the Knowledge door — 31 moments, 21 actors, 36 tags.
 * Idempotent: upserts actors/tags, deletes and reinserts all knowledge moments.
 *
 * Usage (from apps/api/):
 *   pnpm db:seed-knowledge
 */

import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import { actors, momentActors, momentSources, momentTags, moments, tags } from "./schema/archive";

// ---------------------------------------------------------------------------
// Actors
// ---------------------------------------------------------------------------

const ACTORS_SEED = [
  { name: "Zionist Organization (WZO)", slug: "zionist-organization", type: "organization" },
  { name: "Theodor Herzl",              slug: "theodor-herzl",         type: "person" },
  { name: "British Empire",             slug: "british-empire",        type: "state" },
  { name: "France",                     slug: "france",                type: "state" },
  { name: "League of Nations",          slug: "league-of-nations",     type: "organization" },
  { name: "United Nations",             slug: "united-nations",        type: "organization" },
  { name: "Arab Higher Committee",      slug: "arab-higher-committee", type: "organization" },
  { name: "Jewish Agency",              slug: "jewish-agency",         type: "organization" },
  { name: "David Ben-Gurion",           slug: "david-ben-gurion",      type: "person" },
  { name: "Haganah",                    slug: "haganah",               type: "group" },
  { name: "Irgun",                      slug: "irgun",                 type: "group" },
  { name: "Lehi",                       slug: "lehi",                  type: "group" },
  { name: "Zionist movement",           slug: "zionist-movement",      type: "organization" },
  { name: "Czechoslovakia",             slug: "czechoslovakia",        type: "state" },
  { name: "State of Israel",            slug: "israel",                type: "state" },
  { name: "Israeli military (IDF)",     slug: "idf",                   type: "organization" },
  { name: "Israeli Border Police (Magav)", slug: "israel-border-police", type: "organization" },
  { name: "Knesset",                    slug: "knesset",               type: "organization" },
  { name: "Israeli High Court of Justice", slug: "israeli-supreme-court", type: "organization" },
  { name: "International Court of Justice", slug: "icj",              type: "organization" },
  { name: "Palestinians",               slug: "palestinians",          type: "group" },
] as const;

// ---------------------------------------------------------------------------
// Tags — slug → display name
// ---------------------------------------------------------------------------

const TAGS_SEED: { slug: string; name: string }[] = [
  { slug: "origin",          name: "Origin" },
  { slug: "zionism",         name: "Zionism" },
  { slug: "what-was-done",   name: "What Was Done" },
  { slug: "treaty",          name: "Treaty" },
  { slug: "colonialism",     name: "Colonialism" },
  { slug: "1910s",           name: "1910s" },
  { slug: "british-mandate", name: "British Mandate" },
  { slug: "law",             name: "Law" },
  { slug: "uprising",        name: "Uprising" },
  { slug: "partition",       name: "Partition" },
  { slug: "transfer",        name: "Transfer" },
  { slug: "immigration",     name: "Immigration" },
  { slug: "militancy",       name: "Militancy" },
  { slug: "apparatus",       name: "Apparatus" },
  { slug: "irgun",           name: "Irgun" },
  { slug: "bombing",         name: "Bombing" },
  { slug: "un-resolution",   name: "UN Resolution" },
  { slug: "nakba",           name: "Nakba" },
  { slug: "arms",            name: "Arms" },
  { slug: "right-of-return", name: "Right of Return" },
  { slug: "martial-law",     name: "Martial Law" },
  { slug: "land",            name: "Land" },
  { slug: "dispossession",   name: "Dispossession" },
  { slug: "citizenship",     name: "Citizenship" },
  { slug: "ruling",          name: "Ruling" },
  { slug: "occupation",      name: "Occupation" },
  { slug: "settlements",     name: "Settlements" },
  { slug: "expropriation",   name: "Expropriation" },
  { slug: "wall",            name: "Wall" },
  { slug: "gaza",            name: "Gaza" },
  { slug: "blockade",        name: "Blockade" },
  { slug: "memory",          name: "Memory" },
  { slug: "erasure",         name: "Erasure" },
  { slug: "displacement",    name: "Displacement" },
  { slug: "negev",           name: "Negev" },
  { slug: "icj",             name: "ICJ" },
];

// ---------------------------------------------------------------------------
// Moment definitions
// ---------------------------------------------------------------------------

interface SourceDef {
  type: string;
  label: string;
  url?: string | null;
  fileKey?: string | null;
  metadata?: Record<string, unknown>;
  rightsStatus?: string;
}

interface MomentDef {
  title: string;
  occurredAt: string | null;
  location: string | null;
  coverImageKey: string | null;
  description: string;
  tags: string[];
  actors: { slug: string; role: string }[];
  sources: SourceDef[];
}

const MOMENTS: MomentDef[] = [
  {
    title: "First Zionist Congress / Basel Program",
    occurredAt: "1897",
    location: "Basel",
    coverImageKey: "knowledge/mountain-jews-with-herzl-at-the-1st-zionist-congress-basel-switzerland-1897.webp",
    description: "The First Zionist Congress convened by Theodor Herzl in Basel adopted the Basel Program — the founding document of political Zionism, calling for a home for the Jewish people in Palestine. In his diary Herzl wrote: \"At Basel I founded the Jewish State.\" The opening act on the record.",
    tags: ["origin", "zionism", "what-was-done"],
    actors: [
      { slug: "zionist-organization", role: "criminal" },
      { slug: "theodor-herzl",        role: "criminal" },
      { slug: "palestinians",         role: "victim" },
    ],
    sources: [
      { type: "file", label: "Mountain Jews with Herzl at the 1st Zionist Congress, Basel, 1897", fileKey: "knowledge/mountain-jews-with-herzl-at-the-1st-zionist-congress-basel-switzerland-1897.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Sykes-Picot Agreement",
    occurredAt: "1916",
    location: "London / Paris",
    coverImageKey: "knowledge/sykes-picot.webp",
    description: "Secret 1916 Anglo-French agreement carving the Ottoman Arab provinces into spheres of control, drawn without the inhabitants' knowledge or consent. Exposed to the world only when the Bolsheviks published the secret treaties in 1917.",
    tags: ["treaty", "colonialism", "1910s", "what-was-done"],
    actors: [
      { slug: "british-empire", role: "criminal" },
      { slug: "france",         role: "criminal" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "Sykes-Picot annotated carve-up map, 1916", fileKey: "knowledge/sykes-picot.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Balfour Declaration",
    occurredAt: "1917-11-02",
    location: "London",
    coverImageKey: "knowledge/balfour-declaration-unmarked.webp",
    description: "A letter from British Foreign Secretary Arthur James Balfour to Lord Walter Rothschild, pledging British support for \"the establishment in Palestine of a national home for the Jewish people\" — while the majority Arab population was not consulted. One sentence disposed of a nation.",
    tags: ["treaty", "british-mandate", "what-was-done"],
    actors: [
      { slug: "british-empire", role: "criminal" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "Balfour Declaration, 1917", fileKey: "knowledge/balfour-declaration-unmarked.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "British Mandate for Palestine",
    occurredAt: "1923",
    location: "Geneva / Palestine",
    coverImageKey: "knowledge/hope-simpson-inquiry.webp",
    description: "The League of Nations ratified the British Mandate, enshrining the Balfour Declaration in international law. Article 4 granted the Jewish Agency a quasi-governmental status with no Arab equivalent. The Hope Simpson Report (1930) later documented the dispossession already underway.",
    tags: ["law", "british-mandate", "what-was-done"],
    actors: [
      { slug: "league-of-nations", role: "criminal" },
      { slug: "british-empire",    role: "criminal" },
      { slug: "palestinians",      role: "victim" },
    ],
    sources: [
      { type: "file", label: "Hope Simpson Inquiry, 1930", fileKey: "knowledge/hope-simpson-inquiry.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "1936 General Strike / Arab Higher Committee",
    occurredAt: "1936",
    location: "Mandatory Palestine",
    coverImageKey: "knowledge/arab-higher-committee-banishment.webp",
    description: "The Arab Higher Committee called a general strike beginning April 1936 — the longest in the history of any people under colonial rule. Britain responded by dissolving the AHC, exiling its leadership, and banning political organization.",
    tags: ["uprising", "british-mandate", "what-was-done"],
    actors: [
      { slug: "british-empire",      role: "criminal" },
      { slug: "arab-higher-committee", role: "victim" },
      { slug: "palestinians",        role: "victim" },
    ],
    sources: [
      { type: "file", label: "Arab Higher Committee banishment order", fileKey: "knowledge/arab-higher-committee-banishment.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Great Arab Revolt",
    occurredAt: "1936–1939",
    location: "Mandatory Palestine",
    coverImageKey: "knowledge/great-arab-revolt.webp",
    description: "Three years of armed uprising against British rule and Zionist immigration. Britain's response included collective punishment, demolition of the Jaffa Old City, and the execution of hundreds. Official Notice 115/36 (16 Jun 1936) ordered the demolition of Jaffa's old quarter under a \"town planning\" pretext.",
    tags: ["uprising", "what-was-done", "british-mandate"],
    actors: [
      { slug: "british-empire", role: "criminal" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "Great Arab Revolt, 1936–1939", fileKey: "knowledge/great-arab-revolt.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Peel Commission Report",
    occurredAt: "1937",
    location: "London / Palestine",
    coverImageKey: "knowledge/peel-commission.webp",
    description: "The British Royal Commission recommended partition of Palestine and the first official endorsement of \"transfer\" — the forced removal of Arabs from the proposed Jewish state. Woodhead Commission (1938) walked back the partition map but not the principle of transfer.",
    tags: ["partition", "transfer", "what-was-done"],
    actors: [
      { slug: "british-empire", role: "criminal" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "Peel Commission, 1937", fileKey: "knowledge/peel-commission.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Ben-Gurion Transfer Statement",
    occurredAt: "1938-06-12",
    location: "Jerusalem",
    coverImageKey: "knowledge/page-from-david-ben-gurion-s-letter-to-his-son.webp",
    description: "In a Jewish Agency Executive meeting on 12 June 1938, David Ben-Gurion stated: \"I support compulsory transfer. I do not see in it anything immoral.\" (CZA S100/24B; Benny Morris, Righteous Victims, p.144.) Meeting minutes, not diary — a formal institutional record of intent.",
    tags: ["transfer", "zionism", "what-was-done"],
    actors: [
      { slug: "david-ben-gurion", role: "criminal" },
      { slug: "jewish-agency",    role: "criminal" },
      { slug: "palestinians",     role: "victim" },
    ],
    sources: [
      { type: "file", label: "Page from David Ben-Gurion's letter to his son", fileKey: "knowledge/page-from-david-ben-gurion-s-letter-to-his-son.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "1939 White Paper (MacDonald)",
    occurredAt: "1939-05-17",
    location: "London",
    coverImageKey: "knowledge/1939-white-paper-cmd-6019.webp",
    description: "The MacDonald White Paper capped Jewish immigration at ~75,000 over five years (then requiring Arab consent) and imposed land-sale restrictions. A concession wrested from Britain after the revolt — it delayed the project but could not stop it. Cmd. 6019.",
    tags: ["british-mandate", "immigration", "what-was-done"],
    actors: [
      { slug: "british-empire", role: "documenter" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "1939 White Paper, Cmd. 6019", fileKey: "knowledge/1939-white-paper-cmd-6019.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "HaMaas / Cmd. 6873",
    occurredAt: "1945–1946",
    location: "Palestine / London",
    coverImageKey: "knowledge/meitar-collection-hamaas.webp",
    description: "HaMaas was the underground press organ of Lehi (the Stern Gang). The British White Paper Cmd. 6873 used HaMaas pages as documentary evidence of coordinated Jewish armed resistance. Source: Walid Khalidi, From Haven to Conquest (1971). The Meitar Collection holds originals.",
    tags: ["militancy", "apparatus", "what-was-done"],
    actors: [
      { slug: "lehi",           role: "criminal" },
      { slug: "jewish-agency",  role: "criminal" },
      { slug: "british-empire", role: "documenter" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "HaMaas — Lehi underground press (Meitar Collection)", fileKey: "knowledge/meitar-collection-hamaas.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "King David Hotel Bombing",
    occurredAt: "1946-07-22",
    location: "Jerusalem",
    coverImageKey: "knowledge/july-22-king-david-hotel.webp",
    description: "The Irgun bombed the southern wing of the King David Hotel — the headquarters of British civil and military administration in Palestine — killing 91 people (~41 Palestinian/Arab, 28 British, 17 Jewish). The stated motive: destroy Operation Agatha documents seized from the Jewish Agency.",
    tags: ["militancy", "irgun", "bombing", "apparatus"],
    actors: [
      { slug: "irgun",          role: "criminal" },
      { slug: "palestinians",   role: "victim" },
      { slug: "british-empire", role: "victim" },
    ],
    sources: [
      { type: "file", label: "King David Hotel bombing, 22 July 1946", fileKey: "knowledge/july-22-king-david-hotel.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "UN Partition Plan, Resolution 181",
    occurredAt: "1947-11-29",
    location: "Lake Success, NY",
    coverImageKey: "knowledge/un-partition-map-1947.webp",
    description: "The UN General Assembly adopted Resolution 181, partitioning Mandatory Palestine. The proposed Jewish state (~56% of the land) would contain a nearly equal Arab population (~45%). The Arab majority was not consulted in the decision that disposed of their country.",
    tags: ["un-resolution", "partition", "what-was-done"],
    actors: [
      { slug: "united-nations", role: "criminal" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "UN Partition Map, 1947", fileKey: "knowledge/un-partition-map-1947.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Plan Dalet",
    occurredAt: "1948-03",
    location: "Palestine",
    coverImageKey: "knowledge/plan-dalet.webp",
    description: "The Haganah's operational plan for the conquest of Palestine, issued March 1948 — weeks before the British Mandate ended. Plan Dalet provided the military doctrine for the systematic depopulation of Arab towns and villages: the Nakba.",
    tags: ["nakba", "what-was-done"],
    actors: [
      { slug: "haganah",         role: "criminal" },
      { slug: "zionist-movement", role: "criminal" },
      { slug: "palestinians",    role: "victim" },
    ],
    sources: [
      { type: "file", label: "Plan Dalet operational order, March 1948", fileKey: "knowledge/plan-dalet.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Operation Balak",
    occurredAt: "1948",
    location: "Žatec, Czechoslovakia → Palestine",
    coverImageKey: "knowledge/balak-douglas-c-54-skymaster-usaf.webp",
    description: "A secret airlift from Czechoslovakia that broke the UN arms embargo, delivering ex-Wehrmacht Avia S-199 fighters, rifles, and ammunition to Haganah forces during the 1948 war. Czechoslovakia was the sole state supplier — a Cold War anomaly that tipped the military balance.",
    tags: ["militancy", "arms", "apparatus"],
    actors: [
      { slug: "jewish-agency",   role: "criminal" },
      { slug: "haganah",         role: "criminal" },
      { slug: "czechoslovakia",  role: "supplier" },
      { slug: "palestinians",    role: "victim" },
    ],
    sources: [
      { type: "file", label: "Operation Balak — Douglas C-54 Skymaster, Žatec airlift, 1948", fileKey: "knowledge/balak-douglas-c-54-skymaster-usaf.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "UN Resolution 194 — Right of Return",
    occurredAt: "1948-12-11",
    location: "Paris",
    coverImageKey: "knowledge/kns1-return-eng.webp",
    description: "UN General Assembly Resolution 194 affirmed that Palestinian refugees wishing to return to their homes and live at peace with their neighbours should be permitted to do so at the earliest practicable date. It has been affirmed annually since 1948 — and never implemented.",
    tags: ["un-resolution", "right-of-return"],
    actors: [
      { slug: "united-nations", role: "adjudicator" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "UN Resolution 194 — Right of Return (KNS1)", fileKey: "knowledge/kns1-return-eng.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Military Government / Defence (Emergency) Regulations",
    occurredAt: "1948–1966",
    location: "Israel",
    coverImageKey: null,
    description: "Israel placed its Palestinian Arab citizens under military government from 1948 to 1966. Movement was controlled by travel permits; land could be confiscated by declaring areas \"closed military zones.\" The legal instrument was the British Defence (Emergency) Regulations of 1945, repurposed wholesale.",
    tags: ["martial-law", "law", "what-was-done"],
    actors: [
      { slug: "israel", role: "criminal" },
      { slug: "idf",    role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "Defence (Emergency) Regulations, Palestine Gazette 1945", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Absentees' Property Law",
    occurredAt: "1950",
    location: "Israel",
    coverImageKey: "knowledge/absentees-property-law.webp",
    description: "The Absentees' Property Law transferred the property of any Palestinian who had left their home — even to a neighbouring village still inside Israel — to the State Custodian. The category \"present absentee\" meant you could be physically in Israel yet legally dispossessed.",
    tags: ["law", "land", "dispossession"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "knesset",      role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "file", label: "Absentees' Property Law, 1950", fileKey: "knowledge/absentees-property-law.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Law of Return",
    occurredAt: "1950",
    location: "Israel",
    coverImageKey: null,
    description: "The Law of Return granted every Jewish person the right to immigrate to Israel — while Palestinians expelled in 1948 were denied the right to return to their homes under Resolution 194. Paired with the Citizenship Law (1952), it enshrined differential rights in law.",
    tags: ["law", "citizenship"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "knesset",      role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "Law of Return, 1950", rightsStatus: "unknown" },
      { type: "article", label: "Citizenship Law, 1952", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Kafr Qasim Ruling",
    occurredAt: "1956",
    location: "Israel (military court)",
    coverImageKey: "knowledge/kafir-qasim-defendants.webp",
    description: "Israeli Border Police killed 49 Palestinian civilians returning from the fields in Kafr Qasim, unaware a curfew had been imposed hours earlier. The military court's ruling by Justice Benjamin Halevy established the \"black flag\" doctrine: a manifestly illegal order must be disobeyed. The massacre belongs to Grief; the ruling belongs to Knowledge.",
    tags: ["law", "ruling"],
    actors: [
      { slug: "israel-border-police", role: "criminal" },
      { slug: "palestinians",         role: "victim" },
    ],
    sources: [
      { type: "file", label: "Kafr Qasim defendants, military trial", fileKey: "knowledge/kafir-qasim-defendants.webp", metadata: { orientation: "landscape" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Theodor Meron Memo",
    occurredAt: "1967-09-14",
    location: "Jerusalem",
    coverImageKey: "knowledge/theodor-meron.webp",
    description: "A Top Secret memo from legal adviser Theodor Meron to Foreign Minister Abba Eban, written 14 September 1967: civilian settlement in the occupied territories violates the Fourth Geneva Convention. Israel's government ignored it. The document was declassified and revealed by Gershom Gorenberg in the New York Times in 2006.",
    tags: ["occupation", "settlements", "law"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "file", label: "Theodor Meron (legal adviser who wrote the memo), 1967", fileKey: "knowledge/theodor-meron.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "UN Resolution 242",
    occurredAt: "1967-11-22",
    location: "New York",
    coverImageKey: "knowledge/un-res-242-1967-en.webp",
    description: "Resolution 242 called for Israeli withdrawal from \"territories occupied\" in the 1967 war. The deliberate omission of the definite article in the English text (\"territories\" not \"the territories\") — vs. the French \"des territoires\" — created the interpretive ambiguity Israel has exploited ever since.",
    tags: ["un-resolution", "occupation"],
    actors: [
      { slug: "united-nations", role: "documenter" },
      { slug: "palestinians",   role: "victim" },
    ],
    sources: [
      { type: "file", label: "UN Resolution 242, 22 November 1967", fileKey: "knowledge/un-res-242-1967-en.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Land Day / Koenig Memorandum",
    occurredAt: "1976-03-30",
    location: "Galilee, Israel",
    coverImageKey: "knowledge/koenig-report.webp",
    description: "The Koenig Memorandum — leaked to Al-Hamishmar and published in the Journal of Palestine Studies in 1976 — was an internal Israeli government blueprint to \"dilute\" the Arab population of the Galilee. Signed weeks before Land Day, when Israeli Arab citizens were shot dead protesting land confiscations.",
    tags: ["land", "expropriation", "what-was-done"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "idf",          role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "file", label: "Koenig Memorandum (leaked), 1976", fileKey: "knowledge/koenig-report.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Oslo Accords",
    occurredAt: "1993",
    location: "Oslo / Washington",
    coverImageKey: "knowledge/palestine-abc-area-opt.webp",
    description: "The Oslo Declaration of Principles created the Palestinian Authority and divided the West Bank into Areas A, B, and C — with C (~60%) remaining under full Israeli control. Oslo institutionalized the fragmentation of Palestinian territory and deferred final-status issues indefinitely.",
    tags: ["treaty", "occupation"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "file", label: "Palestine Area A/B/C map (OPT)", fileKey: "knowledge/palestine-abc-area-opt.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Separation Wall",
    occurredAt: "2002",
    location: "West Bank",
    coverImageKey: "knowledge/ocha-movement-map.webp",
    description: "Israel began construction of the separation barrier in 2002. The wall's route — ruled illegal by the ICJ in 2004 — extends deep into the West Bank, annexing settlements and severing communities from their land. OCHA's movement map documents the checkpoint and closure apparatus.",
    tags: ["land", "occupation", "wall"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "file", label: "OCHA Movement & Access Map, West Bank", fileKey: "knowledge/ocha-movement-map.webp", metadata: { orientation: "portrait" }, rightsStatus: "unknown" },
    ],
  },
  {
    title: "Gaza Blockade",
    occurredAt: "2007",
    location: "Gaza",
    coverImageKey: null,
    description: "On 19 September 2007 Israel declared Gaza a \"hostile territory,\" beginning a comprehensive land, sea, and air blockade that would restrict the movement of people and goods into the world's most densely populated strip of land.",
    tags: ["gaza", "blockade", "what-was-done"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "\"Hostile territory\" declaration, 19 September 2007", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Nakba Law",
    occurredAt: "2011-03-22",
    location: "Israel",
    coverImageKey: null,
    description: "Amendment No. 40 to Israel's Budget Foundations Law authorized the Finance Ministry to cut funding to any institution that marks Israeli Independence Day as a day of mourning or commemorates the Nakba. A law against memory — the legislative arm of erasure.",
    tags: ["law", "memory", "erasure"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "knesset",      role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "Amendment No. 40 — Budget Foundations Law (Nakba Law), 2011", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Prawer Plan",
    occurredAt: "2011–2013",
    location: "Negev, Israel",
    coverImageKey: null,
    description: "The Begin–Prawer Bill proposed the forced relocation of up to 70,000 Bedouin citizens from unrecognized villages in the Negev — the largest displacement of Israeli citizens since 1948. Mass protests (\"Stop Prawer\") forced withdrawal of the bill in late 2013.",
    tags: ["land", "displacement", "negev"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "knesset",      role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "Begin–Prawer Bill, 2011", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Nation-State Law",
    occurredAt: "2018-07-19",
    location: "Israel",
    coverImageKey: null,
    description: "Israel's Basic Law: Israel as the Nation-State of the Jewish People declared that the right to national self-determination in Israel is \"unique to the Jewish people\" and downgraded Arabic from official to \"special status.\" The constitutional codification of Jewish supremacy.",
    tags: ["law"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "knesset",      role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "Basic Law: Israel as the Nation-State of the Jewish People, 19 July 2018", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Masafer Yatta / Firing Zone 918 Ruling",
    occurredAt: "2022-05-04",
    location: "South Hebron Hills",
    coverImageKey: null,
    description: "Israel's High Court of Justice upheld the military's designation of the South Hebron Hills communities as Firing Zone 918, authorizing the expulsion of approximately 1,150 Palestinians from Masafer Yatta — the largest single displacement ruling by an Israeli court in decades.",
    tags: ["law", "ruling", "displacement"],
    actors: [
      { slug: "israeli-supreme-court", role: "criminal" },
      { slug: "israel",                role: "criminal" },
      { slug: "idf",                   role: "criminal" },
      { slug: "palestinians",          role: "victim" },
    ],
    sources: [
      { type: "article", label: "HCJ ruling — Firing Zone 918 / Masafer Yatta, 4 May 2022", rightsStatus: "unknown" },
    ],
  },
  {
    title: "ICJ Advisory Opinion on the Occupation",
    occurredAt: "2024-07-19",
    location: "The Hague",
    coverImageKey: null,
    description: "The International Court of Justice issued an advisory opinion that Israel's occupation of the Palestinian territories — including East Jerusalem — is unlawful under international law, and that Israel is obligated to end it as rapidly as possible. The Court called on all states to refrain from rendering aid or assistance to Israel's presence.",
    tags: ["law", "icj", "occupation"],
    actors: [
      { slug: "icj",          role: "adjudicator" },
      { slug: "israel",       role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "ICJ Advisory Opinion — Legal Consequences of Israel's Occupation, 19 July 2024", rightsStatus: "unknown" },
    ],
  },
  {
    title: "Crimson Thread",
    occurredAt: "2025–2026",
    location: "Jordan Valley (Buqe'aa Plain)",
    coverImageKey: null,
    description: "Israeli construction of a new wall and road system in the Buqe'aa plain of the Jordan Valley, revealed by Haaretz, will sever approximately 300 Palestinian farming families from their land. The record continues to be made.",
    tags: ["land", "occupation", "wall"],
    actors: [
      { slug: "israel",       role: "criminal" },
      { slug: "idf",          role: "criminal" },
      { slug: "palestinians", role: "victim" },
    ],
    sources: [
      { type: "article", label: "Haaretz — Crimson Thread route map, Jordan Valley, 2025", rightsStatus: "unknown" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding Knowledge door…\n");

  // 1. Upsert actors
  console.log("  Upserting actors…");
  for (const actor of ACTORS_SEED) {
    await db.insert(actors).values(actor).onConflictDoUpdate({
      target: actors.slug,
      set: { name: actor.name, type: actor.type },
    });
  }
  const actorRows = await db.select().from(actors);
  const actorBySlug = Object.fromEntries(actorRows.map((a) => [a.slug, a.id]));
  console.log(`  ${actorRows.length} actors ready.`);

  // 2. Upsert tags
  console.log("  Upserting tags…");
  for (const tag of TAGS_SEED) {
    await db.insert(tags).values(tag).onConflictDoUpdate({
      target: tags.slug,
      set: { name: tag.name },
    });
  }
  const tagRows = await db.select().from(tags);
  const tagBySlug = Object.fromEntries(tagRows.map((t) => [t.slug, t.id]));
  console.log(`  ${tagRows.length} tags ready.`);

  // 3. Delete existing knowledge moments (cascade removes sources, tags, actors)
  console.log("  Clearing existing knowledge moments…");
  const deleted = await db.delete(moments).where(eq(moments.doorId, "knowledge")).returning({ id: moments.id });
  console.log(`  ${deleted.length} moments cleared.`);

  // 4. Insert moments with sources, tags, and actors
  console.log("  Inserting 31 moments…");
  for (let i = 0; i < MOMENTS.length; i++) {
    const def = MOMENTS[i]!;

    const inserted = await db.insert(moments).values({
      doorId: "knowledge",
      title: def.title,
      description: def.description,
      occurredAt: def.occurredAt,
      location: def.location,
      coverImageKey: def.coverImageKey,
      sortOrder: i + 1,
    }).returning();
    const moment = inserted[0]!;

    // Sources
    for (let si = 0; si < def.sources.length; si++) {
      const src = def.sources[si]!;
      await db.insert(momentSources).values({
        momentId: moment.id,
        type: src.type,
        label: src.label,
        url: src.url ?? null,
        fileKey: src.fileKey ?? null,
        metadata: src.metadata ?? null,
        sortOrder: si,
        rightsStatus: src.rightsStatus ?? "unknown",
      });
    }

    // Tags
    for (const tagSlug of def.tags) {
      const tagId = tagBySlug[tagSlug];
      if (!tagId) { console.warn(`    ⚠  unknown tag slug: ${tagSlug}`); continue; }
      await db.insert(momentTags).values({ momentId: moment.id, tagId });
    }

    // Actors
    for (const a of def.actors) {
      const actorId = actorBySlug[a.slug];
      if (!actorId) { console.warn(`    ⚠  unknown actor slug: ${a.slug}`); continue; }
      await db.insert(momentActors).values({ momentId: moment.id, actorId, role: a.role });
    }

    process.stdout.write(`    [${String(i + 1).padStart(2)}] ${def.title}\n`);
  }

  console.log("\nKnowledge door seeded successfully.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => pool.end());
