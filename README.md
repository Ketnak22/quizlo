# quizlo

> **PL:** quizlo to aplikacja z quizami po polsku w trzech trybach: wpisywanie odpowiedzi, parowanie i odgadywanie regionów na mapie. Quizy i mapy można dodawać w kreatorach, a strona główna pokazuje najpopularniejsze gry. Projekt powstał w Next.js 15, TypeScripcie i Firestore.

A Polish quiz app with typed-answer, matching and map modes, built with Next.js, TypeScript and Firestore.

**Live demo:** DEMO_URL

## Screenshots

| Home                                    | Quiz                                        |
| --------------------------------------- | ------------------------------------------- |
| ![Home page](docs/screenshots/home.png) | ![Matching quiz](docs/screenshots/quiz.png) |

| Map game                              | Map creator                                      |
| ------------------------------------- | ------------------------------------------------ |
| ![Map game](docs/screenshots/map.png) | ![Map creator](docs/screenshots/map-creator.png) |

## Features

- **Three game modes**
  - Quiz: type every answer on the list.
  - Matching quiz: fill in a table, for example the capital of each country.
  - Map: name the regions of an SVG map, which change color as you guess them.
- **Forgiving answers:** case, Polish diacritics and extra spaces do not matter, so `lodz` counts as `Łódź`.
- **Creators:** build a quiz in a form, or drop in an SVG and name its regions by clicking them on the map.
- **Popular quizzes:** the home page ranks games by view count.
- **Responsive UI** with loading, error and 404 screens.
- **Demo-safe by default:** publishing needs an admin token, and uploads are rate limited.

## Tech stack

- **Next.js 15 (App Router) and React 19:** server components for the data-driven pages and client components for the games.
- **TypeScript in strict mode**, with no `any` in the codebase.
- **Firestore (Admin SDK):** a document database suits games whose content differs by mode, and it needs no server to maintain. It is only accessed from the server, so no Firebase config reaches the browser.
- **Zod:** one set of schemas validates the creator forms in the browser and the uploads on the server, so the two cannot drift apart. The same schemas parse game data when it is loaded.
- **DOMPurify with jsdom:** uploaded SVGs are rendered as markup, so they are sanitized before they are stored to prevent stored XSS.
- **Vitest, ESLint, Prettier and GitHub Actions** keep the code checked on every push.

## Architecture

```
scripts/                Firestore seed script and sample games
src/app/
  api/                  Route handlers: read a game, upload a quiz or a map
  components/           Shared UI (navigation, quiz selector, status screens)
  create/               Quiz and map creators
  game/[id]/            Game page, players and game hooks
  i18n/pl.ts            All interface text
  lib/                  Firestore access, schemas, SVG handling, answer logic, upload protection
  types/                Shared types
  utils/                Text helpers
```

The home page is a server component that reads the game list directly from Firestore on every request. The game page checks the game type on the server, counts the view and renders the matching player. The player then fetches the game from `/api/game/[id]` and parses it with the Zod schemas. Game progress lives in React state: the `useAnswerGame` hook stores the guessed answers and derives the score and the end of the game from them. Answer checking is a pure function, `findNewMatches`, shared by every mode. Creators validate their input with the same schemas and post it to `/api/upload/*`. Those endpoints check the rate limit and the admin token, validate the data again, sanitize any SVG and write the game to Firestore.

## Running locally

Requires Node.js 22.12 or newer.

1. **Clone the repository and install dependencies**

   ```bash
   git clone https://github.com/Ketnak22/quizlo.git
   cd quizlo
   npm install
   ```

2. **Set up Firebase**
   1. Create a project in the [Firebase console](https://console.firebase.google.com/).
   2. Open **Build > Firestore Database** and create a database in production mode. The app connects through the Admin SDK, so the default deny-all security rules can stay in place.
   3. Open **Project settings > Service accounts** and click **Generate new private key**.

3. **Configure the environment**

   ```bash
   cp .env.example .env
   ```

   Copy the values from the downloaded JSON key into `.env`. Do not commit the key or `.env`.

4. **Add sample games** (optional)

   ```bash
   npm run seed
   ```

   This writes five games: two quizzes, two matching quizzes and one map. Games are matched by name, so running it again resets those games, including their view counts, and leaves all other data alone.

5. **Start the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env`. All variables are server-side only.

| Variable                | Description                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `FIREBASE_PROJECT_ID`   | Firebase project id, the `project_id` field of the service account key.                                            |
| `FIREBASE_CLIENT_EMAIL` | Service account email, the `client_email` field of the key.                                                        |
| `FIREBASE_PRIVATE_KEY`  | Service account private key, the `private_key` field of the key. Keep it on one line, in double quotes, with `\n`. |
| `ADMIN_TOKEN`           | Secret required to publish quizzes and maps. When empty, the creators are read-only and uploads are refused.       |

Generate an admin token with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

### Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start the development server        |
| `npm run build`        | Create a production build           |
| `npm start`            | Serve the production build          |
| `npm run lint`         | Run ESLint                          |
| `npm run format`       | Format the code with Prettier       |
| `npm run format:check` | Check the formatting                |
| `npm run typecheck`    | Run the TypeScript compiler         |
| `npm test`             | Run the Vitest suite                |
| `npm run seed`         | Write the sample games to Firestore |

## Deploying to Vercel

1. Import the repository in [Vercel](https://vercel.com/new). The Next.js settings are detected automatically.
2. Under **Settings > Environment Variables**, add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`.
3. Leave `ADMIN_TOKEN` unset for a public read-only demo, or set it to publish games from the live site.
4. Deploy, then replace `DEMO_URL` at the top of this file with the production URL.

The build does not connect to Firebase, so it works without credentials. The rate limit is kept in memory for each server instance, so on serverless hosting it slows down abuse rather than enforcing an exact global limit.

## Roadmap

- Timed mode with a personal best kept for each game.
- User accounts in place of the shared admin token, so people can manage their own games.
- Search and categories on the home page.
- More than one accepted spelling per answer.

## Map data

The sample maps, including the ones offered by the map creator in demo mode (`public/demo-maps`, listed in `src/app/create/map/demoMaps.ts`), are made from [Natural Earth](https://www.naturalearthdata.com/) data, which is in the public domain. See [scripts/seed-data/README.md](scripts/seed-data/README.md).

## License

[MIT](LICENSE)
