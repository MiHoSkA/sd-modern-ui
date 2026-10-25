(() => {
    "use strict";

    const OPTION_NAME = "sd_modern_ui_enabled";
    const CLASS_NAME = "sd-modern-ui";
    const root = document.documentElement;
    const progressObservers = new WeakMap();
    let bindScheduled = false;
    let localEnabled = null;
    let lastSavedEnabled;

    const appRoot = () => (typeof gradioApp === "function" ? gradioApp() : document);

    const savedEnabled = () => {
        try {
            const options = typeof opts !== "undefined" ? opts : window.opts;
            if (options && Object.prototype.hasOwnProperty.call(options, OPTION_NAME)) {
                return !!options[OPTION_NAME];
            }
        } catch (_err) {}
        return undefined;
    };

    const isEnabled = () => {
        const saved = savedEnabled();
        if (saved !== undefined) {
            if (localEnabled !== null && (saved === localEnabled || (lastSavedEnabled !== undefined && saved !== lastSavedEnabled))) {
                localEnabled = null;
            }
            lastSavedEnabled = saved;
            return localEnabled !== null ? localEnabled : saved;
        }
        if (localEnabled !== null) return localEnabled;
        if (typeof window.sdModernUiEnabled === "boolean") {
            return window.sdModernUiEnabled;
        }
        return true;
    };

    const apply = (enabled) => {
        root.classList.toggle(CLASS_NAME, enabled);
        root.dataset.reforgeModernUi = enabled ? "enabled" : "disabled";
        window.sdModernUiEnabled = enabled;
    };

    const enhanceProgress = (progressDiv) => {
        if (!(progressDiv instanceof Element)) return;

        const progress = progressDiv.querySelector(".progress");
        const existing = progressObservers.get(progressDiv);
        if (!progress) {
            if (existing) {
                existing.observer.disconnect();
                if (existing.rafId) cancelAnimationFrame(existing.rafId);
                progressObservers.delete(progressDiv);
            }
            const label = progressDiv.querySelector(":scope > .modern-progress-label");
            if (label) label.remove();
            return;
        }

        let label = progressDiv.querySelector(":scope > .modern-progress-label");
        if (!label) {
            label = document.createElement("div");
            label.className = "modern-progress-label";
            label.setAttribute("aria-hidden", "true");
            progressDiv.appendChild(label);
        }

        if (existing && existing.progress === progress && existing.label === label) {
            const text = (progress.textContent || "").trim();
            if (label.textContent !== text) label.textContent = text;
            return;
        }

        if (existing) {
            existing.observer.disconnect();
            if (existing.rafId) cancelAnimationFrame(existing.rafId);
            progressObservers.delete(progressDiv);
        }

        const entry = { progress, label, observer: null, rafId: 0 };

        const sync = () => {
            entry.rafId = 0;
            const text = (progress.textContent || "").trim();
            if (label.textContent !== text) label.textContent = text;
        };

        const scheduleSync = () => {
            if (entry.rafId) return;
            entry.rafId = requestAnimationFrame(sync);
        };

        entry.observer = new MutationObserver(scheduleSync);
        entry.observer.observe(progress, { childList: true, characterData: true, subtree: true });
        progressObservers.set(progressDiv, entry);
        progressDiv.dataset.modernProgressBound = "true";
        sync();
    };

    const disconnectProgress = (node) => {
        if (!(node instanceof Element)) return;
        const entry = progressObservers.get(node);
        if (entry) {
            entry.observer.disconnect();
            if (entry.rafId) cancelAnimationFrame(entry.rafId);
            progressObservers.delete(node);
        }
        if (node.querySelectorAll) {
            node.querySelectorAll(".progressDiv").forEach(disconnectProgress);
        }
    };

    const scanProgress = (scope) => {
        if (!scope || !scope.querySelectorAll) return;
        if (scope.classList && scope.classList.contains("progressDiv")) enhanceProgress(scope);
        scope.querySelectorAll(".progressDiv").forEach(enhanceProgress);
    };

    const bindEnableToggle = () => {
        const control = appRoot().querySelector(`#setting_${OPTION_NAME} input[type="checkbox"]`);
        if (!control || control.dataset.reforgeModernUiBound === "true") return;
        control.dataset.reforgeModernUiBound = "true";
        const syncFromControl = () => {
            const saved = savedEnabled();
            if (saved !== undefined) lastSavedEnabled = saved;
            localEnabled = saved === !!control.checked ? null : !!control.checked;
            apply(!!control.checked);
        };
        control.addEventListener("change", syncFromControl);
        control.addEventListener("input", syncFromControl);
    };

    const scheduleBindEnableToggle = () => {
        if (bindScheduled) return;
        bindScheduled = true;
        const raf = window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
        raf(() => {
            bindScheduled = false;
            bindEnableToggle();
        });
    };

    const onMutations = (mutations) => {
        if (!mutations) return;
        if (!Array.isArray(mutations)) mutations = [mutations];
        if (!mutations.length) return;

        const containers = new Set();
        for (const mutation of mutations) {
            if (!mutation || mutation.type !== "childList") continue;
            let structural = false;
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    structural = true;
                    scanProgress(node);
                }
            }
            for (const node of mutation.removedNodes) {
                if (node.nodeType === 1) {
                    structural = true;
                    disconnectProgress(node);
                }
            }
            if (structural && mutation.target instanceof Element) {
                const container = mutation.target.closest(".progressDiv");
                if (container) containers.add(container);
            }
        }
        const app = appRoot();
        for (const container of containers) {
            if (app.contains(container)) enhanceProgress(container);
        }
        scheduleBindEnableToggle();
    };

    const boot = () => {
        apply(isEnabled());
        bindEnableToggle();
        scanProgress(appRoot());
    };

    apply(isEnabled());

    if (typeof onUiLoaded === "function") onUiLoaded(boot);
    if (typeof onUiUpdate === "function") onUiUpdate(onMutations);
    if (typeof onOptionsChanged === "function") {
        onOptionsChanged(() => {
            apply(isEnabled());
            bindEnableToggle();
        });
    }

    if (typeof onUiLoaded !== "function") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", boot, { once: true });
        } else {
            boot();
        }
    }
})();
