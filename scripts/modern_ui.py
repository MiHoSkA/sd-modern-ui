from modules import script_callbacks, shared

OPTION_NAME = "sd_modern_ui_enabled"
_PATCH_ATTR = "_sd_modern_ui_patched"


def _option_enabled():
    try:
        return bool(getattr(shared.opts, OPTION_NAME, True))
    except Exception:
        return True


def on_ui_settings():
    metadata = {"section": ("ui", "User interface")}
    for option in shared.opts.data_labels.values():
        section = getattr(option, "section", None)
        if section and section[0] == "ui":
            metadata = {
                "section": section,
                "category_id": getattr(option, "category_id", None),
            }
            break
    info = shared.OptionInfo(
        True,
        "Enable SD Modern UI",
        **metadata,
    )
    info.info(
        "Modern dark theme. Applies immediately; save settings to persist your choice."
    )
    shared.opts.add_option(OPTION_NAME, info)


def _wrap_javascript_html(original):
    def javascript_html_with_modern_ui_state():
        enabled = "true" if _option_enabled() else "false"
        return (
            "<script>"
            f"window.sdModernUiEnabled={enabled};"
            "(function(){var r=document.documentElement;"
            "if(window.sdModernUiEnabled!==false){"
            "r.classList.add('sd-modern-ui');r.dataset.reforgeModernUi='enabled';"
            "}else{"
            "r.classList.remove('sd-modern-ui');r.dataset.reforgeModernUi='disabled';"
            "}})();"
            "</script>\n"
            + original()
        )

    setattr(javascript_html_with_modern_ui_state, _PATCH_ATTR, True)
    return javascript_html_with_modern_ui_state


def inject_saved_state():
    try:
        from modules import ui_gradio_extensions
    except ImportError:
        return

    current = getattr(ui_gradio_extensions, "javascript_html", None)
    if current is None or getattr(current, _PATCH_ATTR, False):
        return

    ui_gradio_extensions.javascript_html = _wrap_javascript_html(current)


script_callbacks.on_ui_settings(on_ui_settings)
script_callbacks.on_before_ui(inject_saved_state)
