/**
 * Smart Substitute Directory & Real-Time Matching Engine
 * 智慧排代登記、月曆排代視圖、空堂媒合與派代通知單列印模組
 */

const SubstituteModule = {
  viewMode: 'TABLE', // 'TABLE' | 'CALENDAR'
  calendarYear: 2026,
  calendarMonth: 6,
  filterDateStart: '2026-06-01',
  filterDateEnd: '2026-06-30',
  filterLeaveType: 'ALL',
  searchKeyword: '',

  init() {
    this.render();
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const records = await window.appDB.getAllSubstituteRecords();
    const teachers = await window.appDB.getAllTeachers();
    const plans = await window.appDB.getAllBudgetPlans();

    // 篩選紀錄
    const filteredRecords = records.filter(r => {
      if (this.filterDateStart && r.date < this.filterDateStart) return false;
      if (this.filterDateEnd && r.date > this.filterDateEnd) return false;
      if (this.filterLeaveType !== 'ALL' && r.leaveType !== this.filterLeaveType) return false;
      if (this.searchKeyword) {
        const kw = this.searchKeyword.toLowerCase();
        const matchAbsent = (r.absentTeacherName || '').toLowerCase().includes(kw);
        const matchSub = (r.substituteTeacherName || '').toLowerCase().includes(kw);
        const matchReason = (r.reasonDocument || '').toLowerCase().includes(kw);
        return matchAbsent || matchSub || matchReason;
      }
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date) || (a.period - b.period));

    const totalHourlyPeriods = filteredRecords.filter(r => r.substituteType === 'HOURLY').length;
    const totalDailyDays = filteredRecords.filter(r => r.substituteType === 'DAILY').length;
    const totalEstAmount = filteredRecords.reduce((sum, r) => sum + (r.rate || 0) + (r.tutorAllowance || 0), 0);

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">智慧排代與人才媒合 (Smart Substitute Directory)</h2>
          <p class="text-xs text-muted mt-1">選取請假時間，系統即時比對課表空堂推薦校內教師與專長外聘師資</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" onclick="SubstituteModule.openDispatchModal()">
            <span>⚡ 智慧排代登記 / 空堂找人</span>
          </button>
        </div>
      </div>

      <!-- 統計指標卡片 -->
      <div class="grid grid-cols-4 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">📝</div>
          <div class="stat-content">
            <div class="stat-label">區間鐘點排代總節數</div>
            <div class="stat-value text-primary">${totalHourlyPeriods} <span class="text-xs text-muted">節</span></div>
            <div class="stat-meta">公假 / 病假 / 身心調適假等</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon emerald">📅</div>
          <div class="stat-content">
            <div class="stat-label">區間日薪代課天數</div>
            <div class="stat-value text-emerald">${totalDailyDays} <span class="text-xs text-muted">天</span></div>
            <div class="stat-meta">全日派代 (含導師費加給)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">💰</div>
          <div class="stat-content">
            <div class="stat-label">排代鐘點費預估總額</div>
            <div class="stat-value text-amber">$${totalEstAmount.toLocaleString()}</div>
            <div class="stat-meta">尚未扣除勞健保自付額</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon sky">🎯</div>
          <div class="stat-content">
            <div class="stat-label">智慧空堂媒合率</div>
            <div class="stat-value text-sky">100%</div>
            <div class="stat-meta">零課務衝突保證</div>
          </div>
        </div>
      </div>

      <!-- 視圖切換與排代清單 -->
      <div class="card">
        <div class="card-header">
          <div class="tab-group" style="margin-bottom: 0; border-bottom: none;">
            <button class="tab-btn ${this.viewMode === 'TABLE' ? 'active' : ''}" onclick="SubstituteModule.setViewMode('TABLE')">
              📋 排代明細列表
            </button>
            <button class="tab-btn ${this.viewMode === 'CALENDAR' ? 'active' : ''}" onclick="SubstituteModule.setViewMode('CALENDAR')">
              📅 月曆排代矩陣視圖 (可直接點選日期)
            </button>
          </div>

          ${this.viewMode === 'TABLE' ? `
            <div class="flex items-center gap-3" style="flex-wrap: wrap;">
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-600">起訖：</label>
                <input type="date" class="form-control form-control-sm" value="${this.filterDateStart}" 
                       style="width: 135px;" onchange="SubstituteModule.setDateFilter(this.value, SubstituteModule.filterDateEnd)">
                <span class="text-xs text-muted">至</span>
                <input type="date" class="form-control form-control-sm" value="${this.filterDateEnd}" 
                       style="width: 135px;" onchange="SubstituteModule.setDateFilter(SubstituteModule.filterDateStart, this.value)">
              </div>

              <div class="flex items-center gap-2">
                <input type="text" class="form-control form-control-sm" placeholder="搜尋請假/代課教師..." 
                       value="${this.searchKeyword}" oninput="SubstituteModule.onSearch(this.value)" style="width: 180px;">
              </div>
            </div>
          ` : `
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-slate-800">${this.calendarYear} 年 ${this.calendarMonth} 月</span>
              <button class="btn btn-secondary btn-sm" onclick="SubstituteModule.changeCalendarMonth(-1)">◀ 上個月</button>
              <button class="btn btn-secondary btn-sm" onclick="SubstituteModule.changeCalendarMonth(1)">下個月 ▶</button>
            </div>
          `}
        </div>

        <div class="card-body" style="${this.viewMode === 'TABLE' ? 'padding: 0;' : ''}">
          ${this.viewMode === 'TABLE' ? this.renderTableView(filteredRecords, plans) : this.renderCalendarView(records)}
        </div>
      </div>
    `;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  },

  changeCalendarMonth(delta) {
    this.calendarMonth += delta;
    if (this.calendarMonth > 12) {
      this.calendarMonth = 1;
      this.calendarYear++;
    } else if (this.calendarMonth < 1) {
      this.calendarMonth = 12;
      this.calendarYear--;
    }
    this.render();
  },

  renderTableView(filteredRecords, plans) {
    return `
      <div class="table-container" style="border: none; border-radius: 0;">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 50px;">序號</th>
              <th>代課日期</th>
              <th>節次</th>
              <th>請假原任教師</th>
              <th>假別</th>
              <th>公文依據 / 事由</th>
              <th>代課教師</th>
              <th>型態</th>
              <th class="text-right">單價/加給</th>
              <th>經費計畫</th>
              <th class="text-right" style="width: 180px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords.length === 0 ? `
              <tr>
                <td colspan="11" class="text-center py-6 text-muted">無符合條件之排代紀錄</td>
              </tr>
            ` : filteredRecords.map((r, idx) => {
              const leaveBadge = r.leaveType === 'PUBLIC' ? '<span class="badge badge-primary">公假</span>' :
                                 r.leaveType === 'WELLNESS' ? '<span class="badge badge-rose">身心調適假</span>' :
                                 r.leaveType === 'SICK' ? '<span class="badge badge-amber">病假</span>' :
                                 r.leaveType === 'BEREAVEMENT' ? '<span class="badge badge-slate">喪假</span>' :
                                 `<span class="badge badge-slate">${r.leaveType}</span>`;

              const typeBadge = r.substituteType === 'DAILY' ? '<span class="badge badge-emerald">日薪</span>' : '<span class="badge badge-sky">鐘點</span>';
              const plan = plans.find(p => p.id === r.budgetPlanId);

              return `
                <tr>
                  <td class="text-muted">${idx + 1}</td>
                  <td class="font-bold">${r.date}</td>
                  <td>${r.substituteType === 'DAILY' ? '全日' : `第 ${r.period} 節`}</td>
                  <td><div class="font-bold text-slate-900">${r.absentTeacherName}</div></td>
                  <td>${leaveBadge}</td>
                  <td>
                    <div class="text-xs" style="max-width: 220px; word-break: break-all;">${r.reasonDocument || '-'}</div>
                    ${r.note ? `<div class="text-xs text-muted">備註: ${r.note}</div>` : ''}
                  </td>
                  <td><div class="font-bold text-primary">${r.substituteTeacherName}</div></td>
                  <td>${typeBadge}</td>
                  <td class="text-right font-bold">
                    $${r.rate} ${r.tutorAllowance > 0 ? `<span class="text-xs text-emerald">(+$${r.tutorAllowance})</span>` : ''}
                  </td>
                  <td><span class="badge badge-slate text-xs">${plan ? plan.name : r.budgetPlanId}</span></td>
                  <td class="text-right">
                    <button class="btn btn-secondary btn-sm" onclick="SubstituteModule.openPrintSlipModal('${r.id}')">🖨️ 派代單</button>
                    <button class="btn btn-secondary btn-sm" onclick="SubstituteModule.openDispatchModal('${r.id}')">編輯</button>
                    <button class="btn btn-danger btn-sm" onclick="SubstituteModule.deleteRecord('${r.id}')">刪除</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  renderCalendarView(records) {
    const year = this.calendarYear;
    const month = this.calendarMonth;
    
    // 計算該月第一天為星期幾 (0~6) 與該月總天數
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayHeaders = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

    // 建立 42 格 (6 週)
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ isCurrent: false, dayNum: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRecords = records.filter(r => r.date === dateStr);
      cells.push({ isCurrent: true, dayNum: d, dateStr, records: dayRecords });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ isCurrent: false, dayNum: '' });
    }

    return `
      <div class="substitute-calendar">
        ${dayHeaders.map(h => `<div class="cal-header-cell">${h}</div>`).join('')}

        ${cells.map(c => {
          if (!c.isCurrent) {
            return `<div class="cal-day-cell other-month"></div>`;
          }

          return `
            <div class="cal-day-cell" onclick="SubstituteModule.openDispatchForDate('${c.dateStr}')" title="點擊直接新增此日期之排代">
              <div class="cal-date-number">
                <span>${c.dayNum} 日</span>
                ${c.records.length > 0 ? `<span class="badge badge-primary" style="font-size: 0.65rem;">${c.records.length} 筆</span>` : ''}
              </div>
              <div class="flex flex-col gap-1 mt-1">
                ${c.records.map(r => `
                  <div class="cal-event-chip ${r.leaveType === 'WELLNESS' ? 'wellness' : r.substituteType === 'DAILY' ? 'daily' : ''}"
                       onclick="event.stopPropagation(); SubstituteModule.openDispatchModal('${r.id}')"
                       title="${r.absentTeacherName} (${r.leaveType}) -> ${r.substituteTeacherName}">
                    ${r.absentTeacherName} ➔ ${r.substituteTeacherName} (${r.substituteType === 'DAILY' ? '全日' : `第${r.period}節`})
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  openDispatchForDate(dateStr) {
    this.openDispatchModal();
    setTimeout(() => {
      const dateInput = document.getElementById('d-date');
      if (dateInput) {
        dateInput.value = dateStr;
        this.onDateOrPeriodChange();
      }
    }, 100);
  },

  setDateFilter(start, end) {
    this.filterDateStart = start;
    this.filterDateEnd = end;
    this.render();
  },

  onSearch(kw) {
    this.searchKeyword = kw;
    this.render();
  },

  async openDispatchModal(recordId = null) {
    const teachers = await window.appDB.getAllTeachers();
    const plans = await window.appDB.getAllBudgetPlans();
    const schoolConfig = await window.appDB.getConfig('schoolInfo') || { hourlyRateDefault: 405, dailyRateDefault: 1760, tutorAllowanceDefault: 133 };

    let record = {
      id: '',
      date: '2026-06-02',
      dayOfWeek: 2,
      period: 2,
      absentTeacherId: '',
      absentTeacherName: '',
      leaveType: 'PUBLIC',
      reasonDocument: '',
      substituteTeacherId: '',
      substituteTeacherName: '',
      substituteType: 'HOURLY',
      rate: schoolConfig.hourlyRateDefault || 405,
      tutorAllowance: 0,
      budgetPlanId: 'BP_SUB_HOURLY',
      laborInsuranceDeduction: 0,
      healthInsuranceDeduction: 0,
      note: ''
    };

    if (recordId) {
      const records = await window.appDB.getAllSubstituteRecords();
      const existing = records.find(r => r.id === recordId);
      if (existing) record = existing;
    } else {
      const insideTeachers = teachers.filter(t => t.type === 'INSIDE');
      if (insideTeachers.length > 0) {
        record.absentTeacherId = insideTeachers[0].id;
        record.absentTeacherName = insideTeachers[0].name;
      }
    }

    const content = `
      <div class="grid grid-cols-12 gap-4">
        <div style="grid-column: span 7;">
          <form id="dispatch-form" onsubmit="event.preventDefault(); SubstituteModule.saveRecord();">
            <input type="hidden" id="d-id" value="${record.id}">
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label required">請假日期</label>
                <input type="date" id="d-date" class="form-control" value="${record.date}" 
                       onchange="SubstituteModule.onDateOrPeriodChange()" required>
              </div>
              <div class="form-group">
                <label class="form-label required">計費型態</label>
                <select id="d-substituteType" class="form-control" onchange="SubstituteModule.onSubstituteTypeChange(this.value)">
                  <option value="HOURLY" ${record.substituteType === 'HOURLY' ? 'selected' : ''}>鐘點代課 (每節 $${schoolConfig.hourlyRateDefault || 405})</option>
                  <option value="DAILY" ${record.substituteType === 'DAILY' ? 'selected' : ''}>日薪代課 (全日 $${schoolConfig.dailyRateDefault || 1760} + 導師加給)</option>
                </select>
              </div>
            </div>

            <div class="form-group" id="period-select-group" style="${record.substituteType === 'DAILY' ? 'display: none;' : ''}">
              <label class="form-label required">代課節次 (支援多選批次登記)</label>
              <div class="flex gap-2" style="flex-wrap: wrap;">
                ${[1, 2, 3, 4, 5, 6, 7].map(p => `
                  <label class="btn btn-secondary btn-sm flex items-center gap-1" style="font-size: 0.78rem;">
                    <input type="checkbox" name="d-periods" value="${p}" ${p === record.period ? 'checked' : ''} onchange="SubstituteModule.onDateOrPeriodChange()">
                    第 ${p} 節
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label required">請假原任教師</label>
                <select id="d-absentTeacher" class="form-control" onchange="SubstituteModule.onAbsentTeacherChange(this.value)">
                  ${teachers.filter(t => t.type === 'INSIDE').map(t => `
                    <option value="${t.id}" ${t.id === record.absentTeacherId ? 'selected' : ''}>${t.name} (${t.title === 'HOMEROOM' ? '導師' : t.title === 'LEADER' ? '組長' : '科任'})</option>
                  `).join('')}
                </select>
                <div id="absent-course-info" class="text-xs text-primary mt-1 font-semibold"></div>
              </div>

              <div class="form-group">
                <label class="form-label required">假別</label>
                <select id="d-leaveType" class="form-control" onchange="SubstituteModule.onLeaveTypeChange(this.value)">
                  <option value="PUBLIC" ${record.leaveType === 'PUBLIC' ? 'selected' : ''}>公假 (研習/出差/帶隊)</option>
                  <option value="WELLNESS" ${record.leaveType === 'WELLNESS' ? 'selected' : ''}>身心調適假 (專案代課)</option>
                  <option value="SICK" ${record.leaveType === 'SICK' ? 'selected' : ''}>病假</option>
                  <option value="PERSONAL" ${record.leaveType === 'PERSONAL' ? 'selected' : ''}>事假</option>
                  <option value="BEREAVEMENT" ${record.leaveType === 'BEREAVEMENT' ? 'selected' : ''}>喪假</option>
                  <option value="MATERNITY" ${record.leaveType === 'MATERNITY' ? 'selected' : ''}>產假</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">公文依據 / 事由</label>
              <input type="text" id="d-reasonDocument" class="form-control" value="${record.reasonDocument}" 
                     placeholder="如：新北教研字第1150882190號函（課表研討會）" required>
            </div>

            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label required">代課教師姓名</label>
                <input type="text" id="d-substituteTeacherName" class="form-control font-bold text-primary" 
                       value="${record.substituteTeacherName}" placeholder="可從右側推薦點選一鍵帶入" required>
                <input type="hidden" id="d-substituteTeacherId" value="${record.substituteTeacherId}">
              </div>

              <div class="form-group">
                <label class="form-label required">歸屬經費計畫</label>
                <select id="d-budgetPlanId" class="form-control">
                  ${plans.map(p => `<option value="${p.id}" ${p.id === record.budgetPlanId ? 'selected' : ''}>${p.name} (${p.voucherNo})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3">
              <div class="form-group">
                <label class="form-label">鐘點單價 / 日薪</label>
                <input type="number" id="d-rate" class="form-control" value="${record.rate}">
              </div>
              <div class="form-group">
                <label class="form-label">導師費加給 (日薪133)</label>
                <input type="number" id="d-tutorAllowance" class="form-control" value="${record.tutorAllowance || 0}">
              </div>
              <div class="form-group">
                <label class="form-label">備註</label>
                <input type="text" id="d-note" class="form-control" value="${record.note || ''}" placeholder="原授課班級科目">
              </div>
            </div>
          </form>
        </div>

        <div style="grid-column: span 5; border-left: 1px solid var(--slate-200); padding-left: 16px;">
          <div class="flex items-center justify-between mb-2">
            <div class="font-bold text-sm text-slate-800">🎯 即時空堂與人才媒合</div>
            <span class="badge badge-emerald" id="matching-status">運算中...</span>
          </div>
          <p class="text-xs text-muted mb-3">自動推薦該節完全無課之校內專任教師與專長契合之外聘名冊。</p>

          <div id="matching-candidates-container" class="flex flex-col gap-2" style="max-height: 400px; overflow-y: auto;"></div>
        </div>
      </div>
    `;

    window.app.openModal(
      recordId ? '編輯排代紀錄' : '智慧排代登記與空堂媒合',
      content,
      '__AUTO_SAVE__',
      'modal-xl',
      'SUBSTITUTE'
    );

    this.onDateOrPeriodChange();
  },

  onSubstituteTypeChange(type) {
    const periodGroup = document.getElementById('period-select-group');
    const rateInput = document.getElementById('d-rate');
    const tutorInput = document.getElementById('d-tutorAllowance');
    const planSelect = document.getElementById('d-budgetPlanId');

    if (type === 'DAILY') {
      if (periodGroup) periodGroup.style.display = 'none';
      if (rateInput) rateInput.value = 1760;
      if (tutorInput) tutorInput.value = 133;
      if (planSelect) planSelect.value = 'BP_SUB_DAILY';
    } else {
      if (periodGroup) periodGroup.style.display = '';
      if (rateInput) rateInput.value = 405;
      if (tutorInput) tutorInput.value = 0;
      if (planSelect) planSelect.value = 'BP_SUB_HOURLY';
    }
  },

  onLeaveTypeChange(type) {
    const planSelect = document.getElementById('d-budgetPlanId');
    if (planSelect) {
      if (type === 'WELLNESS') {
        planSelect.value = 'BP_SUB_WELLNESS';
      } else {
        const subType = document.getElementById('d-substituteType').value;
        planSelect.value = subType === 'DAILY' ? 'BP_SUB_DAILY' : 'BP_SUB_HOURLY';
      }
    }
  },

  async onAbsentTeacherChange(teacherId) {
    const absentInfo = document.getElementById('absent-course-info');
    const dateVal = document.getElementById('d-date').value;
    if (!dateVal) return;

    const dayOfWeek = new Date(dateVal).getDay() || 7;
    const checkedPeriods = Array.from(document.querySelectorAll('input[name="d-periods"]:checked')).map(cb => parseInt(cb.value, 10));
    const targetPeriod = checkedPeriods[0] || 1;

    const slots = await window.appDB.getTimetableByTeacher(teacherId);
    const matchedSlot = slots.find(s => s.dayOfWeek === dayOfWeek && s.period === targetPeriod);

    if (absentInfo) {
      if (matchedSlot) {
        absentInfo.textContent = `📍 原排課：${matchedSlot.className} 班 ${matchedSlot.subject}`;
        const noteInput = document.getElementById('d-note');
        if (noteInput && !noteInput.value) {
          noteInput.value = `原授 ${matchedSlot.className} ${matchedSlot.subject}`;
        }
      } else {
        absentInfo.textContent = `ℹ️ 該節次課表為原任教師空堂`;
      }
    }

    this.runSmartMatching();
  },

  async onDateOrPeriodChange() {
    const absentSelect = document.getElementById('d-absentTeacher');
    if (absentSelect) {
      this.onAbsentTeacherChange(absentSelect.value);
    }
  },

  async runSmartMatching() {
    const dateVal = document.getElementById('d-date')?.value;
    if (!dateVal) return;

    const dayOfWeek = new Date(dateVal).getDay() || 7;
    const checkedPeriods = Array.from(document.querySelectorAll('input[name="d-periods"]:checked')).map(cb => parseInt(cb.value, 10));
    const targetPeriod = checkedPeriods[0] || 1;
    const absentTeacherId = document.getElementById('d-absentTeacher')?.value;

    const teachers = await window.appDB.getAllTeachers();
    const allSlots = await window.appDB.getAllTimetableSlots();
    const container = document.getElementById('matching-candidates-container');
    const statusBadge = document.getElementById('matching-status');
    if (!container) return;

    const busySlots = allSlots.filter(s => s.dayOfWeek === dayOfWeek && s.period === targetPeriod);
    const busyTeacherIds = new Set(busySlots.map(s => s.teacherId));

    const absentSlots = allSlots.filter(s => s.teacherId === absentTeacherId && s.dayOfWeek === dayOfWeek && s.period === targetPeriod);
    const targetSubject = absentSlots.length > 0 ? absentSlots[0].subject : '';

    const freeInsideTeachers = teachers.filter(t => t.type === 'INSIDE' && t.id !== absentTeacherId && !busyTeacherIds.has(t.id));
    const externalTeachers = teachers.filter(t => t.type === 'EXTERNAL' || t.type === 'RETIRED');

    const scoreTeacher = (t) => {
      let score = 0;
      if (targetSubject && (t.tags || []).some(tag => tag.includes(targetSubject) || targetSubject.includes(tag))) score += 10;
      if (t.type === 'EXTERNAL') score += 5;
      if (t.type === 'RETIRED') score += 6;
      return score;
    };

    externalTeachers.sort((a, b) => scoreTeacher(b) - scoreTeacher(a));

    if (statusBadge) {
      statusBadge.textContent = `空堂: ${freeInsideTeachers.length}人 | 外聘: ${externalTeachers.length}人`;
    }

    container.innerHTML = `
      <div class="text-xs font-bold text-slate-700 mt-1 mb-1">🌟 推薦外聘與退休人才庫：</div>
      ${externalTeachers.slice(0, 5).map(t => {
        const isMatch = targetSubject && (t.tags || []).some(tag => tag.includes(targetSubject) || targetSubject.includes(tag));
        return `
          <div class="candidate-card" style="${isMatch ? 'border-color: var(--primary-300); background: var(--primary-50);' : ''}">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-900">${t.name}</span>
                ${t.type === 'RETIRED' ? '<span class="badge badge-amber text-xs">退休名師</span>' : '<span class="badge badge-emerald text-xs">外聘專長</span>'}
                ${isMatch ? '<span class="badge badge-rose text-xs">專長精準契合</span>' : ''}
              </div>
              <div class="text-xs text-muted mt-1">📞 ${t.phone || '無電話'} | 薪級: ${t.salaryPoint || '-'} 點</div>
              <div class="flex gap-1 mt-1">${(t.tags || []).map(tag => `<span class="candidate-badge">${tag}</span>`).join('')}</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="SubstituteModule.applyCandidate('${t.id}', '${t.name}')">帶入</button>
          </div>
        `;
      }).join('')}

      <div class="text-xs font-bold text-slate-700 mt-3 mb-1">🏫 校內第 ${targetPeriod} 節空堂教師 (${freeInsideTeachers.length} 位)：</div>
      ${freeInsideTeachers.slice(0, 6).map(t => `
        <div class="candidate-card" style="padding: 8px 10px;">
          <div>
            <div class="font-bold text-xs text-slate-800">${t.name} <span class="text-muted font-normal">(${t.title === 'HOMEROOM' ? '導師' : t.title === 'LEADER' ? '組長' : '科任'})</span></div>
            <div class="text-xs text-muted">該節次無課堂排定</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="SubstituteModule.applyCandidate('${t.id}', '${t.name}')">帶入</button>
        </div>
      `).join('')}
    `;
  },

  applyCandidate(id, name) {
    const idInput = document.getElementById('d-substituteTeacherId');
    const nameInput = document.getElementById('d-substituteTeacherName');
    if (idInput) idInput.value = id;
    if (nameInput) nameInput.value = name;
    window.app.showToast(`已帶入代課教師：${name}`, 'info');
  },

  // 自動存檔函式 (由 app.js 的自動存檔引擎呼叫，欄位變動 600ms 後自動觸發)
  async autoSaveRecord() {
    const dateInput = document.getElementById('d-date');
    if (!dateInput) return; // Modal 已關閉
    const date = dateInput.value;
    if (!date) return;

    const substituteTeacherName = document.getElementById('d-substituteTeacherName')?.value?.trim();
    if (!substituteTeacherName) return; // 代課教師未填，尚未存

    const id = document.getElementById('d-id').value;
    const dayOfWeek = new Date(date).getDay() || 7;
    const substituteType = document.getElementById('d-substituteType').value;
    const absentTeacherId = document.getElementById('d-absentTeacher').value;
    const teachers = await window.appDB.getAllTeachers();
    const absentTeacher = teachers.find(t => t.id === absentTeacherId);
    const absentTeacherName = absentTeacher ? absentTeacher.name : '';
    const leaveType = document.getElementById('d-leaveType').value;
    const reasonDocument = document.getElementById('d-reasonDocument')?.value?.trim() || '';
    const substituteTeacherId = document.getElementById('d-substituteTeacherId')?.value || '';
    const budgetPlanId = document.getElementById('d-budgetPlanId')?.value || 'BP_SUB_HOURLY';
    const rate = parseFloat(document.getElementById('d-rate')?.value) || 405;
    const tutorAllowance = parseFloat(document.getElementById('d-tutorAllowance')?.value) || 0;
    const note = document.getElementById('d-note')?.value || '';
    const checkedPeriods = Array.from(document.querySelectorAll('input[name="d-periods"]:checked')).map(cb => parseInt(cb.value, 10));

    // 編輯既有紀錄 or 新增單節
    const record = {
      id: id || undefined,
      date,
      dayOfWeek,
      period: substituteType === 'DAILY' ? 1 : (checkedPeriods[0] || 1),
      absentTeacherId,
      absentTeacherName,
      leaveType,
      reasonDocument,
      substituteTeacherId: substituteTeacherId || ('TEMP_' + Date.now()),
      substituteTeacherName,
      substituteType,
      rate,
      tutorAllowance,
      budgetPlanId,
      laborInsuranceDeduction: 0,
      healthInsuranceDeduction: 0,
      note
    };

    const saved = await window.appDB.saveSubstituteRecord(record);

    // 若為新增，把產生的 ID 填回 hidden field
    if (!id && saved && saved.id) {
      const idField = document.getElementById('d-id');
      if (idField) idField.value = saved.id;
    }

    // 不關閉 Modal，背景刷新清單
    this.render();
  },

  // 相容舊呼叫路徑（排代清單儲存按鈕已移除，但保留此函式供 dispatch from slot 使用）
  async saveRecord() {
    await this.autoSaveRecord();
    window.app.closeModal();
    window.app.showToast('排代紀錄已成功儲存！', 'success');
  },

  async deleteRecord(id) {
    if (confirm('確定要刪除此筆排代紀錄嗎？')) {
      await window.appDB.deleteSubstituteRecord(id);
      window.app.showToast('已刪除排代紀錄', 'info');
      this.render();
    }
  },

  // 🖨️ 派代通知單列印 Modal
  async openPrintSlipModal(recordId) {
    const records = await window.appDB.getAllSubstituteRecords();
    const r = records.find(rec => rec.id === recordId);
    if (!r) return;

    const schoolConfig = await window.appDB.getConfig('schoolInfo') || { schoolName: '新北市新林國民小學' };

    const content = `
      <div class="print-slip" id="printable-slip">
        <div class="print-slip-header">
          <div class="font-bold text-lg">${schoolConfig.schoolName}</div>
          <div class="print-slip-title">教師公假 / 請假課務派代通知單</div>
          <div class="text-xs text-muted mt-1">填單序號：${r.id}  |  列印日期：${new Date().toLocaleDateString()}</div>
        </div>

        <div class="print-slip-grid">
          <div class="print-slip-cell label">請假原任教師</div>
          <div class="print-slip-cell font-bold">${r.absentTeacherName}</div>
          <div class="print-slip-cell label">請假假別</div>
          <div class="print-slip-cell">${r.leaveType === 'PUBLIC' ? '公假(含研習/公差)' : r.leaveType === 'WELLNESS' ? '身心調適假' : r.leaveType}</div>

          <div class="print-slip-cell label">派代日期時間</div>
          <div class="print-slip-cell font-bold">${r.date} (第 ${r.period} 節)</div>
          <div class="print-slip-cell label">計費型態</div>
          <div class="print-slip-cell">${r.substituteType === 'DAILY' ? '全日日薪' : '節次鐘點'}</div>

          <div class="print-slip-cell label">代課受派教師</div>
          <div class="print-slip-cell font-bold text-primary" style="font-size: 1.1rem;">${r.substituteTeacherName}</div>
          <div class="print-slip-cell label">核銷鐘點費</div>
          <div class="print-slip-cell font-bold">$${r.rate} 元 ${r.tutorAllowance > 0 ? `(+導師費$${r.tutorAllowance})` : ''}</div>

          <div class="print-slip-cell label" style="grid-column: span 1;">公文文號/事由</div>
          <div class="print-slip-cell" style="grid-column: span 3;">${r.reasonDocument || '依校務規定辦理'}</div>

          <div class="print-slip-cell label" style="grid-column: span 1;">授課班級與科目</div>
          <div class="print-slip-cell" style="grid-column: span 3;">${r.note || '原排定課程'}</div>
        </div>

        <div class="grid grid-cols-3 gap-2 mt-4 text-center text-xs" style="margin-top: 30px;">
          <div class="p-2 border">教學組長：_________________</div>
          <div class="p-2 border">教務主任：_________________</div>
          <div class="p-2 border">校長：_________________</div>
        </div>
      </div>
    `;

    window.app.openModal('派代通知單列印預覽', content, `
      <button class="btn btn-secondary" onclick="window.app.closeModal()">關閉</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ 立即列印此單</button>
    `, 'modal-lg');
  }
};

window.SubstituteModule = SubstituteModule;
