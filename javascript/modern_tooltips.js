(() => {
    "use strict";

    const previous = window.sdModernUiTooltipTitles;
    if (previous && typeof previous.destroy === "function") previous.destroy();

    const tooltipId = `sd-modern-tooltip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    const dialogSelector = "[role='dialog'], [aria-modal='true'], dialog[open], .popup-dialog, .global-popup, #lightboxModal";
    const ownTitleWrites = new WeakMap();
    const removers = [];
    let root = null;
    let panel = null;
    let observer = null;
    let active = null;
    let pending = null;
    let hovered = null;
    let focused = null;
    let focusTarget = null;
    let pointerFocusScope = null;
    let dismissed = null;
    let panelHovered = false;
    let showTimer = 0;
    let hideTimer = 0;
    let positionFrame = 0;
    let processing = false;
    let disposed = false;

    const appRoot = () => (typeof gradioApp === "function" ? gradioApp() : document);
    const enabled = () => !disposed && document.documentElement.classList.contains("sd-modern-ui");
    const meaningful = value => typeof value === "string" && value.trim().length > 0;
    const contains = (parent, node) => !!parent && !!node && (parent === node || parent.contains(node));
    const ownNode = node => !!panel && contains(panel, node);

    const eventElement = event => {
        const path = typeof event.composedPath === "function" ? event.composedPath() : [event.target];
        return path.find(node => node && node.nodeType === 1) || null;
    };

    const visible = element => {
        if (!element || !element.getClientRects().length || element.closest("[hidden], [aria-hidden='true']")) return false;
        if (typeof window.getComputedStyle !== "function") return true;
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && style.visibility !== "collapse";
    };

    const popupBlocked = (element, origin = element) => {
        if (!root || !root.querySelectorAll) return false;
        if (origin && origin.closest("[role='option'], [role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio'], .gradio-dropdown ul.options")) return true;
        for (const popup of root.querySelectorAll("[role='listbox'], [role='menu'], .gradio-dropdown ul.options, .gradio-dropdown .wrap-inner.showOptions, .gradio-dropdown .wrap-inner.show_options")) {
            if (!popup.matches("input, textarea, select") && visible(popup)) return true;
        }
        for (const control of root.querySelectorAll("[aria-expanded='true']")) {
            const role = control.getAttribute("role");
            const hasPopup = control.getAttribute("aria-haspopup");
            if ((role === "combobox" || role === "listbox" || (hasPopup && hasPopup !== "false")) && visible(control)) return true;
        }
        for (const dialog of root.querySelectorAll(dialogSelector)) {
            if (visible(dialog) && (!contains(dialog, element) || contains(element, dialog))) return true;
        }
        const dropdown = element.closest(".gradio-dropdown");
        return !!dropdown && !!focusTarget && contains(dropdown, focusTarget) && focusTarget.matches("input, textarea, select, [contenteditable='true'], [contenteditable='']");
    };

    const writeTitle = (element, value) => {
        const current = element.getAttribute("title");
        if (current === value) return;
        if (observer && contains(root, element)) {
            let writes = ownTitleWrites.get(element);
            if (!writes) {
                writes = [];
                ownTitleWrites.set(element, writes);
            }
            writes.push({ from: current, to: value });
        }
        if (value === null) element.removeAttribute("title");
        else element.setAttribute("title", value);
    };

    const cancelShow = () => {
        if (showTimer) clearTimeout(showTimer);
        showTimer = 0;
        pending = null;
    };

    const cancelHide = () => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = 0;
    };

    const restoreDescription = state => {
        if (!state.description) return;
        const element = state.description.element;
        const current = element.getAttribute("aria-describedby");
        if (current === state.description.applied) {
            if (state.description.original === null) element.removeAttribute("aria-describedby");
            else element.setAttribute("aria-describedby", state.description.original);
            return;
        }
        if (current && current.split(/\s+/).includes(tooltipId)) {
            const remaining = current.split(/\s+/).filter(value => value && value !== tooltipId);
            if (remaining.length) element.setAttribute("aria-describedby", remaining.join(" "));
            else element.removeAttribute("aria-describedby");
        }
    };

    const closePanel = () => {
        panelHovered = false;
        if (panel) {
            panel.classList.remove("modern-tooltip-visible");
            panel.setAttribute("aria-hidden", "true");
            panel.hidden = true;
            panel.textContent = "";
        }
    };

    const hide = () => {
        flushObserver();
        cancelShow();
        cancelHide();
        const state = active;
        active = null;
        dismissed = null;
        if (state) {
            if (state.element.getAttribute("title") === "") writeTitle(state.element, state.title);
            restoreDescription(state);
        }
        closePanel();
    };

    const hold = element => {
        cancelShow();
        cancelHide();
        if (!enabled() || !element || !contains(root, element)) {
            hide();
            return;
        }
        const title = getTitle(element);
        if (!meaningful(title)) {
            hide();
            return;
        }
        if (!active || active.element !== element) {
            hide();
            active = { element, title, description: null, visible: false };
        }
        active.visible = false;
        restoreDescription(active);
        active.description = null;
        dismissed = element;
        writeTitle(element, "");
        closePanel();
    };

    const viewBounds = () => {
        const view = window.visualViewport;
        const left = view ? view.offsetLeft : 0;
        const top = view ? view.offsetTop : 0;
        return {
            left,
            top,
            right: left + (view ? view.width : window.innerWidth),
            bottom: top + (view ? view.height : window.innerHeight)
        };
    };

    const position = () => {
        positionFrame = 0;
        if (!active || !panel) return;
        if (!enabled() || !contains(root, active.element) || !visible(active.element)) {
            hide();
            return;
        }
        const bounds = viewBounds();
        const anchor = active.element.getBoundingClientRect();
        if (anchor.bottom <= bounds.top || anchor.top >= bounds.bottom || anchor.right <= bounds.left || anchor.left >= bounds.right) {
            hide();
            return;
        }
        if (popupBlocked(active.element, focusTarget || hovered || active.element)) {
            if (active.visible) hold(active.element);
            return;
        }
        if (!active.visible) return;
        const margin = 12;
        const gap = 8;
        panel.style.maxWidth = `${Math.max(0, Math.min(480, bounds.right - bounds.left - margin * 2))}px`;
        panel.style.maxHeight = `${Math.max(0, bounds.bottom - bounds.top - margin * 2)}px`;
        const box = panel.getBoundingClientRect();
        const minLeft = bounds.left + margin;
        const maxLeft = Math.max(minLeft, bounds.right - margin - box.width);
        const left = Math.max(minLeft, Math.min(maxLeft, anchor.left + (anchor.width - box.width) / 2));
        const below = bounds.bottom - margin - anchor.bottom - gap;
        const above = anchor.top - bounds.top - margin - gap;
        let top = below >= box.height || below >= above ? anchor.bottom + gap : anchor.top - gap - box.height;
        top = Math.max(bounds.top + margin, Math.min(bounds.bottom - margin - box.height, top));
        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
    };

    const schedulePosition = () => {
        if (!active || positionFrame || disposed) return;
        positionFrame = window.requestAnimationFrame(position);
    };

    const flushObserver = () => {
        if (!observer || processing) return;
        const records = observer.takeRecords();
        if (records.length) processRecords(records);
    };

    const getTitle = element => {
        flushObserver();
        return active && active.element === element ? active.title : element.getAttribute("title");
    };

    const setTitle = (element, value) => {
        flushObserver();
        const title = String(value);
        if (active && active.element === element) {
            active.title = title;
            if (!meaningful(title)) {
                hide();
                return;
            }
            if (active.visible) {
                panel.textContent = title;
                addDescription(active);
            }
            writeTitle(element, "");
            schedulePosition();
        } else {
            writeTitle(element, title);
        }
    };

    const addDescription = state => {
        restoreDescription(state);
        state.description = null;
        const element = focusTarget && contains(state.element, focusTarget) ? focusTarget : state.element;
        if (element.getAttribute("aria-label") === state.title) return;
        const original = element.getAttribute("aria-describedby");
        const tokens = original ? original.split(/\s+/).filter(Boolean) : [];
        if (tokens.includes(tooltipId)) return;
        const applied = [...tokens, tooltipId].join(" ");
        state.description = { element, original, applied };
        element.setAttribute("aria-describedby", applied);
    };

    const show = element => {
        cancelShow();
        cancelHide();
        if (!enabled() || element === dismissed || !contains(root, element) || !visible(element) || popupBlocked(element)) return;
        const title = getTitle(element);
        if (!meaningful(title)) return;
        if (active && active.element === element) {
            panel.textContent = title;
            schedulePosition();
            return;
        }
        hide();
        active = { element, title, description: null, visible: true };
        panel.textContent = title;
        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        panel.classList.add("modern-tooltip-visible");
        addDescription(active);
        writeTitle(element, "");
        position();
    };

    const scheduleShow = (element, immediate = false) => {
        cancelHide();
        if (!enabled() || element === dismissed || popupBlocked(element)) return;
        if (active && active.element === element) {
            if (active.visible) addDescription(active);
            return;
        }
        if (pending === element && !immediate) return;
        cancelShow();
        if (immediate) show(element);
        else {
            pending = element;
            showTimer = setTimeout(() => show(element), 350);
        }
    };

    const scheduleHide = () => {
        cancelHide();
        if (!active || panelHovered || active.element === hovered || active.element === focused) return;
        hideTimer = setTimeout(() => {
            hideTimer = 0;
            if (!panelHovered && active && active.element !== hovered && active.element !== focused) hide();
        }, 180);
    };

    const releaseDismissed = () => {
        if (dismissed && dismissed !== hovered && dismissed !== focused) {
            if (active && active.element === dismissed && !active.visible) hide();
            dismissed = null;
        }
    };

    const findAnchor = (event, allowBlocked = false) => {
        const path = typeof event.composedPath === "function" ? event.composedPath() : [event.target];
        for (const node of path) {
            if (node === root) break;
            if (!node || node.nodeType !== 1 || ownNode(node)) continue;
            const element = node.closest("[title]");
            if (!element || !contains(root, element) || ownNode(element)) continue;
            if (element.matches("script, style, meta, link, title, head, [hidden], input[type='hidden']")) continue;
            if (!meaningful(getTitle(element))) {
                if (element.matches("input") && element.getAttribute("title") === "" && element.closest(".gradio-dropdown")) continue;
                return null;
            }
            return allowBlocked || !popupBlocked(element, eventElement(event)) ? element : null;
        }
        return null;
    };

    const pointerOver = event => {
        if (event.pointerType === "touch" || ownNode(event.target)) return;
        const element = findAnchor(event);
        if (!element) return;
        releaseDismissed();
        hovered = element;
        scheduleShow(element);
    };

    const pointerOut = event => {
        if (pointerFocusScope && contains(pointerFocusScope, event.target) && !contains(pointerFocusScope, event.relatedTarget)) pointerFocusScope = null;
        if (!hovered || !contains(hovered, event.target) || contains(hovered, event.relatedTarget)) return;
        hovered = null;
        cancelShow();
        releaseDismissed();
        if (ownNode(event.relatedTarget)) cancelHide();
        else scheduleHide();
    };

    const focusIn = event => {
        if (ownNode(event.target)) return;
        focusTarget = eventElement(event);
        const fromPointer = pointerFocusScope && (contains(pointerFocusScope, focusTarget) || contains(focusTarget, pointerFocusScope));
        pointerFocusScope = null;
        const element = findAnchor(event, true);
        if (!element) return;
        releaseDismissed();
        focused = element;
        if (fromPointer || popupBlocked(element, focusTarget)) hold(element);
        else scheduleShow(element, true);
    };

    const focusOut = event => {
        if (focusTarget && contains(focusTarget, event.target)) {
            focusTarget = null;
            if (active && active.visible) addDescription(active);
        }
        if (!focused || !contains(focused, event.target) || contains(focused, event.relatedTarget)) return;
        focused = null;
        releaseDismissed();
        scheduleHide();
    };

    const interact = event => {
        const origin = eventElement(event);
        if (ownNode(origin)) return;
        if (event.type === "pointerdown" || event.type === "touchstart") {
            pointerFocusScope = origin && (origin.closest(".gradio-dropdown") || origin.closest("button, input, textarea, select, label, [contenteditable='true'], [role='button']") || origin);
        }
        const anchor = findAnchor(event, true);
        const current = active && contains(active.element, origin) ? active.element : null;
        const element = anchor || current;
        const engaged = element && (element === hovered || element === focused || element === pending || (active && active.element === element) || contains(element, pointerFocusScope));
        if (engaged) hold(element);
        else hide();
    };

    const moving = event => {
        if (ownNode(eventElement(event))) return;
        if (active) hold(active.element);
        else if (pending) hold(pending);
    };

    const leaveWindow = () => {
        hide();
        hovered = null;
        focused = null;
        focusTarget = null;
        pointerFocusScope = null;
    };

    const keyDown = event => {
        if (ownNode(eventElement(event))) return;
        if ((event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === "c") {
            const selection = root && typeof root.getSelection === "function"
                ? root.getSelection()
                : typeof window.getSelection === "function" ? window.getSelection() : null;
            if (selection && !selection.isCollapsed && ownNode(selection.anchorNode) && ownNode(selection.focusNode)) return;
        }
        if (event.key === "Tab") {
            pointerFocusScope = null;
            hide();
            hovered = null;
            focused = null;
            focusTarget = null;
            return;
        }
        if (event.key !== "Escape") {
            if (!["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(event.key)) interact(event);
            return;
        }
        const nativeDialog = root && root.querySelectorAll && [...root.querySelectorAll(dialogSelector)].some(visible);
        if (nativeDialog || (active && popupBlocked(active.element, eventElement(event)))) {
            if (active) hold(active.element);
            else if (pending) hold(pending);
            return;
        }
        if (!active || !active.visible) {
            if (pending) {
                dismissed = pending;
                cancelShow();
            }
            return;
        }
        event.stopPropagation();
        hold(active.element);
    };

    const listen = (target, name, callback, options) => {
        target.addEventListener(name, callback, options);
        removers.push(() => target.removeEventListener(name, callback, options));
    };

    function processRecords(records) {
        if (disposed || processing) return;
        processing = true;
        let external = null;
        let relevant = false;
        try {
            for (let index = 0; index < records.length; index++) {
                const record = records[index];
                if (ownNode(record.target)) continue;
                if (record.type !== "attributes" || record.attributeName !== "title") {
                    relevant = true;
                    continue;
                }
                const writes = ownTitleWrites.get(record.target);
                if ((!writes || !writes.length) && (!active || record.target !== active.element)) continue;
                let value = record.target.getAttribute("title");
                for (let next = index + 1; next < records.length; next++) {
                    if (records[next].type === "attributes" && records[next].attributeName === "title" && records[next].target === record.target) {
                        value = records[next].oldValue;
                        break;
                    }
                }
                if (writes && writes.length && writes[0].from === record.oldValue && writes[0].to === value) {
                    writes.shift();
                    continue;
                }
                if (!active || record.target !== active.element) continue;
                external = { state: active, value };
                relevant = true;
            }
            if (!relevant) return;
            if (external && active === external.state) {
                active.title = external.value;
                if (!meaningful(external.value)) hide();
                else {
                    if (active.visible) {
                        panel.textContent = external.value;
                        addDescription(active);
                    }
                    writeTitle(active.element, "");
                    schedulePosition();
                }
            }
            if (!enabled()) {
                hide();
                hovered = null;
                focused = null;
                focusTarget = null;
                pointerFocusScope = null;
                dismissed = null;
            } else if (active) {
                if (!contains(root, active.element) || !visible(active.element)) hide();
                else if (popupBlocked(active.element, focusTarget || hovered || active.element)) hold(active.element);
                else schedulePosition();
            } else if (pending && popupBlocked(pending)) {
                hold(pending);
            }
        } finally {
            processing = false;
        }
    }

    const destroy = () => {
        flushObserver();
        hide();
        disposed = true;
        if (positionFrame) window.cancelAnimationFrame(positionFrame);
        positionFrame = 0;
        if (observer) observer.disconnect();
        while (removers.length) removers.pop()();
        if (panel) panel.remove();
        root = null;
        panel = null;
    };

    window.sdModernUiTooltipTitles = { get: getTitle, set: setTitle, destroy };

    const bind = () => {
        if (disposed) return;
        const next = appRoot();
        const mount = next && next.nodeType === 9 ? next.body : next;
        if (!mount || !mount.appendChild) return;
        if (root === next && panel && contains(mount, panel)) return;
        flushObserver();
        hide();
        if (observer) observer.disconnect();
        while (removers.length) removers.pop()();
        if (panel) panel.remove();
        root = next;
        panel = document.createElement("div");
        panel.id = tooltipId;
        panel.className = "modern-tooltip";
        panel.setAttribute("role", "tooltip");
        panel.setAttribute("aria-hidden", "true");
        panel.hidden = true;
        mount.appendChild(panel);
        listen(root, "pointerover", pointerOver);
        listen(root, "pointerout", pointerOut);
        listen(root, "focusin", focusIn);
        listen(root, "focusout", focusOut);
        listen(document, "keydown", keyDown, true);
        listen(document, "pointerdown", interact, { capture: true, passive: true });
        listen(document, "click", interact, true);
        listen(document, "touchstart", interact, { capture: true, passive: true });
        for (const name of ["beforeinput", "input", "change", "compositionstart"]) listen(root, name, interact, true);
        for (const name of ["wheel", "touchmove", "dragstart"]) listen(document, name, moving, { capture: true, passive: true });
        listen(document, "pointerout", event => {
            if (event.relatedTarget === null) leaveWindow();
        });
        listen(window, "blur", leaveWindow);
        listen(panel, "pointerenter", () => {
            panelHovered = true;
            cancelHide();
        });
        listen(panel, "pointerleave", () => {
            panelHovered = false;
            scheduleHide();
        });
        listen(root, "scroll", schedulePosition, { capture: true, passive: true });
        listen(window, "scroll", schedulePosition, { capture: true, passive: true });
        listen(window, "resize", schedulePosition, { passive: true });
        if (window.visualViewport) {
            listen(window.visualViewport, "resize", schedulePosition, { passive: true });
            listen(window.visualViewport, "scroll", schedulePosition, { passive: true });
        }
        if (!observer) observer = new MutationObserver(processRecords);
        observer.observe(root, { attributes: true, attributeFilter: ["title", "class", "style", "hidden", "aria-hidden", "aria-expanded", "open"], attributeOldValue: true, childList: true, subtree: true });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    };

    const update = () => {
        if (disposed) return;
        bind();
        if (!enabled()) hide();
        else schedulePosition();
    };

    const optionsChanged = () => {
        if (disposed) return;
        flushObserver();
        hide();
        hovered = null;
        focused = null;
        focusTarget = null;
        pointerFocusScope = null;
        dismissed = null;
        bind();
    };

    if (typeof onUiLoaded === "function") onUiLoaded(bind);
    if (typeof onUiUpdate === "function") onUiUpdate(update);
    if (typeof onOptionsChanged === "function") onOptionsChanged(optionsChanged);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
    else bind();
})();
