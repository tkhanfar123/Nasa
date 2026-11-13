# Explorer Echoes

An English educational website for **NASA Space Apps Challenge 2026 — “Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars.”**
Spacecraft and equipment tell their own stories in the first person, with different stories, activities and questions for ages 6–11 and 12–18.

## Setup

Requires Node.js 18+ (20+ recommended).

```bash
npm install          # install dependencies
npm run dev          # development server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve the production build locally
npm run typecheck    # TypeScript check (needs the installed @types packages)
npm run validate:content   # check the JSON content files for mistakes
```

The build uses `base: './'`, so `dist/` can be hosted from any static host or sub-folder (GitHub Pages, Netlify, a school server). No backend, accounts, paid APIs or live NASA API calls are used.

## Project structure

```
src/
  content/
    destinations.json          ← 8 planets + the Moon (editable)
    equipment/*.json           ← one file per spacecraft/equipment (editable)
    index.ts                   ← registry: add new JSON files here
  components/                  ← UI (map, destination, story, activities, pages)
  lib/                         ← router, progress (localStorage), narration (speech synthesis), labels
  types.ts                     ← the content data model
scripts/validate-content.mjs   ← content checker
```

### Editing content
Each equipment record contains every field the brief requires (with English-only names): `id, name, mission, equipmentType, destinations, encounterType, launchDate, arrivalDate, lastContactDate, missionEndDate, status, finalFate, location, instruments, discoveries, timeline, primaryStory, secondaryStory, primaryActivity, secondaryActivity, imageUrl, imageCredit, imageSourceUrl, factSources, lastReviewedAt` — plus `spotlight`, `engineeringChallenge`, `badge`, `dateNotes` and `verificationNotes`.

- Use `null` for anything unknown; the interface shows “Not available” rather than breaking.
- Stories always have five chapters with keys `who, why, how, learn, fate`.
- Primary activity: `matching` or `sequencing` + 2 questions. Secondary: `observation` (with `dataKind: "sourced" | "example"`) + 3 questions.
- To add a real NASA image, set `imageUrl` (and `imageAlt`, `imageCredit`). If it fails to load, the schematic illustration is shown automatically.
- Only set `lastReviewedAt` when facts were actually checked.

## How it addresses the challenge
- **Equipment as storyteller:** every record speaks in five fixed chapters (Who am I? Why was I sent? How did I work? What did I help scientists learn? What happened to me?), clearly labelled as an educational dramatization, not a real transmission.
- **Core stories:** Apollo 15 Lunar Roving Vehicle, Surveyor 3 (parts returned by Apollo 12, body left on the Moon), Sojourner, Spirit, Opportunity, InSight.
- **“Fate” is taught precisely:** encounter types (landing, orbit, flyby, atmospheric entry, surface impact) are shown for each destination; flyby-only Voyager 2 is one record linked to Uranus and Neptune and never shown as left there; destroyed spacecraft (MESSENGER, Pioneer Venus 2, Galileo, Cassini) are drawn faded and labelled as no longer existing. Last contact is separated from official mission end.
- **Language:** English only, left-to-right (an earlier Arabic version was replaced at the team's request).
- **Two real age tracks:** ages 6–11 get short illustrated scenes, glossary, matching/sequencing games and encouraging feedback focused on purpose + one discovery; ages 12–18 get deeper stories, an engineering challenge and solution, instrument → measurement → interpretation, outcome vs interpretation tags, and data-based reasoning tasks.
- **Journey:** age → solar-system map (schematic, with an accessible list) starting from Earth → destination → equipment → story/narration → activity + questions → badge.
- **Narration:** browser speech synthesis with an English voice; listen/pause/resume/stop; starts only on user action; stops on story or age change; clear message when no English voice exists.
- **Progress:** age, completed steps and badges saved in localStorage; reset button; no account or birth date.

## Verification performed
Automated browser tests (headless Chrome) passed for: age switching changes stories/activities/quizzes; map, list and keyboard navigation; narration controls (with a simulated English voice) and the no-voice fallback; correct/incorrect activity feedback; badge award; persistence after refresh; reset; mobile layout at 390 px without horizontal overflow; reduced-motion; no console errors.

## Known limitations / content still to verify
- **No photographs are embedded.** All visuals are schematic illustrations made for this project and labeled as such; each record links to a NASA page with real images. Add verified NASA images via `imageUrl` after checking usage terms.
- **Narration quality depends on the device.** If no English voice is installed, the site shows the full text and an availability message.
- **Some facts rely on secondary or archived sources** (marked “Secondary source” and listed under “Verification limits” in each record). Some NASA Science mission pages could not be opened during review. Notable items to re-check against primary NASA sources:
  - Sojourner/Mars Pathfinder official mission-end date (left `null`; sources disagree between Nov 1997 and Mar 1998).
  - InSight launch date (5 May 2018) and some figures taken from NASA releases republished by news sites.
  - Spirit: the dragged-wheel detail behind the silica discovery.
  - Galileo: details of the high-gain-antenna workaround.
  - MESSENGER: exact planetary flyby sequence (story says only “flybys near planets”).
  - Surveyor 3: interpretation of the bacteria report (presented only as a reasoning question).
  - Opportunity: final-location coordinates (left `null`); the planned 1 km distance.
  - Voyager 2: operating status changes over time; NASA’s page gives two interstellar-entry dates and inconsistent Neptune moon counts (no number shown).
- Destinations without stories (Earth is the start point) have no equipment records yet.
- Typechecking was done against a minimal shim in the build environment; run `npm run typecheck` after `npm install` for a full check.

Not an official NASA website. Facts last reviewed 13 November 2026.
