frappe.pages["th-executive-dashboard"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({ parent: wrapper, title: __("th-executive-dashboard"), single_column: true });
	frappe.call({ method: "erpgenex_theme_0426.th_global_benchmark.get_global_th_score", callback(r) {
		const s = r.message || {};
		$(page.body).html(`<div class="p-4"><h4>Score: <b>${s.weighted_score||0}</b></h4><p>${s.gaps_closed||0} / ${s.gaps_total||48}</p></div>`);
	}});
};
