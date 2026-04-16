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
├── downloads/          # Standalone HTML-файлы (источник правды)
│   ├── explicit-quiz/
│   │   ├── assets/
│   │   └── generating.html
│   ├── live-now/
│   │   ├── chat-button-animation.html
│   │   └── content-to-counter.html
│   └── <feature>/
│       └── <animation-name>.html
├── docs/               # Спеки и проектная документация
├── .github/workflows/  # CI/CD
└── AGENTS.md           # Инструкции для AI-агентов
```

## Как добавить анимацию

### Способ 1: File-based (рекомендуемый)

Standalone-файл — единственный источник правды. Каталог автоматически подтягивает превью (iframe) и код (по маркерам `@snippet`).

1. Создать standalone-файл `downloads/<feature>/<name>.html` — самодостаточный HTML с инлайн-стилями. Разметить сниппеты маркерами:

```css
/* @snippet:css */
@keyframes myAnimation { ... }
.my-class { animation: myAnimation 0.3s ease-out; }
/* @snippet:end */
```

```html
<!-- @snippet:html -->
<div class="my-class">...</div>
<!-- @snippet:end -->
```

2. В `index.html` добавить секцию (только data-атрибуты, без шаблонов):

```html
<section class="animation"
  data-feature="Feature Name"
  data-name="Animation Name"
  data-duration="0.3s"
  data-easing="ease-out"
  data-delay="0s"
  data-css-vars="--my-var"
  data-file="downloads/feature/animation-name.html">
</section>
```

`catalog.js` сам: покажет iframe-превью, извлечёт CSS/HTML сниппеты из маркеров, покажет блоки кода с кнопкой Copy.

### Способ 2: Template-based (inline)

Для анимаций без standalone-файла — код прямо в `<template>` тегах:

```html
<section class="animation" data-feature="..." data-name="..." ...>
  <template class="animation-css">/* CSS */</template>
  <template class="animation-html"><!-- HTML --></template>
  <template class="animation-js">// JS (опционально)</template>
</section>
```

---

В обоих случаях: standalone-файл в `downloads/<feature>/<name>.html` — полностью самодостаточный HTML с инлайн-стилями и скриптами.

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

## Локальная разработка

```bash
python3 -m http.server 8080
```

Открыть http://localhost:8080 в браузере. `Ctrl+C` — остановить.

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
