// Copyright (c) 2026, Omnexa and contributors
// License: MIT. See license.txt
// Desk theme runtime (ERPGenEx) — app erpgenex_theme_0426; API from omnexa_theme_manager when installed.

(function () {
	"use strict";

	const STORAGE_KEY = "erpgenex_theme_0426.user_overrides";
	const REVISION_KEY = "erpgenex_theme_0426.desk_theme_revision";
	const OVERRIDE_FORMAT = 2;
	const TOKEN_KEYS_FOR_LEGACY_DETECT = [
		"primary_color",
		"primary_contrast",
		"background_color",
		"surface_color",
		"foreground_color",
		"font_stack_for_web",
		"desk_theme_mode",
		"desk_base_font_size",
		"desk_ui_density",
		"desk_radius_scale",
	];
	const STYLE_ID = "erpgenex-theme-0426-inline";
	const BUSINESS_V14_CSS_ID = "erpgenex-business-theme-v14-css";
	const MENU_ID = "erpgenex-theme-studio-entry";
	const TOOLBAR_BTN_ID = "erpgenex-theme-toolbar-btn";

	/** Last payload from get_desk_theme_payload (updated on boot + refresh). */
	let latestMessage = null;

	function root() {
		return document.documentElement;
	}

	function safeParse(jsonText, fallback) {
		try {
			return JSON.parse(jsonText);
		} catch (e) {
			return fallback;
		}
	}

	function hasLegacyOverrideShape(obj) {
		if (!obj || typeof obj !== "object" || obj.v === OVERRIDE_FORMAT) return false;
		return TOKEN_KEYS_FOR_LEGACY_DETECT.some((k) =>
			Object.prototype.hasOwnProperty.call(obj, k)
		);
	}

	/**
	 * Personal Theme Studio colours are stored with the server desk_theme_revision they belonged to.
	 * If the active company theme row changes, revision changes and old tweaks are ignored (no more “stuck” look).
	 */
	function parseStoredOverrides() {
		const parsed = safeParse(localStorage.getItem(STORAGE_KEY) || "{}", null);
		if (!parsed || typeof parsed !== "object") {
			return { tokens: {}, baseRevision: "" };
		}
		if (parsed.v === OVERRIDE_FORMAT && parsed.tokens && typeof parsed.tokens === "object") {
			return { tokens: parsed.tokens, baseRevision: (parsed.baseRevision || "").trim() };
		}
		if (hasLegacyOverrideShape(parsed)) {
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch (e) {
				/* ignore */
			}
			return { tokens: {}, baseRevision: "" };
		}
		return { tokens: {}, baseRevision: "" };
	}

	function readLocalOverrides() {
		return parseStoredOverrides().tokens;
	}

	function writeLocalOverrides(data) {
		const rev =
			(latestMessage &&
				latestMessage.theme &&
				latestMessage.theme.desk_theme_revision) ||
			"";
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				v: OVERRIDE_FORMAT,
				baseRevision: rev,
				tokens: data || {},
			})
		);
	}

	function cssEscapeFontStack(value) {
		const v = (value || "").trim();
		if (!v) return '"Inter", "Segoe UI", Arial, sans-serif';
		return v.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
	}

	/**
	 * Apply token CSS. Must set derived vars (--egx-muted, shadows, etc.) so the whole desk
	 * updates, not only primary/background (static erpgenex_theme_0426.css defaults would otherwise "stick").
	 */
	function docToThemePayload(doc) {
		if (!doc) return { tokens: {} };
		return {
			// In Experience Tenant Theme form, preset field is `theme_preset`
			preset: doc.theme_preset || doc.preset || "erpgenex_theme_0426",
			tokens: {
				primary_color: doc.primary_color,
				primary_contrast: doc.primary_contrast,
				background_color: doc.background_color,
				surface_color: doc.surface_color,
				foreground_color: doc.foreground_color,
				font_stack_for_web: doc.font_stack_for_web,
				desk_theme_mode: doc.desk_theme_mode,
				desk_base_font_size: doc.desk_base_font_size,
				desk_ui_density: doc.desk_ui_density,
				desk_radius_scale: doc.desk_radius_scale,
				logo_url: doc.logo || doc.logo_url || "",
			},
		};
	}

	function ensureBusinessThemeV14Layer(preset) {
		const should = preset === "business_theme_v14";
		let link = document.getElementById(BUSINESS_V14_CSS_ID);
		if (should) {
			if (!link) {
				link = document.createElement("link");
				link.id = BUSINESS_V14_CSS_ID;
				link.rel = "stylesheet";
				link.href = "/assets/erpgenex_theme_0426/css/business_theme_v14_port.css";
				document.head.appendChild(link);
			}
		} else if (link && link.parentNode) {
			link.parentNode.removeChild(link);
		}
	}

	function injectStyle(payload) {
		const id = STYLE_ID;
		let style = document.getElementById(id);
		if (!style) {
			style = document.createElement("style");
			style.id = id;
		}
		const tokens = payload.tokens || {};
		ensureBusinessThemeV14Layer(payload && payload.preset);
		const primary = tokens.primary_color || "#2563eb";
		const contrast = tokens.primary_contrast || "#ffffff";
		const bg = tokens.background_color || "#f3f7fb";
		const surface = tokens.surface_color || "#ffffff";
		const fg = tokens.foreground_color || "#0f172a";
		const font = cssEscapeFontStack(tokens.font_stack_for_web);
		const fs = tokens.desk_base_font_size || "16px";
		const mode = resolveThemeMode(tokens.desk_theme_mode || "auto");
		root().setAttribute("data-egx-density", tokens.desk_ui_density || "comfortable");
		root().setAttribute("data-egx-radius", tokens.desk_radius_scale || "soft");
		root().setAttribute("data-egx-theme", mode);

		let css = `
			:root, html {
				/* business_theme_v14 variables (used by the ported stylesheet) */
				--primary-color: ${primary};
				--secondary-color: color-mix(in srgb, ${primary} 60%, #7574ff);
				--background-color: color-mix(in srgb, ${fg} 42%, #000);
				--egx-primary: ${primary};
				--egx-primary-contrast: ${contrast};
				--egx-bg: ${bg};
				--egx-surface: ${surface};
				--egx-surface-alt: color-mix(in srgb, ${surface} 82%, ${bg});
				--egx-fg: ${fg};
				--egx-muted: color-mix(in srgb, ${fg} 42%, #64748b);
				--egx-border: color-mix(in srgb, ${fg} 10%, transparent);
				--egx-shadow-sm: 0 8px 24px color-mix(in srgb, ${fg} 8%, transparent);
				--egx-shadow-md: 0 14px 34px color-mix(in srgb, ${fg} 11%, transparent);
				--egx-focus: 0 0 0 3px color-mix(in srgb, ${primary} 22%, transparent);
				--egx-font-sans: ${font};
				--egx-font-size: ${fs};
			}`;
		/* erpgenex_theme_0426.css uses html[data-egx-theme="dark"] with higher specificity than :root — override with tenant tokens. */
		if (mode === "dark") {
			css += `
			html[data-egx-theme="dark"] {
				--primary-color: ${primary};
				--secondary-color: color-mix(in srgb, ${primary} 62%, #7574ff);
				--background-color: color-mix(in srgb, ${fg} 55%, #000);
				--egx-primary: ${primary};
				--egx-primary-contrast: ${contrast};
				--egx-bg: ${bg};
				--egx-surface: ${surface};
				--egx-surface-alt: color-mix(in srgb, ${surface} 78%, ${bg});
				--egx-fg: ${fg};
				--egx-muted: color-mix(in srgb, ${fg} 38%, #94a3b8);
				--egx-border: color-mix(in srgb, ${fg} 16%, transparent);
				--egx-shadow-sm: 0 10px 30px color-mix(in srgb, ${fg} 20%, transparent);
				--egx-shadow-md: 0 16px 40px color-mix(in srgb, ${fg} 26%, transparent);
				--egx-focus: 0 0 0 3px color-mix(in srgb, ${primary} 28%, transparent);
				--egx-font-sans: ${font};
				--egx-font-size: ${fs};
			}`;
		}
		/* Stronger visible cue when tenant colours change (navbar + sidebar accent). */
		css += `
			.navbar {
				border-bottom: 3px solid color-mix(in srgb, ${primary} 42%, transparent) !important;
			}
			.navbar .navbar-nav .nav-link.active,
			.navbar .navbar-nav .nav-link:focus-visible {
				color: ${primary} !important;
			}
			.desk-sidebar .sidebar-item-container.is-active .sidebar-item svg,
			.standard-sidebar .sidebar-item-container.is-active svg {
				color: ${primary};
			}
			.desk-sidebar .sidebar-item-container.is-active .sidebar-item-label,
			.standard-sidebar .sidebar-item-container.is-active .sidebar-item-label {
				color: ${primary};
				font-weight: 600;
			}`;
		style.textContent = css;
		if (!style.parentNode) {
			document.head.appendChild(style);
		}
	}

	function resolveThemeMode(mode) {
		if (mode === "light" || mode === "dark") return mode;
		return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}

	function withOverrides(serverPayload) {
		const payload = JSON.parse(JSON.stringify(serverPayload || {}));
		payload.tokens = payload.tokens || {};
		const rev = (payload.desk_theme_revision || "").trim();
		const stored = parseStoredOverrides();
		if (
			!rev ||
			!stored.tokens ||
			!Object.keys(stored.tokens).length ||
			stored.baseRevision !== rev
		) {
			return payload;
		}
		Object.assign(payload.tokens, stored.tokens);
		return payload;
	}

	/** Drop bundled localStorage overrides when session sees a new desk revision (same-tab switches). */
	function invalidateStaleLocalOverrides(themePayload) {
		if (!themePayload || typeof themePayload !== "object") return;
		const rev = themePayload.desk_theme_revision || "";
		if (!rev) return;
		const prev = sessionStorage.getItem(REVISION_KEY);
		if (prev && prev !== rev) {
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch (e) {
				/* ignore */
			}
		}
		sessionStorage.setItem(REVISION_KEY, rev);
	}

	function themeFields(theme, presets) {
		return [
			{
				fieldname: "preset",
				fieldtype: "Select",
				label: __("Preset"),
				options: Object.keys(presets || {}).join("\n"),
				default: theme.preset || "erpgenex_theme_0426",
			},
			{ fieldname: "primary_color", fieldtype: "Color", label: __("Primary"), default: theme.tokens.primary_color },
			{ fieldname: "primary_contrast", fieldtype: "Color", label: __("Primary contrast"), default: theme.tokens.primary_contrast },
			{ fieldname: "background_color", fieldtype: "Color", label: __("Background"), default: theme.tokens.background_color },
			{ fieldname: "surface_color", fieldtype: "Color", label: __("Surface"), default: theme.tokens.surface_color },
			{ fieldname: "foreground_color", fieldtype: "Color", label: __("Foreground"), default: theme.tokens.foreground_color },
			{
				fieldname: "font_stack_for_web",
				fieldtype: "Data",
				label: __("Font stack"),
				default: theme.tokens.font_stack_for_web,
			},
			{
				fieldname: "desk_base_font_size",
				fieldtype: "Select",
				label: __("Base font size"),
				options: "14px\n15px\n16px\n17px\n18px",
				default: theme.tokens.desk_base_font_size,
			},
			{
				fieldname: "desk_ui_density",
				fieldtype: "Select",
				label: __("Density"),
				options: "compact\ncomfortable\nspacious",
				default: theme.tokens.desk_ui_density,
			},
			{
				fieldname: "desk_radius_scale",
				fieldtype: "Select",
				label: __("Corner style"),
				options: "classic\nsoft\nrounded",
				default: theme.tokens.desk_radius_scale,
			},
			{
				fieldname: "desk_theme_mode",
				fieldtype: "Select",
				label: __("Theme mode"),
				options: "auto\nlight\ndark",
				default: theme.tokens.desk_theme_mode,
			},
		];
	}

	function presetTokens(presetName, presets, fallback) {
		const preset = (presets || {})[presetName] || {};
		return Object.assign({}, fallback || {}, preset);
	}

	function openThemeStudio() {
		if (!latestMessage || !latestMessage.theme) return;
		const theme = withOverrides(latestMessage.theme || {});
		const presets = latestMessage.presets || {};
		const dialog = new frappe.ui.Dialog({
			title: __("ERPGenEx Desk Theme Studio"),
			size: "large",
			fields: themeFields(theme, presets),
			primary_action_label: __("Apply"),
			primary_action(values) {
				const merged = Object.assign({}, values);
				delete merged.preset;
				writeLocalOverrides(merged);
				injectStyle(withOverrides(latestMessage.theme || {}));
				dialog.hide();
				frappe.show_alert({ message: __("Theme applied for your user session"), indicator: "green" });
			},
			secondary_action_label: __("Reset"),
			secondary_action() {
				localStorage.removeItem(STORAGE_KEY);
				injectStyle(latestMessage.theme || {});
				dialog.hide();
				frappe.show_alert({ message: __("Theme reset to company default"), indicator: "orange" });
			},
		});

		const syncPreset = () => {
			const selected = dialog.get_value("preset");
			const tokens = presetTokens(selected, presets, theme.tokens);
			[
				"primary_color",
				"primary_contrast",
				"background_color",
				"surface_color",
				"foreground_color",
				"font_stack_for_web",
				"desk_base_font_size",
				"desk_ui_density",
				"desk_radius_scale",
				"desk_theme_mode",
			].forEach((fieldname) => dialog.set_value(fieldname, tokens[fieldname]));
		};
		dialog.show();
		if (dialog.fields_dict.preset && dialog.fields_dict.preset.$input) {
			dialog.fields_dict.preset.$input.on("change", syncPreset);
		}
	}

	function addThemeMenuItem() {
		if (document.getElementById(MENU_ID)) return;
		const menu = document.getElementById("toolbar-user");
		if (!menu) return;
		const presetLabel =
			(latestMessage && latestMessage.theme && latestMessage.theme.preset_label) || "ERPGenEx Theme 0426";
		const button = document.createElement("button");
		button.type = "button";
		button.id = MENU_ID;
		button.className = "btn-reset dropdown-item erpgenex-theme-menu-entry";
		button.innerHTML = `<span class="erpgenex-theme-studio-badge">${frappe.utils.escape_html(
			__("Theme") + " — " + presetLabel
		)}</span>`;
		button.addEventListener("click", () => openThemeStudio());
		menu.prepend(button);
	}

	function addThemeToolbarButton() {
		if (document.getElementById(TOOLBAR_BTN_ID)) return;
		const userLi = document.querySelector("li.dropdown-navbar-user");
		if (!userLi || !userLi.parentElement) return;
		const li = document.createElement("li");
		li.className = "nav-item dropdown-mobile d-none d-sm-flex align-items-center";
		li.setAttribute("title", __("Theme — colors, font, light/dark (click or Alt+Shift+T)"));
		const btn = document.createElement("button");
		btn.id = TOOLBAR_BTN_ID;
		btn.type = "button";
		btn.className = "btn-reset nav-link erpgenex-theme-toolbar-btn";
		btn.setAttribute("aria-label", __("Open theme settings"));
		btn.innerHTML =
			'<svg class="es-icon icon-sm" aria-hidden="true"><use href="#es-line-colour"></use></svg>' +
			`<span class="erpgenex-theme-toolbar-label">${frappe.utils.escape_html(__("Theme"))}</span>`;
		btn.addEventListener("click", () => openThemeStudio());
		li.appendChild(btn);
		userLi.parentElement.insertBefore(li, userLi);
	}

	function registerThemeShortcut() {
		if (!frappe.ui.keys || !frappe.ui.keys.add_shortcut) return;
		frappe.ui.keys.add_shortcut({
			shortcut: "alt+shift+t",
			action() {
				openThemeStudio();
			},
			description: __("Theme & appearance (ERPGenEx)"),
			ignore_inputs: true,
		});
	}

	function addThemeMenuItemWhenReady(tries) {
		if (document.getElementById(MENU_ID)) return;
		if (document.getElementById("toolbar-user")) {
			addThemeMenuItem();
			return;
		}
		if ((tries || 0) > 40) return;
		setTimeout(() => addThemeMenuItemWhenReady((tries || 0) + 1), 250);
	}

	function addThemeToolbarWhenReady(tries) {
		if (document.getElementById(TOOLBAR_BTN_ID)) return;
		if (document.querySelector("li.dropdown-navbar-user")) {
			addThemeToolbarButton();
			return;
		}
		if ((tries || 0) > 40) return;
		setTimeout(() => addThemeToolbarWhenReady((tries || 0) + 1), 250);
	}

	function applyDeskThemePayload(message, opts) {
		if (!message || !message.theme) return;
		latestMessage = message;
		invalidateStaleLocalOverrides(message.theme);
		const usePersonal = !(opts && opts.serverOnly === true);
		const themePayload = usePersonal ? withOverrides(message.theme) : message.theme;
		injectStyle(themePayload);
	}

	function clearPersonalThemeOverrides() {
		try {
			localStorage.removeItem(STORAGE_KEY);
			sessionStorage.removeItem(REVISION_KEY);
		} catch (e) {
			/* ignore */
		}
	}

	async function refreshFromServer(opts) {
		const args = {};
		if (opts && opts.company) {
			args.company = opts.company;
		}
		if (opts && opts.prefer_theme) {
			args.prefer_theme = opts.prefer_theme;
		}
		const response = await frappe.call({
			method: "omnexa_theme_manager.desk_theme.get_desk_theme_payload",
			args,
			freeze: false,
		});
		applyDeskThemePayload(response.message || {}, { serverOnly: true });
	}

	function previewDeskFromDoc(doc) {
		if (!frappe.session || frappe.session.user === "Guest") return;
		if (typeof frappe !== "undefined" && frappe.boot && frappe.boot.omnexa_desk_theme_enabled === 0) return;
		injectStyle(docToThemePayload(doc));
	}

	async function bootTheme() {
		if (!frappe.session || frappe.session.user === "Guest") return;
		const response = await frappe.call({
			method: "omnexa_theme_manager.desk_theme.get_desk_theme_payload",
			freeze: false,
		});
		applyDeskThemePayload(response.message || {});
		if (!latestMessage || !latestMessage.theme) return;
		addThemeToolbarWhenReady(0);
		addThemeMenuItemWhenReady(0);
		registerThemeShortcut();
		window.erpgenexTheme0426 = Object.assign(window.erpgenexTheme0426 || {}, {
			openStudio: () => openThemeStudio(),
			clearPersonalThemeOverrides,
			previewDeskFromDoc,
			reset: () => {
				clearPersonalThemeOverrides();
				if (latestMessage && latestMessage.theme) {
					injectStyle(latestMessage.theme);
				}
			},
			refreshFromServer,
		});
	}

	frappe.ready(() => {
		if (typeof frappe !== "undefined" && frappe.boot && frappe.boot.omnexa_desk_theme_enabled === 0) {
			return;
		}
		window.erpgenexTheme0426 = Object.assign(window.erpgenexTheme0426 || {}, {
			previewDeskFromDoc,
		});
		bootTheme();
		if (window.matchMedia) {
			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
				const current = readLocalOverrides();
				if (!current.desk_theme_mode || current.desk_theme_mode === "auto") {
					const inline = document.getElementById(STYLE_ID);
					if (inline) {
						root().setAttribute("data-egx-theme", resolveThemeMode("auto"));
					}
				}
			});
		}
	});
})();
