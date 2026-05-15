# Relations System

AI-drivet Business OS / CRM för moderna tjänsteföretag, byggt med `Next.js`, `TypeScript`, `Tailwind`, `Framer Motion` och nu även en första `Prisma`-grund för multi-tenant SaaS.

## Appstruktur

- Publik SaaS-hemsida ligger på `/`
- Intern app börjar på `/oversikt`
- Svenska kärnmoduler finns för leads, kunder, pipeline, bokningar, uppgifter, statistik, konversationer, automationer, AI-assistent, team, fakturering och inställningar

## Kom igång

1. Installera beroenden:

```bash
npm install
```

2. Skapa en lokal miljöfil:

```bash
copy .env.example .env
```

3. Lägg in en fungerande Postgres-anslutning i `DATABASE_URL`

4. Generera Prisma-klienten:

```bash
npm run db:generate
```

5. Skapa databasschemat:

```bash
npm run db:push
```

6. Fyll databasen med demo-data:

```bash
npm run db:seed
```

7. Starta appen:

```bash
npm run dev
```

## Databas

Projektet använder `PostgreSQL` och `Prisma` med en första multi-tenant struktur för:

- `Workspace`
- `User`
- `WorkspaceMember`
- `Customer`
- `Lead`
- `Booking`
- `Task`
- `ConversationThread`
- `ConversationMessage`
- `AutomationFlow`
- `Invoice`
- `AIInsight`

Schemafilen finns i [schema.prisma](file:///c:/Users/pilav/Documents/trae_projects/relationssystem%202/prisma/schema.prisma).

## Viktiga scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
```

## Status just nu

- Frontend-grund för premium CRM / Business OS finns på plats
- Svensk navigationsstruktur är uppbyggd
- Prisma-klient och multi-tenant schema finns på plats
- Seed-data finns för lokal demo och vidare backend-utveckling

## Nästa tekniska steg

- Auth-integration med `Clerk` eller `Auth.js`
- API routes / server actions mot Prisma
- Riktig dataladdning i modulerna
- Realtime-uppdateringar och AI-integration
