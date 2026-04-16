# 📖 Stories

Демо виджета «историй» в стиле соцсетей: превью с кольцом прогресса, полноэкранный просмотр с автопереключением, навигация по тапам и клавиатуре, режим просмотра зрителей, запоминание просмотренных в `localStorage`.

Стек: **Next.js 15** (App Router), **React 19**, **TypeScript**, **styled-components** (тема и глобальные стили через `GlobalStyles`), **Framer Motion** для анимаций открытия/закрытия и shared layout, **Sass** для подключения иконочного шрифта.

## 📋 Требования

- Node.js (LTS)
- [Yarn](https://yarnpkg.com/) 4 (в проекте указан `packageManager`)

## 🛠️ Скрипты

| Команда                       | Назначение                                                                 |
| ----------------------------- | -------------------------------------------------------------------------- |
| `yarn dev`                    | Режим разработки                                                           |
| `yarn build`                  | `prebuild` (blur-плейсхолдеры) + продакшен-сборка Next.js                    |
| `yarn start`                  | Запуск собранного приложения                                                |
| `yarn lint` / `yarn lint:fix` | ESLint                                                                     |
| `yarn pretty`                 | Форматирование Prettier                                                    |
| `yarn typecheck`              | Проверка типов без emit                                                    |
| `yarn icofont`                | Генерация иконочного шрифта (fantasticon → `public/assets/fonts/icofont`)   |
| `yarn img:prog`               | Подготовка прогрессивных JPEG (см. `scripts/make-progressive-img-jpegs.mjs`) |
| `yarn img:opt`                | Оптимизация изображений (см. `scripts/optimize-images.mjs`)                 |

Перед сборкой `prebuild` генерирует `src/generated/blur-map.json` — карту размытых data URL для `placeholder="blur"` у картинок историй (скрипт `scripts/generate-blur-data-urls.mjs`, **sharp**). После добавления новых файлов в `public/img/…` имеет смысл снова выполнить `yarn build` или запустить генератор вручную.

## 🎨 Настройка контента историй

Список слайдов, длительность и данные зрителей задаются в `src/widgets/stories/constants.ts` (`STORIES`, `STORY_DURATION_SEC` и связанные константы). Изображения кладите в `public` (например `public/img/stories/…`) и укажите пути в константах.

Просмотренные id хранятся под ключом `STORIES_STORAGE_KEY` в `localStorage` (см. `src/widgets/stories/lib/storiesStorage.ts`).

## 📁 Структура проекта

```
.
├── public/                      # статика Next.js (картинки историй, favicon)
│   └── assets/fonts/icofont/    # иконочный шрифт после yarn icofont
├── scripts/                     # prebuild (blur), оптимизация изображений
├── @types/                      # доп. типы TS (тема styled-components и др.)
└── src/
    ├── app/                     # App Router: layout, page, провайдеры, styled-registry
    ├── generated/               # blur-map.json (генерируется prebuild)
    ├── lib/                     # getBlurDataURL и пр.
    ├── screens/                 # экраны как UI-слой (без маршрутизации Next)
    │   └── main/
    │       └── ui/              # главная страница и её стили
    ├── widgets/
    │   └── stories/             # виджет «истории»
    │       ├── lib/             # storage, навигация, жесты, preload, форматирование
    │       └── ui/              # превью, просмотр, прогресс, зрители, styled
    ├── shared/
    │   └── ui/                  # Icon/, layouts/ (container, flexbox, space)
    ├── theme/                   # тема, медиа, defaultTheme
    │   └── styles/              # reset, base, animations, global
    └── types/                   # общие типы (в т.ч. icofont)
```

## 📦 Yarn

Используется `nodeLinker: node-modules` (без PnP).
