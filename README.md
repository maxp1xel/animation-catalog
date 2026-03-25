# Animation Catalog

Каталог CSS/JS-анимаций команды, организованный по продуктовым фичам.

**URL:** `https://test.shaihalov.com/animations/`

## Стек

Чистый HTML + CSS + JS. Без фреймворков, без билда.

## Структура

```
├── index.html          # Каталог — единая страница
├── styles.css          # Тёмная тема
├── catalog.js          # Навигация, replay, copy, download
├── downloads/          # Standalone HTML-файлы для скачивания
│   ├── onboarding/
│   │   └── card-entrance.html
│   └── dashboard/
│       └── chart-reveal.html
├── docs/               # Спеки и проектная документация
├── .github/workflows/  # CI/CD
└── AGENTS.md           # Инструкции для AI-агентов
```

## Как добавить анимацию

1. В `index.html` добавить секцию:

```html
<section class="animation"
  data-feature="onboarding"
  data-name="Card Entrance"
  data-duration="0.3s"
  data-easing="ease-out"
  data-delay="0s"
  data-css-vars="--card-duration, --card-ease"
  data-file="downloads/onboarding/card-entrance.html">

  <div class="animation-preview">
    <!-- HTML для живого превью -->
  </div>

  <template class="animation-css">
    /* CSS анимации */
  </template>

  <template class="animation-html">
    <!-- HTML разметка -->
  </template>

  <template class="animation-js">
    // JS (опционально)
  </template>
</section>
```

2. Создать standalone-файл в `downloads/<feature>/<name>.html` — полностью самодостаточный HTML с инлайн-стилями и скриптами. Код в standalone-файле должен совпадать с `<template>` в `index.html`.

3. Пушнуть в `main` — GH Actions задеплоит автоматически.

Сайдбар обновится сам — `catalog.js` строит навигацию из `data-*` атрибутов.

## Раскладка

- **Сайдбар** (слева): дерево фич, каждая раскрывается в список анимаций
- **Основная область** (справа): карточка анимации — превью, replay, спека, блоки кода с кнопками Copy, кнопка Download

## Функциональность

| Функция | Описание |
|---------|----------|
| Replay | Перезапуск анимации (reflow-трюк) |
| Copy | Копирование CSS / HTML / JS по отдельности |
| Download | Скачивание standalone HTML-файла |
| Deep links | URL-хеш обновляется при выборе (`#onboarding/card-entrance`) |

## Деплой

Push в `main` → GitHub Actions → rsync в `/animations/` на сервере.

Необходимые GitHub Secrets:
- `DEPLOY_HOST` — хост сервера
- `DEPLOY_USER` — SSH-пользователь
- `DEPLOY_PATH` — путь к web root на сервере
- `DEPLOY_KEY` — SSH-ключ

## Дизайн

Тёмная минималистичная тема. Desktop only.

- Фон: `#0d0d1a` (превью), `#1a1a2e` (страница), `#12122a` (сайдбар)
- Акцент: `#a0a0ff`
- Шрифты: monospace для кода, system sans-serif для UI

## Документация

- Детальная спека: [`docs/superpowers/specs/2026-03-25-animation-catalog-design.md`](docs/superpowers/specs/2026-03-25-animation-catalog-design.md)
