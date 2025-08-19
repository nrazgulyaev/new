# Villas App (Next.js + Prisma + React-Admin)

Единое приложение: админка + каталог + калькулятор.
- **/admin** — единая админка (react-admin) для проектов, вилл и сценариев
- **/catalog** — каталог с проектами и виллами, кнопка «В расчёт» создаёт сценарий и открывает калькулятор
- **/calc/[id]** — простая страница KPI по сценарию (можно расширять под рассрочку/кэшфлоу)

## Старт
```bash
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate    # создаст sqlite dev.db
npm run seed              # демо-данные
npm run dev               # http://localhost:3000
```

## Схема данных (Prisma)
- **Project**: id, name, description
- **Villa**: все параметры для обоих приложений (тип, комнаты, площади, цена/м², базовая цена, ставка НДС, цена с НДС, первый платёж, статус; а также areaSqm, monthlyPriceGrowthPct, leaseholdEndDate, dailyRateUSD, rentalGrowthPct, occupancyPct)
- **Scenario**: id, name, villaId

## API (RA simple-rest совместимо)
- `GET/POST /api/v1/projects`, `GET/PUT/DELETE /api/v1/projects/:id`
- `GET/POST /api/v1/villas`, `GET/PUT/DELETE /api/v1/villas/:id`
- `GET/POST /api/v1/scenarios`, `GET/PUT/DELETE /api/v1/scenarios/:id`

## Настройка под Postgres
- В `.env` поменяйте `DATABASE_URL` на URL Postgres
- Выполните `npm run prisma:migrate`