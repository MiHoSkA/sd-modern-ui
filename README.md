# SD Modern UI

[Русский](#ru) · [English](#en)

<a id="ru"></a>

## Русский

Тёмное оформление для **Stable Diffusion WebUI reForge** и **Forge Neo** с удобными панелями, читаемыми элементами управления и настройкой под свой вкус.

### Возможности

- Единая тёмная палитра, аккуратные отступы и скруглённые панели.
- Контрастные значки инструментов и подсказки при наведении или работе с клавиатуры.
- Удобная галерея с заметными кнопками скачивания и закрытия изображения.
- Оформленные уведомления, ошибки и индикатор прогресса.
- Выделение включённых Hires, ADetailer и ControlNet, а также используемых LoRA.
- Редактор цветов, прозрачности, теней, скруглений, шрифта и фонового изображения.
- Предпросмотр изменений и общие настройки для браузеров, подключённых к одной установке WebUI.
- Выбор English / Русский для всего интерфейса Stable Diffusion.
- Оформленная полоса прокрутки и собственный значок вкладки браузера. При отключении темы возвращается штатная иконка.
- Управление мышью, клавиатурой и на сенсорном экране.

Штатные действия кнопок сохраняются. Дополнительные библиотеки для установки не нужны.

### Установка

**По ссылке на репозиторий**

1. Откройте **Extensions → Install from URL**.
2. Вставьте адрес репозитория расширения и нажмите **Install**.
3. Перезапустите WebUI и обновите страницу с очисткой кеша: **Ctrl+F5**.

**Из ZIP**

1. Остановите WebUI.
2. Распакуйте папку `sd-modern-ui` из архива в папку `extensions` вашей сборки. Файл `style.css` должен находиться прямо в `extensions/sd-modern-ui`, без лишней вложенной папки.
3. Запустите WebUI и нажмите **Ctrl+F5**.

При обновлении из ZIP сохраните файл `config.json` отдельно, замените папку расширения и верните этот файл на место.

### Включение и отключение

В **Settings → User Interface** найдите **Enable SD Modern UI / Включить SD Modern UI**. Переключатель меняет оформление сразу. Чтобы сохранить его состояние после перезапуска, нажмите **Apply settings / Применить настройки** в WebUI.

### Настройка оформления

Откройте редактор кнопкой с палитрой в верхней панели быстрых настроек или кнопкой **Настроить оформление** в настройках интерфейса.

Все изменения сначала показываются в предпросмотре:

| Действие | Результат |
| --- | --- |
| **Сохранить** | Записывает настройки в файл конфигурации расширения. |
| **Отмена**, закрытие окна или **Esc** | Возвращает ранее сохранённое оформление. |
| **Сброс** | Показывает исходное оформление. Для сохранения сброса нажмите «Сохранить». |
| **Экспорт / Импорт** | Сохраняет профиль в JSON или открывает ранее сохранённый файл. |

Если открыт список шрифтов, первое **Esc** закрывает список. В непустом поле поиска первое **Esc** очищает запрос. Следующее **Esc** закрывает редактор без сохранения.

**Цвета.** Раскрывайте группы или ищите параметр по названию. Для поиска по цвету введите HEX-код: например, `#818CF8`, `818cf8` или `#fff`. Поиск учитывает текущие цвета, в том числе автоматические. Чтобы изменить несколько совпадений сразу, выберите новый цвет и нажмите **Заменить найденные цвета**. Основной акцентный цвет при такой замене сохраняется. Проверьте предпросмотр и сохраните результат.

У каждого цвета есть палитра, поле HEX и круговая стрелка возврата в **Авто**. В автоматическом режиме цвет следует акценту и связанным настройкам темы. Сброс группы возвращает в «Авто» только её цвета. Некорректный HEX подсвечивается; исправьте его или сбросьте поле перед сохранением.

**Шрифт.** Выберите вариант в оформленном списке. С клавиатуры доступны стрелки, **Home / End**, поиск по первым буквам, **Enter** или пробел для выбора.

**Фон.** Можно выбрать PNG, JPEG или WebP, отрегулировать затемнение и размытие или убрать изображение. Исходный файл должен занимать до **8 МиБ** и содержать до **32 мегапикселей**.

**Язык интерфейса.** В самом низу редактора выберите **English** или **Русский**. По умолчанию используется английский. Нажмите **Сохранить и перезагрузить**, чтобы применить выбранный язык ко всему WebUI. Отмена оставляет ранее сохранённый язык.

**Перенос профиля.** Нажмите **Экспорт**, затем откройте JSON через **Импорт** в другом браузере или другой сборке. Фон включается в профиль. Импорт сначала показывает предпросмотр; нажмите **Сохранить**, чтобы применить его постоянно. Поддерживаются прежние профили редактора. Максимальный размер JSON — **3 МиБ**.

Настройки хранятся в `config.json` внутри папки `extensions/sd-modern-ui`: цвета, шрифт, фон, остальные параметры оформления и язык. Другой браузер получает их при открытии или обновлении страницы этой установки WebUI. Очистка данных браузера их не удаляет. Прежняя тема из браузера переносится автоматически, если общий конфиг ещё не настроен.

Для переноса всех настроек на другой компьютер сохраните `config.json` вместе с папкой расширения. JSON-экспорт редактора также позволяет переносить отдельные профили оформления.

### Если что-то выглядит неправильно

| Проблема | Что сделать |
| --- | --- |
| Тема или новые элементы не появились | Проверьте переключатель темы и папку установки, перезапустите WebUI и нажмите **Ctrl+F5**. |
| Неудачно выбраны цвета | Откройте редактор, нажмите **Сброс**, затем **Сохранить**, либо импортируйте свой профиль. |
| Не удаётся сохранить цвет | Исправьте выделенный HEX-код или верните поле в «Авто». |
| Сохранение в конфиг не удалось | Проверьте сообщение в редакторе, права на папку расширения и свободное место. Предпросмотр остаётся открытым. |
| Настройки изменены в другом браузере | Экспортируйте несохранённый профиль при необходимости и обновите страницу перед дальнейшим редактированием. |
| Оформление смешивается с другой темой | Временно отключите другое расширение оформления и обновите страницу. |

---

<a id="en"></a>

## English

A dark theme for **Stable Diffusion WebUI reForge** and **Forge Neo**, with clear controls, tidy panels, and an appearance you can make your own.

### Features

- A consistent dark palette, balanced spacing, and rounded panels.
- Clear tool icons with mouse and keyboard tooltips.
- A gallery with visible download and close controls.
- Styled notifications, errors, and progress indicators.
- Highlighted enabled Hires, ADetailer, and ControlNet panels, plus LoRA cards in use.
- An editor for colors, opacity, shadows, corner radius, font, and background images.
- Live preview and shared settings for browsers connected to the same WebUI installation.
- English / Russian selection for the entire Stable Diffusion interface.
- A themed page scrollbar and browser tab icon. Turning the theme off restores the host icon.
- Mouse, keyboard, and touch controls.

Buttons keep their usual actions. No additional libraries are required.

### Installation

**From a repository URL**

1. Open **Extensions → Install from URL**.
2. Paste the extension repository address and click **Install**.
3. Restart WebUI and refresh the page with **Ctrl+F5**.

**From a ZIP archive**

1. Stop WebUI.
2. Extract the `sd-modern-ui` folder into your WebUI `extensions` folder. The `style.css` file must be directly inside `extensions/sd-modern-ui`, without an extra nested folder.
3. Start WebUI and press **Ctrl+F5**.

When updating from ZIP, back up `config.json`, replace the extension folder, and put this file back.

### Turning the theme on or off

Find **Enable SD Modern UI** in **Settings → User Interface**. The switch applies immediately. Click WebUI's **Apply settings** button to keep your choice after a restart.

### Customizing the appearance

Open the editor with the palette button in the top quick settings bar, or **Customize appearance** in the interface settings.

Changes appear in a live preview first:

| Action | Result |
| --- | --- |
| **Save** | Writes settings to the extension configuration file. |
| **Cancel**, closing the editor, or **Esc** | Restores the previously saved appearance. |
| **Reset** | Previews the default appearance. Click Save to keep the reset. |
| **Export / Import** | Saves a JSON profile or opens an existing one. |

When the font list is open, the first **Esc** closes the list. In a nonempty color search, the first **Esc** clears the query. Press **Esc** again to close the editor without saving.

**Colors.** Expand a group or search by a setting's name. Enter a HEX code to find colors, such as `#818CF8`, `818cf8`, or `#fff`. Search uses current values, including automatic colors. To change several matches together, choose a replacement and click **Replace matching colors**. The main accent stays unchanged. Check the preview, then save the result.

Each color has a picker, a HEX field, and a circular-arrow button to return it to **Auto**. Automatic colors follow the accent and related theme settings. A group reset affects only that group's colors. An invalid HEX value is highlighted; correct it or reset the field before saving.

**Font.** Choose from the themed list. Keyboard controls include arrows, **Home / End**, first-letter search, and **Enter** or Space to select an option.

**Background.** Choose PNG, JPEG, or WebP, adjust dimming and blur, or remove the image. The original file can be up to **8 MiB** and **32 megapixels**.

**Interface language.** Choose **English** or **Русский** at the bottom of the editor. English is the default. Click **Save and reload** to apply the chosen language throughout WebUI. Cancel keeps the previously saved language.

**Moving a profile.** Click **Export**, then open the JSON through **Import** in another browser or WebUI host. The background is included. Import shows a preview first; click **Save** to keep it. Earlier editor profiles are supported. The maximum JSON file size is **3 MiB**.

Settings are stored in `config.json` inside `extensions/sd-modern-ui`: colors, font, background, other appearance controls, and language. Another browser loads them when opening or refreshing this WebUI installation. Clearing browser data does not remove them. A previous browser theme is migrated automatically if the shared configuration has not been set up yet.

To move all settings to another computer, keep `config.json` with the extension folder. The editor also supports JSON export and import for individual appearance profiles.

### Troubleshooting

| Problem | What to do |
| --- | --- |
| The theme or new controls do not appear | Check the theme switch and installation folder, restart WebUI, and press **Ctrl+F5**. |
| The chosen colors are hard to use | Open the editor, click **Reset**, then **Save**, or import a saved profile. |
| A color cannot be saved | Correct the highlighted HEX value or return the field to Auto. |
| The configuration cannot be saved | Check the editor message, extension folder permissions, and free disk space. Your preview remains open. |
| Settings changed in another browser | Export your unsaved profile if needed, then refresh the page before editing further. |
| Another theme changes the appearance | Temporarily disable the other appearance extension and refresh the page. |
