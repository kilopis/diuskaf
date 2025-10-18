# ⚡ Быстрый старт: GitHub + Netlify

## 🚀 За 5 минут до работающего сайта

### 1️⃣ Подготовка файлов

Переименуйте файлы:
```bash
index-netlify.html → index.html
script-netlify.js → script.js
```

### 2️⃣ Создание репозитория GitHub

1. Зайдите на [github.com](https://github.com) → "New repository"
2. Название: `secure-photo-portal`
3. Создайте репозиторий

### 3️⃣ Загрузка файлов

**Через командную строку:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Или через GitHub Desktop:**
- Скачайте [GitHub Desktop](https://desktop.github.com/)
- Откройте папку с проектом
- Сделайте коммит и загрузите

### 4️⃣ Настройка Netlify

1. Зайдите на [netlify.com](https://netlify.com) → "New site from Git"
2. Выберите "GitHub" → ваш репозиторий
3. Настройки:
   - Build command: (пусто)
   - Publish directory: `.`
4. Нажмите "Deploy site"



## 🔄 Обновления

Для обновления сайта:
```bash
git add .
git commit -m "Update"
git push
```

Netlify автоматически пересоберет сайт!

## 📁 Нужные файлы для GitHub:

```
├── index.html          # (переименованный index-netlify.html)
├── script.js           # (переименованный script-netlify.js)
├── styles.css
├── netlify.toml
├── _redirects
├── .gitignore
└── README.md
```

## 🆘 Если что-то не работает:

1. **Камера не работает:** Убедитесь, что сайт по HTTPS
2. **Геолокация недоступна:** Разрешите доступ в браузере
3. **Ошибки деплоя:** Проверьте логи в Netlify

**Подробная инструкция:** `GITHUB_NETLIFY_SETUP.md`

