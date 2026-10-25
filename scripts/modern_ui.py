import base64
import binascii
from copy import deepcopy
from io import BytesIO
import inspect
import json
import os
from pathlib import Path
import re
import secrets
import tempfile
import threading
from urllib.parse import urlsplit
import warnings

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.requests import ClientDisconnect

from modules import script_callbacks, shared

OPTION_NAME = "sd_modern_ui_enabled"
_PATCH_ATTR = "_sd_modern_ui_patched"
_ROUTE_ATTR = "_sd_modern_ui_config_routes"
_TEMPLATE_ATTR = "_sd_modern_ui_live_config"
_EXTENSION_ROOT = Path(__file__).resolve().parent.parent
_CONFIG_PATH = _EXTENSION_ROOT / "config.json"
_LANGUAGE_DIR = _EXTENSION_ROOT / "languages"
_CONFIG_LOCK = threading.RLock()
_MAX_REQUEST = 4 * 1024 * 1024
_MAX_THEME = 3 * 1024 * 1024
_MAX_IMAGE = 1572864
_MAX_REVISION = 9007199254740991
_COLOR_ROLES = frozenset(["canvas","neutral-100","neutral-200","neutral-300","neutral-400","neutral-50","neutral-500","neutral-600","neutral-700","neutral-800","neutral-900","neutral-950","wallpaper-base","wallpaper-shade","model-card","model-pane","panel","panel-hover","panel-raised","settings-tab-hover","settings-tab-hover-border","tab-active-border","tab-active-end","tab-active-start","tab-border","tab-hover","tab-surface","link","link-hover","placeholder","placeholder-native","tab-active-text","tab-hover-text","tab-text","text","text-bright","text-muted","text-strong","button-border","button-hover-border","checkbox","checkbox-checkmark","checkbox-hover","delete-background","delete-border","delete-text","dropdown","dropdown-tag","gallery-button","gallery-button-hover","gallery-toolbar","input","primary-end","primary-hover-end","primary-hover-start","primary-hover-text","primary-start","primary-text","secondary","secondary-hover","secondary-hover-text","secondary-text","slider-thumb","slider-thumb-border","slider-track","stop-end","stop-hover","stop-start","tag-remove-background","tag-remove-text","tool-text","accent-100","accent-200","accent-300","accent-400","accent-50","accent-500","accent-600","accent-700","accent-800","accent-900","accent-glow-hover","accent-violet","accent-violet-light","accent-violet-pale","border","focus-ring","inset-shadow","lightbox","scrollbar","scrollbar-webkit","shadow","surface-highlight","text-shadow","tooltip","tooltip-text","danger","error-accent","error-background","error-gradient-end","error-text","toast-close-hover","toast-end","toast-muted","toast-scrollbar","toast-start","toast-text","warning","editor-border","editor-button","editor-button-hover","editor-error-background","editor-error-text","editor-heading","editor-icon","editor-label","editor-muted","editor-overlay","editor-preview-background","editor-preview-line","editor-preview-line-short","editor-preview-panel","editor-preview-stripe","editor-preview-stripe-alt","editor-scrollbar","editor-shadow","editor-success","editor-surface","editor-text","editor-value","page-scrollbar-thumb","page-scrollbar-hover","page-scrollbar-track"])
_HEX = re.compile(r"#[0-9a-fA-F]{6}\Z")
_IMAGE = re.compile(r"data:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})\Z")
_DEFAULT_SETTINGS = {
    "accent": "#818cf8", "panelOpacity": 100, "shadow": 100, "radius": 14,
    "font": "system", "backgroundImage": None, "backgroundDim": 65,
    "backgroundBlur": 8, "colors": {},
}
_RANGES = {"panelOpacity": (50, 100), "shadow": (0, 150), "radius": (0, 24),
           "backgroundDim": (0, 90), "backgroundBlur": (0, 24)}
_FONTS = frozenset(("system", "segoe", "arial", "tahoma", "verdana"))
_CONFIG_SCRIPT = re.compile(rb'<script id="sd-modern-ui-config" type="application/json">.*?</script>\n?', re.DOTALL)


class ConfigError(Exception):
    def __init__(self, status, code, message, config=None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.config = config


def _default_config():
    return {"theme": {"schema": "sd-modern-ui-theme", "version": 2,
                      "settings": deepcopy(_DEFAULT_SETTINGS)},
            "language": "en", "revision": 0, "initialized": False}


def _invalid():
    return ConfigError(422, "invalid_config", "The configuration is not valid.")


def _exact_keys(value, keys):
    return type(value) is dict and set(value) == set(keys)


def _json_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON key")
        result[key] = value
    return result


def _json_constant(value):
    raise ValueError("Invalid JSON number")


def _parse_json(data):
    try:
        return json.loads(data, object_pairs_hook=_json_pairs, parse_constant=_json_constant)
    except RecursionError:
        raise ValueError("JSON nesting is too deep") from None


def _validate_image(value):
    if type(value) is not str or len(value) > (_MAX_IMAGE * 4 // 3) + 48:
        raise _invalid()
    match = _IMAGE.fullmatch(value)
    if not match or len(match.group(2)) % 4:
        raise _invalid()
    try:
        data = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError):
        raise _invalid() from None
    if not data or len(data) > _MAX_IMAGE:
        raise _invalid()
    formats = {"image/png": "PNG", "image/jpeg": "JPEG", "image/webp": "WEBP"}
    signatures = {
        "image/png": data.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/jpeg": data.startswith(b"\xff\xd8\xff"),
        "image/webp": len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP",
    }
    if not signatures[match.group(1)]:
        raise _invalid()
    try:
        from PIL import Image
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as image:
                if image.format != formats[match.group(1)] or not (1 <= image.width <= 2560 and 1 <= image.height <= 2560):
                    raise _invalid()
                image.verify()
            with Image.open(BytesIO(data)) as image:
                image.load()
    except ConfigError:
        raise
    except Exception:
        raise _invalid() from None
    return value


def _validate_theme(value):
    if not _exact_keys(value, ("schema", "version", "settings")) or value["schema"] != "sd-modern-ui-theme" or type(value["version"]) is not int or value["version"] != 2:
        raise _invalid()
    settings = value["settings"]
    if not _exact_keys(settings, _DEFAULT_SETTINGS):
        raise _invalid()
    if type(settings["accent"]) is not str or not _HEX.fullmatch(settings["accent"]):
        raise _invalid()
    for key, (minimum, maximum) in _RANGES.items():
        if type(settings[key]) is not int or not minimum <= settings[key] <= maximum:
            raise _invalid()
    if type(settings["font"]) is not str or settings["font"] not in _FONTS:
        raise _invalid()
    if type(settings["colors"]) is not dict:
        raise _invalid()
    colors = {}
    for key, color in settings["colors"].items():
        if key not in _COLOR_ROLES or type(color) is not str or not _HEX.fullmatch(color):
            raise _invalid()
        colors[key] = color.lower()
    background = settings["backgroundImage"]
    if background is not None:
        _validate_image(background)
    result = {"schema": "sd-modern-ui-theme", "version": 2,
              "settings": {**settings, "accent": settings["accent"].lower(), "colors": colors}}
    if len(json.dumps(result, ensure_ascii=True, allow_nan=False).encode("utf-8")) > _MAX_THEME:
        raise _invalid()
    return result


def _validate_language(value):
    if type(value) is not str or value not in ("en", "ru"):
        raise _invalid()
    return value


def _validate_revision(value):
    if type(value) is not int or not 0 <= value <= _MAX_REVISION:
        raise _invalid()
    return value


class ConfigStore:
    def __init__(self, path):
        self.path = Path(path)

    def _read(self):
        try:
            with self.path.open("rb") as file:
                data = file.read(_MAX_REQUEST + 1)
        except FileNotFoundError:
            return _default_config()
        except OSError:
            raise ConfigError(503, "config_read_error", "The saved configuration could not be read.") from None
        try:
            if len(data) > _MAX_REQUEST:
                raise _invalid()
            value = _parse_json(data.decode("utf-8-sig"))
            if not _exact_keys(value, ("theme", "language", "revision", "initialized")) or type(value["initialized"]) is not bool:
                raise _invalid()
            return {"theme": _validate_theme(value["theme"]),
                    "language": _validate_language(value["language"]),
                    "revision": _validate_revision(value["revision"]),
                    "initialized": value["initialized"]}
        except (ValueError, UnicodeError, ConfigError, TypeError):
            raise ConfigError(503, "config_read_error", "The saved configuration could not be read.") from None

    def read(self):
        with _CONFIG_LOCK:
            return self._read()

    def write(self, payload):
        if not _exact_keys(payload, ("theme", "language", "expectedRevision")):
            raise _invalid()
        with _CONFIG_LOCK:
            theme = _validate_theme(payload["theme"])
            language = _validate_language(payload["language"])
            revision = _validate_revision(payload["expectedRevision"])
            current = self._read()
            if revision != current["revision"]:
                raise ConfigError(409, "revision_conflict", "The configuration changed. Reload before saving.", current)
            if revision == _MAX_REVISION:
                raise _invalid()
            config = {"theme": theme, "language": language, "revision": revision + 1, "initialized": True}
            data = json.dumps(config, ensure_ascii=False, allow_nan=False, indent=2).encode("utf-8")
            if len(data) > _MAX_REQUEST:
                raise _invalid()
            temporary = None
            try:
                with tempfile.NamedTemporaryFile(mode="wb", prefix=".sd-modern-ui-", suffix=".tmp", dir=self.path.parent, delete=False) as file:
                    temporary = Path(file.name)
                    file.write(data)
                    file.flush()
                    os.fsync(file.fileno())
                os.replace(temporary, self.path)
                temporary = None
            except OSError:
                raise ConfigError(503, "config_write_error", "The configuration could not be saved.") from None
            finally:
                if temporary is not None:
                    try:
                        temporary.unlink()
                    except OSError:
                        pass
            return config


def _config_store():
    return ConfigStore(_CONFIG_PATH)


def _catalogs():
    result = {}
    for language, name in (("en", "en_US.json"), ("ru", "ru_RU.json")):
        try:
            value = _parse_json((_LANGUAGE_DIR / name).read_text(encoding="utf-8-sig"))
            result[language] = value if type(value) is dict else {}
        except (OSError, ValueError, UnicodeError):
            result[language] = {}
    return result


def _json_script(identifier, value):
    data = json.dumps(value, ensure_ascii=True, allow_nan=False, separators=(",", ":")).replace("<", "\\u003c")
    return f'<script id="{identifier}" type="application/json">{data}</script>\n'


def _config_script():
    try:
        config = _config_store().read()
    except ConfigError:
        config = {**_default_config(), "readError": True}
    return _json_script("sd-modern-ui-config", config)


def _wrap_template_response(original):
    def template_response_with_live_config(*args, **kwargs):
        response = original(*args, **kwargs)
        if _CONFIG_SCRIPT.search(response.body):
            context = getattr(response, "context", None)
            config = context.get("config") if isinstance(context, dict) else None
            requires_login = isinstance(config, dict) and config.get("auth_required") is True
            if requires_login:
                response.body = _CONFIG_SCRIPT.sub(b"", response.body)
            else:
                data = _config_script().encode("utf-8")
                response.body = _CONFIG_SCRIPT.sub(lambda match: data, response.body, count=1)
            response.headers["content-length"] = str(len(response.body))
        return response

    setattr(template_response_with_live_config, _TEMPLATE_ATTR, True)
    return template_response_with_live_config


def _inject_live_config_template():
    import gradio as gr

    current = gr.routes.templates.TemplateResponse
    if not getattr(current, _TEMPLATE_ATTR, False):
        gr.routes.templates.TemplateResponse = _wrap_template_response(current)


def _wrap_reload_javascript(original):
    def reload_javascript_with_live_config(*args, **kwargs):
        result = original(*args, **kwargs)
        _inject_live_config_template()
        return result

    setattr(reload_javascript_with_live_config, _TEMPLATE_ATTR, True)
    return reload_javascript_with_live_config


def _basic_credentials(request):
    authorization = request.headers.get("authorization", "")
    scheme, separator, encoded = authorization.partition(" ")
    if not separator or scheme.lower() != "basic":
        return None
    try:
        value = base64.b64decode(encoded, validate=True).decode("utf-8")
    except (binascii.Error, ValueError, UnicodeError):
        return None
    username, separator, password = value.partition(":")
    return (username, password) if separator else None


def _matches_credentials(credentials, accounts):
    if credentials is None:
        return False
    username, password = credentials
    for expected_user, expected_password in accounts:
        if secrets.compare_digest(username.encode("utf-8"), str(expected_user).encode("utf-8")) and secrets.compare_digest(password.encode("utf-8"), str(expected_password).encode("utf-8")):
            return True
    return False


async def _authorize(request, app):
    auth = getattr(app, "auth", None)
    dependency = getattr(app, "auth_dependency", None)
    api_auth = getattr(getattr(shared, "cmd_opts", None), "api_auth", None)
    if auth is None and dependency is None:
        return
    if dependency is not None:
        user = dependency(request)
        if inspect.isawaitable(user):
            user = await user
        if user is not None:
            return
    suffix = "-" + str(app.cookie_id) if getattr(app, "cookie_id", None) is not None else ""
    tokens = getattr(app, "tokens", {})
    if auth is not None:
        for name in ("access-token" + suffix, "access-token-unsecure" + suffix):
            token = request.cookies.get(name)
            if token is not None and tokens.get(token) is not None:
                return
    credentials = _basic_credentials(request)
    if api_auth:
        accounts = [value.partition(":")[::2] for value in api_auth.split(",") if ":" in value]
        if _matches_credentials(credentials, accounts):
            return
    if type(auth) is dict and _matches_credentials(credentials, auth.items()):
        return
    if callable(auth) and credentials is not None:
        accepted = auth(*credentials)
        if inspect.isawaitable(accepted):
            accepted = await accepted
        if accepted:
            return
    raise HTTPException(status_code=401, detail={"code": "authentication_required", "message": "Authentication is required."}, headers={"WWW-Authenticate": 'Basic realm="SD Modern UI"'})


def _origin(value):
    try:
        url = urlsplit(value)
        if url.scheme not in ("http", "https") or not url.hostname or url.username is not None or url.password is not None:
            return None
        return url.scheme, url.hostname.lower(), url.port or (443 if url.scheme == "https" else 80)
    except ValueError:
        return None


def _check_write_request(request):
    if request.headers.get("x-sd-modern-ui") != "1":
        raise ConfigError(403, "invalid_request", "The request is not allowed.")
    if request.headers.get("content-type", "").split(";", 1)[0].strip().lower() != "application/json":
        raise ConfigError(415, "invalid_content_type", "JSON content is required.")
    if request.headers.get("sec-fetch-site", "").lower() == "cross-site":
        raise ConfigError(403, "origin_rejected", "The request origin is not allowed.")
    expected = _origin(str(request.url))
    for header in ("origin", "referer"):
        value = request.headers.get(header)
        if value is not None and _origin(value) != expected:
            raise ConfigError(403, "origin_rejected", "The request origin is not allowed.")


def _error_response(error):
    data = {"detail": {"code": error.code, "message": error.message}}
    if error.config is not None:
        data["config"] = error.config
    return JSONResponse(data, status_code=error.status, headers={"Cache-Control": "no-store"})


def on_app_started(demo, app):
    _inject_live_config_template()
    if getattr(app, _ROUTE_ATTR, False):
        return

    async def get_configuration(request: Request):
        await _authorize(request, app)
        try:
            value = await run_in_threadpool(_config_store().read)
            return JSONResponse({"config": value}, headers={"Cache-Control": "no-store"})
        except ConfigError as error:
            return _error_response(error)

    async def post_configuration(request: Request):
        await _authorize(request, app)
        try:
            _check_write_request(request)
            data = bytearray()
            try:
                async for chunk in request.stream():
                    if len(data) + len(chunk) > _MAX_REQUEST:
                        raise ConfigError(413, "request_too_large", "The configuration is too large.")
                    data.extend(chunk)
            except ClientDisconnect:
                raise ConfigError(400, "request_incomplete", "The request was interrupted before it was received.") from None
            try:
                payload = _parse_json(data.decode("utf-8"))
            except (ValueError, UnicodeError):
                raise ConfigError(422, "invalid_json", "The request is not valid JSON.") from None
            config = await run_in_threadpool(_config_store().write, payload)
            return JSONResponse({"config": config}, headers={"Cache-Control": "no-store"})
        except ConfigError as error:
            return _error_response(error)

    app.add_api_route("/sd-modern-ui/config", get_configuration, methods=["GET"])
    app.add_api_route("/sd-modern-ui/config", post_configuration, methods=["POST"])
    setattr(app, _ROUTE_ATTR, True)


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
            _json_script("sd-modern-ui-locales", _catalogs())
            + _config_script()
            + "<script>"
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
    if current is not None and not getattr(current, _PATCH_ATTR, False):
        ui_gradio_extensions.javascript_html = _wrap_javascript_html(current)

    reload = getattr(ui_gradio_extensions, "reload_javascript", None)
    if reload is not None and not getattr(reload, _TEMPLATE_ATTR, False):
        ui_gradio_extensions.reload_javascript = _wrap_reload_javascript(reload)


script_callbacks.on_ui_settings(on_ui_settings)
script_callbacks.on_before_ui(inject_saved_state)
script_callbacks.on_app_started(on_app_started)
