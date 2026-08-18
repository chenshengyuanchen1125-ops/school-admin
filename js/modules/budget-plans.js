/**
 * Dynamic Budget Profile & Plan Management Module
 * 經費計畫設定與預算科目設定檔模組
 */

const BudgetPlanModule = {
  init() {
    this.render();
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const plans = await window.appDB.getAllBudgetPlans();
    const records = await window.appDB.getAllSubstituteRecords();

    // 計算每個計畫的使用次數與總金額
    const planStats = {};
    for (const p of plans) {
      const recs = records.filter(r => r.budgetPlanId === p.id);
      const count = recs.length;
      const amount = recs.reduce((sum, r) => sum + (r.rate || 0) + (r.tutorAllowance || 0), 0);
      planStats[p.id] = { count, amount };
    }

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">經費計畫與預算科目設定 (Budget Profiles)</h2>
          <p class="text-xs text-muted mt-1">動態管理鐘點費、日薪代課、專案補助之憑證編號、會計預算科目與核算單價</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" onclick="BudgetPlanModule.openEditModal()">
            <span>➕ 新增經費計畫</span>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="font-bold text-slate-800">現行經費計畫一覽表 (${plans.length} 項)</div>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 60px;">序號</th>
                <th>憑證編號</th>
                <th>計畫名稱</th>
                <th>經費類別</th>
                <th>預算科目字樣 (官方會計科目)</th>
                <th class="text-right">預設單價 (元)</th>
                <th class="text-center">本期使用筆數</th>
                <th class="text-right">本期累計金額</th>
                <th class="text-right" style="width: 130px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${plans.length === 0 ? `
                <tr>
                  <td colspan="9" class="text-center py-6 text-muted">目前無任何經費計畫</td>
                </tr>
              ` : plans.map((p, idx) => {
                const stats = planStats[p.id] || { count: 0, amount: 0 };
                const catBadge = p.category === 'OVERTIME' ? '<span class="badge badge-primary">常態超鐘點</span>' :
                                 p.category === 'HOURLY_SUB' ? '<span class="badge badge-sky">鐘點代課</span>' :
                                 p.category === 'DAILY_SUB' ? '<span class="badge badge-emerald">日薪代課</span>' :
                                 '<span class="badge badge-amber">專案補助</span>';

                return `
                  <tr>
                    <td class="text-muted">${idx + 1}</td>
                    <td><span class="badge badge-slate font-bold">${p.voucherNo || '-'}</span></td>
                    <td class="font-bold text-slate-900">${p.name}</td>
                    <td>${catBadge}</td>
                    <td class="text-xs" style="max-width: 320px; word-break: break-all;">${p.accountSubject || '-'}</td>
                    <td class="text-right font-bold text-primary">$${(p.defaultRate || 0).toLocaleString()}</td>
                    <td class="text-center"><span class="badge badge-slate">${stats.count} 筆</span></td>
                    <td class="text-right font-bold">$${stats.amount.toLocaleString()}</td>
                    <td class="text-right">
                      <button class="btn btn-secondary btn-sm" onclick="BudgetPlanModule.openEditModal('${p.id}')">編輯</button>
                      <button class="btn btn-danger btn-sm" onclick="BudgetPlanModule.deletePlan('${p.id}', '${p.name}')">刪除</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async openEditModal(planId = null) {
    let plan = {
      id: '',
      name: '',
      voucherNo: '1120',
      accountSubject: '532國民小學教育-53263624國小教育行政-124兼職人員酬金',
      defaultRate: 405,
      category: 'SPECIAL_PROJECT',
      templateLayout: 'PROJECT_STANDARD'
    };

    if (planId) {
      const existing = await window.appDB.getBudgetPlanById(planId);
      if (existing) plan = existing;
    }

    const content = `
      <form id="plan-form" onsubmit="event.preventDefault(); BudgetPlanModule.savePlan();">
        <input type="hidden" id="p-id" value="${plan.id}">

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label required">計畫名稱</label>
            <input type="text" id="p-name" class="form-control" value="${plan.name}" required placeholder="如：額滿學校減課、數位精進方案">
          </div>
          <div class="form-group">
            <label class="form-label required">憑證編號 (Voucher No.)</label>
            <input type="text" id="p-voucherNo" class="form-control font-bold" value="${plan.voucherNo}" required placeholder="如：1120, 1125">
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label required">經費類別</label>
            <select id="p-category" class="form-control">
              <option value="OVERTIME" ${plan.category === 'OVERTIME' ? 'selected' : ''}>常態兼超鐘點</option>
              <option value="HOURLY_SUB" ${plan.category === 'HOURLY_SUB' ? 'selected' : ''}>鐘點代課</option>
              <option value="DAILY_SUB" ${plan.category === 'DAILY_SUB' ? 'selected' : ''}>日薪代課</option>
              <option value="SPECIAL_PROJECT" ${plan.category === 'SPECIAL_PROJECT' ? 'selected' : ''}>專案補助超鐘點 (額滿/數位精進/本土語等)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label required">預設單價 (元)</label>
            <input type="number" id="p-defaultRate" class="form-control" value="${plan.defaultRate}" required min="0">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label required">預算科目字樣 (印領清冊抬頭)</label>
          <textarea id="p-accountSubject" class="form-control" rows="2" required placeholder="如：532國民小學教育-53263624國小教育行政-124兼職人員酬金">${plan.accountSubject}</textarea>
          <div class="form-help">將於 Excel 印領清冊抬頭完整呈現供會計主任與出納組長覆核</div>
        </div>
      </form>
    `;

    window.app.openModal(planId ? '編輯經費計畫設定' : '新增經費計畫設定', content, `
      <button class="btn btn-secondary" onclick="window.app.closeModal()">取消</button>
      <button class="btn btn-primary" onclick="BudgetPlanModule.savePlan()">儲存計畫</button>
    `);
  },

  async savePlan() {
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value.trim();
    const voucherNo = document.getElementById('p-voucherNo').value.trim();
    const category = document.getElementById('p-category').value;
    const defaultRate = parseFloat(document.getElementById('p-defaultRate').value) || 405;
    const accountSubject = document.getElementById('p-accountSubject').value.trim();

    if (!name || !voucherNo || !accountSubject) {
      window.app.showToast('請完整填寫所有必填欄位', 'error');
      return;
    }

    const planData = {
      id: id || 'BP_' + Date.now(),
      name,
      voucherNo,
      category,
      defaultRate,
      accountSubject,
      templateLayout: 'PROJECT_STANDARD'
    };

    await window.appDB.saveBudgetPlan(planData);
    window.app.closeModal();
    window.app.showToast(`經費計畫「${name}」已儲存！`, 'success');
    this.render();
  },

  async deletePlan(id, name) {
    if (confirm(`確定要刪除經費計畫「${name}」嗎？`)) {
      await window.appDB.deleteBudgetPlan(id);
      window.app.showToast(`已刪除經費計畫「${name}」`, 'info');
      this.render();
    }
  }
};

window.BudgetPlanModule = BudgetPlanModule;
