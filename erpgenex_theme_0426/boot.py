# Copyright (c) 2026, Omnexa and contributors
# License: MIT. See license.txt

"""Desk boot: allow disabling ERPGenEx desk theme via site_config (see hooks.py)."""

from __future__ import annotations

import frappe
from frappe.utils import cint


def extend_boot_session(bootinfo):
	# disable_omnexa_desk_theme = 1 in site_config → stock Frappe desk (no ERPGenEx CSS/JS).
	disabled = cint(frappe.conf.get("disable_omnexa_desk_theme"))
	bootinfo.omnexa_desk_theme_enabled = 0 if disabled else 1
