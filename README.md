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

## 🎨 Настройка контента и констант

- **Список слайдов и зрителей** задаётся в [`src/widgets/stories/stories.data.ts`](src/widgets/stories/stories.data.ts) (массив `STORIES`, тип `StoryItem`).
- **Общие константы виджета** (ключ `localStorage`, `layoutId` для Framer Motion, длительность сегмента, `STORY_AVATAR_SRC`, типы вроде `ViewersStage`) — в [`src/widgets/stories/constants.ts`](src/widgets/stories/constants.ts).
- **Пороги жестов и анимации режима зрителей** (spring, диапазон `swipeUpDragY`, коэффициенты) — в [`src/widgets/stories/lib/motion/storyViewerMotionConstants.ts`](src/widgets/stories/lib/motion/storyViewerMotionConstants.ts) и в [`src/widgets/stories/lib/gestures/storyViewerGestureConstants.ts`](src/widgets/stories/lib/gestures/storyViewerGestureConstants.ts).

Изображения кладите в `public` (например `public/img/stories/…`) и укажите пути в данных.

Просмотренные id хранятся под ключом `STORIES_STORAGE_KEY` в `localStorage`; чтение и запись — в [`src/widgets/stories/lib/storage/storiesStorage.ts`](src/widgets/stories/lib/storage/storiesStorage.ts).

## 📚 Модуль `src/widgets/stories/lib`

Логика разнесена по папкам; из UI удобно импортировать через **barrel** (`index.ts` в каждой папке):

| Папка        | Назначение |
| ------------ | ---------- |
| `navigation/` | Выбор начального индекса, разрешение прогресса по списку (`getInitialOpenIndex`, `resolveStoriesProgressComplete`). |
| `storage/`    | `loadSeenIds` / `saveSeenIds`. |
| `media/`      | Preload и фазы загрузки кадра/аватара (`useStorySlidePhase`, `useProgressiveAvatarPhase`). |
| `gestures/`   | Жесты оболочки и рельса миниатюр, константы DOM, `useStoryViewerInteractions` и связанные хуки. |
| `motion/`     | Константы motion для viewers, snap после жеста (`useStoryViewerSnapMotion`). |

Пример: `import { useStoryViewerInteractions } from '@/widgets/stories/lib/gestures'` или относительный путь `../lib/gestures` из файлов в `ui/`.

Дополнительно в корне `lib/` лежат небольшие утилиты без отдельной папки: `formatStoryViewCount.ts`, `isEditableTarget.ts`.

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
    │       ├── lib/             # navigation, storage, media, gestures, motion, утилиты
    │       ├── stories.data.ts  # демо-данные STORIES
    │       ├── constants.ts     # доменные константы виджета
    │       └── ui/              # превью, просмотр, прогресс, зрители, styled
    ├── shared/
    │   └── ui/                  # Icon/, layouts/ (container, flexbox, space)
    ├── theme/                   # тема, медиа, defaultTheme
    │   └── styles/              # reset, base, animations, global
    └── types/                   # общие типы (в т.ч. icofont)
```

## 📦 Yarn

Используется `nodeLinker: node-modules` (без PnP).
