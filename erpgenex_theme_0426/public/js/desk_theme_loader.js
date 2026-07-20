// Copyright (c) 2026, Omnexa and contributors
// License: MIT. See license.txt
// Loads ERPGenEx desk theme assets only when site_config disable_omnexa_desk_theme is not set.

(function () {
	"use strict";

	const BASE = "/assets/erpgenex_theme_0426/";
	const CSS_MAIN_ID = "erpgenex-theme-0426-css";
	const CSS_INSPIRED_ID = "erpgenex-business-theme-inspired-css";

	function shouldLoad() {
		if (typeof frappe === "undefined" || !frappe.boot) {
			return true;
		}
		if (frappe.boot.omnexa_desk_theme_enabled === 0) {
			return false;
		}
		return true;
	}

	function inject() {
		if (!shouldLoad()) {
			return;
		}
		if (!document.getElementById(CSS_MAIN_ID)) {
			const link = document.createElement("link");
			link.id = CSS_MAIN_ID;
			link.rel = "stylesheet";
			link.href = BASE + "css/erpgenex_theme_0426.css";
			document.head.appendChild(link);
		}
		if (!document.getElementById(CSS_INSPIRED_ID)) {
			const link2 = document.createElement("link");
			link2.id = CSS_INSPIRED_ID;
			link2.rel = "stylesheet";
			link2.href = BASE + "css/business_theme_inspired.css";
			document.head.appendChild(link2);
		}
		const script = document.createElement("script");
		script.src = BASE + "js/erpgenex_theme_0426.js";
		/* No async: async loads complete after Desk boot, so save/activate can run before window.erpgenexTheme0426 exists. */
		document.head.appendChild(script);
	}

	if (typeof frappe !== "undefined" && frappe.ready) {
		frappe.ready(inject);
	} else {
		inject();
	}
})();
