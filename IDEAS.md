# Ideas

Future directions for **mihrab** — a personal space for artistic musings and the
inspirations around them. Nothing here is a commitment; it's a place to let ideas
accrete. For what's actually built, see the [README](./README.md).

A thread runs through most of these: they reuse the **card deck** mechanic the
Oblique Strategies screen already has — a deck of cards in Postgres, served
through the API, drawn into the niche. Several ideas below are "just" a new deck
plus a richer card, so the deck/card/filter is worth generalizing once.

---

## 1. Interactive card decks

### War crimes — an educational deck
Cards strewn across the screen; click one to learn about a war crime — what
happened, where, when, and the record of it. **Filterable by country.**
Educational and archival in spirit: sober, factual, and each card cites
reputable sources rather than asserting on its own.

- **Builds on:** a new deck table (e.g. `country`, `year`, `title`, `summary`,
  `sources[]`), the card UI generalized from `StrategyCard`, and a country
  filter.
- **New bits:** a "scattered cards" layout (vs. the single-niche layout), and a
  detail view when a card is opened.
- **Care:** tone and sourcing matter here — citations first, no editorializing.

### Revolutions & protests — same mechanic
The same clickable, filterable deck for revolutions and protests — what sparked
them, who, and what changed. Filter by country (and maybe era / outcome).

- **Builds on:** the exact same generalized deck + card + filter as above —
  likely one table with a `kind` discriminator (`war-crime` | `revolution`), or
  sibling decks sharing the UI.

> War crimes and revolutions differ only in content — design the deck, card, and
> filter **once** and point both (and Oblique Strategies) at it.

---

## 2. Recommendation engines — curated by my taste

### Books
A book recommendation engine curated by *my* taste — not generic bestseller
lists, but what I vouch for, with my notes on why.

### Films
The same, for films — personal picks with personal notes.

- **Builds on:** a `recommendations` table (`medium`, `title`, `creator`, `year`,
  `note`, `tags`), curated by me. Could surface as its own screen or as more
  decks reusing the card mechanic.

---

## 3. The "what do you think?" curation loop

Room for a visitor to push back on my recommendations — *"what do you think?"* —
and have mihrab respond.

- **v1 (heuristic): sentiment analysis on the visitor's reaction.**
  - Positive → **keep** the recommendation.
  - Negative → **swap** it for another.
  - After **3 swaps**, stop second-guessing and say **"take a leap of faith."**
- **Later: swap the heuristic for an LLM** (Claude) for a real back-and-forth —
  understanding *why* they reacted and recommending from that. The sentiment
  version is the placeholder until the LLM version clearly earns its keep.

- **Builds on:** a small feedback endpoint (store reaction + verdict), a
  pluggable sentiment step (light library now, LLM later), and a per-session
  swap counter. The "leap of faith" line is the escape hatch so it never nags
  past three.

---

## Through-lines

- **One card mechanic, many decks.** Oblique Strategies, war crimes, revolutions,
  and the recommendation cards are all *decks* — generalize deck / card / filter
  once, then it's mostly content.
- **Curation is the point.** Everything here is "my taste, made browsable"; the
  feedback loop is how visitors engage with it.
- **Reach for the LLM only when it earns it.** Start with the simplest thing that
  works (bundled decks, a sentiment heuristic); upgrade to an LLM where it
  clearly beats the placeholder.
