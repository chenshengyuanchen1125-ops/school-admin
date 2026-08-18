/**
 * Teacher Management & Talent Pool Module
 * v3.0 - 全面即時自動存檔版 (完全不需要手動按儲存按鈕)
 */

const TeacherModule = {
  currentTab: 'ALL',
  searchKeyword: '',
  _currentEditingId: null,

  init() {
    this.render();
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const teachers = await window.appDB.getAllTeachers();
    const timetables = await window.appDB.getAllTimetableSlots();

    const teacherStats = {};
    for (const t of teachers) {
      const slots = timetables.filter(s => s.teacherId === t.id);
      const actualPeriods = slots.length;
      const netBase = Math.max(0, (t.basePeriods || 0) - (t.reductionPeriods || 0));
      const overtime = Math.max(0, actualPeriods - netBase);
      teacherStats[t.id] = { actualPeriods, netBase, overtime };
    }

    const filtered = teachers.filter(t => {
      if (this.currentTab !== 'ALL' && t.type !== this.currentTab) return false;
      if (this.searchKeyword) {
        const kw = this.searchKeyword.toLowerCase();
        return t.name.toLowerCase().includes(kw) ||
               (t.note || '').toLowerCase().includes(kw) ||
               (t.tags || []).some(tag => tag.toLowerCase().includes(kw)) ||
               (t.phone || '').includes(kw);
      }
      return true;
    });

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">教師名冊與代課人才庫 (Teacher Directory)</h2>
          <p class="text-xs text-muted mt-1">管理校內編制教師、外聘兼任教師與退休人才庫，維護基本節數與專長標籤</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" onclick="TeacherModule.openEditModal()">
            <span>➕ 新增教師/人才</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-4 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">👨‍🏫</div>
          <div class="stat-content">
            <div class="stat-label">校內編制教師</div>
            <div class="stat-value">${teachers.filter(t => t.type === 'INSIDE').length} <span class="text-xs text-muted">位</span></div>
            <div class="stat-meta">主任/組長/導師/科任</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon emerald">👥</div>
          <div class="stat-content">
            <div class="stat-label">外聘兼任師資</div>
            <div class="stat-value">${teachers.filter(t => t.type === 'EXTERNAL').length} <span class="text-xs text-muted">位</span></div>
            <div class="stat-meta">常備兼任與代課人才</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">🎖️</div>
          <div class="stat-content">
            <div class="stat-label">退休兼課人才庫</div>
            <div class="stat-value">${teachers.filter(t => t.type === 'RETIRED').length} <span class="text-xs text-muted">位</span></div>
            <div class="stat-meta">資深退休支援教師</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon sky">⏱️</div>
          <div class="stat-content">
            <div class="stat-label">每週超鐘點總節數</div>
            <div class="stat-value">${Object.values(teacherStats).reduce((sum, s) => sum + s.overtime, 0)} <span class="text-xs text-muted">節</span></div>
            <div class="stat-meta">課表常態兼超節數</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="tab-group" style="margin-bottom: 0; border-bottom: none;">
            <button class="tab-btn ${this.currentTab === 'ALL' ? 'active' : ''}" onclick="TeacherModule.setTab('ALL')">
              全部名冊 (${teachers.length})
            </button>
            <button class="tab-btn ${this.currentTab === 'INSIDE' ? 'active' : ''}" onclick="TeacherModule.setTab('INSIDE')">
              校內專任 (${teachers.filter(t => t.type === 'INSIDE').length})
            </button>
            <button class="tab-btn ${this.currentTab === 'EXTERNAL' ? 'active' : ''}" onclick="TeacherModule.setTab('EXTERNAL')">
              外聘師資 (${teachers.filter(t => t.type === 'EXTERNAL').length})
            </button>
            <button class="tab-btn ${this.currentTab === 'RETIRED' ? 'active' : ''}" onclick="TeacherModule.setTab('RETIRED')">
              退休人才庫 (${teachers.filter(t => t.type === 'RETIRED').length})
            </button>
          </div>

          <div class="flex items-center gap-2">
            <input type="text" class="form-control form-control-sm" placeholder="搜尋姓名、專長、職稱..."
                   value="${this.searchKeyword}" oninput="TeacherModule.onSearch(this.value)" style="width: 220px;">
          </div>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 60px;">序號</th>
                <th>教師姓名</th>
                <th>身分別</th>
                <th>職稱 / 職責</th>
                <th class="text-center">基本節數</th>
                <th class="text-center">減課節數</th>
                <th class="text-center">應授節數</th>
                <th class="text-center">課表實排</th>
                <th class="text-center">每週超節</th>
                <th>薪級俸點</th>
                <th>專長領域 / 標籤</th>
                <th>聯絡電話 / 備註</th>
                <th class="text-right" style="width: 100px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="13" class="text-center py-4 text-muted">無符合條件之教師資料</td>
                </tr>
              ` : filtered.map((t, idx) => {
                const stats = teacherStats[t.id] || { actualPeriods: 0, netBase: 0, overtime: 0 };
                const typeBadge = t.type === 'INSIDE' ? '<span class="badge badge-primary">校內專任</span>' :
                                  t.type === 'EXTERNAL' ? '<span class="badge badge-emerald">外聘兼任</span>' :
                                  '<span class="badge badge-amber">退休人才</span>';
                const titleText = t.title === 'DIRECTOR' ? '處室主任' :
                                  t.title === 'LEADER' ? '教學/行政組長' :
                                  t.title === 'HOMEROOM' ? '學年班級導師' :
                                  t.title === 'SUBJECT' ? '專任科任教師' : (t.note || '-');

                return `
                  <tr>
                    <td class="text-muted">${idx + 1}</td>
                    <td><div class="font-bold text-slate-900">${t.name}</div></td>
                    <td>${typeBadge}</td>
                    <td>${titleText}</td>
                    <td class="text-center">${t.type === 'INSIDE' ? t.basePeriods : '-'}</td>
                    <td class="text-center">
                      ${t.reductionPeriods > 0 ? `<span class="text-rose font-bold">-${t.reductionPeriods}</span> <span class="text-xs text-muted">(${t.reductionReason || '減課'})</span>` : '0'}
                    </td>
                    <td class="text-center font-bold">${t.type === 'INSIDE' ? stats.netBase : '-'}</td>
                    <td class="text-center">
                      <span class="badge badge-slate">${stats.actualPeriods} 節</span>
                    </td>
                    <td class="text-center">
                      ${stats.overtime > 0 ? `<span class="badge badge-rose font-bold">+${stats.overtime} 節</span>` : '<span class="text-muted">0</span>'}
                    </td>
                    <td>${t.salaryPoint ? `<span class="badge badge-sky">${t.salaryPoint} 點</span>` : '<span class="text-muted">-</span>'}</td>
                    <td>
                      <div class="flex gap-1" style="flex-wrap: wrap;">
                        ${(t.tags || []).map(tag => `<span class="candidate-badge">${tag}</span>`).join('')}
                      </div>
                    </td>
                    <td>
                      <div class="text-xs">${t.phone || ''}</div>
                      <div class="text-xs text-muted">${t.note || ''}</div>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-secondary btn-sm" onclick="TeacherModule.openEditModal('${t.id}')">編輯</button>
                      <button class="btn btn-danger btn-sm" onclick="TeacherModule.deleteTeacher('${t.id}', '${t.name}')">刪除</button>
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

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  onSearch(kw) {
    this.searchKeyword = kw;
    this.render();
  },

  async openEditModal(teacherId = null) {
    this._currentEditingId = teacherId;

    let teacher = {
      id: '',
      name: '',
      type: 'INSIDE',
      title: 'HOMEROOM',
      basePeriods: 16,
      reductionReason: '',
      reductionPeriods: 0,
      phone: '',
      salaryPoint: 330,
      note: '',
      tags: []
    };

    if (teacherId) {
      const existing = await window.appDB.getTeacherById(teacherId);
      if (existing) teacher = existing;
    }

    const titleMap = [
      { key: 'DIRECTOR', label: '處室主任 (基本2節)' },
      { key: 'LEADER', label: '處室組長 (基本8節)' },
      { key: 'HOMEROOM', label: '班級導師 (基本16節)' },
      { key: 'SUBJECT', label: '科任教師 (基本20節)' }
    ];

    const content = `
      <div class="mb-3 p-2 rounded text-xs font-semibold"
           style="background: var(--emerald-50); color: var(--emerald-800); border: 1px solid var(--emerald-200);">
        🟢 自動存檔模式：每修改一個欄位後，系統即自動儲存，無需手動按儲存鈕。
      </div>

      <form id="teacher-form">
        <input type="hidden" id="t-id" value="${teacher.id}">

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label required">教師姓名</label>
            <input type="text" id="t-name" class="form-control" value="${teacher.name}" placeholder="請輸入姓名">
          </div>
          <div class="form-group">
            <label class="form-label required">身分別</label>
            <select id="t-type" class="form-control" onchange="TeacherModule.onTypeChange(this.value)">
              <option value="INSIDE" ${teacher.type === 'INSIDE' ? 'selected' : ''}>校內專任教師</option>
              <option value="EXTERNAL" ${teacher.type === 'EXTERNAL' ? 'selected' : ''}>外聘兼任 / 代課師資</option>
              <option value="RETIRED" ${teacher.type === 'RETIRED' ? 'selected' : ''}>退休人才庫</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2" id="inside-fields" style="${teacher.type === 'INSIDE' ? '' : 'display: none;'}">
          <div class="form-group">
            <label class="form-label">職稱 / 職責</label>
            <select id="t-title" class="form-control" onchange="TeacherModule.onTitleChange(this.value)">
              ${titleMap.map(t => `<option value="${t.key}" ${teacher.title === t.key ? 'selected' : ''}>${t.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">基本授課節數</label>
            <input type="number" id="t-basePeriods" class="form-control" value="${teacher.basePeriods}" min="0" max="40">
          </div>
        </div>

        <div class="grid grid-cols-2" id="reduction-fields" style="${teacher.type === 'INSIDE' ? '' : 'display: none;'}">
          <div class="form-group">
            <label class="form-label">減課原因</label>
            <input type="text" id="t-reductionReason" class="form-control" value="${teacher.reductionReason || ''}" placeholder="如：額滿學校減課、學年主任、數位精進">
          </div>
          <div class="form-group">
            <label class="form-label">減課節數</label>
            <input type="number" id="t-reductionPeriods" class="form-control" value="${teacher.reductionPeriods || 0}" min="0" max="20">
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">薪級俸點</label>
            <input type="number" id="t-salaryPoint" class="form-control" value="${teacher.salaryPoint || ''}" placeholder="如：625, 450, 190, 170">
          </div>
          <div class="form-group">
            <label class="form-label">聯絡電話 / 手機</label>
            <input type="text" id="t-phone" class="form-control" value="${teacher.phone || ''}" placeholder="如：0912-345-678">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">專長標籤 (以逗點分隔)</label>
          <input type="text" id="t-tags" class="form-control" value="${(teacher.tags || []).join(', ')}" placeholder="如：閩南語, 英語, 自然, 資訊, 田徑">
          <div class="form-help">智慧排代媒合時將依此標籤進行專長自動比對</div>
        </div>

        <div class="form-group">
          <label class="form-label">備註事項 / 可配合時段</label>
          <textarea id="t-note" class="form-control" rows="2" placeholder="如：週二、週四全天可；具雙語合格證書">${teacher.note || ''}</textarea>
        </div>
      </form>
    `;

    // 使用 '__AUTO_SAVE__' 標記讓 app.js 自動替換 footer 為自動存檔說明
    window.app.openModal(
      teacherId ? `編輯教師：${teacher.name}` : '新增教師與人才資料',
      content,
      '__AUTO_SAVE__',
      '',
      'TEACHER'
    );
  },

  onTypeChange(type) {
    const insideFields = document.getElementById('inside-fields');
    const reductionFields = document.getElementById('reduction-fields');
    if (insideFields && reductionFields) {
      if (type === 'INSIDE') {
        insideFields.style.display = '';
        reductionFields.style.display = '';
      } else {
        insideFields.style.display = 'none';
        reductionFields.style.display = 'none';
      }
    }
    // 每次 type 變更也觸發自動存檔
    window.app._scheduleAutoSave('TEACHER');
  },

  onTitleChange(title) {
    const baseInput = document.getElementById('t-basePeriods');
    if (!baseInput) return;
    if (title === 'DIRECTOR') baseInput.value = 2;
    else if (title === 'LEADER') baseInput.value = 8;
    else if (title === 'HOMEROOM') baseInput.value = 16;
    else if (title === 'SUBJECT') baseInput.value = 20;
    window.app._scheduleAutoSave('TEACHER');
  },

  // 自動存檔函式 (由 app.js 的自動存檔引擎呼叫)
  async autoSaveTeacher() {
    const nameInput = document.getElementById('t-name');
    if (!nameInput) return; // Modal 已關閉
    const name = nameInput.value.trim();
    if (!name) return; // 姓名未填寫，不存

    const id = document.getElementById('t-id').value;
    const type = document.getElementById('t-type').value;
    const title = document.getElementById('t-title')?.value || 'SUBJECT';
    const basePeriods = parseInt(document.getElementById('t-basePeriods')?.value || '0', 10);
    const reductionReason = document.getElementById('t-reductionReason')?.value || '';
    const reductionPeriods = parseInt(document.getElementById('t-reductionPeriods')?.value || '0', 10);
    const salaryPoint = parseInt(document.getElementById('t-salaryPoint')?.value || '0', 10) || null;
    const phone = document.getElementById('t-phone')?.value || '';
    const note = document.getElementById('t-note')?.value || '';
    const tagsRaw = document.getElementById('t-tags')?.value || '';
    const tags = tagsRaw.split(/[,，、\s]+/).map(t => t.trim()).filter(Boolean);

    const teacherData = {
      id: id || undefined,
      name,
      type,
      title,
      basePeriods: type === 'INSIDE' ? basePeriods : 0,
      reductionReason: type === 'INSIDE' ? reductionReason : '',
      reductionPeriods: type === 'INSIDE' ? reductionPeriods : 0,
      salaryPoint,
      phone,
      note,
      tags
    };

    const saved = await window.appDB.saveTeacher(teacherData);

    // 如果是新增，把 ID 填回 hidden field，讓下次自動存檔可以更新同一筆
    if (!id && saved && saved.id) {
      const idField = document.getElementById('t-id');
      if (idField) idField.value = saved.id;
      this._currentEditingId = saved.id;
    }

    // 自動存檔完成後刷新清單（不關閉 Modal）
    this.render();
  },

  async deleteTeacher(id, name) {
    if (confirm(`確定要刪除教師「${name}」嗎？相關課表資料亦將一併移除。`)) {
      await window.appDB.deleteTeacher(id);
      window.app.showToast(`已刪除教師「${name}」`, 'info');
      this.render();
    }
  }
};

window.TeacherModule = TeacherModule;
