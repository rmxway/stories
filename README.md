# Stories

Next.js 15 + React 19 + TypeScript. Стили и тема — `styled-components`, глобальные стили через `GlobalStyles`.

## Скрипты

- `yarn dev` — разработка
- `yarn build` — сборка
- `yarn start` — продакшен-сервер
- `yarn lint` / `yarn lint:fix` — ESLint
- `yarn pretty` — Prettier
- `yarn typecheck` — `tsc --noEmit`

## Структура

- `src/app` — Next App Router (`layout`, `page`, провайдеры, styled-components registry)
- `src/theme` — тема, медиа-хелпер (`styled-media-query`), reset/base/global
- `src/screens` — экраны (слой вместо `src/pages`, чтобы не конфликтовать с Pages Router Next)

## Yarn

Используется `nodeLinker: node-modules` (без PnP).
