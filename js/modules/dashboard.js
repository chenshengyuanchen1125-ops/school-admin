/**
 * Executive Dashboard Module
 * 儀表板總覽、KPI 指標、今日排代與快捷操作模組
 */

const DashboardModule = {
  init() {
    this.render();
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const teachers = await window.appDB.getAllTeachers();
    const allSlots = await window.appDB.getAllTimetableSlots();
    const records = await window.appDB.getAllSubstituteRecords();
    const plans = await window.appDB.getAllBudgetPlans();
    const schoolConfig = await window.appDB.getConfig('schoolInfo') || {
      schoolName: '新北市新林國民小學',
      academicYear: '114學年度第2學期',
      currentMonth: '2026-06'
    };

    const insideTeachers = teachers.filter(t => t.type === 'INSIDE');
    const externalTeachers = teachers.filter(t => t.type === 'EXTERNAL');
    const retiredTeachers = teachers.filter(t => t.type === 'RETIRED');

    const totalHourlySub = records.filter(r => r.substituteType === 'HOURLY').length;
    const totalDailySub = records.filter(r => r.substituteType === 'DAILY').length;
    const totalSubGross = records.reduce((sum, r) => sum + (r.rate || 0) + (r.tutorAllowance || 0), 0);

    let weeklyOvertimeSum = 0;
    insideTeachers.forEach(t => {
      const slots = allSlots.filter(s => s.teacherId === t.id);
      const netBase = Math.max(0, (t.basePeriods || 0) - (t.reductionPeriods || 0));
      weeklyOvertimeSum += Math.max(0, slots.length - netBase);
    });

    const monthEstOvertime = weeklyOvertimeSum * 4 * (schoolConfig.hourlyRateDefault || 405);
    const monthTotalEst = monthEstOvertime + totalSubGross;

    const recentRecords = records.slice(-6).reverse();

    container.innerHTML = `
      <!-- 頂部歡迎與快捷區 -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">教學行政與鐘點代課總覽 (Executive Dashboard)</h2>
          <p class="text-xs text-muted mt-1">目前學期：<span class="font-bold text-slate-800">${schoolConfig.schoolName} ${schoolConfig.academicYear}</span> (本機即時自動存檔中)</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="window.app.navigate('user-guide')">
            <span>📖 操作說明書</span>
          </button>
          <button class="btn btn-emerald" onclick="ExcelGeneratorModule.exportOfficialWorkbook()">
            <span>📑 匯出 6月份印領清冊 Excel</span>
          </button>
          <button class="btn btn-primary" onclick="SubstituteModule.openDispatchModal()">
            <span>⚡ 智慧排代登記</span>
          </button>
        </div>
      </div>

      <!-- KPI 數據指標卡片 (5 欄) -->
      <div class="grid grid-cols-5 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">👨‍🏫</div>
          <div class="stat-content">
            <div class="stat-label">校內編制教師</div>
            <div class="stat-value text-primary">${insideTeachers.length} <span class="text-xs text-muted">位</span></div>
            <div class="stat-meta">導師/主任/組長/科任</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon emerald">👥</div>
          <div class="stat-content">
            <div class="stat-label">外聘與退休人才庫</div>
            <div class="stat-value text-emerald">${externalTeachers.length + retiredTeachers.length} <span class="text-xs text-muted">位</span></div>
            <div class="stat-meta">常備兼任與代課名冊</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon sky">📅</div>
          <div class="stat-content">
            <div class="stat-label">全校每週課表總節數</div>
            <div class="stat-value text-sky">${allSlots.length} <span class="text-xs text-muted">節</span></div>
            <div class="stat-meta">常態超鐘點 +${weeklyOvertimeSum} 節/週</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon amber">📝</div>
          <div class="stat-content">
            <div class="stat-label">本月排代登記</div>
            <div class="stat-value text-amber">${totalHourlySub} <span class="text-xs text-muted">節 / ${totalDailySub}天日薪</span></div>
            <div class="stat-meta">公假/病假/身心調適假</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rose">💰</div>
          <div class="stat-content">
            <div class="stat-label">本月鐘點費預估總額</div>
            <div class="stat-value text-rose font-bold">$${monthTotalEst.toLocaleString()}</div>
            <div class="stat-meta">超節 + 代課 + 日薪加給</div>
          </div>
        </div>
      </div>

      <!-- 快捷任務卡片 (12 欄) -->
      <div class="grid grid-cols-12 gap-4 mb-4">
        <!-- 左側：教學組長核心日常操作 (佔 5 欄) -->
        <div style="grid-column: span 5;" class="card">
          <div class="card-header">
            <div class="card-title">🚀 教學組長常用核心快捷入口</div>
          </div>
          <div class="card-body flex flex-col gap-2">
            <button class="btn btn-primary justify-between w-full text-left" onclick="SubstituteModule.openDispatchModal()">
              <span class="flex items-center gap-2"><span>⚡</span> <span>智慧排代登記 (即時空堂推薦)</span></span>
              <span>➕</span>
            </button>
            <button class="btn btn-secondary justify-between w-full text-left" onclick="TimetableModule.openSwapModal()">
              <span class="flex items-center gap-2"><span>🔄</span> <span>課務調課 / 互調作業工具</span></span>
              <span>➡️</span>
            </button>
            <button class="btn btn-secondary justify-between w-full text-left" onclick="window.app.navigate('settlement')">
              <span class="flex items-center gap-2"><span>💵</span> <span>月末經費結算 DataGrid (扣繳微調)</span></span>
              <span>➡️</span>
            </button>
            <button class="btn btn-secondary justify-between w-full text-left" onclick="window.app.navigate('timetable')">
              <span class="flex items-center gap-2"><span>🏫</span> <span>課表管理 (全校/教師/班級視圖)</span></span>
              <span>➡️</span>
            </button>
            <button class="btn btn-secondary justify-between w-full text-left" onclick="window.app.navigate('template-manager')">
              <span class="flex items-center gap-2"><span>📥</span> <span>空白範本下載與批次建庫</span></span>
              <span>➡️</span>
            </button>
          </div>
        </div>

        <!-- 右側：經費計畫概況與即時狀態 (佔 7 欄) -->
        <div style="grid-column: span 7;" class="card">
          <div class="card-header">
            <div class="card-title">💳 經費計畫執行進度與憑證編號</div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('budget-plans')">計畫設定</button>
          </div>
          <div class="card-body" style="padding: 12px 16px;">
            <div class="grid grid-cols-3 gap-2">
              ${plans.map(p => {
                const count = records.filter(r => r.budgetPlanId === p.id).length;
                return `
                  <div style="border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 10px; background: var(--slate-50);">
                    <div class="flex items-center justify-between">
                      <span class="badge badge-slate font-bold">憑證 ${p.voucherNo}</span>
                      <span class="text-xs text-primary font-semibold">$${p.defaultRate}/節</span>
                    </div>
                    <div class="font-bold text-xs text-slate-800 mt-2">${p.name}</div>
                    <div class="text-xs text-muted mt-1">本月登記：${count} 筆</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- 近期排代紀錄表格 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📝 近期請假排代動態與派代單</div>
          <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('substitute')">查看排代月曆與明細</button>
        </div>
        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="table">
            <thead>
              <tr>
                <th>代課日期</th>
                <th>節次</th>
                <th>請假原任教師</th>
                <th>假別</th>
                <th>事由 / 公文依據</th>
                <th>代課教師</th>
                <th>型態</th>
                <th class="text-right">單價/日薪</th>
                <th class="text-right" style="width: 140px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${recentRecords.length === 0 ? `
                <tr>
                  <td colspan="9" class="text-center py-6 text-muted">目前尚無排代紀錄，請點擊上方「智慧排代登記」開始建立！</td>
                </tr>
              ` : recentRecords.map(r => `
                <tr>
                  <td class="font-bold">${r.date}</td>
                  <td>${r.substituteType === 'DAILY' ? '<span class="badge badge-emerald">全日</span>' : `第 ${r.period} 節`}</td>
                  <td class="font-bold text-slate-900">${r.absentTeacherName}</td>
                  <td><span class="badge badge-primary">${r.leaveType}</span></td>
                  <td class="text-xs text-muted" style="max-width: 240px; word-break: break-all;">${r.reasonDocument || '-'}</td>
                  <td class="font-bold text-primary">${r.substituteTeacherName}</td>
                  <td>${r.substituteType === 'DAILY' ? '<span class="badge badge-emerald">日薪</span>' : '<span class="badge badge-sky">鐘點</span>'}</td>
                  <td class="text-right font-bold">$${r.rate} ${r.tutorAllowance > 0 ? `<span class="text-xs text-emerald">(+$${r.tutorAllowance})</span>` : ''}</td>
                  <td class="text-right">
                    <button class="btn btn-secondary btn-sm" onclick="SubstituteModule.openPrintSlipModal('${r.id}')">🖨️ 派代單</button>
                    <button class="btn btn-secondary btn-sm" onclick="SubstituteModule.openDispatchModal('${r.id}')">編輯</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

window.DashboardModule = DashboardModule;
