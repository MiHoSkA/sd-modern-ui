# SD Modern UI

[Русский](#ru) · [English](#en)

<a id="ru"></a>

## Русский

Тёмное оформление для **Stable Diffusion WebUI reForge** и **Forge Neo**: аккуратные панели, читаемые элементы управления и единые SVG-значки инструментов.

### Возможности

- Тёмная палитра с фиолетовыми акцентами, едиными отступами и скруглёнными панелями.
- Встроенные SVG-значки для известных кнопок сохранения, ZIP, папки, отправки изображения, зерна, размеров и работы с промптами. Кнопки компактные, без текстовых подписей; назначение доступно в подсказках и названиях для средств доступности.
- Кастомные подсказки в стиле темы: наведение мыши, клавиатурный фокус и размещение в пределах экрана. Они скрываются при вводе, выборе, клике и прокрутке, не перекрывают открытые списки и не мешают штатному закрытию окон по Escape.
- Акцентные заголовки включённых Hires, ADetailer и ControlNet, заметные и в свёрнутом состоянии.
- Рамка и галочка на карточках LoRA, которые уже используются в промптах выбранной вкладки.
- Контрастная панель скачивания и закрытия предпросмотра галереи, выровненные границы изображения и строки зерна.
- Оформление ошибок, предупреждений и информационных уведомлений со штатными кнопками закрытия и таймерами.
- Оформленный индикатор прогресса, видимый фокус клавиатуры, адаптация для узких экранов и учёт настройки уменьшения анимации в системе.
- Быстрое включение и отключение через существующий раздел настроек интерфейса.

Значки сохраняют штатные действия кнопок. Например, кнопка удаления использует поведение установленного `sd_delete_button`. Неизвестные кнопки сторонних расширений и их собственные SVG не заменяются.

### Совместимость

| Сборка | Проверенная версия Gradio | Статус |
| --- | --- | --- |
| reForge | 3.41.2 | Проверено |
| Forge Neo | 4.40.0 | Проверено |

Для обеих сборок используется один комплект файлов. Дополнительные Python-пакеты, npm-пакеты и отдельный установщик расширению не требуются.

WebUI самостоятельно загружает файлы расширения. `install.py` предназначен для установки дополнительных зависимостей, поэтому в этом пакете он отсутствует. Подробнее: [структура расширений в документации AUTOMATIC1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Developing-extensions).

### Установка

#### Через Extensions → Install from URL

Этот способ доступен после публикации расширения в Git-репозитории.

1. Откройте в WebUI **Extensions → Install from URL** — «Расширения → Установить по URL».
2. Вставьте URL репозитория **SD Modern UI**. Используйте адрес страницы опубликованного репозитория на GitHub.
3. Нажмите **Install** и дождитесь окончания установки.
4. Перезапустите WebUI. Если используете кнопку **Apply and quit**, запустите WebUI снова.
5. Обновите страницу сочетанием **Ctrl+F5**.

#### Из ZIP-архива

1. Распакуйте архив расширения.
2. Найдите папку, непосредственно внутри которой находятся `style.css`, `scripts` и `javascript`. Поместите эту папку в `extensions` вашей установки WebUI и назовите её `sd-modern-ui`. Если файлы архива лежат без общей папки, сначала создайте для них папку `sd-modern-ui`.
3. Проверьте, что файл темы находится непосредственно по пути `extensions/sd-modern-ui/style.css`, а рядом расположены папки `scripts` и `javascript`.
4. Перезапустите WebUI, затем нажмите **Ctrl+F5** в браузере.

Правильная структура установки:

```text
extensions/
└── sd-modern-ui/
    ├── README.md
    ├── style.css
    ├── javascript/
    │   ├── modern_icons.js
    │   ├── modern_states.js
    │   ├── modern_tooltips.js
    │   └── modern_ui.js
    └── scripts/
        └── modern_ui.py
```

### Включение и отключение

В **Settings → User Interface** — «Настройки → Пользовательский интерфейс» — найдите **Enable SD Modern UI / Включить SD Modern UI**.

Переключатель меняет оформление сразу. Нажмите штатную кнопку **Apply settings / Применить настройки**, чтобы сохранить выбор после перезапуска. При отключении возвращается исходное оформление WebUI.

### Обновление

- **Установка через Git:** откройте **Extensions → Installed**, нажмите **Check for updates**, выберите обновление SD Modern UI и примените его штатной кнопкой WebUI. Затем перезапустите WebUI и нажмите **Ctrl+F5**.
- **Установка из ZIP:** остановите WebUI и сохраните резервную копию папки `extensions/sd-modern-ui`. Замените эту папку целиком папкой из нового архива, сохранив правильную структуру установки. Запустите WebUI и нажмите **Ctrl+F5**.

### Если что-то выглядит неправильно

| Симптом | Что проверить |
| --- | --- |
| Тема или новые значки не появились | Включён ли **Enable SD Modern UI**; нет ли лишней вложенной папки; выполнены ли перезапуск WebUI и **Ctrl+F5**. |
| Цвета или расположение элементов отличаются | Временно отключите другое расширение оформления и сравните результат. Для сообщения об ошибке укажите сборку WebUI, версию Gradio, браузер и приложите скриншот проблемного элемента. |

### Публикация на GitHub

Загрузите в корень репозитория **содержимое** папки `sd-modern-ui`, сохранив подпапки:

```text
repository-root/
├── .gitignore
├── README.md
├── style.css
├── javascript/
│   ├── modern_icons.js
│   ├── modern_states.js
│   ├── modern_tooltips.js
│   └── modern_ui.js
└── scripts/
    └── modern_ui.py
```

`README.md`, `style.css`, `scripts` и `javascript` должны быть видны сразу при открытии репозитория. Не создавайте дополнительный уровень `sd-modern-ui/sd-modern-ui`: установщик WebUI сам создаёт папку расширения внутри `extensions`.

После публикации адрес этого репозитория можно использовать в **Install from URL**.

---

<a id="en"></a>

## English

A dark theme for **Stable Diffusion WebUI reForge** and **Forge Neo**, with consistent panels, readable controls, and matching SVG tool icons.

### Features

- A dark palette with violet accents, consistent spacing, and rounded panels.
- Embedded SVG icons for known save, ZIP, folder, image transfer, seed, size, and prompt tools. Buttons remain compact and use tooltips and accessible names instead of visible text captions.
- Themed tooltips with mouse and keyboard support and viewport-aware positioning. They dismiss during typing, selection, clicks, and scrolling, stay clear of open menus, and preserve native Escape handling in dialogs.
- Accent headers for enabled Hires, ADetailer, and ControlNet blocks, including collapsed panels.
- An accent border and check mark on LoRA cards already used in the current tab's prompts.
- A contrasting gallery download/close toolbar, aligned preview boundaries, and a tidy seed row.
- Styled errors, warnings, and information messages with their native close controls and timers.
- A styled progress indicator, visible keyboard focus, narrow-screen layouts, and support for the system's reduced-motion preference.
- An immediate theme toggle in the existing interface settings section.

Icons retain each button's native action. For example, the delete button keeps the behavior of the installed `sd_delete_button` extension. Unknown third-party buttons and their existing SVG controls are left intact.

### Compatibility

| WebUI host | Tested Gradio version | Status |
| --- | --- | --- |
| reForge | 3.41.2 | Tested |
| Forge Neo | 4.40.0 | Tested |

Both hosts use the same files. No additional Python packages, npm packages, or extension installer are required.

WebUI loads the extension's files itself. `install.py` is intended to install additional dependencies, so this package does not include one. See the [AUTOMATIC1111 extension layout documentation](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Developing-extensions).

### Installation

#### Using Extensions → Install from URL

This method becomes available once the extension is published in a Git repository.

1. Open **Extensions → Install from URL** in WebUI.
2. Paste the URL of the published **SD Modern UI** repository. Use its repository page address on GitHub.
3. Click **Install** and wait for installation to finish.
4. Restart WebUI. If you use **Apply and quit**, start WebUI again afterwards.
5. Refresh the browser page with **Ctrl+F5**.

#### Using a ZIP archive

1. Extract the extension archive.
2. Find the folder that directly contains `style.css`, `scripts`, and `javascript`. Place that folder inside your WebUI installation's `extensions` directory and name it `sd-modern-ui`. If the archive files have no enclosing folder, create a `sd-modern-ui` folder for them first.
3. Check that `style.css` is directly inside `extensions/sd-modern-ui`, alongside the `scripts` and `javascript` directories.
4. Restart WebUI, then refresh the browser with **Ctrl+F5**.

The installation layout should be:

```text
extensions/
└── sd-modern-ui/
    ├── README.md
    ├── style.css
    ├── javascript/
    │   ├── modern_icons.js
    │   ├── modern_states.js
    │   ├── modern_tooltips.js
    │   └── modern_ui.js
    └── scripts/
        └── modern_ui.py
```

### Enable or disable

Find **Enable SD Modern UI** under **Settings → User Interface**.

The checkbox changes the appearance immediately. Click **Apply settings** to preserve your choice after restarting. Turning the theme off restores the original WebUI appearance.

### Updating

- **Git installation:** open **Extensions → Installed**, click **Check for updates**, select the SD Modern UI update, and apply it using WebUI's native control. Restart WebUI, then refresh with **Ctrl+F5**.
- **ZIP installation:** stop WebUI and back up `extensions/sd-modern-ui`. Replace that entire directory with the extension folder from the new archive, preserving the correct installation layout. Start WebUI, then refresh with **Ctrl+F5**.

### Troubleshooting

| Symptom | What to check |
| --- | --- |
| The theme or new icons do not appear | Check **Enable SD Modern UI**, remove any extra nested extension folder, restart WebUI, and refresh with **Ctrl+F5**. |
| Colors or layout look different | Temporarily disable another UI theme extension and compare. When reporting a problem, include the WebUI host, Gradio version, browser, and a screenshot of the affected control. |

### Publishing on GitHub

Upload the **contents** of the `sd-modern-ui` folder to the repository root, preserving its subdirectories:

```text
repository-root/
├── .gitignore
├── README.md
├── style.css
├── javascript/
│   ├── modern_icons.js
│   ├── modern_states.js
│   ├── modern_tooltips.js
│   └── modern_ui.js
└── scripts/
    └── modern_ui.py
```

`README.md`, `style.css`, `scripts`, and `javascript` must be visible directly at the repository root. Avoid an extra `sd-modern-ui/sd-modern-ui` directory level: WebUI's installer creates the extension directory inside `extensions` itself.

Once published, the repository URL can be used in **Install from URL**.
