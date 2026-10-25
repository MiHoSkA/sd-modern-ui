(() => {
    "use strict";

    const previous = window.sdModernUiTooltipTitles;
    if (previous && typeof previous.destroy === "function") previous.destroy();

    const tooltipId = `sd-modern-tooltip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    const dialogSelector = "[role='dialog'], [aria-modal='true'], dialog[open], .popup-dialog, .global-popup, #lightboxModal";
    const ownTitleWrites = new WeakMap();
    const titleLeases = new Map();
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
    let pointerPosition = null;
    let restoringFocus = null;
    let hoverSuppressed = null;
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

    const trackPointer = event => {
        if (event.pointerType === "touch" || event.type.startsWith("touch")) pointerPosition = null;
        else if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) pointerPosition = { x: event.clientX, y: event.clientY };
    };

    const pointerOverElement = element => {
        if (!pointerPosition || typeof document.elementFromPoint !== "function") return false;
        let target = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
        while (target && target.shadowRoot && typeof target.shadowRoot.elementFromPoint === "function") {
            const inner = target.shadowRoot.elementFromPoint(pointerPosition.x, pointerPosition.y);
            if (!inner || inner === target) break;
            target = inner;
        }
        return contains(element, target);
    };

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
        releaseTitles();
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

    const releaseTitles = (all = false) => {
        for (const [element, state] of titleLeases) {
            if (!all && enabled() && contains(root, element) && visible(element) && (state === active || element === pending || element === hovered || element === focused || element === hoverSuppressed)) continue;
            if (element.getAttribute("title") === "") writeTitle(element, state.title);
            restoreDescription(state);
            state.description = null;
            titleLeases.delete(element);
        }
    };

    const leaseTitle = element => {
        flushObserver();
        let state = titleLeases.get(element);
        if (!state) {
            const title = element.getAttribute("title");
            if (!meaningful(title)) return null;
            state = { element, title, description: null, visible: false };
            titleLeases.set(element, state);
        }
        writeTitle(element, "");
        return state;
    };

    const hide = (all = false) => {
        flushObserver();
        cancelShow();
        cancelHide();
        const state = active;
        active = null;
        dismissed = null;
        if (state) {
            restoreDescription(state);
            state.description = null;
            state.visible = false;
        }
        closePanel();
        if (all) hoverSuppressed = null;
        releaseTitles(all);
    };

    const hold = element => {
        cancelShow();
        cancelHide();
        if (!enabled() || !element || !contains(root, element)) {
            hide();
            return;
        }
        const state = leaseTitle(element);
        if (!state) {
            hide();
            return;
        }
        if (active !== state) {
            hide();
            titleLeases.set(element, state);
            active = state;
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
            hide(true);
            return;
        }
        const bounds = viewBounds();
        const anchor = active.element.getBoundingClientRect();
        if (anchor.bottom <= bounds.top || anchor.top >= bounds.bottom || anchor.right <= bounds.left || anchor.left >= bounds.right) {
            hide(true);
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
        return titleLeases.has(element) ? titleLeases.get(element).title : element.getAttribute("title");
    };

    const setTitle = (element, value) => {
        flushObserver();
        const title = String(value);
        const state = titleLeases.get(element);
        if (state) {
            state.title = title;
            if (!meaningful(title)) {
                if (active === state) hide();
                if (pending === element) cancelShow();
                titleLeases.delete(element);
                writeTitle(element, title);
                return;
            }
            if (active === state && active.visible) {
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
        const state = leaseTitle(element);
        if (!state) return;
        if (active && active.element === element) {
            panel.textContent = state.title;
            schedulePosition();
            return;
        }
        hide();
        titleLeases.set(element, state);
        active = state;
        active.visible = true;
        panel.textContent = state.title;
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
            if (active && active.element !== element) hide();
            if (!leaseTitle(element)) return;
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
        if (dismissed && dismissed !== hovered && dismissed !== focused && dismissed !== hoverSuppressed) {
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
        trackPointer(event);
        if (event.pointerType === "touch" || ownNode(event.target)) return;
        const element = findAnchor(event);
        if (!element) {
            const previousHovered = hovered;
            hovered = null;
            cancelShow();
            releaseDismissed();
            if (active && active.element === previousHovered) hide();
            else scheduleHide();
            releaseTitles();
            return;
        }
        if (hoverSuppressed && contains(hoverSuppressed, eventElement(event))) {
            hovered = hoverSuppressed;
            return;
        }
        releaseDismissed();
        hovered = element;
        scheduleShow(element);
    };

    const pointerOut = event => {
        if (hoverSuppressed && contains(hoverSuppressed, event.target) && !contains(hoverSuppressed, event.relatedTarget)) hoverSuppressed = null;
        if (pointerFocusScope && contains(pointerFocusScope, event.target) && !contains(pointerFocusScope, event.relatedTarget)) pointerFocusScope = null;
        if (!hovered || !contains(hovered, event.target) || contains(hovered, event.relatedTarget)) return;
        hovered = null;
        cancelShow();
        releaseDismissed();
        if (ownNode(event.relatedTarget)) cancelHide();
        else scheduleHide();
        releaseTitles();
    };

    const focusIn = event => {
        if (ownNode(event.target)) return;
        focusTarget = eventElement(event);
        if (restoringFocus && contains(restoringFocus, focusTarget)) {
            focused = null;
            return;
        }
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
        releaseTitles();
    };

    const restoreFocus = (element, options = { preventScroll: true }) => {
        if (!element || typeof element.focus !== "function") return;
        hide(true);
        focused = null;
        focusTarget = null;
        pointerFocusScope = null;
        hovered = null;
        const anchor = findAnchor({ target: element, composedPath: () => [element] }, true);
        if (enabled() && anchor && pointerOverElement(anchor)) {
            hovered = anchor;
            hold(anchor);
            hoverSuppressed = anchor;
        }
        const previousFocus = restoringFocus;
        restoringFocus = element;
        try { element.focus(options); } finally { restoringFocus = previousFocus; }
    };

    const pointerMove = event => {
        trackPointer(event);
        if (hoverSuppressed && !contains(hoverSuppressed, eventElement(event))) {
            hoverSuppressed = null;
            hovered = null;
            releaseDismissed();
            releaseTitles();
        }
    };

    const interact = event => {
        trackPointer(event);
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
        hide(true);
        hovered = null;
        focused = null;
        focusTarget = null;
        pointerFocusScope = null;
        pointerPosition = null;
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
            hoverSuppressed = null;
            hovered = hovered && pointerOverElement(hovered) ? hovered : null;
            focused = null;
            focusTarget = null;
            releaseTitles();
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
        const external = new Map();
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
                if ((!writes || !writes.length) && !titleLeases.has(record.target)) continue;
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
                const state = titleLeases.get(record.target);
                if (!state) continue;
                external.set(state, value);
                relevant = true;
            }
            if (!relevant) return;
            for (const [state, value] of external) {
                if (titleLeases.get(state.element) !== state) continue;
                state.title = value;
                if (!meaningful(value)) {
                    if (active === state) hide();
                    if (pending === state.element) cancelShow();
                    titleLeases.delete(state.element);
                    writeTitle(state.element, value);
                }
                else {
                    if (active === state && active.visible) {
                        panel.textContent = value;
                        addDescription(active);
                    }
                    writeTitle(state.element, "");
                    schedulePosition();
                }
            }
            if (!enabled()) {
                hide(true);
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
            releaseTitles();
        } finally {
            processing = false;
        }
    }

    const destroy = () => {
        flushObserver();
        hide(true);
        disposed = true;
        if (positionFrame) window.cancelAnimationFrame(positionFrame);
        positionFrame = 0;
        if (observer) observer.disconnect();
        while (removers.length) removers.pop()();
        if (panel) panel.remove();
        root = null;
        panel = null;
    };

    window.sdModernUiTooltipTitles = { get: getTitle, set: setTitle, restoreFocus, destroy };

    const bind = () => {
        if (disposed) return;
        const next = appRoot();
        const mount = next && next.nodeType === 9 ? next.body : next;
        if (!mount || !mount.appendChild) return;
        if (root === next && panel && contains(mount, panel)) return;
        flushObserver();
        hide(true);
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
        listen(document, "pointermove", pointerMove, { capture: true, passive: true });
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
        if (!enabled()) hide(true);
        else schedulePosition();
    };

    const optionsChanged = () => {
        if (disposed) return;
        flushObserver();
        hide(true);
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
