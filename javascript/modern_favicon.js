(() => {
    "use strict";

    const INSTANCE_KEY = "sdModernUiFavicon";
    const ICON_URI = "data:image/png;base64,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";
    const root = document.documentElement;
    const originalIcons = new Map();
    let ownWrites = new WeakMap();
    let observing = false;
    let active = false;
    let ownIcon = null;
    let destroyed = false;
    let head = null;

    const previous = window[INSTANCE_KEY];
    if (previous && typeof previous.destroy === "function") previous.destroy();

    const isIcon = (node) => node instanceof HTMLLinkElement
        && node !== ownIcon && node.rel.toLowerCase().split(/\s+/).includes("icon");

    const setAttribute = (node, name, value) => {
        const current = node.getAttribute(name);
        if (current === value) return;
        if (observing && head && head.contains(node)) {
            let writes = ownWrites.get(node);
            if (!writes) { writes = []; ownWrites.set(node, writes); }
            writes.push({ name, from: current, to: value });
        }
        if (value === null) node.removeAttribute(name);
        else node.setAttribute(name, value);
    };

    const absorb = records => {
        for (let index = 0; index < records.length; index++) {
            const record = records[index];
            if (record.type !== "attributes" || !["href", "type"].includes(record.attributeName)) continue;
            const writes = ownWrites.get(record.target);
            const owned = writes ? writes.findIndex(write => write.name === record.attributeName) : -1;
            let value = record.target.getAttribute(record.attributeName);
            for (let next = index + 1; next < records.length; next++) {
                if (records[next].target === record.target && records[next].type === "attributes" && records[next].attributeName === record.attributeName) { value = records[next].oldValue; break; }
            }
            if (owned >= 0 && writes[owned].from === record.oldValue && writes[owned].to === value) { writes.splice(owned, 1); continue; }
            const original = originalIcons.get(record.target);
            if (original) original[record.attributeName] = value;
        }
    };

    const lease = (node) => {
        let original = originalIcons.get(node);
        if (!original) {
            original = { href: node.getAttribute("href"), type: node.getAttribute("type") };
            originalIcons.set(node, original);
        } else {
            if (node.getAttribute("href") !== ICON_URI) original.href = node.getAttribute("href");
            if (node.getAttribute("type") !== "image/png") original.type = node.getAttribute("type");
        }
        setAttribute(node, "href", ICON_URI);
        setAttribute(node, "type", "image/png");
    };

    const release = (node, original) => {
        if (node.getAttribute("href") === ICON_URI) setAttribute(node, "href", original.href);
        if (node.getAttribute("type") === "image/png") setAttribute(node, "type", original.type);
    };

    const refresh = () => {
        if (!active || destroyed || !head) return;
        if (observing) absorb(headObserver.takeRecords());
        for (const [node, original] of originalIcons) {
            if (!node.isConnected || !isIcon(node)) {
                release(node, original);
                originalIcons.delete(node);
            }
        }
        head.querySelectorAll("link[rel]").forEach((node) => { if (isIcon(node)) lease(node); });
        if (!ownIcon) {
            ownIcon = document.createElement("link");
            ownIcon.rel = "icon";
            ownIcon.type = "image/png";
            ownIcon.sizes = "64x64";
            ownIcon.href = ICON_URI;
            ownIcon.dataset.sdModernUiFavicon = "true";
        }
        if (ownIcon.parentNode !== head || ownIcon !== head.lastElementChild) head.appendChild(ownIcon);
    };

    const headObserver = new MutationObserver(records => { absorb(records); refresh(); });

    const deactivate = () => {
        if (observing) absorb(headObserver.takeRecords());
        headObserver.disconnect();
        observing = false;
        active = false;
        if (ownIcon) ownIcon.remove();
        for (const [node, original] of originalIcons) release(node, original);
        originalIcons.clear();
        ownWrites = new WeakMap();
    };

    const sync = () => {
        if (destroyed) return;
        const enabled = root.classList.contains("sd-modern-ui");
        if (!enabled) {
            if (active) {
                refresh();
                deactivate();
            }
            return;
        }
        if (active) return;
        head = document.head;
        if (!head) return;
        if (![...head.querySelectorAll("link[rel]")].some(isIcon)) {
            const fallback = document.createElement("link");
            fallback.rel = "icon";
            fallback.setAttribute("href", "/favicon.ico");
            fallback.dataset.sdModernUiFaviconFallback = "true";
            head.appendChild(fallback);
        }
        active = true;
        refresh();
        headObserver.observe(head, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["href", "rel", "type"] });
        observing = true;
    };

    const rootObserver = new MutationObserver(sync);
    rootObserver.observe(root, { attributes: true, attributeFilter: ["class"] });
    const destroy = () => {
        if (destroyed) return;
        refresh();
        deactivate();
        destroyed = true;
        rootObserver.disconnect();
        document.removeEventListener("DOMContentLoaded", sync);
        if (window[INSTANCE_KEY] === api) delete window[INSTANCE_KEY];
    };
    const api = { destroy };
    window[INSTANCE_KEY] = api;
    document.addEventListener("DOMContentLoaded", sync, { once: true });
    sync();
})();
