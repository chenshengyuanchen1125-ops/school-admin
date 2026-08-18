/**
 * Blank Import Template Generator & Universal Data Importer
 * 空白範本下載與資料庫批次匯入模組
 */

const TemplateManagerModule = {
  importTarget: 'TEACHERS', // 'TEACHERS' | 'TIMETABLE' | 'SUBSTITUTE' | 'BUDGET_PLANS'
  rawRows: [],
  rawHeaders: [],

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">空白匯入範本下載與批次建庫 (Template & Batch Importer)</h2>
          <p class="text-xs text-muted mt-1">下載官方標準格式空白 Excel/CSV 範本，填妥後一鍵快速匯入初始化校務資料庫</p>
        </div>
      </div>

      <!-- 4 大空白範本下載卡片 -->
      <div class="grid grid-cols-4 mb-4">
        <!-- 1. 教師名冊範本 -->
        <div class="card">
          <div class="card-body flex flex-col justify-between" style="height: 100%;">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.5rem;">👨‍🏫</span>
                <div class="font-bold text-slate-900 text-sm">教師名冊空白範本</div>
              </div>
              <p class="text-xs text-muted mb-3">
                包含姓名、身分別(校內/外聘/退休)、職稱、基本授課節數、減課原因/節數、薪級俸點、專長標籤等欄位。
              </p>
            </div>
            <div class="flex gap-2 mt-2">
              <button class="btn btn-secondary btn-sm w-full" onclick="TemplateManagerModule.downloadTeacherTemplate('csv')">
                📥 下載 CSV
              </button>
              <button class="btn btn-primary btn-sm w-full" onclick="TemplateManagerModule.downloadTeacherTemplate('xlsx')">
                📑 下載 Excel
              </button>
            </div>
          </div>
        </div>

        <!-- 2. 全校課表範本 -->
        <div class="card">
          <div class="card-body flex flex-col justify-between" style="height: 100%;">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.5rem;">🏫</span>
                <div class="font-bold text-slate-900 text-sm">全校課表空白範本</div>
              </div>
              <p class="text-xs text-muted mb-3">
                相容欣河、巨耀、教育局排課系統，包含教師姓名、星期(1~5)、節次(1~7)、班級(如101)、科目。
              </p>
            </div>
            <div class="flex gap-2 mt-2">
              <button class="btn btn-secondary btn-sm w-full" onclick="TemplateManagerModule.downloadTimetableTemplate('csv')">
                📥 下載 CSV
              </button>
              <button class="btn btn-primary btn-sm w-full" onclick="TemplateManagerModule.downloadTimetableTemplate('xlsx')">
                📑 下載 Excel
              </button>
            </div>
          </div>
        </div>

        <!-- 3. 排代紀錄範本 -->
        <div class="card">
          <div class="card-body flex flex-col justify-between" style="height: 100%;">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.5rem;">📝</span>
                <div class="font-bold text-slate-900 text-sm">請假排代空白範本</div>
              </div>
              <p class="text-xs text-muted mb-3">
                包含請假日期、節次、原任教師、假別、公文依據、代課教師、計費型態、單價、導師加給等。
              </p>
            </div>
            <div class="flex gap-2 mt-2">
              <button class="btn btn-secondary btn-sm w-full" onclick="TemplateManagerModule.downloadSubstituteTemplate('csv')">
                📥 下載 CSV
              </button>
              <button class="btn btn-primary btn-sm w-full" onclick="TemplateManagerModule.downloadSubstituteTemplate('xlsx')">
                📑 下載 Excel
              </button>
            </div>
          </div>
        </div>

        <!-- 4. 經費計畫科目範本 -->
        <div class="card">
          <div class="card-body flex flex-col justify-between" style="height: 100%;">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.5rem;">💳</span>
                <div class="font-bold text-slate-900 text-sm">經費計畫空白範本</div>
              </div>
              <p class="text-xs text-muted mb-3">
                包含憑證編號、計畫名稱、經費類別、預算科目字樣、預設單價（405或自訂）。
              </p>
            </div>
            <div class="flex gap-2 mt-2">
              <button class="btn btn-secondary btn-sm w-full" onclick="TemplateManagerModule.downloadBudgetTemplate('csv')">
                📥 下載 CSV
              </button>
              <button class="btn btn-primary btn-sm w-full" onclick="TemplateManagerModule.downloadBudgetTemplate('xlsx')">
                📑 下載 Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 萬用批次匯入區 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📤 萬用批次檔案匯入器 (Universal Data Importer)</div>
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-slate-700">匯入目標資料庫：</label>
            <select class="form-control form-control-sm" id="universal-target-select" style="width: 180px;" onchange="TemplateManagerModule.setImportTarget(this.value)">
              <option value="TEACHERS" ${this.importTarget === 'TEACHERS' ? 'selected' : ''}>👨‍🏫 教師名冊資料庫</option>
              <option value="TIMETABLE" ${this.importTarget === 'TIMETABLE' ? 'selected' : ''}>🏫 全校每週課表資料庫</option>
              <option value="SUBSTITUTE" ${this.importTarget === 'SUBSTITUTE' ? 'selected' : ''}>📝 請假排代紀錄資料庫</option>
              <option value="BUDGET_PLANS" ${this.importTarget === 'BUDGET_PLANS' ? 'selected' : ''}>💳 經費計畫科目資料庫</option>
            </select>
          </div>
        </div>

        <div class="card-body">
          <div class="dropzone" id="universal-dropzone" onclick="document.getElementById('universal-file-input').click()">
            <div class="dropzone-icon">📥</div>
            <div class="font-bold text-slate-800">點擊此處或拖曳您填寫好的 Excel / CSV 檔案至此</div>
            <div class="text-xs text-muted mt-1">系統將自動進行欄位比對並提供即時預覽確認</div>
            <input type="file" id="universal-file-input" accept=".xlsx,.xls,.csv" style="display: none;" onchange="TemplateManagerModule.handleFileSelect(event)">
          </div>

          <div id="universal-preview-area" style="display: none;" class="mt-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-bold text-sm text-slate-800">📋 欄位對應與解析預覽</div>
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" id="overwrite-existing-check" checked>
                  匯入時先清空該資料表現有舊資料 (覆蓋模式)
                </label>
              </div>
            </div>

            <!-- 動態欄位選擇器 -->
            <div id="universal-column-mappers" class="grid grid-cols-4 gap-2 mb-3"></div>

            <div class="table-container" style="max-height: 260px; overflow-y: auto;">
              <table class="table" id="universal-preview-table">
                <thead></thead>
                <tbody></tbody>
              </table>
            </div>

            <div class="flex justify-end gap-2 mt-3">
              <button class="btn btn-secondary" onclick="TemplateManagerModule.cancelImport()">取消</button>
              <button class="btn btn-primary" onclick="TemplateManagerModule.commitUniversalImport()">
                <span>✅ 確認匯入並即時存檔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupDropzone();
  },

  setImportTarget(target) {
    this.importTarget = target;
    this.cancelImport();
  },

  setupDropzone() {
    setTimeout(() => {
      const dropzone = document.getElementById('universal-dropzone');
      if (!dropzone) return;

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          TemplateManagerModule.parseFile(e.dataTransfer.files[0]);
        }
      });
    }, 100);
  },

  handleFileSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.parseFile(event.target.files[0]);
    }
  },

  parseFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          window.app.showToast('上傳檔案無有效資料列', 'error');
          return;
        }

        this.rawHeaders = json[0].map(h => String(h || '').trim());
        this.rawRows = json.slice(1).filter(r => r && r.length > 0);

        this.showMappingUI();
      } catch (err) {
        console.error(err);
        window.app.showToast('讀取檔案失敗：' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  },

  showMappingUI() {
    const previewArea = document.getElementById('universal-preview-area');
    const mappersContainer = document.getElementById('universal-column-mappers');
    if (!previewArea || !mappersContainer) return;
    previewArea.style.display = 'block';

    const opts = this.rawHeaders.map((h, i) => `<option value="${i}">${h || `欄位 ${i + 1}`}</option>`).join('');

    if (this.importTarget === 'TEACHERS') {
      mappersContainer.className = 'grid grid-cols-4 gap-2 mb-3';
      mappersContainer.innerHTML = `
        <div class="form-group mb-0">
          <label class="form-label text-xs">教師姓名欄</label>
          <select id="u-col-name" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">身分別 (校內/外聘/退休)</label>
          <select id="u-col-type" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">基本授課節數</label>
          <select id="u-col-base" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">減課節數</label>
          <select id="u-col-red" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
      `;
    } else if (this.importTarget === 'TIMETABLE') {
      mappersContainer.className = 'grid grid-cols-5 gap-2 mb-3';
      mappersContainer.innerHTML = `
        <div class="form-group mb-0">
          <label class="form-label text-xs">教師姓名欄</label>
          <select id="u-col-tname" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">星期欄 (1~5)</label>
          <select id="u-col-day" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">節次欄 (1~7)</label>
          <select id="u-col-period" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">班級欄 (如 101)</label>
          <select id="u-col-class" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">科目欄</label>
          <select id="u-col-sub" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
      `;
    } else if (this.importTarget === 'SUBSTITUTE') {
      mappersContainer.className = 'grid grid-cols-5 gap-2 mb-3';
      mappersContainer.innerHTML = `
        <div class="form-group mb-0">
          <label class="form-label text-xs">請假日期欄 (YYYY-MM-DD)</label>
          <select id="u-col-date" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">節次欄</label>
          <select id="u-col-speriod" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">原任教師欄</label>
          <select id="u-col-absent" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">代課教師欄</label>
          <select id="u-col-subteacher" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">事由/公文欄</label>
          <select id="u-col-doc" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
      `;
    } else if (this.importTarget === 'BUDGET_PLANS') {
      mappersContainer.className = 'grid grid-cols-4 gap-2 mb-3';
      mappersContainer.innerHTML = `
        <div class="form-group mb-0">
          <label class="form-label text-xs">憑證編號欄</label>
          <select id="u-col-voucher" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">計畫名稱欄</label>
          <select id="u-col-pname" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">預算科目欄</label>
          <select id="u-col-subject" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">預設單價欄</label>
          <select id="u-col-rate" class="form-control form-control-sm" onchange="TemplateManagerModule.updatePreview()">${opts}</select>
        </div>
      `;
    }

    // 自動猜測欄位對齊
    this.rawHeaders.forEach((h, i) => {
      const lower = h.toLowerCase();
      if (document.getElementById('u-col-name') && (lower.includes('姓名') || lower.includes('教師'))) document.getElementById('u-col-name').value = i;
      if (document.getElementById('u-col-type') && lower.includes('身分')) document.getElementById('u-col-type').value = i;
      if (document.getElementById('u-col-base') && lower.includes('基本')) document.getElementById('u-col-base').value = i;
      if (document.getElementById('u-col-red') && lower.includes('減課')) document.getElementById('u-col-red').value = i;

      if (document.getElementById('u-col-tname') && (lower.includes('教師') || lower.includes('姓名'))) document.getElementById('u-col-tname').value = i;
      if (document.getElementById('u-col-day') && (lower.includes('星期') || lower.includes('週'))) document.getElementById('u-col-day').value = i;
      if (document.getElementById('u-col-period') && lower.includes('節')) document.getElementById('u-col-period').value = i;
      if (document.getElementById('u-col-class') && lower.includes('班')) document.getElementById('u-col-class').value = i;
      if (document.getElementById('u-col-sub') && (lower.includes('科') || lower.includes('領域'))) document.getElementById('u-col-sub').value = i;

      if (document.getElementById('u-col-date') && lower.includes('日')) document.getElementById('u-col-date').value = i;
      if (document.getElementById('u-col-speriod') && lower.includes('節')) document.getElementById('u-col-speriod').value = i;
      if (document.getElementById('u-col-absent') && (lower.includes('請假') || lower.includes('原任'))) document.getElementById('u-col-absent').value = i;
      if (document.getElementById('u-col-subteacher') && lower.includes('代課')) document.getElementById('u-col-subteacher').value = i;
      if (document.getElementById('u-col-doc') && (lower.includes('公文') || lower.includes('事由'))) document.getElementById('u-col-doc').value = i;

      if (document.getElementById('u-col-voucher') && (lower.includes('憑證') || lower.includes('編號'))) document.getElementById('u-col-voucher').value = i;
      if (document.getElementById('u-col-pname') && lower.includes('名稱')) document.getElementById('u-col-pname').value = i;
      if (document.getElementById('u-col-subject') && lower.includes('科目')) document.getElementById('u-col-subject').value = i;
      if (document.getElementById('u-col-rate') && (lower.includes('單價') || lower.includes('金額'))) document.getElementById('u-col-rate').value = i;
    });

    this.updatePreview();
  },

  updatePreview() {
    const previewTable = document.getElementById('universal-preview-table');
    if (!previewTable) return;

    const thead = previewTable.querySelector('thead');
    const tbody = previewTable.querySelector('tbody');

    const sample = this.rawRows.slice(0, 5);

    if (this.importTarget === 'TEACHERS') {
      const nIdx = parseInt(document.getElementById('u-col-name')?.value || 0, 10);
      const tIdx = parseInt(document.getElementById('u-col-type')?.value || 0, 10);
      const bIdx = parseInt(document.getElementById('u-col-base')?.value || 0, 10);
      const rIdx = parseInt(document.getElementById('u-col-red')?.value || 0, 10);

      thead.innerHTML = `<tr><th>姓名</th><th>身分別</th><th>基本節數</th><th>減課節數</th></tr>`;
      tbody.innerHTML = sample.map(r => `
        <tr>
          <td class="font-bold">${r[nIdx] || ''}</td>
          <td>${r[tIdx] || '校內'}</td>
          <td>${r[bIdx] || '16'}</td>
          <td>${r[rIdx] || '0'}</td>
        </tr>
      `).join('');
    } else if (this.importTarget === 'TIMETABLE') {
      const tIdx = parseInt(document.getElementById('u-col-tname')?.value || 0, 10);
      const dIdx = parseInt(document.getElementById('u-col-day')?.value || 0, 10);
      const pIdx = parseInt(document.getElementById('u-col-period')?.value || 0, 10);
      const cIdx = parseInt(document.getElementById('u-col-class')?.value || 0, 10);
      const sIdx = parseInt(document.getElementById('u-col-sub')?.value || 0, 10);

      thead.innerHTML = `<tr><th>教師</th><th>星期</th><th>節次</th><th>班級</th><th>科目</th></tr>`;
      tbody.innerHTML = sample.map(r => `
        <tr>
          <td class="font-bold">${r[tIdx] || ''}</td>
          <td>週${r[dIdx] || '1'}</td>
          <td>第 ${r[pIdx] || '1'} 節</td>
          <td>${r[cIdx] || ''} 班</td>
          <td>${r[sIdx] || ''}</td>
        </tr>
      `).join('');
    } else if (this.importTarget === 'SUBSTITUTE') {
      const dtIdx = parseInt(document.getElementById('u-col-date')?.value || 0, 10);
      const pIdx = parseInt(document.getElementById('u-col-speriod')?.value || 0, 10);
      const abIdx = parseInt(document.getElementById('u-col-absent')?.value || 0, 10);
      const subIdx = parseInt(document.getElementById('u-col-subteacher')?.value || 0, 10);
      const docIdx = parseInt(document.getElementById('u-col-doc')?.value || 0, 10);

      thead.innerHTML = `<tr><th>請假日期</th><th>節次</th><th>原任教師</th><th>代課教師</th><th>事由/公文</th></tr>`;
      tbody.innerHTML = sample.map(r => `
        <tr>
          <td class="font-bold">${r[dtIdx] || ''}</td>
          <td>第 ${r[pIdx] || '1'} 節</td>
          <td>${r[abIdx] || ''}</td>
          <td class="text-primary font-bold">${r[subIdx] || ''}</td>
          <td class="text-xs text-muted">${r[docIdx] || ''}</td>
        </tr>
      `).join('');
    } else if (this.importTarget === 'BUDGET_PLANS') {
      const vIdx = parseInt(document.getElementById('u-col-voucher')?.value || 0, 10);
      const pIdx = parseInt(document.getElementById('u-col-pname')?.value || 0, 10);
      const sIdx = parseInt(document.getElementById('u-col-subject')?.value || 0, 10);
      const rIdx = parseInt(document.getElementById('u-col-rate')?.value || 0, 10);

      thead.innerHTML = `<tr><th>憑證編號</th><th>計畫名稱</th><th>預算科目</th><th>單價</th></tr>`;
      tbody.innerHTML = sample.map(r => `
        <tr>
          <td><span class="badge badge-slate">${r[vIdx] || ''}</span></td>
          <td class="font-bold">${r[pIdx] || ''}</td>
          <td class="text-xs">${r[sIdx] || ''}</td>
          <td class="text-right font-bold">$${r[rIdx] || '405'}</td>
        </tr>
      `).join('');
    }
  },

  cancelImport() {
    this.rawRows = [];
    this.rawHeaders = [];
    const previewArea = document.getElementById('universal-preview-area');
    if (previewArea) previewArea.style.display = 'none';
  },

  async commitUniversalImport() {
    const isOverwrite = document.getElementById('overwrite-existing-check')?.checked;

    if (this.importTarget === 'TEACHERS') {
      const nIdx = parseInt(document.getElementById('u-col-name').value, 10);
      const tIdx = parseInt(document.getElementById('u-col-type').value, 10);
      const bIdx = parseInt(document.getElementById('u-col-base').value, 10);
      const rIdx = parseInt(document.getElementById('u-col-red').value, 10);

      const teachers = [];
      for (let i = 0; i < this.rawRows.length; i++) {
        const r = this.rawRows[i];
        const name = String(r[nIdx] || '').trim();
        if (!name) continue;

        const typeStr = String(r[tIdx] || '').trim();
        const type = typeStr.includes('外') ? 'EXTERNAL' : typeStr.includes('退') ? 'RETIRED' : 'INSIDE';
        const base = parseInt(r[bIdx] || '16', 10) || 16;
        const red = parseInt(r[rIdx] || '0', 10) || 0;

        teachers.push({
          id: `T_IMP_${Date.now()}_${i}`,
          name,
          type,
          title: base <= 2 ? 'DIRECTOR' : base <= 8 ? 'LEADER' : base <= 16 ? 'HOMEROOM' : 'SUBJECT',
          basePeriods: type === 'INSIDE' ? base : 0,
          reductionPeriods: type === 'INSIDE' ? red : 0,
          salaryPoint: 330,
          tags: []
        });
      }

      if (isOverwrite) await window.appDB.db.teachers.clear();
      await window.appDB.batchSaveTeachers(teachers);
      window.app.showToast(`成功匯入 ${teachers.length} 位教師資料！`, 'success');

    } else if (this.importTarget === 'TIMETABLE') {
      const tIdx = parseInt(document.getElementById('u-col-tname').value, 10);
      const dIdx = parseInt(document.getElementById('u-col-day').value, 10);
      const pIdx = parseInt(document.getElementById('u-col-period').value, 10);
      const cIdx = parseInt(document.getElementById('u-col-class').value, 10);
      const sIdx = parseInt(document.getElementById('u-col-sub').value, 10);

      const existingTeachers = await window.appDB.getAllTeachers();
      const slots = [];

      for (let i = 0; i < this.rawRows.length; i++) {
        const r = this.rawRows[i];
        const teacherName = String(r[tIdx] || '').trim();
        if (!teacherName) continue;

        let teacher = existingTeachers.find(t => t.name === teacherName);
        if (!teacher) {
          teacher = await window.appDB.saveTeacher({
            name: teacherName,
            type: 'INSIDE',
            title: 'SUBJECT',
            basePeriods: 20,
            reductionPeriods: 0,
            tags: []
          });
          existingTeachers.push(teacher);
        }

        const dVal = parseInt(String(r[dIdx] || '1').replace(/[^0-9]/g, ''), 10) || 1;
        const pVal = parseInt(String(r[pIdx] || '1').replace(/[^0-9]/g, ''), 10) || 1;

        slots.push({
          id: `SLOT_IMP_${Date.now()}_${i}`,
          teacherId: teacher.id,
          teacherName: teacher.name,
          dayOfWeek: (dVal >= 1 && dVal <= 5) ? dVal : 1,
          period: (pVal >= 1 && pVal <= 8) ? pVal : 1,
          className: String(r[cIdx] || '101').trim(),
          subject: String(r[sIdx] || '課程').trim()
        });
      }

      await window.appDB.batchSaveTimetable(slots, isOverwrite);
      window.app.showToast(`成功匯入 ${slots.length} 節全校課表！`, 'success');

    } else if (this.importTarget === 'SUBSTITUTE') {
      const dtIdx = parseInt(document.getElementById('u-col-date').value, 10);
      const pIdx = parseInt(document.getElementById('u-col-speriod').value, 10);
      const abIdx = parseInt(document.getElementById('u-col-absent').value, 10);
      const subIdx = parseInt(document.getElementById('u-col-subteacher').value, 10);
      const docIdx = parseInt(document.getElementById('u-col-doc').value, 10);

      const records = [];
      for (let i = 0; i < this.rawRows.length; i++) {
        const r = this.rawRows[i];
        const date = String(r[dtIdx] || '').trim();
        const subName = String(r[subIdx] || '').trim();
        if (!date || !subName) continue;

        records.push({
          id: `SUB_IMP_${Date.now()}_${i}`,
          date,
          dayOfWeek: new Date(date).getDay() || 1,
          period: parseInt(r[pIdx] || '1', 10) || 1,
          absentTeacherId: 'TEMP_ABS_' + i,
          absentTeacherName: String(r[abIdx] || '原任教師').trim(),
          leaveType: 'PUBLIC',
          reasonDocument: String(r[docIdx] || '').trim(),
          substituteTeacherId: 'TEMP_SUB_' + i,
          substituteTeacherName: subName,
          substituteType: 'HOURLY',
          rate: 405,
          tutorAllowance: 0,
          budgetPlanId: 'BP_SUB_HOURLY',
          laborInsuranceDeduction: 0,
          healthInsuranceDeduction: 0
        });
      }

      if (isOverwrite) await window.appDB.db.substituteRecords.clear();
      await window.appDB.batchSaveSubstituteRecords(records);
      window.app.showToast(`成功匯入 ${records.length} 筆排代紀錄！`, 'success');

    } else if (this.importTarget === 'BUDGET_PLANS') {
      const vIdx = parseInt(document.getElementById('u-col-voucher').value, 10);
      const pIdx = parseInt(document.getElementById('u-col-pname').value, 10);
      const sIdx = parseInt(document.getElementById('u-col-subject').value, 10);
      const rIdx = parseInt(document.getElementById('u-col-rate').value, 10);

      const plans = [];
      for (let i = 0; i < this.rawRows.length; i++) {
        const r = this.rawRows[i];
        const voucherNo = String(r[vIdx] || '').trim();
        const name = String(r[pIdx] || '').trim();
        if (!voucherNo || !name) continue;

        plans.push({
          id: `BP_IMP_${Date.now()}_${i}`,
          voucherNo,
          name,
          accountSubject: String(r[sIdx] || '').trim(),
          defaultRate: parseFloat(r[rIdx] || '405') || 405,
          category: 'SPECIAL_PROJECT',
          templateLayout: 'PROJECT_STANDARD'
        });
      }

      if (isOverwrite) await window.appDB.db.budgetPlans.clear();
      await window.appDB.batchSaveBudgetPlans(plans);
      window.app.showToast(`成功匯入 ${plans.length} 項經費計畫！`, 'success');
    }

    this.cancelImport();
  },

  // --- 4 大空白範本產生器 ---
  downloadTeacherTemplate(format = 'xlsx') {
    const headers = ['教師姓名', '身分別(校內/外聘/退休)', '職稱(主任/組長/導師/科任)', '基本授課節數', '減課原因', '減課節數', '薪級俸點', '聯絡電話', '專長標籤(逗號分隔)', '備註事項'];
    const rows = [
      headers,
      ['陳美惠', '校內', '組長', 8, '教學組長減課', 12, 450, '0911-222-333', '國語, 社會', '教學組長'],
      ['王雅婷', '校內', '導師', 16, '', 0, 330, '0920-101-001', '低年級, 國語, 生活', '101導師'],
      ['李家豪', '校內', '科任', 20, '', 0, 350, '0930-111-333', '體育, 桌球', '專任體育'],
      ['高雅涵', '外聘', '科任', 0, '', 0, 190, '0912-345-678', '閩南語, 國語', '週二四全天可'],
      ['彭淑芬', '退休', '導師', 0, '', 0, 625, '0933-111-222', '低年級, 導師', '本校退休名師']
    ];
    this.exportFile(rows, '國小教師名冊匯入範本', format);
  },

  downloadTimetableTemplate(format = 'xlsx') {
    const headers = ['教師姓名', '星期(1~5)', '節次(1~7)', '班級(如101)', '科目名稱'];
    const rows = [
      headers,
      ['陳美惠', 2, 2, '501', '社會'],
      ['陳美惠', 2, 3, '502', '社會'],
      ['李家豪', 1, 2, '101', '體育'],
      ['王雅婷', 1, 4, '101', '國語'],
      ['王雅婷', 1, 5, '101', '生活'],
      ['羅美娟', 1, 1, '301', '英語']
    ];
    this.exportFile(rows, '全校每週課表匯入範本', format);
  },

  downloadSubstituteTemplate(format = 'xlsx') {
    const headers = ['請假日期(YYYY-MM-DD)', '節次(1~7)', '請假原任教師', '假別(公假/病假/身心調適假/事假/喪假)', '事由/公文依據', '代課教師姓名', '計費型態(鐘點/日薪)', '鐘點單價', '導師費加給(日薪填133)'];
    const rows = [
      headers,
      ['2026-06-02', 2, '陳美惠', '公假', '新北教研字第1150882190號函（課表研討會）', '高雅涵', '鐘點', 405, 0],
      ['2026-06-05', 1, '王雅婷', '公假', '新北教幼字第1150901144號（新進教師研習）', '彭淑芬', '日薪', 1760, 133],
      ['2026-06-08', 3, '羅美娟', '身心調適假', '教師身心調適假實施辦法第3條', '周思潔', '鐘點', 405, 0]
    ];
    this.exportFile(rows, '請假排代登記匯入範本', format);
  },

  downloadBudgetTemplate(format = 'xlsx') {
    const headers = ['憑證編號', '計畫名稱', '經費類別(OVERTIME/HOURLY_SUB/DAILY_SUB/SPECIAL_PROJECT)', '預算科目字樣(公文科目)', '預設單價'];
    const rows = [
      headers,
      ['1101', '常態兼超鐘點', 'OVERTIME', '532國民小學教育-53263624國小教育行政-124兼職人員酬金', 405],
      ['1102', '公假/病假派代(鐘點)', 'HOURLY_SUB', '532國民小學教育-53263624國小教育行政-124兼職人員酬金', 405],
      ['1103', '全日公假派代(日薪)', 'DAILY_SUB', '532國民小學教育-53263624國小教育行政-124兼職人員酬金', 1760],
      ['1104', '身心調適假派代', 'HOURLY_SUB', '532國民小學教育-身心調適假專款-124兼職人員酬金', 405],
      ['1120', '額滿學校減課專案', 'SPECIAL_PROJECT', '532國民小學教育-專案補助-124兼職人員酬金', 405]
    ];
    this.exportFile(rows, '經費計畫科目匯入範本', format);
  },

  exportFile(rows, baseFilename, format = 'xlsx') {
    if (format === 'csv') {
      const csvStr = "\uFEFF" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFilename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, '範本資料');
      XLSX.writeFile(wb, `${baseFilename}.xlsx`);
    }
    window.app.showToast(`已成功下載「${baseFilename}.${format}」`, 'success');
  }
};

window.TemplateManagerModule = TemplateManagerModule;
