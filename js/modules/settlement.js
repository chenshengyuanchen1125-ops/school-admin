/**
 * Settlement & Budget Calculation DataGrid Engine
 * 動態經費結算、外聘教師總表、線上微調 DataGrid 與官方清冊直接列印模組
 */

const SettlementModule = {
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  currentTab: 'OVERTIME', // 'OVERTIME' | 'EXTERNAL_PAYROLL' | 'HOURLY_SUB' | 'DAILY_SUB' | 'WELLNESS' | 'PROJECTS'
  applyGradDeduction: true,
  gradCutoffDate: '2026-06-12',
  weeksInMonth: 4,

  // 永久儲存於 IndexedDB 的扣繳設定 (teacherId -> { labor, health })
  overtimeDeductions: {},
  externalDeductions: {},

  init() {
    this.loadDeductionsFromDB().then(() => {
      this.render();
    });
  },

  async loadDeductionsFromDB() {
    const saved = await window.appDB.getConfig('settlementDeductions');
    if (saved) {
      this.overtimeDeductions = saved.overtimeDeductions || {};
      this.externalDeductions = saved.externalDeductions || {};
    }
  },

  async saveDeductionsToDB() {
    await window.appDB.saveConfig('settlementDeductions', {
      overtimeDeductions: this.overtimeDeductions,
      externalDeductions: this.externalDeductions
    });
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const teachers = await window.appDB.getAllTeachers();
    const allSlots = await window.appDB.getAllTimetableSlots();
    const records = await window.appDB.getSubstituteRecordsByDateRange(this.startDate, this.endDate);
    const plans = await window.appDB.getAllBudgetPlans();
    const schoolConfig = await window.appDB.getConfig('schoolInfo') || { hourlyRateDefault: 405, dailyRateDefault: 1760, tutorAllowanceDefault: 133 };

    // 1. 計算校內教師超鐘點
    const overtimeList = [];
    for (const t of teachers.filter(tea => tea.type === 'INSIDE')) {
      const slots = allSlots.filter(s => s.teacherId === t.id);
      const weeklyActual = slots.length;
      const netBase = Math.max(0, (t.basePeriods || 0) - (t.reductionPeriods || 0));
      const weeklyOvertime = Math.max(0, weeklyActual - netBase);

      if (weeklyOvertime > 0 || (t.reductionPeriods || 0) > 0) {
        let gradDeduction = 0;
        if (this.applyGradDeduction) {
          const g6Slots = slots.filter(s => s.className && s.className.startsWith('6'));
          gradDeduction = g6Slots.length * 2; // 6/12 畢業後約扣 2 週
        }

        const baseMonthPeriods = weeklyOvertime * this.weeksInMonth;
        const totalPayablePeriods = Math.max(0, baseMonthPeriods - gradDeduction);
        const rate = schoolConfig.hourlyRateDefault || 405;
        const grossAmount = totalPayablePeriods * rate;

        const deductions = this.overtimeDeductions[t.id] || { labor: 0, health: 0 };
        const netAmount = Math.max(0, grossAmount - deductions.labor - deductions.health);

        overtimeList.push({
          teacher: t,
          weeklyActual,
          netBase,
          weeklyOvertime,
          baseMonthPeriods,
          gradDeduction,
          totalPayablePeriods,
          rate,
          grossAmount,
          labor: deductions.labor,
          health: deductions.health,
          netAmount
        });
      }
    }

    // 2. 外聘與退休教師代課彙總清冊
    const externalTeachers = teachers.filter(t => t.type === 'EXTERNAL' || t.type === 'RETIRED');
    const externalPayrollList = [];

    externalTeachers.forEach(t => {
      const teacherRecords = records.filter(r => r.substituteTeacherName === t.name || r.substituteTeacherId === t.id);
      if (teacherRecords.length > 0) {
        const hourlyPeriods = teacherRecords.filter(r => r.substituteType === 'HOURLY').length;
        const dailyDays = teacherRecords.filter(r => r.substituteType === 'DAILY').length;
        const hourlyGross = teacherRecords.filter(r => r.substituteType === 'HOURLY').reduce((sum, r) => sum + (r.rate || 405), 0);
        const dailyGross = teacherRecords.filter(r => r.substituteType === 'DAILY').reduce((sum, r) => sum + (r.rate || 1760) + (r.tutorAllowance || 0), 0);
        const totalGross = hourlyGross + dailyGross;

        const deductions = this.externalDeductions[t.id] || { labor: 0, health: 0 };
        const totalNet = Math.max(0, totalGross - deductions.labor - deductions.health);

        externalPayrollList.push({
          teacher: t,
          hourlyPeriods,
          dailyDays,
          hourlyGross,
          dailyGross,
          totalGross,
          labor: deductions.labor,
          health: deductions.health,
          totalNet,
          records: teacherRecords
        });
      }
    });

    const hourlyRecords = records.filter(r => r.substituteType === 'HOURLY' && r.leaveType !== 'WELLNESS');
    const dailyRecords = records.filter(r => r.substituteType === 'DAILY');
    const wellnessRecords = records.filter(r => r.leaveType === 'WELLNESS');

    const sumOvertimeGross = overtimeList.reduce((sum, item) => sum + item.grossAmount, 0);
    const sumHourlyGross = hourlyRecords.reduce((sum, r) => sum + (r.rate || 405), 0);
    const sumDailyGross = dailyRecords.reduce((sum, r) => sum + (r.rate || 1760) + (r.tutorAllowance || 0), 0);
    const sumWellnessGross = wellnessRecords.reduce((sum, r) => sum + (r.rate || 405), 0);

    const grandGross = sumOvertimeGross + sumHourlyGross + sumDailyGross + sumWellnessGross;
    const grandLabor = overtimeList.reduce((sum, i) => sum + i.labor, 0) + externalPayrollList.reduce((sum, ep) => sum + ep.labor, 0);
    const grandHealth = overtimeList.reduce((sum, i) => sum + i.health, 0) + externalPayrollList.reduce((sum, ep) => sum + ep.health, 0);
    const grandNet = grandGross - grandLabor - grandHealth;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">動態經費核算與自付額微調 (Settlement Engine)</h2>
          <p class="text-xs text-muted mt-1">自選計費區間，線上微調勞健保扣繳，支援直接列印或匯出官方 Excel</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="window.print()">
            <span>🖨️ 直接列印本期清冊</span>
          </button>
          <button class="btn btn-emerald" onclick="ExcelGeneratorModule.exportOfficialWorkbook()">
            <span>📑 匯出官方 Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      <!-- 區間控制與規則列 -->
      <div class="card mb-4">
        <div class="card-body" style="padding: 14px 20px;">
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 12px;">
            <div class="flex items-center gap-3">
              <label class="text-xs font-bold text-slate-700">核算計費區間：</label>
              <input type="date" class="form-control form-control-sm" value="${this.startDate}" style="width: 140px;" onchange="SettlementModule.setDateRange(this.value, SettlementModule.endDate)">
              <span class="text-xs text-muted">至</span>
              <input type="date" class="form-control form-control-sm" value="${this.endDate}" style="width: 140px;" onchange="SettlementModule.setDateRange(SettlementModule.startDate, this.value)">
              
              <div class="flex gap-1 ml-2">
                <button class="btn btn-secondary btn-sm" onclick="SettlementModule.setPreset('2026-06')">115年6月</button>
                <button class="btn btn-secondary btn-sm" onclick="SettlementModule.setPreset('2026-05')">115年5月</button>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" ${this.applyGradDeduction ? 'checked' : ''} onchange="SettlementModule.toggleGradDeduction(this.checked)">
                🎓 啟用六年級 (6/12畢業) 扣課計算
              </label>

              <div class="flex items-center gap-2 text-xs text-muted">
                <span>上課週數：</span>
                <input type="number" class="form-control form-control-sm" value="${this.weeksInMonth}" min="1" max="5" style="width: 60px;" onchange="SettlementModule.setWeeks(this.value)">
                <span>週</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 總額指標卡 -->
      <div class="grid grid-cols-4 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">💵</div>
          <div class="stat-content">
            <div class="stat-label">本期應付總金額 (Gross)</div>
            <div class="stat-value text-primary">$${grandGross.toLocaleString()}</div>
            <div class="stat-meta">含校內超節與外聘代課</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rose">🛡️</div>
          <div class="stat-content">
            <div class="stat-label">勞保自付額扣繳總額</div>
            <div class="stat-value text-rose">-$${grandLabor.toLocaleString()}</div>
            <div class="stat-meta">即時自動存檔至本機</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">🏥</div>
          <div class="stat-content">
            <div class="stat-label">二代健保/補充保費扣繳</div>
            <div class="stat-value text-amber">-$${grandHealth.toLocaleString()}</div>
            <div class="stat-meta">兼職人員所得扣繳</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon emerald">🏦</div>
          <div class="stat-content">
            <div class="stat-label">本期實付總金額 (Net)</div>
            <div class="stat-value text-emerald font-bold">$${grandNet.toLocaleString()}</div>
            <div class="stat-meta">銀行撥款總淨額</div>
          </div>
        </div>
      </div>

      <!-- 核算清冊切換 DataGrid -->
      <div class="card">
        <div class="card-header">
          <div class="tab-group" style="margin-bottom: 0; border-bottom: none;">
            <button class="tab-btn ${this.currentTab === 'OVERTIME' ? 'active' : ''}" onclick="SettlementModule.setTab('OVERTIME')">
              1. 校內超鐘點總表 (${overtimeList.length} 人)
            </button>
            <button class="tab-btn ${this.currentTab === 'EXTERNAL_PAYROLL' ? 'active' : ''}" onclick="SettlementModule.setTab('EXTERNAL_PAYROLL')">
              2. 外聘代課教師鐘點總表 (${externalPayrollList.length} 人)
            </button>
            <button class="tab-btn ${this.currentTab === 'HOURLY_SUB' ? 'active' : ''}" onclick="SettlementModule.setTab('HOURLY_SUB')">
              3. 代課(鐘點明細) (${hourlyRecords.length} 筆)
            </button>
            <button class="tab-btn ${this.currentTab === 'DAILY_SUB' ? 'active' : ''}" onclick="SettlementModule.setTab('DAILY_SUB')">
              4. 代課(日薪明細) (${dailyRecords.length} 筆)
            </button>
            <button class="tab-btn ${this.currentTab === 'WELLNESS' ? 'active' : ''}" onclick="SettlementModule.setTab('WELLNESS')">
              5. 身心調適假 (${wellnessRecords.length} 筆)
            </button>
            <button class="tab-btn ${this.currentTab === 'PROJECTS' ? 'active' : ''}" onclick="SettlementModule.setTab('PROJECTS')">
              6. 各專案減課超鐘點
            </button>
          </div>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          ${this.currentTab === 'OVERTIME' ? this.renderOvertimeGrid(overtimeList) :
            this.currentTab === 'EXTERNAL_PAYROLL' ? this.renderExternalPayrollGrid(externalPayrollList) :
            this.currentTab === 'HOURLY_SUB' ? this.renderHourlyGrid(hourlyRecords) :
            this.currentTab === 'DAILY_SUB' ? this.renderDailyGrid(dailyRecords) :
            this.currentTab === 'WELLNESS' ? this.renderWellnessGrid(wellnessRecords) :
            this.renderProjectsGrid(teachers, allSlots)}
        </div>
      </div>
    `;
  },

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  setDateRange(start, end) {
    this.startDate = start;
    this.endDate = end;
    this.render();
  },

  setPreset(month) {
    if (month === '2026-06') {
      this.startDate = '2026-06-01';
      this.endDate = '2026-06-30';
    } else if (month === '2026-05') {
      this.startDate = '2026-05-01';
      this.endDate = '2026-05-31';
    }
    this.render();
  },

  toggleGradDeduction(val) {
    this.applyGradDeduction = val;
    this.render();
  },

  setWeeks(w) {
    this.weeksInMonth = parseInt(w, 10) || 4;
    this.render();
  },

  // 1. 校內超鐘點 DataGrid
  renderOvertimeGrid(list) {
    const sumGross = list.reduce((sum, i) => sum + i.grossAmount, 0);
    const sumLabor = list.reduce((sum, i) => sum + i.labor, 0);
    const sumHealth = list.reduce((sum, i) => sum + i.health, 0);
    const sumNet = list.reduce((sum, i) => sum + i.netAmount, 0);
    const sumPeriods = list.reduce((sum, i) => sum + i.totalPayablePeriods, 0);

    return `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">序號</th>
            <th>教師姓名</th>
            <th>職稱</th>
            <th class="text-center">應授節數</th>
            <th class="text-center">每週排課</th>
            <th class="text-center">每週超節</th>
            <th class="text-center">全月基數 (${this.weeksInMonth}週)</th>
            <th class="text-center">畢業扣節</th>
            <th class="text-center">實計節數</th>
            <th class="text-right">單價</th>
            <th class="text-right">應發金額</th>
            <th class="text-right" style="width: 110px;">勞保自付額 (即時存)</th>
            <th class="text-right" style="width: 110px;">二代健保 (即時存)</th>
            <th class="text-right">實領金額</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((item, idx) => `
            <tr>
              <td class="text-muted">${idx + 1}</td>
              <td class="font-bold">${item.teacher.name}</td>
              <td class="text-xs text-muted">${item.teacher.title === 'HOMEROOM' ? '導師' : item.teacher.title === 'LEADER' ? '組長' : '科任'}</td>
              <td class="text-center">${item.netBase}</td>
              <td class="text-center font-bold">${item.weeklyActual}</td>
              <td class="text-center font-bold text-rose">+${item.weeklyOvertime}</td>
              <td class="text-center">${item.baseMonthPeriods}</td>
              <td class="text-center text-rose">${item.gradDeduction > 0 ? `-${item.gradDeduction}` : '0'}</td>
              <td class="text-center font-bold text-primary">${item.totalPayablePeriods}</td>
              <td class="text-right">$${item.rate}</td>
              <td class="text-right font-bold">$${item.grossAmount.toLocaleString()}</td>
              <td class="text-right">
                <input type="number" class="editable-cell" value="${item.labor}" min="0"
                       oninput="SettlementModule.updateOvertimeDeduction('${item.teacher.id}', 'labor', this.value)">
              </td>
              <td class="text-right">
                <input type="number" class="editable-cell" value="${item.health}" min="0"
                       oninput="SettlementModule.updateOvertimeDeduction('${item.teacher.id}', 'health', this.value)">
              </td>
              <td class="text-right font-bold text-emerald">$${item.netAmount.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="table-summary-row">
            <td colspan="8" class="text-right font-bold">合計：</td>
            <td class="text-center font-bold text-primary">${sumPeriods} 節</td>
            <td></td>
            <td class="text-right font-bold">$${sumGross.toLocaleString()}</td>
            <td class="text-right font-bold text-rose">-$${sumLabor.toLocaleString()}</td>
            <td class="text-right font-bold text-amber">-$${sumHealth.toLocaleString()}</td>
            <td class="text-right font-bold text-emerald">$${sumNet.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // 2. 外聘代課教師鐘點總表
  renderExternalPayrollGrid(list) {
    const sumGross = list.reduce((sum, i) => sum + i.totalGross, 0);
    const sumLabor = list.reduce((sum, i) => sum + i.labor, 0);
    const sumHealth = list.reduce((sum, i) => sum + i.health, 0);
    const sumNet = list.reduce((sum, i) => sum + i.totalNet, 0);

    return `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">序號</th>
            <th>代課教師姓名</th>
            <th>身分別</th>
            <th>聯絡電話</th>
            <th class="text-center">鐘點代課總節數</th>
            <th class="text-center">全日日薪總天數</th>
            <th class="text-right">應發鐘點/日薪總額</th>
            <th class="text-right" style="width: 120px;">勞保自付額 (即時存)</th>
            <th class="text-right" style="width: 120px;">二代健保扣繳 (即時存)</th>
            <th class="text-right">實領金額 (Net)</th>
            <th>代課明細</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((item, idx) => `
            <tr>
              <td class="text-muted">${idx + 1}</td>
              <td class="font-bold text-primary">${item.teacher.name}</td>
              <td>${item.teacher.type === 'RETIRED' ? '<span class="badge badge-amber">退休兼課</span>' : '<span class="badge badge-emerald">外聘兼任</span>'}</td>
              <td class="text-xs">${item.teacher.phone || '-'}</td>
              <td class="text-center font-bold">${item.hourlyPeriods} 節</td>
              <td class="text-center font-bold">${item.dailyDays} 天</td>
              <td class="text-right font-bold text-slate-900">$${item.totalGross.toLocaleString()}</td>
              <td class="text-right">
                <input type="number" class="editable-cell" value="${item.labor}" min="0"
                       oninput="SettlementModule.updateExternalDeduction('${item.teacher.id}', 'labor', this.value)">
              </td>
              <td class="text-right">
                <input type="number" class="editable-cell" value="${item.health}" min="0"
                       oninput="SettlementModule.updateExternalDeduction('${item.teacher.id}', 'health', this.value)">
              </td>
              <td class="text-right font-bold text-emerald">$${item.totalNet.toLocaleString()}</td>
              <td class="text-xs text-muted">共代 ${item.records.length} 筆課程</td>
            </tr>
          `).join('')}
          <tr class="table-summary-row">
            <td colspan="6" class="text-right font-bold">合計 (${list.length} 位外聘/退休師資)：</td>
            <td class="text-right font-bold text-slate-900">$${sumGross.toLocaleString()}</td>
            <td class="text-right font-bold text-rose">-$${sumLabor.toLocaleString()}</td>
            <td class="text-right font-bold text-amber">-$${sumHealth.toLocaleString()}</td>
            <td class="text-right font-bold text-emerald">$${sumNet.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // 3. 鐘點代課明細 DataGrid
  renderHourlyGrid(records) {
    const sumGross = records.reduce((sum, r) => sum + (r.rate || 405), 0);
    return `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">序號</th>
            <th>代課日期</th>
            <th>節次</th>
            <th>原任教師</th>
            <th>假別 / 公文事由</th>
            <th>代課教師</th>
            <th class="text-right">鐘點單價</th>
            <th class="text-right">應發金額</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((r, idx) => `
            <tr>
              <td class="text-muted">${idx + 1}</td>
              <td>${r.date}</td>
              <td>第 ${r.period} 節</td>
              <td class="font-bold">${r.absentTeacherName}</td>
              <td><span class="badge badge-primary">${r.leaveType}</span> <span class="text-xs text-muted">${r.reasonDocument || ''}</span></td>
              <td class="font-bold text-primary">${r.substituteTeacherName}</td>
              <td class="text-right">$${r.rate || 405}</td>
              <td class="text-right font-bold">$${r.rate || 405}</td>
            </tr>
          `).join('')}
          <tr class="table-summary-row">
            <td colspan="7" class="text-right font-bold">合計 (${records.length} 節)：</td>
            <td class="text-right font-bold text-primary">$${sumGross.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // 4. 日薪代課明細 DataGrid
  renderDailyGrid(records) {
    const sumGross = records.reduce((sum, r) => sum + (r.rate || 1760) + (r.tutorAllowance || 0), 0);
    return `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">序號</th>
            <th>請假日期</th>
            <th>原任教師</th>
            <th>假別 / 事由</th>
            <th>代課教師</th>
            <th class="text-right">基本日薪</th>
            <th class="text-right">導師費加給</th>
            <th class="text-right">應發總額</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((r, idx) => {
            const gross = (r.rate || 1760) + (r.tutorAllowance || 0);
            return `
              <tr>
                <td class="text-muted">${idx + 1}</td>
                <td>${r.date}</td>
                <td class="font-bold">${r.absentTeacherName}</td>
                <td><span class="badge badge-emerald">${r.leaveType}</span> <span class="text-xs text-muted">${r.reasonDocument || ''}</span></td>
                <td class="font-bold text-primary">${r.substituteTeacherName}</td>
                <td class="text-right">$${r.rate || 1760}</td>
                <td class="text-right text-emerald">+$${r.tutorAllowance || 0}</td>
                <td class="text-right font-bold">$${gross.toLocaleString()}</td>
              </tr>
            `;
          }).join('')}
          <tr class="table-summary-row">
            <td colspan="7" class="text-right font-bold">合計 (${records.length} 天)：</td>
            <td class="text-right font-bold text-emerald">$${sumGross.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // 5. 身心調適假 DataGrid
  renderWellnessGrid(records) {
    const sumGross = records.reduce((sum, r) => sum + (r.rate || 405), 0);
    return `
      <div class="mb-2 p-3 bg-amber-light text-xs text-amber-900 rounded">
        💡 <strong>身心調適假專款說明：</strong> 依教育部專案經費全額補助代課鐘點費，獨立產製專用印領清冊。
      </div>
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">序號</th>
            <th>請假日期</th>
            <th>節次</th>
            <th>原任教師</th>
            <th>請假依據</th>
            <th>代課教師</th>
            <th class="text-right">單價</th>
            <th class="text-right">應發金額</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((r, idx) => `
            <tr>
              <td class="text-muted">${idx + 1}</td>
              <td>${r.date}</td>
              <td>第 ${r.period} 節</td>
              <td class="font-bold">${r.absentTeacherName}</td>
              <td class="text-xs text-muted">${r.reasonDocument || '身心調適假實施辦法'}</td>
              <td class="font-bold text-rose">${r.substituteTeacherName}</td>
              <td class="text-right">$${r.rate || 405}</td>
              <td class="text-right font-bold">$${r.rate || 405}</td>
            </tr>
          `).join('')}
          <tr class="table-summary-row">
            <td colspan="7" class="text-right font-bold">身心調適假專案合計 (${records.length} 節)：</td>
            <td class="text-right font-bold text-rose">$${sumGross.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    `;
  },

  // 6. 各專案超鐘點 (額滿/數位精進/央款本土語)
  renderProjectsGrid(teachers, allSlots) {
    const reducedTeachers = teachers.filter(t => t.type === 'INSIDE' && (t.reductionPeriods || 0) > 0);

    return `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">序號</th>
            <th>教師姓名</th>
            <th>職稱</th>
            <th>專案減課依據 / 計畫名稱</th>
            <th class="text-center">每週減課節數</th>
            <th class="text-center">全月總節數 (${this.weeksInMonth}週)</th>
            <th class="text-right">鐘點單價</th>
            <th class="text-right">專案應付鐘點費</th>
          </tr>
        </thead>
        <tbody>
          ${reducedTeachers.map((t, idx) => {
            const monthPeriods = (t.reductionPeriods || 0) * this.weeksInMonth;
            const amount = monthPeriods * 405;
            return `
              <tr>
                <td class="text-muted">${idx + 1}</td>
                <td class="font-bold">${t.name}</td>
                <td>${t.title === 'HOMEROOM' ? '導師' : t.title === 'LEADER' ? '組長' : '主任'}</td>
                <td><span class="badge badge-amber">${t.reductionReason || '專案減課'}</span></td>
                <td class="text-center font-bold text-rose">${t.reductionPeriods} 節</td>
                <td class="text-center font-bold">${monthPeriods} 節</td>
                <td class="text-right">$405</td>
                <td class="text-right font-bold text-primary">$${amount.toLocaleString()}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  updateOvertimeDeduction(teacherId, field, value) {
    if (!this.overtimeDeductions[teacherId]) {
      this.overtimeDeductions[teacherId] = { labor: 0, health: 0 };
    }
    this.overtimeDeductions[teacherId][field] = parseFloat(value) || 0;
    this.saveDeductionsToDB();
    this.render();
  },

  updateExternalDeduction(teacherId, field, value) {
    if (!this.externalDeductions[teacherId]) {
      this.externalDeductions[teacherId] = { labor: 0, health: 0 };
    }
    this.externalDeductions[teacherId][field] = parseFloat(value) || 0;
    this.saveDeductionsToDB();
    this.render();
  }
};

window.SettlementModule = SettlementModule;
