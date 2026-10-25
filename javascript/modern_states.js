(() => {
    "use strict";

    const INSTANCE_KEY = "sdModernUiStates";
    const previous = window[INSTANCE_KEY];
    if (previous && typeof previous.destroy === "function") previous.destroy();
    const SVG_NS = "http://www.w3.org/2000/svg";
    const MARK = ".modern-lora-mark";
    const states = ["txt2img", "img2img"].map(tab => ({
        tab,
        units: [],
        cards: [],
        cardsDirty: true,
        unitsDirty: true,
        force: true
    }));
    const pending = new Set();
    let cardCache = new WeakMap();
    let promptTimer = null;
    let moduleTimer = null;
    let disposed = false;
    let boundRoot = null;
    let unsubscribe = null;

    const appRoot = () => typeof gradioApp === "function" ? gradioApp() : document;
    const byId = id => {
        const root = appRoot();
        return root.getElementById ? root.getElementById(id) : root.querySelector(`[id="${id}"]`);
    };
    const attached = node => node && node.isConnected;
    const current = (node, id) => attached(node) ? node : byId(id);
    const translated = text => {
        const i18n = window.sdModernUiI18n;
        const value = i18n && typeof i18n.t === "function" ? i18n.t(text) : undefined;
        return typeof value === "string" && value.trim() ? value : text;
    };
    const protect = node => {
        if (node.getAttribute("data-sd-modern-ui-i18n") !== null) return;
        const i18n = window.sdModernUiI18n;
        if (i18n && typeof i18n.protect === "function") i18n.protect(node);
        else {
            node.setAttribute("data-sd-modern-ui-i18n", "states");
            node.setAttribute("translate", "no");
        }
    };
    const commentMode = () => {
        let options;
        try {
            options = typeof opts !== "undefined" ? opts : window.opts;
        } catch (_error) {}
        const version = window.gradio_config && String(window.gradio_config.version || "");
        if (/^3\./.test(version)) return "reforge";
        if (/^4\./.test(version)) {
            return options && Object.prototype.hasOwnProperty.call(options, "enable_prompt_comments")
                ? options.enable_prompt_comments ? "neo" : "none"
                : "neo";
        }
        if (options && Object.prototype.hasOwnProperty.call(options, "enable_prompt_comments")) {
            return options.enable_prompt_comments ? "neo" : "none";
        }
        return "reforge";
    };
    const stripComments = (text, mode) => {
        if (mode === "none") return text;
        if (mode === "neo") {
            return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/[^\S\n]*(?:#|\/\/)[^\n]*/g, "");
        }
        return text
            .replace(/^\/\*[\s\S]*?\*\/(?:\n|$)/gm, "\n")
            .replace(/#[^\n]*(?:\n|$)/g, "\n")
            .replace(/\/\/[^\n]*(?:\n|$)/g, "\n")
            .replace(/\/\*[^\n]*(?:\n|$)|\*\/[^\n]*(?:\n|$)/g, "\n");
    };
    const promptAliases = (positive, negative, mode) => {
        const names = new Set();
        for (const prompt of [positive, negative]) {
            const text = stripComments(prompt, mode);
            const pattern = /<(?:lora|lyco):([^>]+)>/g;
            let match;
            while ((match = pattern.exec(text))) {
                const name = match[1].split(":").find(part => part.split("=", 3).length !== 2);
                if (name) names.add(name);
            }
        }
        return names;
    };
    const cardAliases = (card, tab) => {
        const source = card.getAttribute("onclick") || "";
        const name = card.getAttribute("data-name") || "";
        const cached = cardCache.get(card);
        if (cached && cached.source === source && cached.name === name && cached.tab === tab) return cached;
        const result = { source, name, tab, aliases: [], mark: cached ? cached.mark : null };
        const call = /^\s*(?:return\s+)?cardClicked\(\s*(['"])(txt2img|img2img)\1\s*,\s*("(?:\\.|[^"\\])*")/.exec(source);
        if (call && call[2] === tab) {
            try {
                const prefix = JSON.parse(call[3]);
                const alias = /^<(?:lora|lyco):([^:<>]+):$/.exec(prefix);
                const tail = source.slice(call[0].length);
                const weight = /^\s*\+\s*(?:opts\.extra_networks_default_multiplier|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*\+\s*">"\s*(?:\+|,)/i;
                if (alias && weight.test(tail)) {
                    result.aliases.push(alias[1]);
                    if (name && !result.aliases.includes(name)) result.aliases.push(name);
                }
            } catch (_error) {}
        }
        cardCache.set(card, result);
        return result;
    };
    const setClass = (node, name, enabled) => {
        if (node && node.classList.contains(name) !== enabled) node.classList.toggle(name, enabled);
    };
    const markModule = (root, enabled) => {
        if (!root) return;
        setClass(root, "modern-module", true);
        setClass(root, "modern-module-active", enabled);
        const heading = root.querySelector(":scope > .label-wrap");
        setClass(heading, "modern-module-heading", true);
    };
    const accordionChecked = root => {
        if (!root) return false;
        const field = byId(root.id + "-checkbox");
        const checkbox = field && field.querySelector('input[type="checkbox"]');
        const visible = byId(root.id + "-visible-checkbox");
        return checkbox ? checkbox.checked : !!(visible && visible.checked);
    };
    const ownsMark = node => node.nodeType === 1 && (node.matches(MARK) || !!node.closest(MARK));
    const contains = (node, selector) => node.nodeType === 1 && (node.matches(selector) || !!node.querySelector(selector));
    const queueModules = () => {
        if (disposed || moduleTimer !== null) return;
        moduleTimer = setTimeout(() => {
            moduleTimer = null;
            for (const state of states) updateModules(state);
        }, 0);
    };
    const queuePrompts = (state, reset = false) => {
        if (disposed) return;
        pending.add(state);
        if (promptTimer !== null && !reset) return;
        if (promptTimer !== null) clearTimeout(promptTimer);
        promptTimer = setTimeout(() => {
            promptTimer = null;
            const batch = [...pending];
            pending.clear();
            for (const item of batch) updateCards(item);
        }, 80);
    };
    const connectControlNet = state => {
        const group = current(state.controlNet, `${state.tab}_controlnet`);
        if (group !== state.controlNet) {
            if (state.controlObserver) state.controlObserver.disconnect();
            state.controlNet = group;
            state.controlRoot = null;
            state.unitsDirty = true;
            if (group) {
                state.controlObserver = new MutationObserver(records => {
                    for (const record of records) {
                        if ([...record.addedNodes, ...record.removedNodes].some(node => contains(node, ".cnet-unit-enabled"))) {
                            state.unitsDirty = true;
                            queueModules();
                            return;
                        }
                    }
                });
                state.controlObserver.observe(group, { childList: true, subtree: true });
            }
        }
        return group;
    };
    const updateModules = state => {
        if (state.tab === "txt2img") {
            state.hires = current(state.hires, "txt2img_hr");
            markModule(state.hires, accordionChecked(state.hires));
        }
        const detailerId = `script_${state.tab}_adetailer_ad_main_accordion`;
        state.detailer = current(state.detailer, detailerId);
        const detailerField = byId(`script_${state.tab}_adetailer_ad_enable`);
        const detailerCheckbox = detailerField && detailerField.querySelector('input[type="checkbox"]');
        markModule(state.detailer, detailerCheckbox ? detailerCheckbox.checked : accordionChecked(state.detailer));
        const group = connectControlNet(state);
        if (!group) return;
        if (!attached(state.controlRoot)) state.controlRoot = group.querySelector('[id="controlnet"]');
        if (state.unitsDirty || state.units.some(unit => !attached(unit.input))) {
            const pattern = new RegExp(`^${state.tab}_controlnet_ControlNet-(\\d+)_controlnet_enable_checkbox$`);
            state.units = [...group.querySelectorAll('.cnet-unit-enabled input[type="checkbox"]')].flatMap(input => {
                const wrapper = input.closest(".cnet-unit-enabled");
                const match = wrapper && pattern.exec(wrapper.id);
                return match ? [{ input, index: Number(match[1]) }] : [];
            });
            state.unitsDirty = false;
        }
        let enabled = false;
        const enabledUnits = new Set();
        for (const unit of state.units) {
            enabled = enabled || unit.input.checked;
            if (unit.input.checked) enabledUnits.add(unit.index);
            const accordion = unit.input.closest(".input-accordion");
            if (accordion && group.contains(accordion)) markModule(accordion, unit.input.checked);
        }
        markModule(state.controlRoot, enabled);
        const tabs = byId(`${state.tab}_controlnet_tabs`);
        if (tabs) {
            tabs.querySelectorAll(":scope > .tab-nav > button").forEach((button, index) => {
                setClass(button, "modern-unit-active", enabledUnits.has(index));
            });
        }
    };
    const connectPage = state => {
        const page = current(state.page, `${state.tab}_lora_cards_html`);
        if (page !== state.page) {
            if (state.pageObserver) state.pageObserver.disconnect();
            state.page = page;
            state.cardsDirty = true;
            state.force = true;
            if (page) {
                state.pageObserver = new MutationObserver(records => {
                    for (const record of records) {
                        if (ownsMark(record.target)) continue;
                        if (record.type === "attributes" && record.target.matches(".card")) {
                            state.cardsDirty = true;
                            queuePrompts(state);
                            return;
                        }
                        const nodes = [...record.addedNodes, ...record.removedNodes];
                        if (nodes.some(node => !ownsMark(node) && contains(node, ".card"))) {
                            state.cardsDirty = true;
                            queuePrompts(state);
                            return;
                        }
                        if ([...record.removedNodes].some(ownsMark)) {
                            state.force = true;
                            queuePrompts(state);
                            return;
                        }
                    }
                });
                state.pageObserver.observe(page, { childList: true, subtree: true, attributes: true, attributeFilter: ["onclick", "data-name"] });
            }
        }
        return page;
    };
    const promptValues = state => {
        state.positiveRoot = current(state.positiveRoot, `${state.tab}_prompt`);
        state.negativeRoot = current(state.negativeRoot, `${state.tab}_neg_prompt`);
        if (!attached(state.positive)) state.positive = state.positiveRoot && state.positiveRoot.querySelector("textarea");
        if (!attached(state.negative)) state.negative = state.negativeRoot && state.negativeRoot.querySelector("textarea");
        return [state.positive ? state.positive.value : "", state.negative ? state.negative.value : ""];
    };
    const updateCards = state => {
        if (disposed) return;
        const page = connectPage(state);
        if (!page) return;
        if (state.cardsDirty) {
            state.cards = [...page.querySelectorAll(".card")]
                .filter(card => !card.parentElement.closest(".card"))
                .map(card => ({ card, entry: cardAliases(card, state.tab) }));
            state.cardsDirty = false;
        }
        const [positive, negative] = promptValues(state);
        const mode = commentMode();
        const label = translated("Used in prompt");
        const aliases = promptAliases(positive, negative, mode);
        state.lastPositive = positive;
        state.lastNegative = negative;
        state.lastMode = mode;
        state.lastLabel = label;
        state.force = false;
        for (const { card, entry } of state.cards) {
            const active = entry.aliases.some(alias => aliases.has(alias));
            setClass(card, "modern-lora-active", active);
            if (!active) {
                if (entry.mark && entry.mark.parentNode === card) entry.mark.remove();
                continue;
            }
            if (!entry.mark) {
                const existing = [...card.querySelectorAll(":scope > svg.modern-lora-mark")];
                entry.mark = existing[0] || null;
                for (const duplicate of existing.slice(1)) duplicate.remove();
            }
            if (!entry.mark) {
                const mark = document.createElementNS(SVG_NS, "svg");
                mark.setAttribute("class", "modern-lora-mark");
                mark.setAttribute("viewBox", "0 0 24 24");
                mark.setAttribute("fill", "none");
                mark.setAttribute("stroke", "currentColor");
                mark.setAttribute("stroke-width", "2.5");
                mark.setAttribute("stroke-linecap", "round");
                mark.setAttribute("stroke-linejoin", "round");
                mark.setAttribute("aria-hidden", "true");
                mark.setAttribute("focusable", "false");
                const title = document.createElementNS(SVG_NS, "title");
                const path = document.createElementNS(SVG_NS, "path");
                path.setAttribute("d", "m5 12 4 4L19 6");
                mark.append(title, path);
                entry.mark = mark;
            }
            protect(entry.mark);
            const title = entry.mark.querySelector("title");
            if (title.textContent !== label) title.textContent = label;
            if (entry.mark.parentNode !== card) card.appendChild(entry.mark);
        }
    };
    const settle = () => {
        if (disposed) return;
        const mode = commentMode();
        const label = translated("Used in prompt");
        for (const state of states) {
            updateModules(state);
            const page = connectPage(state);
            if (!page) continue;
            const [positive, negative] = promptValues(state);
            if (state.force || state.cardsDirty || positive !== state.lastPositive || negative !== state.lastNegative || mode !== state.lastMode || label !== state.lastLabel) queuePrompts(state);
        }
    };
    const onInput = event => {
        if (disposed) return;
        const target = event.target;
        if (!target || target.nodeType !== 1) return;
        for (const state of states) {
            if (target.matches("textarea") && target.closest(`[id="${state.tab}_prompt"], [id="${state.tab}_neg_prompt"]`)) queuePrompts(state, true);
        }
        if (target.matches('input[type="checkbox"]')) queueModules();
    };
    const boot = () => {
        if (disposed) return;
        const root = appRoot();
        if (boundRoot !== root) {
            if (boundRoot) {
                boundRoot.removeEventListener("input", onInput, true);
                boundRoot.removeEventListener("change", onInput, true);
            }
            boundRoot = root;
            root.addEventListener("input", onInput, true);
            root.addEventListener("change", onInput, true);
        }
        settle();
    };

    const destroy = () => {
        if (disposed) return;
        disposed = true;
        if (promptTimer !== null) clearTimeout(promptTimer);
        if (moduleTimer !== null) clearTimeout(moduleTimer);
        promptTimer = null;
        moduleTimer = null;
        pending.clear();
        if (unsubscribe) unsubscribe();
        if (boundRoot) {
            boundRoot.removeEventListener("input", onInput, true);
            boundRoot.removeEventListener("change", onInput, true);
        }
        boundRoot = null;
        document.removeEventListener("DOMContentLoaded", boot);
        for (const state of states) {
            if (state.controlObserver) state.controlObserver.disconnect();
            if (state.pageObserver) state.pageObserver.disconnect();
            for (const { card, entry } of state.cards) {
                setClass(card, "modern-lora-active", false);
                if (entry.mark && entry.mark.parentNode === card) entry.mark.remove();
            }
            const roots = [state.hires, state.detailer, state.controlRoot, ...state.units.map(unit => unit.input.closest(".input-accordion"))];
            for (const root of roots) {
                if (!root) continue;
                setClass(root, "modern-module", false);
                setClass(root, "modern-module-active", false);
                setClass(root.querySelector(":scope > .label-wrap"), "modern-module-heading", false);
            }
            const tabs = byId(state.tab + "_controlnet_tabs");
            if (tabs) tabs.querySelectorAll(":scope > .tab-nav > button.modern-unit-active").forEach(button => setClass(button, "modern-unit-active", false));
            state.cards = [];
            state.units = [];
        }
        cardCache = new WeakMap();
        if (window[INSTANCE_KEY] === api) delete window[INSTANCE_KEY];
    };
    const api = { destroy };
    window[INSTANCE_KEY] = api;
    const i18n = window.sdModernUiI18n;
    if (i18n && typeof i18n.subscribe === "function") unsubscribe = i18n.subscribe(settle);
    else if (typeof window.addEventListener === "function") {
        window.addEventListener("sd-modern-ui-language-change", settle);
        unsubscribe = () => window.removeEventListener("sd-modern-ui-language-change", settle);
    }
    if (typeof onUiLoaded === "function") onUiLoaded(boot);
    else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
    if (typeof onAfterUiUpdate === "function") onAfterUiUpdate(settle);
    else if (typeof onUiUpdate === "function") onUiUpdate(settle);
    if (typeof onOptionsChanged === "function") onOptionsChanged(settle);
    if (typeof onOptionsAvailable === "function") onOptionsAvailable(settle);
})();
