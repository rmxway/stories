# 📖 Stories

Демо виджета «историй» в стиле соцсетей: превью с кольцом прогресса, полноэкранный просмотр с автопереключением, навигация по тапам/клавиатуре, запоминание просмотренных в `localStorage`.

Стек: **Next.js 15** (App Router), **React 19**, **TypeScript**, **styled-components** (тема и глобальные стили через `GlobalStyles`), **Framer Motion** для анимаций открытия/закрытия.

## 📋 Требования

- Node.js (LTS)
- [Yarn](https://yarnpkg.com/) 4 (в проекте указан `packageManager`)

## 🛠️ Скрипты

| Команда                       | Назначение                                                                |
| ----------------------------- | ------------------------------------------------------------------------- |
| `yarn dev`                    | Режим разработки                                                          |
| `yarn build`                  | Продакшен-сборка                                                          |
| `yarn start`                  | Запуск собранного приложения                                              |
| `yarn lint` / `yarn lint:fix` | ESLint                                                                    |
| `yarn pretty`                 | Форматирование Prettier                                                   |
| `yarn typecheck`              | Проверка типов без emit                                                   |
| `yarn icofont`                | Генерация иконочного шрифта (fantasticon → `public/assets/fonts/icofont`) |

## 🎨 Настройка контента историй

Список слайдов и длительность задаются в `src/widgets/stories/constants.ts` (`STORIES`, `STORY_DURATION_SEC`). Изображения кладите в `public` (например `public/img/stories/…`) и укажите пути в `src`.

Просмотренные id хранятся под ключом из `STORIES_STORAGE_KEY` в `localStorage` (см. `src/widgets/stories/lib/storiesStorage.ts`).

## 📁 Структура проекта

```
.
├── public/                      # статика Next.js (картинки историй, favicon)
│   └── assets/fonts/icofont/    # иконочный шрифт после yarn icofont
├── @types/                      # доп. типы TS (тема styled-components и др.)
└── src/
    ├── app/                     # App Router: layout, page, провайдеры, styled-registry
    ├── screens/                 # экраны как UI-слой (без маршрутизации Next)
    │   └── main/
    │       └── ui/              # главная страница и её стили
    ├── widgets/
    │   └── stories/             # виджет «истории»
    │       ├── lib/             # localStorage и пр.
    │       └── ui/              # превью, просмотр, прогресс, SVG-кольцо, styled
    ├── shared/
    │   └── ui/                  # Icon/, layouts/ (container, flexbox, space)
    ├── theme/                   # тема, медиа, defaultTheme
    │   └── styles/              # reset, base, animations, global
    └── types/                   # общие типы (в т.ч. icofont)
```

## 📦 Yarn

Используется `nodeLinker: node-modules` (без PnP).
