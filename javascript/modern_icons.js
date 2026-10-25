(() => {
    "use strict";

    const INSTANCE_KEY = "sdModernUiIcons";
    const previous = window[INSTANCE_KEY];
    if (previous && typeof previous.destroy === "function") previous.destroy();
    const SVG_NS = "http://www.w3.org/2000/svg";
    const OWN_SELECTOR = ".modern-tool-icon";
    const EXCLUDED_SELECTOR = ".gradio-gallery, .forge-container, #lightboxModal, #sd_image_viewer";
    const states = new Map();
    let scheduled = false;
    let frame = 0;
    let frameIsTimeout = false;
    let disposed = false;
    let unsubscribe = null;

    const icons = {
        folder: '<path d="M3 7V5a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/><path d="M3 9h18"/>',
        save: '<path d="M5 3h12l4 4v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8M14 5v2"/>',
        archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4M12 4v5"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
        brush: '<path d="m13 6 5-3 3 3-9 9-3-3 4-6Z"/><path d="M10 13c-5-1-4 5-7 6 4 3 9 0 8-4"/>',
        ruler: '<path d="m3 16 13-13 5 5L8 21l-5-5Z"/><path d="m13 6 2 2M10 9l2 2M7 12l2 2M4 15l2 2"/>',
        video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3Z"/>',
        upscale: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4"/>',
        dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 7.5h.01M16.5 7.5h.01M12 12h.01M7.5 16.5h.01M16.5 16.5h.01" stroke-width="2"/>',
        reuse: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2"/>',
        swap: '<path d="M7 3v16m-4-4 4 4 4-4M17 21V5m-4 4 4-4 4 4"/>',
        scan: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/><rect x="7" y="7" width="10" height="10" rx="1"/>',
        refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2"/>',
        paste: '<path d="M9 5H6a2 2 0 0 0-2 2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2h-3"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M8 12h8M8 16h6"/>',
        delete: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
        styles: '<path d="M4 4h16v5H4ZM4 13h7v7H4ZM15 13h5M15 17h5M15 21h5"/>',
        edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14l-1 7 1-1Z"/>',
        copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
        restore: '<path d="M3 4v6h6M3 10a9 9 0 1 1 1 8"/><path d="M12 7v5l3 2"/>',
        interrogate: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h5M7 12h10M7 16h7"/>',
        tags: '<path d="M3 3h8l10 10-8 8L3 11V3Z"/><circle cx="7.5" cy="7.5" r="1"/>',
        clear: '<path d="M4 7h16M8 7V4h8v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>'
    };

    const actions = {
        folder: { icon: "folder", tipEn: "Open images output directory." },
        save: { icon: "save", tipEn: "Save image" },
        archive: { icon: "archive", tipEn: "Save ZIP archive with images" },
        "send-img2img": { icon: "image", tipEn: "Send image and generation parameters to img2img tab." },
        "send-inpaint": { icon: "brush", tipEn: "Send image and generation parameters to img2img inpaint tab." },
        "send-extras": { icon: "ruler", tipEn: "Send image and generation parameters to extras tab." },
        "send-svd": { icon: "video", tipEn: "Send image and generation parameters to SVD tab." },
        upscale: { icon: "upscale", tipEn: "Upscale current image using hires fix settings" },
        "random-seed": { icon: "dice", tipEn: "Use a new random seed for each generation" },
        "reuse-seed": { icon: "reuse", tipEn: "Reuse seed from last generation" },
        "random-subseed": { icon: "dice", tipEn: "Use a random variation seed" },
        "reuse-subseed": { icon: "reuse", tipEn: "Reuse variation seed from last generation" },
        "swap-dimensions": { icon: "swap", tipEn: "Switch width/height" },
        "detect-dimensions": { icon: "scan", tipEn: "Auto detect size from img2img" },
        refresh: { icon: "refresh", tipEn: "Refresh" },
        paste: { icon: "paste", tipEn: "Read generation parameters from prompt or last generation if prompt is empty into user interface." },
        "clear-prompt": { icon: "clear", tipEn: "Clear prompt" },
        "styles-apply": { icon: "styles", tipEn: "Apply selected styles to prompts" },
        "styles-edit": { icon: "edit", tipEn: "Edit styles" },
        "styles-copy": { icon: "copy", tipEn: "Copy main UI prompt to style." },
        "restore-progress": { icon: "restore", tipEn: "Restore progress" },
        interrogate: { icon: "interrogate", tipEn: "Describe image with CLIP" },
        deepbooru: { icon: "tags", tipEn: "Describe image with DeepBooru tags" },
        delete: { icon: "delete", tipEn: "Delete" }
    };

    const buttonActions = new Map();
    for (const tab of ["txt2img", "img2img", "extras", "svd"]) {
        buttonActions.set(`${tab}_open_folder`, "folder");
        buttonActions.set(`save_${tab}`, "save");
        buttonActions.set(`save_zip_${tab}`, "archive");
        buttonActions.set(`${tab}_send_to_img2img`, "send-img2img");
        buttonActions.set(`${tab}_send_to_inpaint`, "send-inpaint");
        buttonActions.set(`${tab}_send_to_extras`, "send-extras");
        buttonActions.set(`${tab}_send_to_svd`, "send-svd");
    }
    for (const tab of ["txt2img", "img2img"]) {
        for (const [suffix, action] of [
            ["random_seed", "random-seed"],
            ["reuse_seed", "reuse-seed"],
            ["random_subseed", "random-subseed"],
            ["reuse_subseed", "reuse-subseed"],
            ["res_switch_btn", "swap-dimensions"],
            ["clear_prompt", "clear-prompt"],
            ["style_apply", "styles-apply"],
            ["styles_edit_button", "styles-edit"],
            ["style_apply_dialog", "styles-apply"],
            ["style_copy", "styles-copy"],
            ["restore_progress", "restore-progress"],
            ["sdelb_delete_button", "delete"]
        ]) {
            buttonActions.set(`${tab}_${suffix}`, action);
        }
    }
    for (const id of [
        "refresh_sd_model_checkpoint",
        "forge_refresh_checkpoint",
        "refresh_sd_vae",
        "refresh_sd_unet",
        "refresh_sd_text_encoder",
        "refresh_localization",
        "refresh_txt2img_styles",
        "refresh_img2img_styles",
        "hr_checkpoint_refresh",
        "txt2img_checkpoint_refresh",
        "img2img_checkpoint_refresh"
    ]) {
        buttonActions.set(id, "refresh");
    }
    buttonActions.set("txt2img_upscale", "upscale");
    buttonActions.set("img2img_detect_image_size_btn", "detect-dimensions");
    buttonActions.set("paste", "paste");
    buttonActions.set("interrogate", "interrogate");
    buttonActions.set("deepbooru", "deepbooru");

    const buttonSelector = [...buttonActions.keys()].map(id => `button[id="${id}"]`).join(",");
    const appRoot = () => (typeof gradioApp === "function" ? gradioApp() : document);
    const enabled = () => !disposed && document.documentElement.classList.contains("sd-modern-ui");

    const translated = english => {
        const i18n = window.sdModernUiI18n;
        const value = i18n && typeof i18n.t === "function" ? i18n.t(english) : undefined;
        return typeof value === "string" && value.trim() ? value : english;
    };

    const readTitle = button => {
        const bridge = window.sdModernUiTooltipTitles;
        return bridge && typeof bridge.get === "function" ? bridge.get(button) : button.getAttribute("title");
    };

    const writeTitle = (button, value) => {
        const bridge = window.sdModernUiTooltipTitles;
        if (bridge && typeof bridge.set === "function") bridge.set(button, value);
        else button.setAttribute("title", value);
    };

    const updateFallback = (button, state, attribute, value) => {
        const current = attribute === "title" ? readTitle(button) : button.getAttribute(attribute);
        const owned = state.attributes[attribute];
        if (state.nativeAttributes.has(attribute)) return;
        if (owned && current !== owned.value) {
            delete state.attributes[attribute];
            state.nativeAttributes.add(attribute);
            return;
        }
        if (!owned && current && current.trim()) {
            state.nativeAttributes.add(attribute);
            return;
        }
        if (!owned) state.attributes[attribute] = { original: current, value };
        else owned.value = value;
        if (current !== value) {
            if (attribute === "title") writeTitle(button, value);
            else button.setAttribute(attribute, value);
        }
    };

    const protectTitle = (button, state, owned) => {
        if (owned) {
            if (state.protection || button.hasAttribute("data-sd-modern-ui-i18n")) return;
            state.protection = { translate: button.getAttribute("translate") };
            button.setAttribute("data-sd-modern-ui-i18n", "icons");
            button.setAttribute("translate", "no");
            return;
        }
        if (!state.protection) return;
        if (button.getAttribute("data-sd-modern-ui-i18n") === "icons") button.removeAttribute("data-sd-modern-ui-i18n");
        if (button.getAttribute("translate") === "no") {
            if (state.protection.translate === null) button.removeAttribute("translate");
            else button.setAttribute("translate", state.protection.translate);
        }
        state.protection = null;
        if (!button.closest("[data-sd-modern-ui-i18n]") && typeof processNode === "function") processNode(button);
    };

    const releaseLabels = (button, state) => {
        for (const [attribute, owned] of Object.entries(state.attributes)) {
            const current = attribute === "title" ? readTitle(button) : button.getAttribute(attribute);
            if (current === owned.value) {
                if (attribute === "title") {
                    if (owned.original === null) {
                        const bridge = window.sdModernUiTooltipTitles;
                        if (bridge && typeof bridge.set === "function") bridge.set(button, "");
                        button.removeAttribute("title");
                    } else writeTitle(button, owned.original);
                } else if (owned.original === null) button.removeAttribute(attribute);
                else button.setAttribute(attribute, owned.original);
            }
            delete state.attributes[attribute];
        }
        if (state.saveTitle) {
            if (readTitle(button) === state.saveTitle.translated) writeTitle(button, state.saveTitle.original);
            state.saveTitle = null;
        }
        protectTitle(button, state, false);
    };

    const translateSaveTitle = (button, state, actionName) => {
        const prefix = actionName === "save"
            ? "Save the image to a dedicated directory ("
            : actionName === "archive"
                ? "Save zip archive with images to a dedicated directory ("
                : null;
        if (!prefix) return false;
        const current = readTitle(button);
        const previous = state.saveTitle;
        let original;
        if (previous && (current === previous.original || current === previous.translated)) {
            original = previous.original;
        } else if (current && current.startsWith(prefix)) {
            original = current;
        } else {
            delete state.saveTitle;
            return false;
        }
        const next = translated(prefix) + original.slice(prefix.length);
        state.saveTitle = { original, translated: next };
        if (current !== next) writeTitle(button, next);
        return true;
    };

    let classObserver = null;

    const decorate = button => {
        if (button.closest(EXCLUDED_SELECTOR)) return;
        if (!button.classList.contains("tool")) return;
        const actionName = buttonActions.get(button.id);
        const action = actions[actionName];
        if (!action) return;
        const existing = [...button.querySelectorAll("svg")];
        const ownIcons = existing.filter(icon => icon.parentNode === button && icon.classList.contains("modern-tool-icon"));
        let state = states.get(button);
        if (existing.some(icon => !ownIcons.includes(icon))) {
            if (state || ownIcons.length) {
                if (state) releaseLabels(button, state);
                for (const icon of ownIcons) icon.remove();
                states.delete(button);
                button.classList.remove("modern-icon-button");
                delete button.dataset.modernIcon;
            }
            return;
        }
        if (!state) {
            const icon = ownIcons[0] || document.createElementNS(SVG_NS, "svg");
            icon.setAttribute("class", "modern-tool-icon");
            icon.setAttribute("viewBox", "0 0 24 24");
            icon.setAttribute("fill", "none");
            icon.setAttribute("stroke", "currentColor");
            icon.setAttribute("stroke-width", "1.8");
            icon.setAttribute("stroke-linecap", "round");
            icon.setAttribute("stroke-linejoin", "round");
            icon.setAttribute("aria-hidden", "true");
            icon.setAttribute("focusable", "false");
            icon.innerHTML = icons[action.icon];
            state = { icon, attributes: Object.create(null), nativeAttributes: new Set(), protection: null, saveTitle: null };
            states.set(button, state);
        }
        if (ownIcons.length) state.icon = ownIcons[0];
        for (const icon of ownIcons.slice(1)) icon.remove();
        button.classList.add("modern-icon-button");
        button.dataset.modernIcon = actionName;
        if (state.icon.parentNode !== button) button.appendChild(state.icon);
        const tip = translated(action.tipEn);
        const savedTitle = translateSaveTitle(button, state, actionName);
        if (savedTitle) {
            delete state.attributes.title;
            state.nativeAttributes.add("title");
        } else updateFallback(button, state, "title", tip);
        if (!button.getAttribute("aria-labelledby")) updateFallback(button, state, "aria-label", tip);
        else if (state.attributes["aria-label"]) {
            const owned = state.attributes["aria-label"];
            if (button.getAttribute("aria-label") === owned.value) {
                if (owned.original === null) button.removeAttribute("aria-label");
                else button.setAttribute("aria-label", owned.original);
            }
            delete state.attributes["aria-label"];
        }
        protectTitle(button, state, !!state.saveTitle || !!state.attributes.title);
    };

    const scan = () => {
        if (disposed) return;
        const root = appRoot();
        if (!root || !root.querySelectorAll) return;
        for (const [button, state] of states) {
            if (!button.isConnected || !enabled()) {
                releaseLabels(button, state);
                if (state.icon.parentNode === button) state.icon.remove();
                button.classList.remove("modern-icon-button");
                delete button.dataset.modernIcon;
                if (!button.isConnected) states.delete(button);
            }
        }
        if (!classObserver && typeof MutationObserver === "function") {
            classObserver = new MutationObserver(records => {
                for (const record of records) {
                    const button = record.target;
                    if (button === document.documentElement) { schedule(); continue; }
                    const state = states.get(button);
                    if (!state || !button.matches(buttonSelector)) continue;
                    if (record.attributeName === "class") {
                        if (enabled() && button.classList.contains("tool") && !button.classList.contains("modern-icon-button")) decorate(button);
                    } else if (record.attributeName === "aria-labelledby") schedule();
                    else {
                        const current = record.attributeName === "title" ? readTitle(button) : button.getAttribute(record.attributeName);
                        const owned = state.attributes[record.attributeName];
                        if ((owned && current !== owned.value) || (record.attributeName === "title" && state.saveTitle && current !== state.saveTitle.translated)) schedule();
                    }
                }
            });
        }
        if (classObserver) classObserver.disconnect();
        if (classObserver) classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        if (!enabled()) return;
        root.querySelectorAll(buttonSelector).forEach(button => {
            decorate(button);
            if (classObserver && states.has(button)) classObserver.observe(button, { attributes: true, attributeFilter: ["class", "title", "aria-label", "aria-labelledby"] });
        });
    };

    const schedule = () => {
        if (disposed || scheduled) return;
        scheduled = true;
        frameIsTimeout = typeof window.requestAnimationFrame !== "function";
        const raf = window.requestAnimationFrame || (callback => setTimeout(callback, 16));
        frame = raf(() => {
            scheduled = false;
            frame = 0;
            scan();
        });
    };

    const isOwnNode = node => node.nodeType === 1 && !!node.closest(OWN_SELECTOR);

    const onMutations = mutations => {
        if (disposed) return;
        if (!mutations) return;
        const records = Array.isArray(mutations) ? mutations : [mutations];
        for (const mutation of records) {
            if (!mutation || mutation.type !== "childList" || isOwnNode(mutation.target)) continue;
            const target = mutation.target;
            const button = target.nodeType === 1 ? target.closest(buttonSelector) : null;
            if (button && [...mutation.addedNodes, ...mutation.removedNodes].some(node => node.nodeType === 1 && !isOwnNode(node) && (node.matches("svg") || node.querySelector("svg")))) {
                schedule();
                return;
            }
            if (target.nodeType === 1 && target.matches(buttonSelector)) {
                if ([...mutation.removedNodes].some(node => isOwnNode(node))) {
                    schedule();
                    return;
                }
            }
            for (const node of mutation.removedNodes) {
                if (node.nodeType === 1 && (node.matches(buttonSelector) || node.querySelector(buttonSelector))) {
                    schedule();
                    return;
                }
            }
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1 || isOwnNode(node)) continue;
                if (node.matches(buttonSelector) || node.querySelector(buttonSelector)) {
                    schedule();
                    return;
                }
            }
        }
    };

    const destroy = () => {
        if (disposed) return;
        disposed = true;
        if (frame) {
            if (frameIsTimeout) clearTimeout(frame);
            else window.cancelAnimationFrame(frame);
        }
        frame = 0;
        if (classObserver) classObserver.disconnect();
        if (unsubscribe) unsubscribe();
        document.removeEventListener("DOMContentLoaded", schedule);
        for (const [button, state] of states) {
            releaseLabels(button, state);
            if (state.icon.parentNode === button) state.icon.remove();
            button.classList.remove("modern-icon-button");
            delete button.dataset.modernIcon;
        }
        states.clear();
        if (window[INSTANCE_KEY] === api) delete window[INSTANCE_KEY];
    };
    const api = { destroy };
    window[INSTANCE_KEY] = api;
    const i18n = window.sdModernUiI18n;
    if (i18n && typeof i18n.subscribe === "function") unsubscribe = i18n.subscribe(schedule);
    else if (typeof window.addEventListener === "function") {
        window.addEventListener("sd-modern-ui-language-change", schedule);
        unsubscribe = () => window.removeEventListener("sd-modern-ui-language-change", schedule);
    }
    if (typeof onUiLoaded === "function") onUiLoaded(schedule);
    if (typeof onUiUpdate === "function") onUiUpdate(onMutations);
    if (typeof onOptionsChanged === "function") onOptionsChanged(schedule);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", schedule, { once: true });
    } else {
        schedule();
    }
})();
