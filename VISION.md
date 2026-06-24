# Vision

**mihrab** (مِحراب — the niche one turns toward) is a public, multimedia project:
not an app you *use* but a place you *face*. It is explicitly one person's
archive — a portrait of a sensibility — and my voice guides the visitor through
it. It holds, in one space, both **wonder** and **witness**: turning toward what
is beautiful and toward what is unbearable. It is a garden, tended without end.

**It must never be flat.**

## What it is (and isn't)

- **Public to join, behind a login to enter.** Anyone can make an account, but
  nothing is open to the anonymous — the whole place lives behind a login.
  Inside, what you find is *my* archive, in *my* voice — "I gathered this, and
  here's why."
- **Curated, never algorithmic.** Every piece is chosen. No feed, no engagement
  metrics, no ranking. Taste is the only sorting function.
- **Wonder and witness, together.** The same house carries creative provocation
  and grave testimony. Attention is the practice — aimed at beauty *and* at truth.
- **A garden, not a destination.** It grows and is tended; you wander it, you
  don't "finish" it.
- **Private by covenant.** What a visitor writes is theirs alone (see the
  Threshold). No tracking, no harvesting. Privacy is a promise, not a setting.

## The Threshold

There is no anonymous browsing — an unsigned visitor sees exactly one thing: the
way in. You enter mihrab not by browsing but by *signing in* and then by
*making*.

1. **Sign in, or join.** The login screen is all a stranger ever sees;
   everything beyond it requires an account.
2. **One Oblique Strategy** — a single provocation to begin.
3. **Three minutes of writing** — a brain dump in the spirit of _The Artist's
   Way_; unedited, for its own sake.
4. **Keep it encrypted, or don't.** You may save what you wrote, but only
   **end-to-end encrypted**. On first save your browser generates a key and shows
   it once — **keep it; there is no recovery.** Your account decides *which drawer
   is yours*; your key is the only thing that opens it. The server holds ciphertext
   and never sees a word. _We won't touch your data — not a thing._
5. **The doors open.** Having made something, you've unlocked the Mi7rab.

> Contribution is the price of admission; privacy is the covenant.

The ritual **recurs daily** — a fresh page each day, in the spirit of morning
pages. Your past pages stay in your drawer, openable only with your key; you can
return and read them whenever you like.

**On the key (zero-knowledge by design).** Two locks, never the same: your
**login** grants *access* (it tells us which encrypted pages are yours); your
**key** grants *decryption* (it turns them readable, only in your browser). The
login password is deliberately *never* the encryption key — it reaches the
server, so anything derived from it wouldn't be zero-knowledge.

The key is shown **once, ever** — keep it. On your own device it's cached so you
aren't re-entering it daily, but kept so the page can decrypt *without the raw
key being readable back out* (a non-extractable browser key). A new device — or
a cleared browser — means entering your key again; lose it with no copy and the
pages are gone. That's the covenant, said plainly at the single moment we show
it. The server holds only ciphertext, plus a small check value that can confirm
a re-entered key is correct without ever revealing it. (A future, kinder option:
a browser-only *passphrase* that wraps the key — never the login password, never
sent up — so a second device needs only the passphrase.)

**Not even me.** Running mihrab, I see only ciphertext, timestamps, and a check
value that reveals nothing. I cannot read anyone's pages, restore them, or hand
them over — there is nothing to hand over but gibberish, and no admin view or
reset exists. The honest caveat: browser end-to-end encryption trusts the app
that's served, so the guarantee holds only as long as the client stays honest —
which is exactly why the client is **open-source and self-hostable**: the promise
is _auditable_, not merely stated.

## The Eight Doors

Ahead of you, eight paths. You **wander freely** — no required order, no
corridor; the garden, not a guided tour. Each path is a different *kind of
room* — its own feeling, its own way of moving. **Flat to face, deep to enter.**
(Eight: a lucky number, and an octave — the same note returned, one register up.)

### Knowledge

Revolutionary reading, documentaries, excerpts — the canon of how the world gets
changed.

### Understanding

The documented record of war crimes — sober, sourced, citations first. Home of
**Project Crimson Thread** (Israel / Palestine). The head: _what happened._

### Grief / Mourning

The lament that answers Understanding's report. The naming of the dead, one at a
time; elegy and requiem; mourning across cultures; grief in art. The heart: _who
was lost._ Where Chaos floods you, Grief asks you to stay.

### Joy

Fiction, film, music — recommendations and favorite excerpts. Delight, chosen
and shared. Home of the **"what do you think?" loop**: react to a pick and the
room responds — keep, or swap; after three swaps it says _take a leap of faith_
(sentiment now, an LLM later). See `IDEAS.md`.

### Safety

A candle. Peaceful images drifting past. Nothing asked of you. A room to breathe.

### Chaos

Everything at once, flying at you, nothing to click. The deluge — the world with
the filter removed.

### Strength

Protest and resistance — including self-sacrifice as protest. Held with the most
care of any room: context, sourcing, content warnings, and support close at
hand. Gravity, never spectacle.

### Hope

Victories. What was won — so the rest is bearable.

> The grave rooms (Understanding, Grief, Strength) and the refuges (Joy, Safety,
> Hope) hold each other up. The refuges are load-bearing, not decoration.

## Principles

- **Never flat.** Each door is its own atmosphere and interaction; motifs recur
  across rooms in different keys (a candle in Safety; a candle lit for a name in
  Grief).
- **Curation over computation.** A human chose this.
- **Privacy as covenant.** End-to-end encryption, zero-knowledge, no tracking.
- **Open and self-hostable.** Anyone can stand up their own niche.
- **The LLM only where it earns its place.** Start with the simplest honest thing.
- **Gravity, not spectacle** — especially in the rooms that document harm.

## Decisions so far

- **Everything behind a login** — no anonymous access; the login screen is the
  only public surface.
- **Free wander** — the doors are a constellation, not a sequence.
- **The ritual is the first thing after first login** — not part of sign-up; the
  first page you meet once you're in.
- **Key model (v1): a passphrase wraps a generated key + a once-shown recovery
  phrase.** You choose a passphrase; it wraps a generated key (Argon2id) so any
  device unlocks after login. A recovery phrase, shown **once**, is the
  break-glass backup if the passphrase is forgotten. Nothing — passphrase, key,
  or phrase — ever leaves the browser. No recovery if both are lost. Login and
  key stay separate locks (see The Threshold).
- **Daily ritual** — the writing recurs each day; your past pages are revisitable
  (decrypted with your key).
- **The "what do you think?" loop lives in Joy.**

## Still open

- **Recovery-phrase format** — a word-list phrase (easy to transcribe) vs. a raw
  string. (Leaning word-list.)
- **The don't-save path.** If you choose not to keep a day's writing, it's simply
  ephemeral — gone when you leave. (Likely right; confirm.)

## How it grows from what's already here

- The **Oblique Strategies** screen is the seed of the Threshold.
- The **card/deck mechanic** generalizes to several doors (Knowledge,
  Understanding, Joy) — but each door still earns its own interaction; the deck
  is a starting point, not a mold to flatten everything into.
- **Project Crimson Thread** lives under Understanding.
- The **ambient audio** belongs to Safety.

## A duty of care

The grave rooms document real suffering. They carry content warnings, cite the
record rather than asserting, and keep support resources within reach — most of
all in Strength, where self-sacrifice as protest is held. The measure is always
gravity over spectacle: bearing witness without flattening the people inside the
record into a point being made.
