# Copyright (c) 2026, ErpGenEx
from frappe.tests.utils import FrappeTestCase
from omnexa_core.omnexa_core.infra_parity import preview_infra

class TestSapParityInfraApp(FrappeTestCase):
	def test_infra_kpi(self):
		out = preview_infra("erpgenex_theme_0426", theme_active=1)
		self.assertEqual(out["vertical"], "erpgenex_theme_0426")
