#!/usr/bin/env python3
"""Audit company/branch scoping — erpgenex_theme_0426."""
from __future__ import annotations

import frappe

from omnexa_core.omnexa_core.session_scope import resolve_effective_branch, resolve_effective_company


def run():
	company = resolve_effective_company()
	branch = resolve_effective_branch(company)
	return {"ok": True, "app": "erpgenex_theme_0426", "company": company, "branch": branch, "uses_session_context": bool(company)}
