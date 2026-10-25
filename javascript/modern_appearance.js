(() => {
    "use strict";

    const previous = window.sdModernUiAppearance;
    if (previous && typeof previous.destroy === "function") previous.destroy();

    const SCHEMA = "sd-modern-ui-theme";
    const MAX_SOURCE = 8 * 1024 * 1024;
    const MAX_JSON = 3 * 1024 * 1024;
    const MAX_STORED_IMAGE = 1.5 * 1024 * 1024;
    const MAX_PIXELS = 32000000;
    const COLOR_MANIFEST = {
        "groups": [
            {
                "key": "base",
                "label": "Base and neutral palette"
            },
            {
                "key": "panels",
                "label": "Panels and navigation"
            },
            {
                "key": "text",
                "label": "Text and links"
            },
            {
                "key": "controls",
                "label": "Controls and buttons"
            },
            {
                "key": "accent",
                "label": "Accent palette"
            },
            {
                "key": "details",
                "label": "Borders, shadows and details"
            },
            {
                "key": "notifications",
                "label": "Notifications and errors"
            },
            {
                "key": "editor",
                "label": "Appearance editor"
            }
        ],
        "roles": [
            {
                "key": "canvas",
                "group": "base",
                "label": "Page background",
                "defaultHex": "#0b1020",
                "cssVar": "--modern-user-color-canvas",
                "rgbVar": "--modern-user-color-canvas-rgb"
            },
            {
                "key": "neutral-100",
                "group": "base",
                "label": "Neutral 100",
                "defaultHex": "#121a2d",
                "cssVar": "--modern-user-color-neutral-100",
                "rgbVar": "--modern-user-color-neutral-100-rgb"
            },
            {
                "key": "neutral-200",
                "group": "base",
                "label": "Neutral 200",
                "defaultHex": "#18233a",
                "cssVar": "--modern-user-color-neutral-200",
                "rgbVar": "--modern-user-color-neutral-200-rgb"
            },
            {
                "key": "neutral-300",
                "group": "base",
                "label": "Neutral 300",
                "defaultHex": "#253551",
                "cssVar": "--modern-user-color-neutral-300",
                "rgbVar": "--modern-user-color-neutral-300-rgb"
            },
            {
                "key": "neutral-400",
                "group": "base",
                "label": "Neutral 400",
                "defaultHex": "#64748b",
                "cssVar": "--modern-user-color-neutral-400",
                "rgbVar": "--modern-user-color-neutral-400-rgb"
            },
            {
                "key": "neutral-50",
                "group": "base",
                "label": "Neutral 50",
                "defaultHex": "#0e1628",
                "cssVar": "--modern-user-color-neutral-50",
                "rgbVar": "--modern-user-color-neutral-50-rgb"
            },
            {
                "key": "neutral-500",
                "group": "base",
                "label": "Neutral 500",
                "defaultHex": "#94a3b8",
                "cssVar": "--modern-user-color-neutral-500",
                "rgbVar": "--modern-user-color-neutral-500-rgb"
            },
            {
                "key": "neutral-600",
                "group": "base",
                "label": "Neutral 600",
                "defaultHex": "#b4c1d6",
                "cssVar": "--modern-user-color-neutral-600",
                "rgbVar": "--modern-user-color-neutral-600-rgb"
            },
            {
                "key": "neutral-700",
                "group": "base",
                "label": "Neutral 700",
                "defaultHex": "#d0d9e9",
                "cssVar": "--modern-user-color-neutral-700",
                "rgbVar": "--modern-user-color-neutral-700-rgb"
            },
            {
                "key": "neutral-800",
                "group": "base",
                "label": "Neutral 800",
                "defaultHex": "#e4eaf5",
                "cssVar": "--modern-user-color-neutral-800",
                "rgbVar": "--modern-user-color-neutral-800-rgb"
            },
            {
                "key": "neutral-900",
                "group": "base",
                "label": "Neutral 900",
                "defaultHex": "#f8fafc",
                "cssVar": "--modern-user-color-neutral-900",
                "rgbVar": "--modern-user-color-neutral-900-rgb"
            },
            {
                "key": "neutral-950",
                "group": "base",
                "label": "Neutral 950",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-neutral-950",
                "rgbVar": "--modern-user-color-neutral-950-rgb"
            },
            {
                "key": "wallpaper-base",
                "group": "base",
                "label": "Wallpaper base background",
                "defaultHex": "#0b1020",
                "cssVar": "--modern-user-color-wallpaper-base",
                "rgbVar": "--modern-user-color-wallpaper-base-rgb"
            },
            {
                "key": "wallpaper-shade",
                "group": "base",
                "label": "Wallpaper dimming color",
                "defaultHex": "#020617",
                "cssVar": "--modern-user-color-wallpaper-shade",
                "rgbVar": "--modern-user-color-wallpaper-shade-rgb"
            },
            {
                "key": "model-card",
                "group": "panels",
                "label": "Model card",
                "defaultHex": "#121a2d",
                "cssVar": "--modern-user-color-model-card",
                "rgbVar": "--modern-user-color-model-card-rgb"
            },
            {
                "key": "model-pane",
                "group": "panels",
                "label": "Model browser",
                "defaultHex": "#121a2d",
                "cssVar": "--modern-user-color-model-pane",
                "rgbVar": "--modern-user-color-model-pane-rgb"
            },
            {
                "key": "panel",
                "group": "panels",
                "label": "Primary panel",
                "defaultHex": "#121a2d",
                "cssVar": "--modern-user-color-panel",
                "rgbVar": "--modern-user-color-panel-rgb"
            },
            {
                "key": "panel-hover",
                "group": "panels",
                "label": "Panel hover",
                "defaultHex": "#202e49",
                "cssVar": "--modern-user-color-panel-hover",
                "rgbVar": "--modern-user-color-panel-hover-rgb"
            },
            {
                "key": "panel-raised",
                "group": "panels",
                "label": "Raised panel",
                "defaultHex": "#18233a",
                "cssVar": "--modern-user-color-panel-raised",
                "rgbVar": "--modern-user-color-panel-raised-rgb"
            },
            {
                "key": "settings-tab-hover",
                "group": "panels",
                "label": "Settings tab hover background",
                "defaultHex": "#818cf8",
                "cssVar": "--modern-user-color-settings-tab-hover",
                "rgbVar": "--modern-user-color-settings-tab-hover-rgb",
                "autoFrom": "accent-400"
            },
            {
                "key": "settings-tab-hover-border",
                "group": "panels",
                "label": "Settings tab hover border",
                "defaultHex": "#818cf8",
                "cssVar": "--modern-user-color-settings-tab-hover-border",
                "rgbVar": "--modern-user-color-settings-tab-hover-border-rgb",
                "autoFrom": "accent-400"
            },
            {
                "key": "tab-active-border",
                "group": "panels",
                "label": "Active tab outline",
                "defaultHex": "#a5b4fc",
                "cssVar": "--modern-user-color-tab-active-border",
                "rgbVar": "--modern-user-color-tab-active-border-rgb",
                "autoFrom": "accent-300"
            },
            {
                "key": "tab-active-end",
                "group": "panels",
                "label": "Active tab gradient end",
                "defaultHex": "#8b5cf6",
                "cssVar": "--modern-user-color-tab-active-end",
                "rgbVar": "--modern-user-color-tab-active-end-rgb",
                "autoFrom": "accent-violet"
            },
            {
                "key": "tab-active-start",
                "group": "panels",
                "label": "Active tab gradient start",
                "defaultHex": "#6366f1",
                "cssVar": "--modern-user-color-tab-active-start",
                "rgbVar": "--modern-user-color-tab-active-start-rgb",
                "autoFrom": "accent-500"
            },
            {
                "key": "tab-border",
                "group": "panels",
                "label": "Tab navigation border",
                "defaultHex": "#94a3b8",
                "cssVar": "--modern-user-color-tab-border",
                "rgbVar": "--modern-user-color-tab-border-rgb",
                "autoFrom": "border"
            },
            {
                "key": "tab-hover",
                "group": "panels",
                "label": "Tab hover background",
                "defaultHex": "#202e49",
                "cssVar": "--modern-user-color-tab-hover",
                "rgbVar": "--modern-user-color-tab-hover-rgb",
                "autoFrom": "panel-hover"
            },
            {
                "key": "tab-surface",
                "group": "panels",
                "label": "Tab navigation background",
                "defaultHex": "#121a2d",
                "cssVar": "--modern-user-color-tab-surface",
                "rgbVar": "--modern-user-color-tab-surface-rgb",
                "autoFrom": "panel"
            },
            {
                "key": "link",
                "group": "text",
                "label": "Link text",
                "defaultHex": "#a5b4fc",
                "cssVar": "--modern-user-color-link",
                "rgbVar": "--modern-user-color-link-rgb",
                "autoFrom": "accent-300"
            },
            {
                "key": "link-hover",
                "group": "text",
                "label": "Link hover",
                "defaultHex": "#c4b5fd",
                "cssVar": "--modern-user-color-link-hover",
                "rgbVar": "--modern-user-color-link-hover-rgb",
                "autoFrom": "accent-violet-pale"
            },
            {
                "key": "placeholder",
                "group": "text",
                "label": "Text input placeholder",
                "defaultHex": "#6f7e99",
                "cssVar": "--modern-user-color-placeholder",
                "rgbVar": "--modern-user-color-placeholder-rgb"
            },
            {
                "key": "placeholder-native",
                "group": "text",
                "label": "Native input placeholder",
                "defaultHex": "#687795",
                "cssVar": "--modern-user-color-placeholder-native",
                "rgbVar": "--modern-user-color-placeholder-native-rgb"
            },
            {
                "key": "tab-active-text",
                "group": "text",
                "label": "Active tab text",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-tab-active-text",
                "rgbVar": "--modern-user-color-tab-active-text-rgb",
                "autoFrom": "text-bright"
            },
            {
                "key": "tab-hover-text",
                "group": "text",
                "label": "Tab hover text",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-tab-hover-text",
                "rgbVar": "--modern-user-color-tab-hover-text-rgb",
                "autoFrom": "text"
            },
            {
                "key": "tab-text",
                "group": "text",
                "label": "Inactive tab text",
                "defaultHex": "#9eacc8",
                "cssVar": "--modern-user-color-tab-text",
                "rgbVar": "--modern-user-color-tab-text-rgb",
                "autoFrom": "text-muted"
            },
            {
                "key": "text",
                "group": "text",
                "label": "Primary text",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-text",
                "rgbVar": "--modern-user-color-text-rgb"
            },
            {
                "key": "text-bright",
                "group": "text",
                "label": "Bright text",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-text-bright",
                "rgbVar": "--modern-user-color-text-bright-rgb"
            },
            {
                "key": "text-muted",
                "group": "text",
                "label": "Secondary text",
                "defaultHex": "#9eacc8",
                "cssVar": "--modern-user-color-text-muted",
                "rgbVar": "--modern-user-color-text-muted-rgb"
            },
            {
                "key": "text-strong",
                "group": "text",
                "label": "Strong text",
                "defaultHex": "#f8fafc",
                "cssVar": "--modern-user-color-text-strong",
                "rgbVar": "--modern-user-color-text-strong-rgb"
            },
            {
                "key": "button-border",
                "group": "controls",
                "label": "Button border",
                "defaultHex": "#94a3b8",
                "cssVar": "--modern-user-color-button-border",
                "rgbVar": "--modern-user-color-button-border-rgb",
                "autoFrom": "border"
            },
            {
                "key": "button-hover-border",
                "group": "controls",
                "label": "Button hover border",
                "defaultHex": "#a5b4fc",
                "cssVar": "--modern-user-color-button-hover-border",
                "rgbVar": "--modern-user-color-button-hover-border-rgb",
                "autoFrom": "accent-300"
            },
            {
                "key": "checkbox",
                "group": "controls",
                "label": "Unchecked checkbox and radio",
                "defaultHex": "#0b1324",
                "cssVar": "--modern-user-color-checkbox",
                "rgbVar": "--modern-user-color-checkbox-rgb"
            },
            {
                "key": "checkbox-checkmark",
                "group": "controls",
                "label": "Checked checkbox mark",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-checkbox-checkmark",
                "rgbVar": "--modern-user-color-checkbox-checkmark-rgb",
                "kind": "svgStroke",
                "imageVar": "--modern-user-color-checkmark-image",
                "automaticImageVar": "--modern-user-checkmark-image",
                "derivedFrom": "--modern-user-accent-hover-text"
            },
            {
                "key": "checkbox-hover",
                "group": "controls",
                "label": "Checkbox hover and focus",
                "defaultHex": "#172239",
                "cssVar": "--modern-user-color-checkbox-hover",
                "rgbVar": "--modern-user-color-checkbox-hover-rgb"
            },
            {
                "key": "delete-background",
                "group": "controls",
                "label": "Delete button hover background",
                "defaultHex": "#7f1d1d",
                "cssVar": "--modern-user-color-delete-background",
                "rgbVar": "--modern-user-color-delete-background-rgb"
            },
            {
                "key": "delete-border",
                "group": "controls",
                "label": "Delete button border",
                "defaultHex": "#fb7185",
                "cssVar": "--modern-user-color-delete-border",
                "rgbVar": "--modern-user-color-delete-border-rgb"
            },
            {
                "key": "delete-text",
                "group": "controls",
                "label": "Delete button text",
                "defaultHex": "#fda4af",
                "cssVar": "--modern-user-color-delete-text",
                "rgbVar": "--modern-user-color-delete-text-rgb"
            },
            {
                "key": "dropdown",
                "group": "controls",
                "label": "Dropdown menu",
                "defaultHex": "#172239",
                "cssVar": "--modern-user-color-dropdown",
                "rgbVar": "--modern-user-color-dropdown-rgb"
            },
            {
                "key": "dropdown-tag",
                "group": "controls",
                "label": "Selected dropdown tag",
                "defaultHex": "#1b2945",
                "cssVar": "--modern-user-color-dropdown-tag",
                "rgbVar": "--modern-user-color-dropdown-tag-rgb"
            },
            {
                "key": "gallery-button",
                "group": "controls",
                "label": "Gallery button",
                "defaultHex": "#202e49",
                "cssVar": "--modern-user-color-gallery-button",
                "rgbVar": "--modern-user-color-gallery-button-rgb"
            },
            {
                "key": "gallery-button-hover",
                "group": "controls",
                "label": "Gallery button hover",
                "defaultHex": "#304366",
                "cssVar": "--modern-user-color-gallery-button-hover",
                "rgbVar": "--modern-user-color-gallery-button-hover-rgb"
            },
            {
                "key": "gallery-toolbar",
                "group": "controls",
                "label": "Gallery toolbar",
                "defaultHex": "#0b1020",
                "cssVar": "--modern-user-color-gallery-toolbar",
                "rgbVar": "--modern-user-color-gallery-toolbar-rgb"
            },
            {
                "key": "input",
                "group": "controls",
                "label": "Input background",
                "defaultHex": "#0e1628",
                "cssVar": "--modern-user-color-input",
                "rgbVar": "--modern-user-color-input-rgb"
            },
            {
                "key": "primary-end",
                "group": "controls",
                "label": "Primary button gradient end",
                "defaultHex": "#8b5cf6",
                "cssVar": "--modern-user-color-primary-end",
                "rgbVar": "--modern-user-color-primary-end-rgb",
                "autoFrom": "accent-violet"
            },
            {
                "key": "primary-hover-end",
                "group": "controls",
                "label": "Native primary hover gradient end",
                "defaultHex": "#a78bfa",
                "cssVar": "--modern-user-color-primary-hover-end",
                "rgbVar": "--modern-user-color-primary-hover-end-rgb",
                "autoFrom": "accent-violet-light"
            },
            {
                "key": "primary-hover-start",
                "group": "controls",
                "label": "Native primary hover gradient start",
                "defaultHex": "#818cf8",
                "cssVar": "--modern-user-color-primary-hover-start",
                "rgbVar": "--modern-user-color-primary-hover-start-rgb",
                "autoFrom": "accent-400"
            },
            {
                "key": "primary-hover-text",
                "group": "controls",
                "label": "Native primary hover text",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-primary-hover-text",
                "rgbVar": "--modern-user-color-primary-hover-text-rgb",
                "derivedFrom": "--modern-user-accent-hover-text"
            },
            {
                "key": "primary-start",
                "group": "controls",
                "label": "Primary button gradient start",
                "defaultHex": "#6366f1",
                "cssVar": "--modern-user-color-primary-start",
                "rgbVar": "--modern-user-color-primary-start-rgb",
                "autoFrom": "accent-500"
            },
            {
                "key": "primary-text",
                "group": "controls",
                "label": "Primary button text",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-primary-text",
                "rgbVar": "--modern-user-color-primary-text-rgb",
                "derivedFrom": "--modern-user-accent-text"
            },
            {
                "key": "secondary",
                "group": "controls",
                "label": "Secondary and tool button background",
                "defaultHex": "#18233a",
                "cssVar": "--modern-user-color-secondary",
                "rgbVar": "--modern-user-color-secondary-rgb",
                "autoFrom": "panel-raised"
            },
            {
                "key": "secondary-hover",
                "group": "controls",
                "label": "Secondary and tool button hover",
                "defaultHex": "#202e49",
                "cssVar": "--modern-user-color-secondary-hover",
                "rgbVar": "--modern-user-color-secondary-hover-rgb",
                "autoFrom": "panel-hover"
            },
            {
                "key": "secondary-hover-text",
                "group": "controls",
                "label": "Secondary button hover text",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-secondary-hover-text",
                "rgbVar": "--modern-user-color-secondary-hover-text-rgb",
                "autoFrom": "text-bright"
            },
            {
                "key": "secondary-text",
                "group": "controls",
                "label": "Secondary button text",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-secondary-text",
                "rgbVar": "--modern-user-color-secondary-text-rgb",
                "autoFrom": "text"
            },
            {
                "key": "slider-thumb",
                "group": "controls",
                "label": "Slider thumb",
                "defaultHex": "#a5b4fc",
                "cssVar": "--modern-user-color-slider-thumb",
                "rgbVar": "--modern-user-color-slider-thumb-rgb",
                "autoFrom": "accent-300"
            },
            {
                "key": "slider-thumb-border",
                "group": "controls",
                "label": "Slider thumb border",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-slider-thumb-border",
                "rgbVar": "--modern-user-color-slider-thumb-border-rgb",
                "autoFrom": "text"
            },
            {
                "key": "slider-track",
                "group": "controls",
                "label": "Slider track",
                "defaultHex": "#1e2a42",
                "cssVar": "--modern-user-color-slider-track",
                "rgbVar": "--modern-user-color-slider-track-rgb"
            },
            {
                "key": "stop-end",
                "group": "controls",
                "label": "Stop button gradient end",
                "defaultHex": "#152138",
                "cssVar": "--modern-user-color-stop-end",
                "rgbVar": "--modern-user-color-stop-end-rgb"
            },
            {
                "key": "stop-hover",
                "group": "controls",
                "label": "Stop button hover",
                "defaultHex": "#243653",
                "cssVar": "--modern-user-color-stop-hover",
                "rgbVar": "--modern-user-color-stop-hover-rgb"
            },
            {
                "key": "stop-start",
                "group": "controls",
                "label": "Stop button gradient start",
                "defaultHex": "#1b2942",
                "cssVar": "--modern-user-color-stop-start",
                "rgbVar": "--modern-user-color-stop-start-rgb"
            },
            {
                "key": "tag-remove-background",
                "group": "controls",
                "label": "Tag removal hover background",
                "defaultHex": "#ef4444",
                "cssVar": "--modern-user-color-tag-remove-background",
                "rgbVar": "--modern-user-color-tag-remove-background-rgb"
            },
            {
                "key": "tag-remove-text",
                "group": "controls",
                "label": "Tag removal hover text",
                "defaultHex": "#fecaca",
                "cssVar": "--modern-user-color-tag-remove-text",
                "rgbVar": "--modern-user-color-tag-remove-text-rgb"
            },
            {
                "key": "tool-text",
                "group": "controls",
                "label": "Tool button text",
                "defaultHex": "#9eacc8",
                "cssVar": "--modern-user-color-tool-text",
                "rgbVar": "--modern-user-color-tool-text-rgb",
                "autoFrom": "text-muted"
            },
            {
                "key": "accent-100",
                "group": "accent",
                "label": "Accent 100",
                "defaultHex": "#e0e7ff",
                "cssVar": "--modern-user-color-accent-100",
                "rgbVar": "--modern-user-color-accent-100-rgb",
                "derivedFrom": "--modern-user-accent-100"
            },
            {
                "key": "accent-200",
                "group": "accent",
                "label": "Accent 200",
                "defaultHex": "#c7d2fe",
                "cssVar": "--modern-user-color-accent-200",
                "rgbVar": "--modern-user-color-accent-200-rgb",
                "derivedFrom": "--modern-user-accent-200"
            },
            {
                "key": "accent-300",
                "group": "accent",
                "label": "Accent 300",
                "defaultHex": "#a5b4fc",
                "cssVar": "--modern-user-color-accent-300",
                "rgbVar": "--modern-user-color-accent-300-rgb",
                "derivedFrom": "--modern-user-accent-300"
            },
            {
                "key": "accent-400",
                "group": "accent",
                "label": "Accent 400",
                "defaultHex": "#818cf8",
                "cssVar": "--modern-user-color-accent-400",
                "rgbVar": "--modern-user-color-accent-400-rgb",
                "derivedFrom": "--modern-user-accent-400"
            },
            {
                "key": "accent-50",
                "group": "accent",
                "label": "Accent 50",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-accent-50",
                "rgbVar": "--modern-user-color-accent-50-rgb",
                "derivedFrom": "--modern-user-accent-50"
            },
            {
                "key": "accent-500",
                "group": "accent",
                "label": "Accent 500",
                "defaultHex": "#6366f1",
                "cssVar": "--modern-user-color-accent-500",
                "rgbVar": "--modern-user-color-accent-500-rgb",
                "derivedFrom": "--modern-user-accent-500"
            },
            {
                "key": "accent-600",
                "group": "accent",
                "label": "Accent 600",
                "defaultHex": "#4f46e5",
                "cssVar": "--modern-user-color-accent-600",
                "rgbVar": "--modern-user-color-accent-600-rgb",
                "derivedFrom": "--modern-user-accent-600"
            },
            {
                "key": "accent-700",
                "group": "accent",
                "label": "Accent 700",
                "defaultHex": "#4338ca",
                "cssVar": "--modern-user-color-accent-700",
                "rgbVar": "--modern-user-color-accent-700-rgb",
                "derivedFrom": "--modern-user-accent-700"
            },
            {
                "key": "accent-800",
                "group": "accent",
                "label": "Accent 800",
                "defaultHex": "#3730a3",
                "cssVar": "--modern-user-color-accent-800",
                "rgbVar": "--modern-user-color-accent-800-rgb",
                "derivedFrom": "--modern-user-accent-800"
            },
            {
                "key": "accent-900",
                "group": "accent",
                "label": "Accent 900",
                "defaultHex": "#312e81",
                "cssVar": "--modern-user-color-accent-900",
                "rgbVar": "--modern-user-color-accent-900-rgb",
                "derivedFrom": "--modern-user-accent-900"
            },
            {
                "key": "accent-glow-hover",
                "group": "accent",
                "label": "Accent hover glow",
                "defaultHex": "#7c3aed",
                "cssVar": "--modern-user-color-accent-glow-hover",
                "rgbVar": "--modern-user-color-accent-glow-hover-rgb",
                "derivedFrom": "--modern-user-accent-hover-rgb",
                "derivedFormat": "rgb"
            },
            {
                "key": "accent-violet",
                "group": "accent",
                "label": "Accent violet",
                "defaultHex": "#8b5cf6",
                "cssVar": "--modern-user-color-accent-violet",
                "rgbVar": "--modern-user-color-accent-violet-rgb",
                "derivedFrom": "--modern-user-accent-violet"
            },
            {
                "key": "accent-violet-light",
                "group": "accent",
                "label": "Accent violet-light",
                "defaultHex": "#a78bfa",
                "cssVar": "--modern-user-color-accent-violet-light",
                "rgbVar": "--modern-user-color-accent-violet-light-rgb",
                "derivedFrom": "--modern-user-accent-violet-light"
            },
            {
                "key": "accent-violet-pale",
                "group": "accent",
                "label": "Accent violet-pale",
                "defaultHex": "#c4b5fd",
                "cssVar": "--modern-user-color-accent-violet-pale",
                "rgbVar": "--modern-user-color-accent-violet-pale-rgb",
                "derivedFrom": "--modern-user-accent-violet-pale"
            },
            {
                "key": "border",
                "group": "details",
                "label": "Standard border",
                "defaultHex": "#94a3b8",
                "cssVar": "--modern-user-color-border",
                "rgbVar": "--modern-user-color-border-rgb"
            },
            {
                "key": "focus-ring",
                "group": "details",
                "label": "Keyboard focus ring",
                "defaultHex": "#818cf8",
                "cssVar": "--modern-user-color-focus-ring",
                "rgbVar": "--modern-user-color-focus-ring-rgb",
                "autoFrom": "accent-400"
            },
            {
                "key": "inset-shadow",
                "group": "details",
                "label": "Inset shadow",
                "defaultHex": "#000000",
                "cssVar": "--modern-user-color-inset-shadow",
                "rgbVar": "--modern-user-color-inset-shadow-rgb"
            },
            {
                "key": "lightbox",
                "group": "details",
                "label": "Image lightbox background",
                "defaultHex": "#020617",
                "cssVar": "--modern-user-color-lightbox",
                "rgbVar": "--modern-user-color-lightbox-rgb"
            },
            {
                "key": "scrollbar",
                "group": "details",
                "label": "Scrollbar",
                "defaultHex": "#475569",
                "cssVar": "--modern-user-color-scrollbar",
                "rgbVar": "--modern-user-color-scrollbar-rgb"
            },
            {
                "key": "scrollbar-webkit",
                "group": "details",
                "label": "WebKit scrollbar thumb",
                "defaultHex": "#384862",
                "cssVar": "--modern-user-color-scrollbar-webkit",
                "rgbVar": "--modern-user-color-scrollbar-webkit-rgb"
            },
            {
                "key": "shadow",
                "group": "details",
                "label": "Panel shadow",
                "defaultHex": "#020617",
                "cssVar": "--modern-user-color-shadow",
                "rgbVar": "--modern-user-color-shadow-rgb"
            },
            {
                "key": "surface-highlight",
                "group": "details",
                "label": "Surface highlight",
                "defaultHex": "#ffffff",
                "cssVar": "--modern-user-color-surface-highlight",
                "rgbVar": "--modern-user-color-surface-highlight-rgb"
            },
            {
                "key": "text-shadow",
                "group": "details",
                "label": "Progress text shadow",
                "defaultHex": "#000000",
                "cssVar": "--modern-user-color-text-shadow",
                "rgbVar": "--modern-user-color-text-shadow-rgb"
            },
            {
                "key": "tooltip",
                "group": "details",
                "label": "Tooltip background",
                "defaultHex": "#111a2c",
                "cssVar": "--modern-user-color-tooltip",
                "rgbVar": "--modern-user-color-tooltip-rgb"
            },
            {
                "key": "tooltip-text",
                "group": "details",
                "label": "Tooltip text",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-tooltip-text",
                "rgbVar": "--modern-user-color-tooltip-text-rgb"
            },
            {
                "key": "danger",
                "group": "notifications",
                "label": "Danger text",
                "defaultHex": "#f87171",
                "cssVar": "--modern-user-color-danger",
                "rgbVar": "--modern-user-color-danger-rgb"
            },
            {
                "key": "error-accent",
                "group": "notifications",
                "label": "Error accent",
                "defaultHex": "#fb7185",
                "cssVar": "--modern-user-color-error-accent",
                "rgbVar": "--modern-user-color-error-accent-rgb"
            },
            {
                "key": "error-background",
                "group": "notifications",
                "label": "Error background",
                "defaultHex": "#211a2b",
                "cssVar": "--modern-user-color-error-background",
                "rgbVar": "--modern-user-color-error-background-rgb"
            },
            {
                "key": "error-gradient-end",
                "group": "notifications",
                "label": "Error gradient end",
                "defaultHex": "#161a2b",
                "cssVar": "--modern-user-color-error-gradient-end",
                "rgbVar": "--modern-user-color-error-gradient-end-rgb"
            },
            {
                "key": "error-text",
                "group": "notifications",
                "label": "Error text",
                "defaultHex": "#fecdd3",
                "cssVar": "--modern-user-color-error-text",
                "rgbVar": "--modern-user-color-error-text-rgb"
            },
            {
                "key": "toast-close-hover",
                "group": "notifications",
                "label": "Notification close hover",
                "defaultHex": "#253551",
                "cssVar": "--modern-user-color-toast-close-hover",
                "rgbVar": "--modern-user-color-toast-close-hover-rgb"
            },
            {
                "key": "toast-end",
                "group": "notifications",
                "label": "Notification gradient end",
                "defaultHex": "#10192c",
                "cssVar": "--modern-user-color-toast-end",
                "rgbVar": "--modern-user-color-toast-end-rgb"
            },
            {
                "key": "toast-muted",
                "group": "notifications",
                "label": "Notification close icon",
                "defaultHex": "#9eacc8",
                "cssVar": "--modern-user-color-toast-muted",
                "rgbVar": "--modern-user-color-toast-muted-rgb"
            },
            {
                "key": "toast-scrollbar",
                "group": "notifications",
                "label": "Notification scrollbar",
                "defaultHex": "#475569",
                "cssVar": "--modern-user-color-toast-scrollbar",
                "rgbVar": "--modern-user-color-toast-scrollbar-rgb"
            },
            {
                "key": "toast-start",
                "group": "notifications",
                "label": "Notification gradient start",
                "defaultHex": "#18233a",
                "cssVar": "--modern-user-color-toast-start",
                "rgbVar": "--modern-user-color-toast-start-rgb"
            },
            {
                "key": "toast-text",
                "group": "notifications",
                "label": "Notification text",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-toast-text",
                "rgbVar": "--modern-user-color-toast-text-rgb"
            },
            {
                "key": "warning",
                "group": "notifications",
                "label": "Warning accent",
                "defaultHex": "#fbbf24",
                "cssVar": "--modern-user-color-warning",
                "rgbVar": "--modern-user-color-warning-rgb"
            },
            {
                "key": "editor-border",
                "group": "editor",
                "label": "Editor border",
                "defaultHex": "#94a3b8",
                "cssVar": "--modern-user-color-editor-border",
                "rgbVar": "--modern-user-color-editor-border-rgb"
            },
            {
                "key": "editor-button",
                "group": "editor",
                "label": "Editor button",
                "defaultHex": "#1b2941",
                "cssVar": "--modern-user-color-editor-button",
                "rgbVar": "--modern-user-color-editor-button-rgb"
            },
            {
                "key": "editor-button-hover",
                "group": "editor",
                "label": "Editor button hover",
                "defaultHex": "#263958",
                "cssVar": "--modern-user-color-editor-button-hover",
                "rgbVar": "--modern-user-color-editor-button-hover-rgb"
            },
            {
                "key": "editor-error-background",
                "group": "editor",
                "label": "Editor error background",
                "defaultHex": "#281b2b",
                "cssVar": "--modern-user-color-editor-error-background",
                "rgbVar": "--modern-user-color-editor-error-background-rgb"
            },
            {
                "key": "editor-error-text",
                "group": "editor",
                "label": "Editor error text",
                "defaultHex": "#fecdd3",
                "cssVar": "--modern-user-color-editor-error-text",
                "rgbVar": "--modern-user-color-editor-error-text-rgb"
            },
            {
                "key": "editor-heading",
                "group": "editor",
                "label": "Editor heading",
                "defaultHex": "#f8fafc",
                "cssVar": "--modern-user-color-editor-heading",
                "rgbVar": "--modern-user-color-editor-heading-rgb"
            },
            {
                "key": "editor-icon",
                "group": "editor",
                "label": "Editor icon button",
                "defaultHex": "#18233a",
                "cssVar": "--modern-user-color-editor-icon",
                "rgbVar": "--modern-user-color-editor-icon-rgb"
            },
            {
                "key": "editor-label",
                "group": "editor",
                "label": "Editor field label",
                "defaultHex": "#e4eaf5",
                "cssVar": "--modern-user-color-editor-label",
                "rgbVar": "--modern-user-color-editor-label-rgb"
            },
            {
                "key": "editor-muted",
                "group": "editor",
                "label": "Editor secondary text",
                "defaultHex": "#aab7d0",
                "cssVar": "--modern-user-color-editor-muted",
                "rgbVar": "--modern-user-color-editor-muted-rgb"
            },
            {
                "key": "editor-overlay",
                "group": "editor",
                "label": "Editor overlay",
                "defaultHex": "#020617",
                "cssVar": "--modern-user-color-editor-overlay",
                "rgbVar": "--modern-user-color-editor-overlay-rgb"
            },
            {
                "key": "editor-preview-background",
                "group": "editor",
                "label": "Image preview background",
                "defaultHex": "#0b1020",
                "cssVar": "--modern-user-color-editor-preview-background",
                "rgbVar": "--modern-user-color-editor-preview-background-rgb"
            },
            {
                "key": "editor-preview-line",
                "group": "editor",
                "label": "Preview prompt line",
                "defaultHex": "#64748b",
                "cssVar": "--modern-user-color-editor-preview-line",
                "rgbVar": "--modern-user-color-editor-preview-line-rgb"
            },
            {
                "key": "editor-preview-line-short",
                "group": "editor",
                "label": "Preview secondary prompt line",
                "defaultHex": "#475569",
                "cssVar": "--modern-user-color-editor-preview-line-short",
                "rgbVar": "--modern-user-color-editor-preview-line-short-rgb"
            },
            {
                "key": "editor-preview-panel",
                "group": "editor",
                "label": "Preview card",
                "defaultHex": "#121a2d",
                "cssVar": "--modern-user-color-editor-preview-panel",
                "rgbVar": "--modern-user-color-editor-preview-panel-rgb"
            },
            {
                "key": "editor-preview-stripe",
                "group": "editor",
                "label": "Preview checkerboard first color",
                "defaultHex": "#172238",
                "cssVar": "--modern-user-color-editor-preview-stripe",
                "rgbVar": "--modern-user-color-editor-preview-stripe-rgb"
            },
            {
                "key": "editor-preview-stripe-alt",
                "group": "editor",
                "label": "Preview checkerboard second color",
                "defaultHex": "#1e2b43",
                "cssVar": "--modern-user-color-editor-preview-stripe-alt",
                "rgbVar": "--modern-user-color-editor-preview-stripe-alt-rgb"
            },
            {
                "key": "editor-scrollbar",
                "group": "editor",
                "label": "Editor scrollbar",
                "defaultHex": "#475569",
                "cssVar": "--modern-user-color-editor-scrollbar",
                "rgbVar": "--modern-user-color-editor-scrollbar-rgb"
            },
            {
                "key": "editor-shadow",
                "group": "editor",
                "label": "Editor shadow",
                "defaultHex": "#020617",
                "cssVar": "--modern-user-color-editor-shadow",
                "rgbVar": "--modern-user-color-editor-shadow-rgb"
            },
            {
                "key": "editor-success",
                "group": "editor",
                "label": "Editor success text",
                "defaultHex": "#a7f3d0",
                "cssVar": "--modern-user-color-editor-success",
                "rgbVar": "--modern-user-color-editor-success-rgb"
            },
            {
                "key": "editor-surface",
                "group": "editor",
                "label": "Editor background",
                "defaultHex": "#10182a",
                "cssVar": "--modern-user-color-editor-surface",
                "rgbVar": "--modern-user-color-editor-surface-rgb"
            },
            {
                "key": "editor-text",
                "group": "editor",
                "label": "Editor primary text",
                "defaultHex": "#eef2ff",
                "cssVar": "--modern-user-color-editor-text",
                "rgbVar": "--modern-user-color-editor-text-rgb"
            },
            {
                "key": "editor-value",
                "group": "editor",
                "label": "Editor value background",
                "defaultHex": "#0e1628",
                "cssVar": "--modern-user-color-editor-value",
                "rgbVar": "--modern-user-color-editor-value-rgb"
            },
            {
                "key": "page-scrollbar-thumb",
                "group": "details",
                "label": "Page scrollbar thumb",
                "defaultHex": "#384862",
                "cssVar": "--modern-user-color-page-scrollbar-thumb",
                "rgbVar": "--modern-user-color-page-scrollbar-thumb-rgb",
                "autoFrom": "scrollbar-webkit"
            },
            {
                "key": "page-scrollbar-hover",
                "group": "details",
                "label": "Page scrollbar thumb hover",
                "defaultHex": "#475569",
                "cssVar": "--modern-user-color-page-scrollbar-hover",
                "rgbVar": "--modern-user-color-page-scrollbar-hover-rgb",
                "autoFrom": "scrollbar"
            },
            {
                "key": "page-scrollbar-track",
                "group": "details",
                "label": "Page scrollbar track",
                "defaultHex": "#0b1020",
                "cssVar": "--modern-user-color-page-scrollbar-track",
                "rgbVar": "--modern-user-color-page-scrollbar-track-rgb",
                "autoFrom": "canvas"
            }
        ]
    };
    const COLOR_ROLES = new Map(COLOR_MANIFEST.roles.map(role => [role.key, role]));
    const DEFAULTS = Object.freeze({ accent: "#818cf8", panelOpacity: 100, shadow: 100, radius: 14, font: "system", backgroundImage: null, backgroundDim: 65, backgroundBlur: 8, colors: Object.freeze({}) });
    const RANGES = { panelOpacity: [50, 100], shadow: [0, 150], radius: [0, 24], backgroundDim: [0, 90], backgroundBlur: [0, 24] };
    const FONT_STACKS = { system: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif', segoe: '"Segoe UI", sans-serif', arial: 'Arial, sans-serif', tahoma: 'Tahoma, sans-serif', verdana: 'Verdana, sans-serif' };
    const FONT_OPTIONS = [{ value: "system", label: "System" }, { value: "segoe", label: "Segoe UI" }, { value: "arial", label: "Arial" }, { value: "tahoma", label: "Tahoma" }, { value: "verdana", label: "Verdana" }];
    const FIELD_LABELS = { accent: "Accent color", panelOpacity: "Panel opacity", shadow: "Shadow strength", radius: "Corner radius", font: "Interface font", backgroundDim: "Background dimming", backgroundBlur: "Background blur" };
    const PALETTE_KEYS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "violet", "violet-light", "violet-pale", "rgb", "strong-rgb", "start-rgb", "end-rgb", "hover-rgb", "pale-rgb", "text", "hover-text"];
    const USER_PROPERTIES = [...new Set([...PALETTE_KEYS.map(key => `--modern-user-accent-${key}`), "--modern-user-checkmark-image", "--modern-user-panel-opacity", "--modern-user-shadow-strength", "--modern-user-radius-scale", "--modern-user-font-family", "--modern-user-background-image", "--modern-user-background-dim", "--modern-user-background-blur", ...COLOR_MANIFEST.roles.flatMap(role => [role.cssVar, role.rgbVar, role.imageVar].filter(Boolean))])];
    const copy = settings => ({ ...settings, colors: { ...settings.colors } });
    const translate = key => {
        const api = window.sdModernUiI18n;
        return api && typeof api.t === "function" ? api.t(key) : key;
    };
    const failure = key => Object.assign(new Error(key), { appearanceMessage: key });
    const format = (key, parameters = {}) => {
        const api = window.sdModernUiI18n;
        if (api && typeof api.t === "function") return api.t(key, parameters);
        return key.replace(/\{(\w+)\}/g, (match, name) => Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : match);
    };
    const isObject = value => !!value && typeof value === "object" && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
    const hasExactKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
    const documentFor = settings => ({ schema: SCHEMA, version: 2, settings: copy(settings) });

    const imageType = bytes => {
        if (bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "image/png";
        if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
        if (bytes.length >= 30 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
        throw failure("Choose a PNG, JPEG or WebP image.");
    };

    const imageDimensions = (bytes, type) => {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        let width;
        let height;
        if (type === "image/png") {
            width = view.getUint32(16);
            height = view.getUint32(20);
        } else if (type === "image/webp") {
            const chunk = String.fromCharCode(...bytes.slice(12, 16));
            if (chunk === "VP8X") {
                width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
                height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
            } else if (chunk === "VP8L" && bytes[20] === 47) {
                width = 1 + bytes[21] + ((bytes[22] & 63) << 8);
                height = 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 15) << 10);
            } else if (chunk === "VP8 " && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) {
                width = view.getUint16(26, true) & 16383;
                height = view.getUint16(28, true) & 16383;
            }
        } else {
            let offset = 2;
            const frameMarkers = [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207];
            while (offset + 3 < bytes.length) {
                if (bytes[offset++] !== 255) break;
                while (bytes[offset] === 255) offset++;
                const marker = bytes[offset++];
                if (marker === 217 || marker === 218) break;
                if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
                if (offset + 2 > bytes.length) break;
                const length = view.getUint16(offset);
                if (length < 2 || offset + length > bytes.length) break;
                if (frameMarkers.includes(marker) && length >= 7) {
                    height = view.getUint16(offset + 3);
                    width = view.getUint16(offset + 5);
                    break;
                }
                offset += length;
            }
        }
        if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw failure("Image could not be decoded.");
        if (width * height > MAX_PIXELS) throw failure("The image must not exceed 32 megapixels.");
        return { width, height };
    };

    const dataImage = value => {
        if (typeof value !== "string" || value.length > Math.ceil(MAX_SOURCE * 4 / 3) + 40) throw failure("Invalid background image.");
        const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
        if (!match || match[2].length % 4 !== 0) throw failure("Invalid background image.");
        let binary;
        try { binary = atob(match[2]); } catch (_error) { throw failure("Invalid background image."); }
        if (!binary.length || binary.length > MAX_SOURCE) throw failure("The source image must not exceed 8 MB.");
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
        const type = imageType(bytes);
        if (type !== match[1]) throw failure("The background image format does not match its data.");
        const dimensions = imageDimensions(bytes, type);
        return { bytes, type, ...dimensions };
    };

    const validate = value => {
        let parsed = value;
        if (typeof value === "string") {
            if (new TextEncoder().encode(value).length > MAX_JSON) throw failure("The JSON file must not exceed 3 MB.");
            try { parsed = JSON.parse(value); } catch (_error) { throw failure("The file is not valid JSON."); }
        }
        if (!hasExactKeys(parsed, ["schema", "version", "settings"]) || parsed.schema !== SCHEMA || ![1, 2].includes(parsed.version)) throw failure("This appearance file has an unsupported format or version.");
        const keys = Object.keys(DEFAULTS).filter(key => parsed.version === 2 || key !== "colors");
        if (!hasExactKeys(parsed.settings, keys)) throw failure("The appearance file contains missing or unknown settings.");
        const settings = parsed.settings;
        if (typeof settings.accent !== "string" || !/^#[0-9a-fA-F]{6}$/.test(settings.accent)) throw failure("Use an accent color in #RRGGBB format.");
        for (const [key, [minimum, maximum]] of Object.entries(RANGES)) {
            if (!Number.isInteger(settings[key]) || settings[key] < minimum || settings[key] > maximum) throw failure("The appearance file contains an invalid numeric setting.");
        }
        if (typeof settings.font !== "string" || !Object.prototype.hasOwnProperty.call(FONT_STACKS, settings.font)) throw failure("The appearance file contains an unsupported font.");
        if (settings.backgroundImage !== null) dataImage(settings.backgroundImage);
        const colors = parsed.version === 1 ? {} : settings.colors;
        if (!isObject(colors)) throw failure("The appearance file contains invalid color overrides.");
        const normalizedColors = {};
        for (const [key, value] of Object.entries(colors)) {
            if (!COLOR_ROLES.has(key)) throw failure("The appearance file contains an unknown color role.");
            if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) throw failure("Use a color in #RRGGBB format.");
            normalizedColors[key] = value.toLowerCase();
        }
        return documentFor({ ...settings, accent: settings.accent.toLowerCase(), colors: normalizedColors });
    };

    const rgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
    const hex = color => "#" + color.map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("");
    const mix = (color, target, fraction) => color.map((value, index) => value + (target[index] - value) * fraction);
    const luminance = color => color.map(value => { const part = value / 255; return part <= 0.04045 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4; }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
    const contrast = (first, second) => { const values = [luminance(first), luminance(second)].sort((a, b) => b - a); return (values[0] + 0.05) / (values[1] + 0.05); };
    const readable = (color, foreground) => {
        if (contrast(color.map(Math.round), foreground) >= 5) return color;
        const target = foreground[0] === 255 ? [0, 0, 0] : [255, 255, 255];
        for (let step = 1; step <= 100; step++) {
            const result = mix(color, target, step / 100);
            if (contrast(result.map(Math.round), foreground) >= 5) return result;
        }
        return target;
    };
    const rotateHue = color => {
        const [r, g, b] = color.map(value => value / 255);
        const maximum = Math.max(r, g, b);
        const minimum = Math.min(r, g, b);
        const delta = maximum - minimum;
        const lightness = (maximum + minimum) / 2;
        if (!delta) return color;
        const saturation = delta / (1 - Math.abs(2 * lightness - 1));
        let hue = maximum === r ? ((g - b) / delta) % 6 : maximum === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
        hue = (hue * 60 + 378) % 360;
        const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
        const offset = lightness - chroma / 2;
        const sectors = [[chroma, x, 0], [x, chroma, 0], [0, chroma, x], [0, x, chroma], [x, 0, chroma], [chroma, 0, x]];
        return sectors[Math.floor(hue / 60)].map(value => (value + offset) * 255);
    };

    const checkmarkImage = color => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path fill='none' stroke='${color}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.2' d='m3 8 3 3 7-7'/></svg>`)}")`;
    const palette = accent => {
        const base = rgb(accent);
        const white = [255, 255, 255];
        const black = [0, 0, 0];
        const hoverText = contrast(base, white) >= contrast(base, black) ? white : black;
        const violet = rotateHue(base);
        const values = { "50": mix(base, white, 0.94), "100": mix(base, white, 0.84), "200": mix(base, white, 0.65), "300": mix(base, white, 0.35), "400": base, "500": readable(mix(base, black, 0.13), white), "600": readable(mix(base, black, 0.25), white), "700": mix(base, black, 0.38), "800": mix(base, black, 0.53), "900": mix(base, black, 0.66), violet: readable(violet, white), "violet-light": readable(mix(violet, white, 0.2), hoverText), "violet-pale": mix(violet, white, 0.45) };
        const properties = {};
        for (const [key, value] of Object.entries(values)) properties[`--modern-user-accent-${key}`] = hex(value);
        for (const [key, value] of Object.entries({ rgb: base, "strong-rgb": values["300"], "start-rgb": values["500"], "end-rgb": values.violet, "hover-rgb": readable(mix(violet, black, 0.15), white), "pale-rgb": values["100"] })) properties[`--modern-user-accent-${key}`] = value.map(Math.round).join(",");
        properties["--modern-user-accent-text"] = "#ffffff";
        properties["--modern-user-accent-hover-text"] = hex(hoverText);
        properties["--modern-user-checkmark-image"] = checkmarkImage(hex(hoverText));
        return properties;
    };

    let saved = copy(DEFAULTS);
    let draft = copy(DEFAULTS);
    let opened = false;
    let busy = false;
    let saveInFlight = false;
    let disposed = false;
    let statusKey = "";
    let statusType = "";
    let statusParameters = {};
    let root = null;
    let backdrop = null;
    let dialog = null;
    let wallpaper = null;
    let status = null;
    let imagePreview = null;
    let imageInfo = null;
    let lastFocused = null;
    let savedOverflow = null;
    let revision = 0;
    let operation = 0;
    let session = 0;
    let frame = 0;
    let observer = null;
    let previewData = null;
    let previewDetails = null;
    let paletteAccent = null;
    let paletteProperties = null;
    let accentHex = null;
    let accentError = null;
    let invalidAccent = null;
    let colorSearch = null;
    let colorEmpty = null;
    let colorSearchActive = false;
    let replacementBox = null;
    let replacementCount = null;
    let replacementPicker = null;
    let replacementHex = null;
    let replacementButton = null;
    let replacementError = null;
    let replacementColor = DEFAULTS.accent;
    let invalidReplacement = null;
    let fontButton = null;
    let fontValue = null;
    let fontPopup = null;
    let fontPopupOpen = false;
    let fontActive = 0;
    let fontTypeBuffer = "";
    let fontTypeTimer = 0;
    let fontPositionFrame = 0;
    let viewportFrame = 0;
    let languageApi = null;
    let unsubscribeLanguage = null;
    let searchCatalogs = [];
    const languageButtons = new Map();
    const saveLockedControls = new Map();
    const fontOptionNodes = [];
    const colorControls = new Map();
    const colorGroups = new Map();
    const invalidColors = new Map();
    const searchOpenStates = new Map();
    const controls = new Map();
    const outputs = new Map();
    const localizations = new Map();
    const launchers = new Set();
    const removers = [];
    const objectURLs = new Set();
    const downloadURLs = new Set();
    const inertStates = new Map();
    const propertyStates = new Map();
    const originalClasses = typeof document === "undefined" ? {} : Object.fromEntries(["sd-modern-ui-appearance-custom", "sd-modern-ui-wallpaper"].map(name => [name, document.documentElement.classList.contains(name)]));
    let ready = Promise.resolve();

    const appRoot = () => typeof gradioApp === "function" ? gradioApp() : document;
    const language = () => window.sdModernUiI18n && typeof window.sdModernUiI18n.getLanguage === "function" ? window.sdModernUiI18n.getLanguage() : "en";
    const appliedLanguage = () => {
        const api = window.sdModernUiI18n;
        const state = api && typeof api.getState === "function" ? api.getState() : null;
        return state && ["en", "ru"].includes(state.appliedLanguage) ? state.appliedLanguage : api && typeof api.getSavedLanguage === "function" ? api.getSavedLanguage() : "en";
    };
    const languagePending = () => language() !== appliedLanguage();
    const protect = node => {
        const api = window.sdModernUiI18n;
        if (node && api && typeof api.protect === "function") api.protect(node);
    };
    const bindLanguage = () => {
        const api = window.sdModernUiI18n || null;
        if (api === languageApi) return;
        if (typeof unsubscribeLanguage === "function") unsubscribeLanguage();
        unsubscribeLanguage = null;
        languageApi = api;
        searchCatalogs = api && typeof api.getCatalog === "function" ? [api.getCatalog("en"), api.getCatalog("ru")] : [];
        if (api && typeof api.subscribe === "function") unsubscribeLanguage = api.subscribe(() => schedule());
    };
    const searchLabels = key => [...new Set([key, translate(key), ...searchCatalogs.map(catalog => catalog && typeof catalog[key] === "string" ? catalog[key] : key)])];
    const renderSaveLock = () => {
        if (saveInFlight && dialog) {
            for (const node of dialog.querySelectorAll("button, input, select, textarea")) {
                if (!saveLockedControls.has(node)) saveLockedControls.set(node, node.disabled);
                if (!node.disabled) node.disabled = true;
            }
        } else {
            for (const [node, disabled] of saveLockedControls) if (node.isConnected) node.disabled = disabled;
            saveLockedControls.clear();
        }
    };
    const syncLanguageControls = () => {
        const value = language();
        for (const node of [backdrop, dialog, fontPopup, ...launchers]) if (node && node.getAttribute("lang") !== value) node.setAttribute("lang", value);
        for (const [code, node] of languageButtons) {
            const selected = code === value;
            if (node.getAttribute("aria-pressed") !== String(selected)) node.setAttribute("aria-pressed", String(selected));
            if (node.classList.contains("is-selected") !== selected) node.classList.toggle("is-selected", selected);
            const unavailable = !window.sdModernUiI18n || typeof window.sdModernUiI18n.previewLanguage !== "function";
            if (node.disabled !== (unavailable || saveInFlight)) node.disabled = unavailable || saveInFlight;
        }
        const save = dialog && dialog.querySelector("#modern-appearance-save");
        if (save) {
            const entries = localizations.get(save);
            const label = entries && entries.find(entry => entry.attribute === null);
            if (label) label.key = languagePending() ? "Save and reload" : "Save";
        }
    };
    const enabled = () => !disposed && typeof document !== "undefined" && document.documentElement.classList.contains("sd-modern-ui");
    const currentFocus = () => { let element = document.activeElement; while (element && element.shadowRoot && element.shadowRoot.activeElement) element = element.shadowRoot.activeElement; return element; };
    const restoreElementFocus = element => {
        const bridge = window.sdModernUiTooltipTitles;
        if (bridge && typeof bridge.restoreFocus === "function") bridge.restoreFocus(element, { preventScroll: true });
        else element.focus({ preventScroll: true });
    };
    const listen = (element, name, callback, options) => { element.addEventListener(name, callback, options); removers.push({ element, remove: () => element.removeEventListener(name, callback, options) }); };
    const text = (element, key, attribute = null, parameters = {}) => {
        const values = localizations.get(element) || [];
        localizations.set(element, [...values.filter(value => value.attribute !== attribute), { key, attribute, parameters }]);
        const value = format(key, parameters);
        if (attribute) element.setAttribute(attribute, value);
        else element.textContent = value;
        return element;
    };
    const element = (tag, className, key = null) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        return key ? text(node, key) : node;
    };
    const button = (id, key, className = "") => {
        const node = element("button", className, key);
        node.id = id;
        node.type = "button";
        return node;
    };
    const setStatus = (key = "", type = "", parameters = {}) => {
        statusKey = key;
        statusType = type;
        statusParameters = { ...parameters };
        if (!status) return;
        const value = format(key, parameters);
        if (status.textContent !== value) status.textContent = value;
        status.classList.toggle("is-error", type === "error");
        status.classList.toggle("is-success", type === "success");
        const live = type === "error" ? "assertive" : "polite";
        if (status.getAttribute("aria-live") !== live) status.setAttribute("aria-live", live);
    };
    const updateProperty = (name, value) => {
        const style = document.documentElement.style;
        let state = propertyStates.get(name);
        if (!state) {
            state = { original: style.getPropertyValue(name), priority: style.getPropertyPriority(name), value: null };
            propertyStates.set(name, state);
        }
        if (value === undefined) {
            if (state.value !== null && style.getPropertyValue(name) === state.value) {
                if (state.original) style.setProperty(name, state.original, state.priority);
                else style.removeProperty(name);
            }
            state.value = null;
        } else {
            if (style.getPropertyValue(name) !== value) style.setProperty(name, value);
            state.value = value;
        }
    };
    const applyAppearance = settings => {
        if (typeof document === "undefined" || disposed) return;
        const properties = {};
        const active = enabled();
        if (active) {
            if (settings.accent !== DEFAULTS.accent) {
                if (paletteAccent !== settings.accent) { paletteAccent = settings.accent; paletteProperties = palette(settings.accent); }
                Object.assign(properties, paletteProperties);
            }
            if (settings.panelOpacity !== DEFAULTS.panelOpacity) properties["--modern-user-panel-opacity"] = String(settings.panelOpacity / 100);
            if (settings.shadow !== DEFAULTS.shadow) properties["--modern-user-shadow-strength"] = String(settings.shadow / 100);
            if (settings.radius !== DEFAULTS.radius) properties["--modern-user-radius-scale"] = String(settings.radius / 14);
            if (settings.font !== DEFAULTS.font) properties["--modern-user-font-family"] = FONT_STACKS[settings.font];
            for (const [key, value] of Object.entries(settings.colors)) {
                const role = COLOR_ROLES.get(key);
                properties[role.cssVar] = value;
                if (role.rgbVar) properties[role.rgbVar] = rgb(value).join(",");
                if (role.imageVar) properties[role.imageVar] = checkmarkImage(value);
            }
            if (settings.backgroundImage) {
                properties["--modern-user-background-image"] = `url("${settings.backgroundImage}")`;
                properties["--modern-user-background-dim"] = String(settings.backgroundDim / 100);
                properties["--modern-user-background-blur"] = `${settings.backgroundBlur}px`;
            }
        }
        for (const name of USER_PROPERTIES) updateProperty(name, properties[name]);
        const html = document.documentElement;
        const customized = active && (Object.keys(DEFAULTS).some(key => key !== "colors" && settings[key] !== DEFAULTS[key]) || Object.keys(settings.colors).length > 0);
        const withImage = active && !!settings.backgroundImage;
        if (html.classList.contains("sd-modern-ui-appearance-custom") !== customized) html.classList.toggle("sd-modern-ui-appearance-custom", customized);
        if (html.classList.contains("sd-modern-ui-wallpaper") !== withImage) html.classList.toggle("sd-modern-ui-wallpaper", withImage);
    };

    const releaseURL = url => { const image = objectURLs.delete(url); const download = downloadURLs.delete(url); if (image || download) URL.revokeObjectURL(url); };
    const invalidate = () => { operation++; busy = false; for (const url of [...objectURLs]) releaseURL(url); };
    const cancelled = () => failure("Operation canceled.");
    const normalizeImage = async (bytes, type, valid = () => !disposed, existing = null) => {
        imageDimensions(bytes, type);
        if (!valid()) throw cancelled();
        const url = URL.createObjectURL(new Blob([bytes], { type }));
        objectURLs.add(url);
        const image = new Image();
        let timer;
        try {
            await new Promise((resolve, reject) => {
                timer = setTimeout(() => reject(failure("Image could not be decoded.")), 15000);
                image.onload = resolve;
                image.onerror = () => reject(failure("Image could not be decoded."));
                image.src = url;
            });
            clearTimeout(timer);
            if (!valid()) throw cancelled();
            if (image.naturalWidth < 1 || image.naturalHeight < 1 || image.naturalWidth * image.naturalHeight > MAX_PIXELS) throw failure("The image must not exceed 32 megapixels.");
            const originalWidth = image.naturalWidth;
            const originalHeight = image.naturalHeight;
            if (existing && originalWidth <= 2560 && originalHeight <= 2560 && bytes.length <= MAX_STORED_IMAGE) return { data: existing, width: originalWidth, height: originalHeight, bytes: bytes.length };
            let scale = Math.min(1, 2560 / Math.max(originalWidth, originalHeight));
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) throw failure("Image processing is not available in this browser.");
            for (let size = 0; size < 6; size++) {
                canvas.width = Math.max(1, Math.round(originalWidth * scale));
                canvas.height = Math.max(1, Math.round(originalHeight * scale));
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                for (const quality of [0.86, 0.65, 0.45]) {
                    if (!valid()) throw cancelled();
                    const encode = format => new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => reject(failure("Image could not be processed.")), 15000);
                        try { canvas.toBlob(blob => { clearTimeout(timeout); if (blob) resolve(blob); else reject(failure("Image could not be processed.")); }, format, quality); }
                        catch (_error) { clearTimeout(timeout); reject(failure("Image could not be processed.")); }
                    });
                    let blob = await encode("image/webp");
                    if (!valid()) throw cancelled();
                    if (blob.type !== "image/webp") {
                        context.fillStyle = "#0b1020";
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(image, 0, 0, canvas.width, canvas.height);
                        blob = await encode("image/jpeg");
                    }
                    if (!valid()) throw cancelled();
                    if (blob.size <= MAX_STORED_IMAGE) {
                        const data = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = () => reject(failure("Image could not be processed."));
                            reader.readAsDataURL(blob);
                        });
                        if (!valid()) throw cancelled();
                        dataImage(data);
                        return { data, width: canvas.width, height: canvas.height, bytes: blob.size };
                    }
                }
                scale *= 0.78;
            }
            throw failure("The image could not be compressed below 1.5 MB.");
        } finally {
            clearTimeout(timer);
            image.onload = null;
            image.onerror = null;
            image.removeAttribute("src");
            releaseURL(url);
        }
    };
    const normalizeSettings = async (settings, valid) => {
        const result = copy(settings);
        if (result.backgroundImage) {
            const input = dataImage(result.backgroundImage);
            result.backgroundImage = (await normalizeImage(input.bytes, input.type, valid, result.backgroundImage)).data;
        }
        return result;
    };

    const syncBackdropViewport = () => {
        if (!opened || !backdrop) return;
        const viewport = window.visualViewport;
        const values = { left: viewport ? viewport.offsetLeft : 0, top: viewport ? viewport.offsetTop : 0, width: viewport ? viewport.width : window.innerWidth, height: viewport ? viewport.height : window.innerHeight };
        let changed = false;
        for (const [name, value] of Object.entries(values)) {
            const next = `${name === "width" || name === "height" ? Math.max(0, value) : value}px`;
            if (backdrop.style[name] !== next) { backdrop.style[name] = next; changed = true; }
        }
        if (changed) {
            const focused = currentFocus();
            const body = dialog && dialog.querySelector(".modern-appearance-body");
            if (!body || !focused || !body.contains(focused) || !focused.getClientRects().length) return;
            const bounds = body.getBoundingClientRect();
            const control = focused.getBoundingClientRect();
            const top = bounds.top + 8;
            const bottom = bounds.bottom - 8;
            if (bottom <= top) return;
            let delta = 0;
            if (control.top < top || control.height > bottom - top) delta = control.top - top;
            else if (control.bottom > bottom) delta = control.bottom - bottom;
            if (delta) body.scrollTop += delta;
        }
    };
    const viewportChanged = () => {
        closeFont();
        if (!opened || viewportFrame) return;
        viewportFrame = window.requestAnimationFrame(() => { viewportFrame = 0; syncBackdropViewport(); });
    };
    const fontEventInside = event => {
        const path = typeof event.composedPath === "function" ? event.composedPath() : [event.target];
        return path.includes(fontButton) || path.includes(fontPopup);
    };
    const keepFontActiveVisible = () => {
        if (!fontPopupOpen || !fontPopup || !fontOptionNodes[fontActive]) return;
        const option = fontOptionNodes[fontActive];
        const top = option.offsetTop;
        const bottom = top + option.offsetHeight;
        if (top < fontPopup.scrollTop) fontPopup.scrollTop = top;
        else if (bottom > fontPopup.scrollTop + fontPopup.clientHeight) fontPopup.scrollTop = Math.max(0, bottom - fontPopup.clientHeight);
    };
    const renderFont = () => {
        if (!fontButton || !fontValue) return;
        const selected = FONT_OPTIONS.findIndex(option => option.value === draft.font);
        const label = translate(FONT_OPTIONS[selected].label);
        if (fontButton.value !== draft.font) fontButton.value = draft.font;
        if (fontValue.textContent !== label) fontValue.textContent = label;
        for (let index = 0; index < fontOptionNodes.length; index++) {
            const option = fontOptionNodes[index];
            const chosen = index === selected;
            const active = fontPopupOpen && index === fontActive;
            if (option.getAttribute("aria-selected") !== String(chosen)) option.setAttribute("aria-selected", String(chosen));
            if (option.classList.contains("is-active") !== active) option.classList.toggle("is-active", active);
        }
        if (fontPopupOpen) {
            const id = fontOptionNodes[fontActive].id;
            if (fontButton.getAttribute("aria-activedescendant") !== id) fontButton.setAttribute("aria-activedescendant", id);
            keepFontActiveVisible();
        }
    };
    const closeFont = (restoreFocus = false) => {
        if (fontTypeTimer) clearTimeout(fontTypeTimer);
        fontTypeTimer = 0;
        fontTypeBuffer = "";
        if (fontPositionFrame) window.cancelAnimationFrame(fontPositionFrame);
        fontPositionFrame = 0;
        if (!fontPopupOpen) return;
        fontPopupOpen = false;
        if (fontPopup) { fontPopup.hidden = true; fontPopup.setAttribute("aria-hidden", "true"); }
        if (fontButton) { fontButton.setAttribute("aria-expanded", "false"); fontButton.removeAttribute("aria-activedescendant"); }
        if (dialog && dialog.getAttribute("aria-owns") === "modern-appearance-font-listbox") dialog.removeAttribute("aria-owns");
        renderFont();
        if (restoreFocus && opened && enabled() && fontButton && fontButton.isConnected) restoreElementFocus(fontButton);
    };
    const positionFont = () => {
        fontPositionFrame = 0;
        if (!fontPopupOpen || !opened || !fontButton || !fontPopup || !fontButton.isConnected || !fontButton.getClientRects().length) { closeFont(); return; }
        const viewport = window.visualViewport;
        const viewLeft = viewport ? viewport.offsetLeft : 0;
        const viewTop = viewport ? viewport.offsetTop : 0;
        const viewRight = viewLeft + (viewport ? viewport.width : window.innerWidth);
        const viewBottom = viewTop + (viewport ? viewport.height : window.innerHeight);
        const trigger = fontButton.getBoundingClientRect();
        const drawer = dialog.getBoundingClientRect();
        const body = dialog.querySelector(".modern-appearance-body").getBoundingClientRect();
        const footer = dialog.querySelector(".modern-appearance-footer").getBoundingClientRect();
        const leftEdge = Math.max(viewLeft + 10, drawer.left + 12);
        const rightEdge = Math.min(viewRight - 10, drawer.right - 12);
        const topEdge = Math.max(viewTop + 10, body.top + 4);
        const bottomEdge = Math.min(viewBottom - 10, body.bottom - 4, footer.top - 8);
        const width = Math.max(1, Math.min(Math.max(trigger.width, 200), rightEdge - leftEdge));
        const left = Math.max(leftEdge, Math.min(rightEdge - width, trigger.left));
        const above = Math.max(0, trigger.top - topEdge - 6);
        const below = Math.max(0, bottomEdge - trigger.bottom - 6);
        const available = Math.max(above, below);
        if (available < 24 || trigger.bottom < topEdge || trigger.top > bottomEdge) { closeFont(); return; }
        fontPopup.style.width = `${Math.floor(width)}px`;
        fontPopup.style.left = `${Math.round(left)}px`;
        fontPopup.style.maxHeight = `${Math.floor(available)}px`;
        const height = fontPopup.getBoundingClientRect().height;
        const useBelow = below >= height || below >= above;
        const top = useBelow ? trigger.bottom + 6 : trigger.top - height - 6;
        fontPopup.style.top = `${Math.round(Math.max(topEdge, Math.min(bottomEdge - height, top)))}px`;
        keepFontActiveVisible();
    };
    const openFont = (index = null) => {
        if (!opened || !enabled() || !fontPopup || !fontButton) return;
        fontActive = index === null ? FONT_OPTIONS.findIndex(option => option.value === draft.font) : index;
        fontPopupOpen = true;
        fontPopup.hidden = false;
        fontPopup.setAttribute("aria-hidden", "false");
        fontButton.setAttribute("aria-expanded", "true");
        dialog.setAttribute("aria-owns", fontPopup.id);
        renderFont();
        positionFont();
        if (fontPopupOpen && !fontPositionFrame) fontPositionFrame = window.requestAnimationFrame(positionFont);
    };
    const chooseFont = index => {
        if (!opened || index < 0 || index >= FONT_OPTIONS.length) return;
        draft.font = FONT_OPTIONS[index].value;
        closeFont(true);
        preview();
    };
    const moveFont = index => { fontActive = Math.max(0, Math.min(FONT_OPTIONS.length - 1, index)); renderFont(); };
    const fontTypeahead = character => {
        if (!fontPopupOpen) openFont();
        const letter = character.toLocaleLowerCase();
        const repeated = fontTypeBuffer.length > 0 && [...fontTypeBuffer].every(value => value === letter);
        fontTypeBuffer = repeated ? letter : fontTypeBuffer + letter;
        if (fontTypeTimer) clearTimeout(fontTypeTimer);
        fontTypeTimer = setTimeout(() => { fontTypeBuffer = ""; fontTypeTimer = 0; }, 700);
        const start = fontTypeBuffer.length === 1 ? fontActive + 1 : fontActive;
        for (let count = 0; count < FONT_OPTIONS.length; count++) {
            const index = (start + count) % FONT_OPTIONS.length;
            const option = FONT_OPTIONS[index];
            if ([option.label, translate(option.label)].some(label => label.toLocaleLowerCase().startsWith(fontTypeBuffer))) { moveFont(index); return; }
        }
    };
    const fontKeyDown = event => {
        if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === "Tab") { closeFont(); return; }
        if (event.key === "Escape") {
            if (!fontPopupOpen) return;
            event.preventDefault();
            event.stopPropagation();
            closeFont(true);
            return;
        }
        if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key) || event.key.length === 1) {
            event.preventDefault();
            event.stopPropagation();
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                if (!fontPopupOpen) openFont();
                else moveFont(fontActive + (event.key === "ArrowDown" ? 1 : -1));
            } else if (event.key === "Home" || event.key === "End") {
                if (!fontPopupOpen) openFont(event.key === "Home" ? 0 : FONT_OPTIONS.length - 1);
                else moveFont(event.key === "Home" ? 0 : FONT_OPTIONS.length - 1);
            } else if (event.key === "Enter" || event.key === " ") {
                if (fontPopupOpen) chooseFont(fontActive);
                else openFont();
            } else fontTypeahead(event.key);
        }
    };
    const fontOutside = event => { if (fontPopupOpen && !fontEventInside(event)) closeFont(); };
    const fontScroll = event => {
        if (!fontPopupOpen) return;
        const target = event.target;
        if (target && target.nodeType && fontPopup && (target === fontPopup || fontPopup.contains(target))) return;
        closeFont();
    };
    const buildFontPopup = () => {
        fontPopup = element("div", "modern-appearance-font-listbox");
        fontPopup.id = "modern-appearance-font-listbox";
        fontPopup.setAttribute("role", "listbox");
        fontPopup.setAttribute("aria-labelledby", "modern-appearance-font-label");
        fontPopup.setAttribute("aria-hidden", "true");
        fontPopup.hidden = true;
        for (let index = 0; index < FONT_OPTIONS.length; index++) {
            const font = FONT_OPTIONS[index];
            const option = element("div", "modern-appearance-font-option");
            option.id = `modern-appearance-font-option-${font.value}`;
            option.dataset.value = font.value;
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", String(font.value === draft.font));
            const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            check.setAttribute("class", "modern-appearance-font-check");
            check.setAttribute("viewBox", "0 0 24 24");
            check.setAttribute("fill", "none");
            check.setAttribute("stroke", "currentColor");
            check.setAttribute("stroke-width", "1.8");
            check.setAttribute("stroke-linecap", "round");
            check.setAttribute("stroke-linejoin", "round");
            check.setAttribute("aria-hidden", "true");
            check.setAttribute("focusable", "false");
            check.innerHTML = '<path d="m5 12 4 4 10-10"/>';
            option.append(element("span", "modern-appearance-font-option-label", font.label), check);
            fontPopup.appendChild(option);
            fontOptionNodes.push(option);
            listen(option, "pointermove", () => { if (fontPopupOpen && fontActive !== index) moveFont(index); });
            listen(option, "click", () => { if (fontPopupOpen) chooseFont(index); });
        }
        listen(fontPopup, "mousedown", event => { event.preventDefault(); });
        backdrop.appendChild(fontPopup);
    };

    const invalidHex = () => invalidAccent !== null || invalidColors.size > 0;
    const clearInvalidHex = () => { invalidAccent = null; invalidColors.clear(); if (statusKey === "Fix invalid HEX colors before saving.") setStatus(); };
    const colorAuto = (role, settings = draft, visited = new Set()) => {
        if (visited.has(role.key)) return role.defaultHex.toLowerCase();
        visited.add(role.key);
        if (role.autoFrom) {
            const parent = COLOR_ROLES.get(role.autoFrom);
            if (parent) return effectiveColor(parent, settings, visited);
        }
        if (role.derivedFrom && settings.accent !== DEFAULTS.accent) {
            if (paletteAccent !== settings.accent) { paletteAccent = settings.accent; paletteProperties = palette(settings.accent); }
            const value = paletteProperties[role.derivedFrom];
            if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
            if (role.derivedFormat === "rgb" && typeof value === "string") {
                const values = value.split(",").map(part => Number(part.trim()));
                if (values.length === 3 && values.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return hex(values);
            }
        }
        return role.defaultHex.toLowerCase();
    };
    const effectiveColor = (role, settings = draft, visited = new Set()) => Object.prototype.hasOwnProperty.call(settings.colors, role.key) ? settings.colors[role.key] : colorAuto(role, settings, visited);
    const searchHex = query => {
        const value = query.trim().toLowerCase();
        const full = /^#?([0-9a-f]{6})$/.exec(value);
        if (full) return "#" + full[1];
        const short = /^#([0-9a-f]{3})$/.exec(value);
        return short ? "#" + [...short[1]].map(character => character + character).join("") : null;
    };
    const matchingColors = value => value ? COLOR_MANIFEST.roles.filter(role => effectiveColor(role) === value) : [];
    const renderReplacement = () => {
        if (!replacementBox || !colorSearch) return;
        const query = searchHex(colorSearch.value);
        if (replacementBox.hidden !== !query) replacementBox.hidden = !query;
        const count = matchingColors(query).length;
        const message = format("Matching color roles: {count}", { count });
        if (replacementCount.textContent !== message) replacementCount.textContent = message;
        if (replacementPicker.value !== replacementColor) replacementPicker.value = replacementColor;
        const value = invalidReplacement === null ? replacementColor : invalidReplacement;
        if (currentFocus() !== replacementHex && replacementHex.value !== value) replacementHex.value = value;
        const invalid = invalidReplacement !== null;
        if (replacementHex.getAttribute("aria-invalid") !== String(invalid)) replacementHex.setAttribute("aria-invalid", String(invalid));
        if (replacementError.hidden !== !invalid) replacementError.hidden = !invalid;
        const blocked = busy || invalid || !count || query === replacementColor;
        if (replacementButton.disabled !== blocked) replacementButton.disabled = blocked;
    };
    const buildReplacement = parent => {
        replacementBox = element("div", "modern-appearance-color-replace");
        replacementBox.hidden = true;
        replacementCount = element("span", "modern-appearance-color-match-count");
        replacementCount.id = "modern-appearance-color-match-count";
        replacementCount.setAttribute("aria-live", "polite");
        const row = element("div", "modern-appearance-color-replace-control");
        const label = element("label", "", "Replacement color");
        label.htmlFor = "modern-appearance-replacement-color";
        replacementPicker = element("input");
        replacementPicker.id = label.htmlFor;
        replacementPicker.type = "color";
        replacementPicker.value = replacementColor;
        replacementHex = element("input", "modern-appearance-hex");
        replacementHex.id = "modern-appearance-replacement-hex";
        replacementHex.type = "text";
        replacementHex.maxLength = 7;
        replacementHex.spellcheck = false;
        replacementHex.autocomplete = "off";
        replacementHex.value = replacementColor;
        text(replacementHex, "HEX color for {name}", "aria-label", { name: "Replacement color" });
        replacementError = element("p", "modern-appearance-color-error", "Use a color in #RRGGBB format.");
        replacementError.id = "modern-appearance-replacement-error";
        replacementError.hidden = true;
        replacementHex.setAttribute("aria-describedby", replacementError.id);
        replacementButton = button("modern-appearance-replace-colors", "Replace matching colors");
        row.append(replacementPicker, replacementHex, replacementButton);
        replacementBox.append(replacementCount, label, row, element("p", "modern-appearance-color-replace-help", "Only matching individual color roles are changed. The main accent stays unchanged."), replacementError);
        parent.appendChild(replacementBox);
        listen(replacementPicker, "input", () => { replacementColor = replacementPicker.value; invalidReplacement = null; renderReplacement(); });
        listen(replacementHex, "input", () => {
            if (/^#[0-9a-fA-F]{6}$/.test(replacementHex.value)) { replacementColor = replacementHex.value.toLowerCase(); invalidReplacement = null; }
            else invalidReplacement = replacementHex.value;
            renderReplacement();
        });
        listen(replacementHex, "blur", renderReplacement);
        listen(replacementButton, "click", () => {
            if (!opened || busy || invalidReplacement !== null) return;
            const query = searchHex(colorSearch.value);
            if (!query || query === replacementColor) return;
            const matches = matchingColors(query).map(role => role.key);
            if (!matches.length) return;
            for (const key of matches) { draft.colors[key] = replacementColor; invalidColors.delete(key); }
            preview();
            setStatus("Replaced {count} matching color roles in the preview.", "success", { count: matches.length });
            updateHexStatus();
        });
    };
    const updateHexStatus = () => {
        if (invalidHex()) setStatus("Fix invalid HEX colors before saving.", "error");
        else if (statusKey === "Fix invalid HEX colors before saving.") setStatus("Changes are previewed until you save.");
    };
    const renderColorControls = () => {
        for (const [key, refs] of colorControls) {
            const customized = Object.prototype.hasOwnProperty.call(draft.colors, key);
            const value = customized ? draft.colors[key] : colorAuto(COLOR_ROLES.get(key));
            const invalid = invalidColors.has(key);
            if (refs.picker.value !== value) refs.picker.value = value;
            const displayed = invalid ? invalidColors.get(key) : value;
            if (currentFocus() !== refs.hex && refs.hex.value !== displayed) refs.hex.value = displayed;
            const mode = translate(customized ? "Custom" : "Auto");
            if (refs.mode.textContent !== mode) refs.mode.textContent = mode;
            const resetDisabled = !customized && !invalid;
            if (refs.reset.disabled !== resetDisabled) refs.reset.disabled = resetDisabled;
            if (refs.field.classList.contains("is-custom") !== customized) refs.field.classList.toggle("is-custom", customized);
            if (refs.field.classList.contains("is-invalid") !== invalid) refs.field.classList.toggle("is-invalid", invalid);
            if (refs.error.hidden !== !invalid) refs.error.hidden = !invalid;
            if (refs.hex.getAttribute("aria-invalid") !== String(invalid)) refs.hex.setAttribute("aria-invalid", String(invalid));
            const description = `${refs.mode.id}${invalid ? " " + refs.error.id : ""}`;
            if (refs.hex.getAttribute("aria-describedby") !== description) refs.hex.setAttribute("aria-describedby", description);
        }
    };
    const makeColorField = (role, parent) => {
        const field = element("div", "modern-appearance-color-field");
        field.dataset.modernColorRole = role.key;
        const label = element("label", "", role.label);
        label.htmlFor = `modern-appearance-color-${role.key}`;
        const row = element("div", "modern-appearance-color-control");
        const picker = element("input");
        picker.type = "color";
        picker.id = label.htmlFor;
        const hexInput = element("input", "modern-appearance-hex");
        hexInput.type = "text";
        hexInput.id = `modern-appearance-hex-${role.key}`;
        hexInput.maxLength = 7;
        hexInput.spellcheck = false;
        hexInput.autocomplete = "off";
        hexInput.setAttribute("inputmode", "text");
        text(hexInput, "HEX color for {name}", "aria-label", { name: role.label });
        const reset = button(`modern-appearance-auto-${role.key}`, null, "modern-appearance-color-reset");
        text(reset, "Reset {name} to Auto", "aria-label", { name: role.label });
        text(reset, "Reset {name} to Auto", "title", { name: role.label });
        reset.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 4v6h6M3 10a9 9 0 1 1 1 8"/></svg>';
        const mode = element("span", "modern-appearance-color-mode");
        mode.id = `modern-appearance-color-mode-${role.key}`;
        picker.setAttribute("aria-describedby", mode.id);
        const error = element("p", "modern-appearance-color-error", "Use a color in #RRGGBB format.");
        error.id = `modern-appearance-validation-${role.key}`;
        error.hidden = true;
        row.append(picker, hexInput, reset, mode);
        field.append(label, row, error);
        parent.appendChild(field);
        colorControls.set(role.key, { field, picker, hex: hexInput, reset, mode, error });
        listen(picker, "input", () => {
            if (!opened) return;
            invalidColors.delete(role.key);
            draft.colors[role.key] = picker.value.toLowerCase();
            preview();
            updateHexStatus();
        });
        listen(hexInput, "input", () => {
            if (!opened) return;
            if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
                invalidColors.delete(role.key);
                draft.colors[role.key] = hexInput.value.toLowerCase();
            } else invalidColors.set(role.key, hexInput.value);
            preview();
            updateHexStatus();
        });
        listen(hexInput, "blur", renderColorControls);
        listen(reset, "click", () => {
            delete draft.colors[role.key];
            invalidColors.delete(role.key);
            preview();
            updateHexStatus();
        });
    };
    const ensureColorGroup = state => {
        if (state.built) return;
        state.built = true;
        const reset = button(`modern-appearance-group-auto-${state.group.key}`, "Reset group to Auto", "modern-appearance-color-group-reset");
        state.body.appendChild(reset);
        listen(reset, "click", () => {
            for (const role of state.roles) { delete draft.colors[role.key]; invalidColors.delete(role.key); }
            preview();
            setStatus("Group colors reset to Auto.");
            updateHexStatus();
        });
        for (const role of state.roles) makeColorField(role, state.body);
        renderColorControls();
        renderSaveLock();
    };
    const filterColorGroups = () => {
        if (!colorSearch) return;
        const query = colorSearch.value.trim().toLocaleLowerCase();
        const hexQuery = searchHex(query);
        if (query && !colorSearchActive) {
            searchOpenStates.clear();
            for (const [key, state] of colorGroups) searchOpenStates.set(key, state.details.open);
        }
        let total = 0;
        for (const [key, state] of colorGroups) {
            const groupMatch = query && !hexQuery && [state.group.key, ...searchLabels(state.group.label)].some(value => value.toLocaleLowerCase().includes(query));
            const matches = state.roles.filter(role => !query || invalidColors.has(role.key) || colorControls.get(role.key)?.field.contains(currentFocus()) || (hexQuery ? effectiveColor(role) === hexQuery : groupMatch || [role.key, ...searchLabels(role.label)].some(value => value.toLocaleLowerCase().includes(query))));
            const visible = matches.length > 0;
            if (state.details.hidden !== !visible) state.details.hidden = !visible;
            const protectedGroup = state.roles.some(role => invalidColors.has(role.key) || colorControls.get(role.key)?.field.contains(currentFocus()));
            if ((query && visible) || protectedGroup) { ensureColorGroup(state); if (!state.details.open) state.details.open = true; }
            else if (!query && colorSearchActive) state.details.open = searchOpenStates.get(key) || false;
            const count = query ? `${matches.length}/${state.roles.length}` : String(state.roles.length);
            if (state.count.textContent !== count) state.count.textContent = count;
            const visibleKeys = new Set(matches.map(role => role.key));
            for (const role of state.roles) {
                const refs = colorControls.get(role.key);
                if (refs && refs.field.hidden !== !visibleKeys.has(role.key)) refs.field.hidden = !visibleKeys.has(role.key);
            }
            total += matches.length;
        }
        colorSearchActive = !!query;
        if (colorEmpty && colorEmpty.hidden !== (total > 0)) colorEmpty.hidden = total > 0;
        renderReplacement();
    };
    const buildColors = parent => {
        const section = element("section", "modern-appearance-colors");
        section.append(element("h3", "", "Theme colors"), element("p", "modern-appearance-help", "Leave a color on Auto to follow the accent palette and theme defaults. Custom colors take priority."));
        colorSearch = element("input", "modern-appearance-color-search");
        colorSearch.id = "modern-appearance-color-search";
        colorSearch.type = "search";
        text(colorSearch, "Search colors", "aria-label");
        text(colorSearch, "Search colors", "placeholder");
        const groups = element("div", "modern-appearance-color-groups");
        groups.id = "modern-appearance-color-groups";
        for (const group of COLOR_MANIFEST.groups) {
            const details = element("details", "modern-appearance-color-group");
            details.dataset.modernColorGroup = group.key;
            const summary = element("summary");
            const count = element("span", "modern-appearance-color-count");
            summary.append(element("span", "modern-appearance-color-group-label", group.label), count);
            const body = element("div", "modern-appearance-color-fields");
            details.append(summary, body);
            groups.appendChild(details);
            const state = { group, details, body, count, roles: COLOR_MANIFEST.roles.filter(role => role.group === group.key).sort((first, second) => first.key.localeCompare(second.key, undefined, { numeric: true })), built: false };
            colorGroups.set(group.key, state);
            listen(details, "toggle", () => { if (details.open) ensureColorGroup(state); });
        }
        colorEmpty = element("p", "modern-appearance-color-empty", "No matching colors.");
        colorEmpty.hidden = true;
        section.appendChild(colorSearch);
        buildReplacement(section);
        section.append(groups, colorEmpty);
        parent.appendChild(section);
        listen(colorSearch, "input", filterColorGroups);
        filterColorGroups();
    };

    const renderControls = () => {
        for (const [key, control] of controls) {
            const next = String(draft[key]);
            if (control.value !== next) control.value = next;
            const output = outputs.get(key);
            if (output) {
                const value = key === "accent" ? draft.accent : `${draft[key]}${key === "radius" || key === "backgroundBlur" ? " " + translate("px") : "%"}`;
                if (output.textContent !== value) output.textContent = value;
            }
        }
        renderFont();
        if (accentHex) {
            const invalid = invalidAccent !== null;
            const value = invalid ? invalidAccent : draft.accent;
            if (currentFocus() !== accentHex && accentHex.value !== value) accentHex.value = value;
            if (accentHex.getAttribute("aria-invalid") !== String(invalid)) accentHex.setAttribute("aria-invalid", String(invalid));
            if (accentError.hidden !== !invalid) accentError.hidden = !invalid;
        }
        renderColorControls();
        renderReplacement();
        if (imagePreview) {
            if (imagePreview.hidden !== !draft.backgroundImage) imagePreview.hidden = !draft.backgroundImage;
            if (previewData !== draft.backgroundImage) {
                previewData = draft.backgroundImage;
                previewDetails = draft.backgroundImage ? dataImage(draft.backgroundImage) : null;
                const image = imagePreview.querySelector("img");
                if (draft.backgroundImage) image.src = draft.backgroundImage;
                else image.removeAttribute("src");
            }
        }
        if (imageInfo) {
            const info = previewDetails;
            const value = info ? `${info.width} × ${info.height} · ${(info.bytes.length / 1024 / 1024).toFixed(2)} ${translate("MB")}` : translate("No background image");
            if (imageInfo.textContent !== value) imageInfo.textContent = value;
        }
        if (dialog) {
            const save = dialog.querySelector("#modern-appearance-save");
            const blocked = busy || invalidHex();
            if (save.disabled !== blocked) save.disabled = blocked;
            const exportButton = dialog.querySelector("#modern-appearance-export");
            if (exportButton.disabled !== blocked) exportButton.disabled = blocked;
            const remove = dialog.querySelector("#modern-appearance-background-remove");
            if (remove.disabled !== !draft.backgroundImage) remove.disabled = !draft.backgroundImage;
            if (dialog.getAttribute("aria-busy") !== String(busy)) dialog.setAttribute("aria-busy", String(busy));
        }
        renderSaveLock();
    };
    const preview = () => { revision++; renderControls(); applyAppearance(draft); if (colorSearchActive) filterColorGroups(); };
    const close = (restoreFocus = true, force = false) => {
        if (!opened || (saveInFlight && !force)) return;
        closeFont();
        opened = false;
        if (viewportFrame) window.cancelAnimationFrame(viewportFrame);
        viewportFrame = 0;
        session++;
        invalidate();
        clearInvalidHex();
        draft = copy(saved);
        if (backdrop) {
            backdrop.hidden = true;
            backdrop.setAttribute("aria-hidden", "true");
            for (const name of ["left", "top", "width", "height"]) backdrop.style.removeProperty(name);
        }
        for (const [node, original] of inertStates) { if (node.inert) node.inert = original; }
        inertStates.clear();
        if (savedOverflow && document.body.style.getPropertyValue("overflow") === "hidden") {
            if (savedOverflow.value) document.body.style.setProperty("overflow", savedOverflow.value, savedOverflow.priority);
            else document.body.style.removeProperty("overflow");
        }
        savedOverflow = null;
        applyAppearance(saved);
        const api = window.sdModernUiI18n;
        if (api && typeof api.restorePreview === "function") api.restorePreview();
        if (restoreFocus && lastFocused && lastFocused.isConnected && !lastFocused.disabled && typeof lastFocused.focus === "function") restoreElementFocus(lastFocused);
        lastFocused = null;
    };
    const open = async () => {
        await ready;
        if (!enabled()) return false;
        bind();
        if (!dialog) return false;
        if (opened) { dialog.focus(); return true; }
        opened = true;
        session++;
        invalidate();
        clearInvalidHex();
        revision++;
        draft = copy(saved);
        lastFocused = currentFocus();
        for (const node of [...backdrop.parentNode.children]) {
            if (node === backdrop || node === wallpaper || node.matches("script, style, link")) continue;
            inertStates.set(node, node.inert);
            node.inert = true;
        }
        savedOverflow = { value: document.body.style.getPropertyValue("overflow"), priority: document.body.style.getPropertyPriority("overflow") };
        document.body.style.setProperty("overflow", "hidden");
        backdrop.hidden = false;
        backdrop.setAttribute("aria-hidden", "false");
        syncBackdropViewport();
        setStatus(statusKey || "Changes are previewed until you save.", statusType, statusParameters);
        renderControls();
        applyAppearance(draft);
        dialog.querySelector("#modern-appearance-close").focus({ preventScroll: true });
        return true;
    };

    const upload = async file => {
        if (!file || !opened) return;
        invalidate();
        const token = operation;
        const openedSession = session;
        const valid = () => !disposed && opened && token === operation && openedSession === session;
        busy = true;
        setStatus("Processing background image…");
        renderControls();
        try {
            if (file.size > MAX_SOURCE) throw failure("The source image must not exceed 8 MB.");
            const bytes = new Uint8Array(await file.arrayBuffer());
            if (!valid()) return;
            const result = await normalizeImage(bytes, imageType(bytes), valid);
            if (!valid()) return;
            draft.backgroundImage = result.data;
            preview();
            setStatus("Background image is ready. Save to keep it.", "success");
        } catch (error) {
            if (valid()) setStatus(error.appearanceMessage || "Image could not be processed.", "error");
        } finally {
            if (valid()) { busy = false; renderControls(); }
        }
    };
    const importFile = async file => {
        if (!file || !opened) return;
        invalidate();
        const token = operation;
        const openedSession = session;
        const originalRevision = revision;
        const valid = () => !disposed && opened && token === operation && openedSession === session;
        busy = true;
        setStatus("Reading appearance file…");
        renderControls();
        try {
            if (file.size > MAX_JSON) throw failure("The JSON file must not exceed 3 MB.");
            const document = validate(await file.text());
            const next = await normalizeSettings(document.settings, valid);
            if (!valid()) return;
            if (revision !== originalRevision) { setStatus("Import canceled because the draft changed."); return; }
            draft = next;
            clearInvalidHex();
            preview();
            setStatus("Appearance imported as a preview. Save to keep it.", "success");
        } catch (error) {
            if (valid()) setStatus(error.appearanceMessage || "The appearance file could not be read.", "error");
        } finally {
            if (valid()) { busy = false; renderControls(); }
        }
    };
    const save = async () => {
        if (!opened || busy || !enabled()) return;
        if (invalidHex()) { updateHexStatus(); return; }
        try {
            const next = validate(documentFor(draft)).settings;
            const serialized = JSON.stringify(documentFor(next));
            if (new TextEncoder().encode(serialized).length > MAX_JSON) throw failure("The JSON file must not exceed 3 MB.");
            const client = window.sdModernUiConfig;
            if (!client || typeof client.save !== "function") throw failure("Server configuration is unavailable. Restart WebUI after updating the extension.");
            const reload = languagePending();
            const selectedLanguage = language();
            saveInFlight = true;
            busy = true;
            closeFont();
            setStatus("Saving configuration…");
            renderControls();
            const response = await client.save({ theme: documentFor(next), language: selectedLanguage });
            if (disposed) return;
            if (!response || response.ok !== true || !response.config) throw failure("Settings could not be saved to the configuration file. Your preview is still open.");
            saved = copy(validate(response.config.theme).settings);
            saveInFlight = false;
            busy = false;
            renderSaveLock();
            renderControls();
            setStatus("Configuration saved.", "success");
            close();
            if (reload) {
                try { window.location.reload(); }
                catch (_error) { setStatus("Reload the page to apply the saved language.", "error"); void open(); }
            }
        } catch (error) {
            if (disposed) return;
            saveInFlight = false;
            busy = false;
            renderSaveLock();
            renderControls();
            setStatus(error.appearanceMessage || "Settings could not be saved to the configuration file. Your preview is still open.", "error");
        }
    };
    const exportFile = () => {
        if (!opened || busy) return;
        if (invalidHex()) { updateHexStatus(); return; }
        try {
            const next = validate(documentFor(draft));
            const blob = new Blob([JSON.stringify(next, null, 2)], { type: "application/json" });
            if (blob.size > MAX_JSON) throw failure("The JSON file must not exceed 3 MB.");
            const url = URL.createObjectURL(blob);
            downloadURLs.add(url);
            const link = document.createElement("a");
            link.href = url;
            link.download = "sd-modern-ui-theme.json";
            link.hidden = true;
            backdrop.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => releaseURL(url), 1000);
            setStatus("Appearance exported with its background image.", "success");
        } catch (error) { setStatus(error.appearanceMessage || "Appearance could not be exported.", "error"); }
    };

    const makeField = (key, parent) => {
        const field = element("div", "modern-appearance-field");
        const label = element("label", "", FIELD_LABELS[key]);
        label.htmlFor = `modern-appearance-${key}`;
        const row = element("div", "modern-appearance-control");
        let input;
        if (key === "font") {
            label.id = "modern-appearance-font-label";
            input = button("modern-appearance-font", null, "modern-appearance-font-trigger");
            input.setAttribute("role", "combobox");
            input.setAttribute("aria-haspopup", "listbox");
            input.setAttribute("aria-expanded", "false");
            input.setAttribute("aria-controls", "modern-appearance-font-listbox");
            input.setAttribute("aria-labelledby", "modern-appearance-font-label modern-appearance-font-value");
            fontValue = element("span", "modern-appearance-font-value");
            fontValue.id = "modern-appearance-font-value";
            const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            chevron.setAttribute("class", "modern-appearance-font-chevron");
            chevron.setAttribute("viewBox", "0 0 24 24");
            chevron.setAttribute("fill", "none");
            chevron.setAttribute("stroke", "currentColor");
            chevron.setAttribute("stroke-width", "1.8");
            chevron.setAttribute("stroke-linecap", "round");
            chevron.setAttribute("stroke-linejoin", "round");
            chevron.setAttribute("aria-hidden", "true");
            chevron.setAttribute("focusable", "false");
            chevron.innerHTML = '<path d="m6 9 6 6 6-6"/>';
            input.append(fontValue, chevron);
            fontButton = input;
            listen(input, "click", () => { if (fontPopupOpen) closeFont(); else openFont(); });
            listen(input, "keydown", fontKeyDown);
        } else {
            input = element("input");
            input.type = key === "accent" ? "color" : "range";
            if (RANGES[key]) { input.min = String(RANGES[key][0]); input.max = String(RANGES[key][1]); input.step = "1"; }
            if (key === "accent") {
                accentHex = element("input", "modern-appearance-hex");
                accentHex.id = "modern-appearance-accent-hex";
                accentHex.type = "text";
                accentHex.maxLength = 7;
                accentHex.spellcheck = false;
                accentHex.autocomplete = "off";
                text(accentHex, "HEX color for {name}", "aria-label", { name: FIELD_LABELS.accent });
                accentError = element("p", "modern-appearance-color-error", "Use a color in #RRGGBB format.");
                accentError.id = "modern-appearance-accent-error";
                accentError.hidden = true;
                accentHex.setAttribute("aria-describedby", accentError.id);
                row.appendChild(accentHex);
                listen(accentHex, "input", () => {
                    if (!opened) return;
                    if (/^#[0-9a-fA-F]{6}$/.test(accentHex.value)) { invalidAccent = null; draft.accent = accentHex.value.toLowerCase(); }
                    else invalidAccent = accentHex.value;
                    preview();
                    updateHexStatus();
                });
                listen(accentHex, "blur", renderControls);
            } else {
                const output = element("output");
                output.htmlFor = `modern-appearance-${key}`;
                outputs.set(key, output);
                row.appendChild(output);
            }
        }
        input.id = `modern-appearance-${key}`;
        input.value = String(draft[key]);
        controls.set(key, input);
        if (key === "font") {
            const wrapper = element("div", "modern-appearance-font-select");
            wrapper.appendChild(input);
            row.prepend(wrapper);
        } else row.prepend(input);
        field.append(label, row);
        if (key === "accent") field.appendChild(accentError);
        parent.appendChild(field);
        if (key !== "font") listen(input, "input", () => {
            if (!opened) return;
            if (key === "accent") invalidAccent = null;
            draft[key] = key === "font" || key === "accent" ? input.value : Number(input.value);
            preview();
            updateHexStatus();
        });
    };

    const buildLanguage = parent => {
        const section = element("section", "modern-appearance-language");
        const label = element("h3", "", "Interface language");
        label.id = "modern-appearance-language-label";
        const choices = element("div", "modern-appearance-language-options");
        choices.setAttribute("role", "group");
        choices.setAttribute("aria-labelledby", label.id);
        const choose = code => {
            if (!opened || saveInFlight) return;
            const api = window.sdModernUiI18n;
            if (api && typeof api.previewLanguage === "function") api.previewLanguage(code);
        };
        for (const [code, caption] of [["en", "English"], ["ru", "Русский"]]) {
            const choice = button(`modern-appearance-language-${code}`, null, "modern-appearance-language-button");
            choice.textContent = caption;
            choice.dataset.language = code;
            choice.setAttribute("lang", code);
            choice.setAttribute("aria-pressed", String(code === language()));
            choices.appendChild(choice);
            languageButtons.set(code, choice);
            listen(choice, "click", () => choose(code));
        }
        listen(choices, "keydown", event => {
            if (event.isComposing || event.ctrlKey || event.altKey || event.metaKey || saveInFlight || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            const code = event.key === "Home" || event.key === "ArrowLeft" ? "en" : "ru";
            event.preventDefault();
            event.stopPropagation();
            languageButtons.get(code).focus({ preventScroll: true });
            choose(code);
        });
        section.append(label, choices, element("p", "modern-appearance-help", "The interface language changes after saving and reloading the page."));
        parent.appendChild(section);
    };

    const build = mount => {
        wallpaper = element("div");
        wallpaper.id = "modern-appearance-wallpaper";
        wallpaper.setAttribute("aria-hidden", "true");
        wallpaper.append(element("div", "modern-appearance-wallpaper-image"), element("div", "modern-appearance-wallpaper-shade"));
        mount.prepend(wallpaper);
        backdrop = element("div", "modern-appearance-backdrop");
        protect(backdrop);
        backdrop.hidden = true;
        backdrop.setAttribute("aria-hidden", "true");
        dialog = element("section", "modern-appearance-drawer");
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-labelledby", "modern-appearance-title");
        dialog.tabIndex = -1;
        const header = element("header", "modern-appearance-header");
        const title = element("h2", "", "Appearance");
        title.id = "modern-appearance-title";
        const exit = button("modern-appearance-close", null);
        text(exit, "Close appearance editor", "aria-label");
        exit.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>';
        header.append(title, exit);
        const body = element("div", "modern-appearance-body");
        body.appendChild(element("p", "modern-appearance-intro", "Changes are previewed until you save. Settings are stored in the extension configuration file."));
        const previewSection = element("section", "modern-appearance-preview");
        text(previewSection, "Appearance preview", "aria-label");
        const previewCard = element("div", "modern-appearance-preview-card");
        previewCard.setAttribute("aria-hidden", "true");
        previewCard.append(element("span", "modern-appearance-preview-label", "Prompt"), element("div", "modern-appearance-preview-line"), element("div", "modern-appearance-preview-line short"), element("span", "modern-appearance-preview-button", "Generate"));
        previewSection.append(element("h3", "", "Preview"), previewCard);
        body.appendChild(previewSection);
        makeField("accent", body);
        buildColors(body);
        for (const key of ["panelOpacity", "shadow", "radius", "font"]) makeField(key, body);
        const background = element("section", "modern-appearance-background");
        background.append(element("h3", "", "Background image"), element("p", "modern-appearance-help", "PNG, JPEG or WebP, up to 8 MB and 32 megapixels. The image is stored in the extension configuration file."));
        const actions = element("div", "modern-appearance-actions");
        const uploadButton = button("modern-appearance-background-upload", "Choose image");
        const removeButton = button("modern-appearance-background-remove", "Remove image");
        actions.append(uploadButton, removeButton);
        imagePreview = element("div", "modern-appearance-image-preview");
        const image = element("img");
        image.alt = "";
        imagePreview.appendChild(image);
        imageInfo = element("p", "modern-appearance-image-info");
        background.append(actions, imagePreview, imageInfo);
        for (const key of ["backgroundDim", "backgroundBlur"]) makeField(key, background);
        body.appendChild(background);
        buildLanguage(body);
        status = element("p", "modern-appearance-status");
        status.id = "modern-appearance-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        body.appendChild(status);
        const footer = element("div", "modern-appearance-footer");
        const files = element("div", "modern-appearance-actions");
        const importButton = button("modern-appearance-import", "Import JSON");
        const exportButton = button("modern-appearance-export", "Export JSON");
        const resetButton = button("modern-appearance-reset", "Reset");
        files.append(importButton, exportButton, resetButton);
        const confirmation = element("div", "modern-appearance-actions");
        const cancelButton = button("modern-appearance-cancel", "Cancel");
        const saveButton = button("modern-appearance-save", "Save", "modern-appearance-primary");
        confirmation.append(cancelButton, saveButton);
        footer.append(files, confirmation);
        const imageFile = element("input");
        imageFile.id = "modern-appearance-image-file";
        imageFile.type = "file";
        imageFile.accept = "image/png,image/jpeg,image/webp";
        imageFile.hidden = true;
        const jsonFile = element("input");
        jsonFile.id = "modern-appearance-json-file";
        jsonFile.type = "file";
        jsonFile.accept = ".json,application/json";
        jsonFile.hidden = true;
        dialog.append(header, body, footer, imageFile, jsonFile);
        backdrop.appendChild(dialog);
        buildFontPopup();
        mount.appendChild(backdrop);
        listen(exit, "click", () => close());
        listen(cancelButton, "click", () => close());
        listen(saveButton, "click", save);
        listen(exportButton, "click", exportFile);
        listen(resetButton, "click", () => { invalidate(); clearInvalidHex(); draft = copy(DEFAULTS); preview(); setStatus("Defaults are previewed. Save to keep them."); });
        listen(removeButton, "click", () => { invalidate(); draft.backgroundImage = null; preview(); setStatus("Background image removed from the preview."); });
        listen(uploadButton, "click", () => imageFile.click());
        listen(importButton, "click", () => jsonFile.click());
        listen(imageFile, "change", () => { const file = imageFile.files[0]; imageFile.value = ""; void upload(file); });
        listen(jsonFile, "change", () => { const file = jsonFile.files[0]; jsonFile.value = ""; void importFile(file); });
        listen(backdrop, "click", event => { if (event.target === backdrop && event.button === 0) close(); });
        listen(backdrop, "keydown", event => {
            if (!opened) return;
            if (event.key === "Escape") {
                if (event.isComposing) return;
                event.preventDefault();
                event.stopPropagation();
                if (fontPopupOpen) { closeFont(true); return; }
                if (event.target === colorSearch && colorSearch.value) { colorSearch.value = ""; filterColorGroups(); return; }
                close();
                return;
            }
            if ((event.ctrlKey || event.metaKey || event.altKey) && event.key === "Enter") { event.preventDefault(); event.stopPropagation(); return; }
            if (event.key !== "Tab") return;
            const available = [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]):not([hidden]), select:not([disabled]), summary, a[href], [tabindex]:not([tabindex='-1'])")].filter(node => node.getClientRects().length && !node.hidden);
            const first = available[0];
            const last = available[available.length - 1];
            const focused = currentFocus();
            const inOrder = available.includes(focused);
            if (!first) { event.preventDefault(); dialog.focus(); }
            else if (event.shiftKey && (focused === first || !inOrder)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (focused === last || !inOrder)) { event.preventDefault(); first.focus(); }
        });
    };

    const syncLocalization = () => {
        syncLanguageControls();
        for (const [node, values] of localizations) {
            if (!node.isConnected) { localizations.delete(node); continue; }
            for (const value of values) {
                const translated = format(value.key, value.parameters);
                if (value.attribute === "title") {
                    const bridge = window.sdModernUiTooltipTitles;
                    const current = bridge && typeof bridge.get === "function" ? bridge.get(node) : node.getAttribute("title");
                    if (current !== translated) {
                        if (bridge && typeof bridge.set === "function") bridge.set(node, translated);
                        else node.setAttribute("title", translated);
                    }
                } else if (value.attribute) {
                    if (node.getAttribute(value.attribute) !== translated) node.setAttribute(value.attribute, translated);
                } else if (node.textContent !== translated) node.textContent = translated;
            }
        }
        setStatus(statusKey, statusType, statusParameters);
        filterColorGroups();
        renderFont();
        if (fontPopupOpen && !fontPositionFrame) fontPositionFrame = window.requestAnimationFrame(positionFont);
    };
    const addLauncher = (parent, id, iconOnly) => {
        let launcher = parent.querySelector(`#${id}`);
        if (launcher) { protect(launcher); launchers.add(launcher); return; }
        launcher = button(id, iconOnly ? null : "Customize appearance", "modern-appearance-launcher");
        protect(launcher);
        if (iconOnly) {
            text(launcher, "Customize appearance", "aria-label");
            launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 1.6-3.9 1.2 1.2 0 0 1 .9-2.1H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z"/><circle cx="7" cy="11" r=".8"/><circle cx="10" cy="7" r=".8"/><circle cx="15" cy="7" r=".8"/><circle cx="18" cy="11" r=".8"/></svg>';
        }
        text(launcher, "Customize appearance", "title");
        parent.appendChild(launcher);
        launchers.add(launcher);
        listen(launcher, "click", () => { void open(); });
    };
    function bind() {
        if (disposed || typeof document === "undefined") return;
        bindLanguage();
        const next = appRoot();
        const mount = next && next.nodeType === 9 ? next.body : next;
        if (!mount || !mount.appendChild) return;
        if (root !== next || !backdrop || !backdrop.isConnected) {
            close(false);
            if (backdrop) backdrop.remove();
            if (wallpaper) wallpaper.remove();
            controls.clear();
            outputs.clear();
            colorControls.clear();
            colorGroups.clear();
            languageButtons.clear();
            searchOpenStates.clear();
            colorSearchActive = false;
            colorSearch = null;
            colorEmpty = null;
            replacementBox = null;
            replacementCount = null;
            replacementPicker = null;
            replacementHex = null;
            replacementButton = null;
            replacementError = null;
            accentHex = null;
            accentError = null;
            fontButton = null;
            fontValue = null;
            fontPopup = null;
            fontOptionNodes.length = 0;
            previewData = null;
            previewDetails = null;
            root = next;
            if (next !== document) listen(next, "scroll", fontScroll, { capture: true, passive: true });
            build(mount);
        }
        protect(backdrop);
        const quick = root.querySelector("#quicksettings");
        if (quick) addLauncher(quick, "modern-appearance-quick-open", true);
        const setting = root.querySelector("#setting_sd_modern_ui_enabled");
        if (setting) {
            let row = setting.querySelector(".modern-appearance-settings-launcher");
            if (!row) { row = element("div", "modern-appearance-settings-launcher"); setting.appendChild(row); }
            addLauncher(row, "modern-appearance-settings-open", false);
        }
        const active = enabled();
        if (!active && opened) close(false);
        for (const launcher of launchers) {
            if (!launcher.isConnected) { launchers.delete(launcher); continue; }
            if (launcher.disabled !== !active) launcher.disabled = !active;
            if (launcher.getAttribute("aria-disabled") !== String(!active)) launcher.setAttribute("aria-disabled", String(!active));
        }
        syncLocalization();
        if (opened) renderControls();
        applyAppearance(opened ? draft : saved);
        for (let index = removers.length - 1; index >= 0; index--) {
            const listener = removers[index];
            if (listener.element !== document && listener.element !== window && listener.element.isConnected === false) { listener.remove(); removers.splice(index, 1); }
        }
    }
    const schedule = () => {
        if (disposed || frame) return;
        frame = window.requestAnimationFrame(() => { frame = 0; bind(); });
    };
    const load = async () => {
        try {
            const client = window.sdModernUiConfig;
            if (!client || typeof client.get !== "function" || (typeof client.available === "function" && !client.available())) throw failure("Server configuration is unavailable. Restart WebUI after updating the extension.");
            let config = client.get();
            if (!config.initialized && !config.readError && typeof client.migrateLegacy === "function") config = await client.migrateLegacy(async raw => documentFor(await normalizeSettings(validate(raw).settings, () => !disposed))) || client.get();
            if (disposed) return;
            const next = validate(config.theme).settings;
            saved = await normalizeSettings(next, () => !disposed);
            draft = copy(saved);
            if (config.readError) setStatus("The configuration file could not be read. Default appearance is active.", "error");
            else if (config.migrationPending) setStatus("Your previous browser profile could not be copied to the configuration file. Open the editor and save it.", "error");
        } catch (error) {
            if (disposed) return;
            saved = copy(DEFAULTS);
            draft = copy(DEFAULTS);
            setStatus(error.appearanceMessage || "Saved appearance could not be read. Default appearance is active.", "error");
        }
        if (!disposed) { applyAppearance(saved); schedule(); }
    };
    const destroy = () => {
        if (disposed) return;
        close(false, true);
        invalidate();
        disposed = true;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        if (observer) observer.disconnect();
        if (typeof unsubscribeLanguage === "function") unsubscribeLanguage();
        unsubscribeLanguage = null;
        languageApi = null;
        searchCatalogs = [];
        while (removers.length) removers.pop().remove();
        for (const url of [...downloadURLs]) releaseURL(url);
        for (const launcher of launchers) launcher.remove();
        if (backdrop) backdrop.remove();
        if (wallpaper) wallpaper.remove();
        if (typeof document !== "undefined") {
            for (const name of USER_PROPERTIES) updateProperty(name, undefined);
            for (const [name, present] of Object.entries(originalClasses)) document.documentElement.classList.toggle(name, present);
        }
        localizations.clear();
        launchers.clear();
        languageButtons.clear();
        saveLockedControls.clear();
    };

    const api = { open, close, get: () => ({ saved: copy(saved), draft: copy(draft), open: opened, busy, status: statusKey, invalidColors: [...invalidColors.keys(), ...(invalidAccent !== null ? ["accent"] : [])] }), validate, defaults: () => copy(DEFAULTS), colors: () => ({ groups: COLOR_MANIFEST.groups.map(group => ({ ...group })), roles: COLOR_MANIFEST.roles.map(role => ({ ...role })) }), destroy, ready };
    window.sdModernUiAppearance = api;
    if (typeof document === "undefined") return;
    ready = load();
    api.ready = ready;
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    listen(document, "pointerdown", fontOutside, { capture: true, passive: true });
    listen(document, "focusin", fontOutside, true);
    listen(document, "scroll", fontScroll, { capture: true, passive: true });
    listen(window, "scroll", fontScroll, { capture: true, passive: true });
    listen(window, "resize", viewportChanged);
    if (window.visualViewport) {
        listen(window.visualViewport, "resize", viewportChanged);
        listen(window.visualViewport, "scroll", viewportChanged);
    }
    if (typeof onUiLoaded === "function") onUiLoaded(schedule);
    if (typeof onUiUpdate === "function") onUiUpdate(schedule);
    if (typeof onOptionsChanged === "function") onOptionsChanged(schedule);
    if (document.readyState === "loading") listen(document, "DOMContentLoaded", schedule, { once: true });
    else schedule();
})();
