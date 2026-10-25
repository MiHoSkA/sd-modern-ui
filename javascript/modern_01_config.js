(() => {
    "use strict";

    const previous = window.sdModernUiConfig;
    if (previous && typeof previous.destroy === "function") previous.destroy();
    const LEGACY_KEY = "sd-modern-ui.appearance.v1";
    const MAX_BYTES = 4 * 1024 * 1024;
    const defaults = { theme: { schema: "sd-modern-ui-theme", version: 2, settings: { accent: "#818cf8", panelOpacity: 100, shadow: 100, radius: 14, font: "system", backgroundImage: null, backgroundDim: 65, backgroundBlur: 8, colors: {} } }, language: "en", revision: 0, initialized: false };
    const clone = value => JSON.parse(JSON.stringify(value));
    const failure = (appearanceMessage, code) => Object.assign(new Error(appearanceMessage), { appearanceMessage, code });
    const valid = config => config && typeof config === "object" && !Array.isArray(config)
        && ["en", "ru"].includes(config.language) && Number.isSafeInteger(config.revision) && config.revision >= 0
        && typeof config.initialized === "boolean" && config.theme && config.theme.schema === "sd-modern-ui-theme" && config.theme.version === 2
        && config.theme.settings && typeof config.theme.settings === "object" && !Array.isArray(config.theme.settings);
    let current = clone(defaults);
    let available = false;
    let busy = false;
    let destroyed = false;
    let migrationAttempted = false;
    const controllers = new Set();
    if (typeof document !== "undefined") {
        const element = document.getElementById("sd-modern-ui-config");
        if (element) {
            try {
                const value = JSON.parse(element.textContent);
                if (valid(value)) { current = clone(value); available = true; }
            } catch (_error) {}
        }
    }
    const endpoint = () => {
        const url = new URL("sd-modern-ui/config", document.baseURI);
        if (url.origin !== window.location.origin) throw failure("Server configuration is unavailable. Restart WebUI after updating the extension.", "origin");
        return url.href;
    };
    const request = async (method, body) => {
        if (destroyed || !available || typeof fetch !== "function") throw failure("Server configuration is unavailable. Restart WebUI after updating the extension.", "unavailable");
        const controller = new AbortController();
        controllers.add(controller);
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(endpoint(), { method, credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", "X-SD-Modern-UI": "1" }, ...(body === undefined ? {} : { body }), signal: controller.signal });
            let value;
            try { value = await response.json(); } catch (_error) {
                throw failure(response.redirected ? "Authentication is required to save the configuration." : "Save failed because the configuration response was invalid.", response.redirected ? "authentication" : "response");
            }
            if (destroyed) throw failure("Server configuration is unavailable. Restart WebUI after updating the extension.", "disposed");
            if (!response.ok) {
                const code = value && value.detail && value.detail.code;
                if (response.status === 409) throw failure("Settings changed in another browser. Reload the page before saving.", "revision_conflict");
                if (response.status === 401 || (response.status === 403 && code === "authentication_required")) throw failure("Authentication is required to save the configuration.", "authentication");
                if (code === "read_unavailable" || code === "config_read_error") throw failure("The configuration file could not be read. Check that it contains valid JSON.", "read_unavailable");
                if (response.status === 503 || response.status >= 500) throw failure("The server could not write the configuration file. Check folder permissions and free disk space.", "write_unavailable");
                throw failure("The server rejected the configuration.", "invalid_configuration");
            }
            if (!value || !valid(value.config)) throw failure("Save failed because the configuration response was invalid.", "response");
            return clone(value.config);
        } catch (error) {
            if (error && error.appearanceMessage) throw error;
            if (error && error.name === "AbortError") throw failure("The save request timed out. Reload the page before trying again.", "timeout");
            throw failure("Settings could not be saved to the configuration file. Your preview is still open.", "network");
        } finally {
            window.clearTimeout(timeout);
            controllers.delete(controller);
        }
    };
    const accept = config => {
        if (destroyed) throw failure("Server configuration is unavailable. Restart WebUI after updating the extension.", "disposed");
        current = clone(config);
        const i18n = window.sdModernUiI18n;
        if (i18n && typeof i18n.acceptConfiguration === "function") i18n.acceptConfiguration(current);
        return { ok: true, config: clone(current) };
    };
    const save = async ({ theme, language }) => {
        if (busy) throw failure("A configuration save is already in progress.", "busy");
        if (!["en", "ru"].includes(language)) throw failure("The server rejected the configuration.", "invalid_language");
        let serialized;
        try { serialized = JSON.stringify({ theme, language, expectedRevision: current.revision }); } catch (_error) { throw failure("The server rejected the configuration.", "invalid_configuration"); }
        if (new TextEncoder().encode(serialized).length > MAX_BYTES) throw failure("The JSON file must not exceed 3 MB.", "size");
        busy = true;
        try { return accept(await request("POST", serialized)); } finally { busy = false; }
    };
    const refresh = async () => {
        if (busy) throw failure("A configuration save is already in progress.", "busy");
        busy = true;
        try { return accept(await request("GET")); } finally { busy = false; }
    };
    const migrateLegacy = async prepare => {
        if (destroyed || !available || current.initialized || migrationAttempted || typeof prepare !== "function") return clone(current);
        migrationAttempted = true;
        let raw;
        try { raw = window.localStorage.getItem(LEGACY_KEY); } catch (_error) { return clone(current); }
        if (raw === null) return clone(current);
        let theme;
        try { theme = await prepare(raw); } catch (_error) { return clone(current); }
        if (destroyed || current.initialized) return clone(current);
        try { await save({ theme, language: current.language }); }
        catch (error) {
            if (destroyed) return clone(current);
            if (error.code === "revision_conflict") {
                try { await refresh(); return clone(current); } catch (_error) {}
            }
            current = { ...current, theme: clone(theme), migrationPending: true };
        }
        return clone(current);
    };
    const destroy = () => {
        destroyed = true;
        for (const controller of controllers) controller.abort();
        controllers.clear();
        if (window.sdModernUiConfig === api) delete window.sdModernUiConfig;
    };
    const api = { get: () => clone(current), available: () => available && !destroyed, save, refresh, migrateLegacy, destroy };
    window.sdModernUiConfig = api;
})();
