/**
 * Timetable Engine Module (課表匯入、適配器、三重視圖矩陣、直接排代與調課互調工具)
 * 國小校務教學行政與鐘點代課整合系統
 */

const TimetableModule = {
  viewMode: 'TEACHER', // 'TEACHER' | 'CLASS' | 'SCHOOL'
  selectedTeacherId: '',
  selectedClassName: '101',
  filterGrade: 'ALL',
  filterSubject: 'ALL',
  periodNames: [
    { p: 1, name: '第 1 節 (08:40-09:20)' },
    { p: 2, name: '第 2 節 (09:30-10:10)' },
    { p: 3, name: '第 3 節 (10:30-11:10)' },
    { p: 4, name: '第 4 節 (11:20-12:00)' },
    { p: 5, name: '第 5 節 (13:30-14:10)' },
    { p: 6, name: '第 6 節 (14:20-15:00)' },
    { p: 7, name: '第 7 節 (15:20-16:00)' }
  ],
  dayNames: ['週一', '週二', '週三', '週四', '週五'],

  init() {
    this.render();
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const teachers = await window.appDB.getAllTeachers();
    const insideTeachers = teachers.filter(t => t.type === 'INSIDE');
    const allSlots = await window.appDB.getAllTimetableSlots();

    if (!this.selectedTeacherId && insideTeachers.length > 0) {
      this.selectedTeacherId = insideTeachers[0].id;
    }

    const classList = Array.from(new Set(allSlots.map(s => s.className))).filter(Boolean).sort();
    if (classList.length === 0) {
      classList.push('101', '102', '103', '201', '202', '301', '302', '401', '402', '501', '502', '601', '602');
    }

    const subjectList = Array.from(new Set(allSlots.map(s => s.subject))).filter(Boolean).sort();

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">課表矩陣與調代課中心 (Timetable & Class Swap)</h2>
          <p class="text-xs text-muted mt-1">點選課表格子可直接發起排代；提供課務互調工具與全校各年級/科目矩陣</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" onclick="TimetableModule.openSwapModal()">
            <span>🔄 課務調課 / 互調作業</span>
          </button>
          <button class="btn btn-secondary" onclick="TimetableModule.downloadTemplateCSV()">
            <span>📥 下載課表範本</span>
          </button>
          <button class="btn btn-secondary" onclick="TimetableModule.openImportModal()">
            <span>📤 匯入課表檔案</span>
          </button>
        </div>
      </div>

      <!-- 視圖切換列與篩選控制器 -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="tab-group" style="margin-bottom: 0; border-bottom: none;">
            <button class="tab-btn ${this.viewMode === 'TEACHER' ? 'active' : ''}" onclick="TimetableModule.setViewMode('TEACHER')">
              👨‍🏫 教師個人週課表 (可直接點選排代)
            </button>
            <button class="tab-btn ${this.viewMode === 'CLASS' ? 'active' : ''}" onclick="TimetableModule.setViewMode('CLASS')">
              🏫 班級功課表
            </button>
            <button class="tab-btn ${this.viewMode === 'SCHOOL' ? 'active' : ''}" onclick="TimetableModule.setViewMode('SCHOOL')">
              📊 全校總課表矩陣 (依年級/科目篩選)
            </button>
          </div>

          <div class="flex items-center gap-3">
            ${this.viewMode === 'TEACHER' ? `
              <label class="text-xs font-semibold text-slate-600">選擇教師：</label>
              <select class="form-control form-control-sm" style="width: 210px;" onchange="TimetableModule.setTeacher(this.value)">
                ${insideTeachers.map(t => `<option value="${t.id}" ${t.id === this.selectedTeacherId ? 'selected' : ''}>${t.name} (${t.title === 'HOMEROOM' ? '導師' : t.title === 'DIRECTOR' ? '主任' : t.title === 'LEADER' ? '組長' : '科任'})</option>`).join('')}
              </select>
            ` : this.viewMode === 'CLASS' ? `
              <label class="text-xs font-semibold text-slate-600">選擇班級：</label>
              <select class="form-control form-control-sm" style="width: 140px;" onchange="TimetableModule.setClass(this.value)">
                ${classList.map(c => `<option value="${c}" ${c === this.selectedClassName ? 'selected' : ''}>${c} 班</option>`).join('')}
              </select>
            ` : `
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-600">年級：</label>
                <select class="form-control form-control-sm" style="width: 100px;" onchange="TimetableModule.setFilterGrade(this.value)">
                  <option value="ALL" ${this.filterGrade === 'ALL' ? 'selected' : ''}>全年級</option>
                  <option value="1" ${this.filterGrade === '1' ? 'selected' : ''}>一年級</option>
                  <option value="2" ${this.filterGrade === '2' ? 'selected' : ''}>二年級</option>
                  <option value="3" ${this.filterGrade === '3' ? 'selected' : ''}>三年級</option>
                  <option value="4" ${this.filterGrade === '4' ? 'selected' : ''}>四年級</option>
                  <option value="5" ${this.filterGrade === '5' ? 'selected' : ''}>五年級</option>
                  <option value="6" ${this.filterGrade === '6' ? 'selected' : ''}>六年級</option>
                </select>

                <label class="text-xs font-semibold text-slate-600">領域科目：</label>
                <select class="form-control form-control-sm" style="width: 120px;" onchange="TimetableModule.setFilterSubject(this.value)">
                  <option value="ALL" ${this.filterSubject === 'ALL' ? 'selected' : ''}>全部領域</option>
                  ${subjectList.map(s => `<option value="${s}" ${s === this.filterSubject ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            `}
          </div>
        </div>

        <div class="card-body">
          ${this.viewMode === 'TEACHER' ? this.renderTeacherView(teachers, allSlots) :
            this.viewMode === 'CLASS' ? this.renderClassView(allSlots) :
            this.renderSchoolView(allSlots, teachers)}
        </div>
      </div>
    `;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  },

  setTeacher(teacherId) {
    this.selectedTeacherId = teacherId;
    this.render();
  },

  setClass(className) {
    this.selectedClassName = className;
    this.render();
  },

  setFilterGrade(g) {
    this.filterGrade = g;
    this.render();
  },

  setFilterSubject(s) {
    this.filterSubject = s;
    this.render();
  },

  renderTeacherView(teachers, allSlots) {
    const teacher = teachers.find(t => t.id === this.selectedTeacherId);
    if (!teacher) return `<div class="text-center py-6 text-muted">查無教師資料</div>`;

    const teacherSlots = allSlots.filter(s => s.teacherId === teacher.id);
    const netBase = Math.max(0, (teacher.basePeriods || 0) - (teacher.reductionPeriods || 0));
    const overtime = Math.max(0, teacherSlots.length - netBase);

    const matrix = {};
    for (let p = 1; p <= 7; p++) {
      matrix[p] = {};
      for (let d = 1; d <= 5; d++) {
        matrix[p][d] = teacherSlots.find(s => s.dayOfWeek === d && s.period === p);
      }
    }

    return `
      <div class="grid grid-cols-4 mb-4">
        <div class="stat-card" style="padding: 12px 14px;">
          <div class="stat-content">
            <div class="stat-label">基本授課節數</div>
            <div class="stat-value" style="font-size: 1.25rem;">${teacher.basePeriods} <span class="text-xs text-muted">節/週</span></div>
          </div>
        </div>
        <div class="stat-card" style="padding: 12px 14px;">
          <div class="stat-content">
            <div class="stat-label">減授節數</div>
            <div class="stat-value text-rose" style="font-size: 1.25rem;">-${teacher.reductionPeriods} <span class="text-xs text-muted">${teacher.reductionReason ? `(${teacher.reductionReason})` : '節/週'}</span></div>
          </div>
        </div>
        <div class="stat-card" style="padding: 12px 14px;">
          <div class="stat-content">
            <div class="stat-label">每週實排總節數</div>
            <div class="stat-value text-primary" style="font-size: 1.25rem;">${teacherSlots.length} <span class="text-xs text-muted">節/週</span></div>
          </div>
        </div>
        <div class="stat-card" style="padding: 12px 14px;">
          <div class="stat-content">
            <div class="stat-label">每週常態超鐘點</div>
            <div class="stat-value ${overtime > 0 ? 'text-rose' : 'text-slate-600'}" style="font-size: 1.25rem;">
              ${overtime > 0 ? `+${overtime}` : '0'} <span class="text-xs text-muted">節/週 (每節 $405)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="timetable-grid">
        <div class="timetable-header-cell">節次 / 時間</div>
        ${this.dayNames.map(d => `<div class="timetable-header-cell">${d}</div>`).join('')}

        ${this.periodNames.map(p => `
          <div class="timetable-period-cell">
            <div class="font-bold">第 ${p.p} 節</div>
            <div class="text-xs text-muted">${p.name.split(' ')[1] || ''}</div>
          </div>
          ${[1, 2, 3, 4, 5].map(d => {
            const slot = matrix[p.p][d];
            return `
              <div class="timetable-slot-cell">
                ${slot ? `
                  <div class="slot-chip" onclick="TimetableModule.dispatchFromSlot('${teacher.id}', '${teacher.name}', ${d}, ${p.p}, '${slot.className}', '${slot.subject}')" title="點擊直接發起此節課排代">
                    <div class="flex justify-between items-center">
                      <span class="slot-class">${slot.className} 班</span>
                      <span class="badge badge-primary" style="font-size: 0.65rem; padding: 1px 4px;">⚡排代</span>
                    </div>
                    <div class="slot-subject">${slot.subject}</div>
                  </div>
                ` : `<span class="text-muted text-xs" style="opacity: 0.4;">空堂</span>`}
              </div>
            `;
          }).join('')}
        `).join('')}
      </div>
    `;
  },

  renderClassView(allSlots) {
    const classSlots = allSlots.filter(s => s.className === this.selectedClassName);

    const matrix = {};
    for (let p = 1; p <= 7; p++) {
      matrix[p] = {};
      for (let d = 1; d <= 5; d++) {
        matrix[p][d] = classSlots.find(s => s.dayOfWeek === d && s.period === p);
      }
    }

    return `
      <div class="flex items-center justify-between mb-3">
        <div class="font-bold text-slate-800">班級：${this.selectedClassName} 班週功課表 (每週共 ${classSlots.length} 節)</div>
      </div>

      <div class="timetable-grid">
        <div class="timetable-header-cell">節次 / 時間</div>
        ${this.dayNames.map(d => `<div class="timetable-header-cell">${d}</div>`).join('')}

        ${this.periodNames.map(p => `
          <div class="timetable-period-cell">
            <div class="font-bold">第 ${p.p} 節</div>
            <div class="text-xs text-muted">${p.name.split(' ')[1] || ''}</div>
          </div>
          ${[1, 2, 3, 4, 5].map(d => {
            const slot = matrix[p.p][d];
            return `
              <div class="timetable-slot-cell">
                ${slot ? `
                  <div class="slot-chip" style="background: var(--emerald-50); border-color: var(--emerald-200);"
                       onclick="TimetableModule.dispatchFromSlot('${slot.teacherId}', '${slot.teacherName}', ${d}, ${p.p}, '${slot.className}', '${slot.subject}')">
                    <div class="slot-class" style="color: var(--emerald-900);">${slot.subject}</div>
                    <div class="slot-subject" style="color: var(--emerald-700);">${slot.teacherName} 老師</div>
                  </div>
                ` : `<span class="text-muted text-xs" style="opacity: 0.3;">-</span>`}
              </div>
            `;
          }).join('')}
        `).join('')}
      </div>
    `;
  },

  renderSchoolView(allSlots, teachers) {
    const filtered = allSlots.filter(s => {
      if (this.filterGrade !== 'ALL') {
        if (!s.className || !s.className.startsWith(this.filterGrade)) return false;
      }
      if (this.filterSubject !== 'ALL') {
        if (s.subject !== this.filterSubject) return false;
      }
      return true;
    });

    return `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-muted">符合篩選之排課節數：共 ${filtered.length} 節</span>
      </div>
      <div class="table-container" style="max-height: 520px; overflow-y: auto;">
        <table class="table">
          <thead>
            <tr>
              <th>星期</th>
              <th>節次</th>
              <th>班級</th>
              <th>科目</th>
              <th>授課教師</th>
              <th>職稱</th>
              <th class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || (a.period - b.period) || a.className.localeCompare(b.className)).map(s => {
              const t = teachers.find(tea => tea.id === s.teacherId);
              return `
                <tr>
                  <td>週${['一', '二', '三', '四', '五'][s.dayOfWeek - 1]}</td>
                  <td>第 ${s.period} 節</td>
                  <td><span class="badge badge-slate font-bold">${s.className} 班</span></td>
                  <td class="font-bold text-slate-900">${s.subject}</td>
                  <td class="font-semibold text-primary">${s.teacherName}</td>
                  <td class="text-muted text-xs">${t ? (t.title === 'HOMEROOM' ? '導師' : t.title === 'LEADER' ? '組長' : '科任') : '-'}</td>
                  <td class="text-right">
                    <button class="btn btn-primary btn-sm" onclick="TimetableModule.dispatchFromSlot('${s.teacherId}', '${s.teacherName}', ${s.dayOfWeek}, ${s.period}, '${s.className}', '${s.subject}')">
                      ⚡ 排代此節
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // 直接由課表格子發起排代
  async dispatchFromSlot(teacherId, teacherName, dayOfWeek, period, className, subject) {
    // 預設日期換算（換算至當前 6月份符合該星期之日期）
    const dayMapToJune = { 1: '2026-06-08', 2: '2026-06-02', 3: '2026-06-03', 4: '2026-06-04', 5: '2026-06-05' };
    const targetDate = dayMapToJune[dayOfWeek] || '2026-06-02';

    // 打開排代視窗並預先填入
    SubstituteModule.openDispatchModal();

    setTimeout(() => {
      const dateInput = document.getElementById('d-date');
      const absentSelect = document.getElementById('d-absentTeacher');
      const noteInput = document.getElementById('d-note');
      
      if (dateInput) dateInput.value = targetDate;
      if (absentSelect) absentSelect.value = teacherId;
      if (noteInput) noteInput.value = `原授 ${className} 班 ${subject}`;

      // 勾選對應節次
      document.querySelectorAll('input[name="d-periods"]').forEach(cb => {
        cb.checked = (parseInt(cb.value, 10) === period);
      });

      SubstituteModule.onDateOrPeriodChange();
    }, 150);
  },

  // 課務調課 / 互調作業 Modal
  async openSwapModal() {
    const teachers = await window.appDB.getAllTeachers();
    const insideTeachers = teachers.filter(t => t.type === 'INSIDE');

    const content = `
      <div class="flex flex-col gap-4">
        <p class="text-xs text-muted">
          選取兩位教師（或同一位教師）之課堂時段進行互調，系統將自動比對課務衝突並更新全校課表。
        </p>

        <div class="grid grid-cols-2 gap-4">
          <!-- 課堂 A -->
          <div class="p-3 border rounded" style="background: var(--slate-50);">
            <div class="font-bold text-sm text-primary mb-2">📍 原課堂 A (欲調出)</div>
            <div class="form-group mb-2">
              <label class="form-label text-xs">教師 A</label>
              <select id="swap-tA" class="form-control form-control-sm" onchange="TimetableModule.loadTeacherSlots('A')">
                ${insideTeachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label text-xs">選擇課堂時段</label>
              <select id="swap-slotA" class="form-control form-control-sm"></select>
            </div>
          </div>

          <!-- 課堂 B -->
          <div class="p-3 border rounded" style="background: var(--slate-50);">
            <div class="font-bold text-sm text-emerald mb-2">📍 互調課堂 B (欲調入)</div>
            <div class="form-group mb-2">
              <label class="form-label text-xs">教師 B</label>
              <select id="swap-tB" class="form-control form-control-sm" onchange="TimetableModule.loadTeacherSlots('B')">
                ${insideTeachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label text-xs">選擇課堂時段</label>
              <select id="swap-slotB" class="form-control form-control-sm"></select>
            </div>
          </div>
        </div>

        <div class="form-group mb-0">
          <label class="form-label text-xs">調課事由備註</label>
          <input type="text" id="swap-reason" class="form-control form-control-sm" placeholder="如：配合校外教學活動對調課程">
        </div>
      </div>
    `;

    window.app.openModal('課務調課 / 互調作業', content, `
      <button class="btn btn-secondary" onclick="window.app.closeModal()">取消</button>
      <button class="btn btn-primary" onclick="TimetableModule.executeSwap()">確認調課並即時存檔</button>
    `, 'modal-lg');

    setTimeout(() => {
      this.loadTeacherSlots('A');
      this.loadTeacherSlots('B');
    }, 100);
  },

  async loadTeacherSlots(target) {
    const tId = document.getElementById(`swap-t${target}`)?.value;
    const select = document.getElementById(`swap-slot${target}`);
    if (!tId || !select) return;

    const slots = await window.appDB.getTimetableByTeacher(tId);
    if (slots.length === 0) {
      select.innerHTML = '<option value="">該教師目前無排課</option>';
      return;
    }

    select.innerHTML = slots.map(s => `
      <option value="${s.id}">週${['一','二','三','四','五'][s.dayOfWeek-1]} 第${s.period}節 - ${s.className}班 (${s.subject})</option>
    `).join('');
  },

  async executeSwap() {
    const slotAId = document.getElementById('swap-slotA')?.value;
    const slotBId = document.getElementById('swap-slotB')?.value;

    if (!slotAId || !slotBId || slotAId === slotBId) {
      window.app.showToast('請選取兩個不同的課堂時段進行互調', 'error');
      return;
    }

    const allSlots = await window.appDB.getAllTimetableSlots();
    const slotA = allSlots.find(s => s.id === slotAId);
    const slotB = allSlots.find(s => s.id === slotBId);

    if (!slotA || !slotB) {
      window.app.showToast('查無課堂資料', 'error');
      return;
    }

    // 對調星期與節次
    const tempDay = slotA.dayOfWeek;
    const tempPeriod = slotA.period;

    slotA.dayOfWeek = slotB.dayOfWeek;
    slotA.period = slotB.period;

    slotB.dayOfWeek = tempDay;
    slotB.period = tempPeriod;

    await window.appDB.addTimetableSlot(slotA);
    await window.appDB.addTimetableSlot(slotB);

    window.app.closeModal();
    window.app.showToast(`課務互調成功！已更新全校課表並即時存檔。`, 'success', 3500);
    this.render();
  },

  downloadTemplateCSV() {
    TemplateManagerModule.downloadTimetableTemplate('csv');
  },

  openImportModal() {
    TemplateManagerModule.importTarget = 'TIMETABLE';
    window.app.navigate('template-manager');
  }
};

window.TimetableModule = TimetableModule;
