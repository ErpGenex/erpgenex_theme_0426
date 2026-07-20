# Copyright (c) 2026, Omnexa and contributors
# License: MIT. See license.txt

app_name = "erpgenex_theme_0426"
app_title = "ERPGenEx Theme 0426"
app_publisher = "ErpGenEx"
app_description = "Enterprise Desk theme (ERPGenEx 0426) with optional business-theme-inspired polish."
app_email = "dev@erpgenex.com"
app_license = "mit"

# desk_theme_loader injects CSS + erpgenex_theme_0426.js only when site_config does NOT set
# disable_omnexa_desk_theme. Do not use app_include_css here — it would load ERPGenEx styles even
# when the runtime is disabled, so "Frappe default desk" would appear unchanged.
app_include_js = [
	"/assets/erpgenex_theme_0426/js/desk_theme_loader.js",
]

app_include_css = []

# Must be a list; boot.py iterates hooks.boot_session.
boot_session = [
	"erpgenex_theme_0426.boot.extend_boot_session",
]
