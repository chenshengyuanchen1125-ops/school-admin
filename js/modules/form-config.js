/**
 * Form Customizer & System Configuration Module
 * v3.0 - 全自動即時存檔版：每修改任何欄位立刻存檔，無需手動儲存
 */

const FormConfigModule = {
  _debounceTimer: null,

  init() {
    this.render();
  },

  async render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    const schoolConfig = await window.appDB.getConfig('schoolInfo') || {
      schoolName: '新北市新林國民小學',
      academicYear: '114學年度第2學期',
      hourlyRateDefault: 405,
      dailyRateDefault: 1760,
      tutorAllowanceDefault: 133,
      signatories: ['製表人 / 教學組長', '出納組長(所得登錄)', '幹事(勞健保費)', '人事主任', '教務主任', '會計主任', '校長']
    };

    const formTitlesConfig = await window.appDB.getConfig('formTitlesConfig') || {
      sheet1Name: '114學年超鐘點總表',
      sheet2Name: '代課(鐘點)',
      sheet3Name: '代課(日薪)',
      sheet4Name: '身心調適假',
      sheet5Name: '各專案超鐘點'
    };

    const sigs = schoolConfig.signatories || [];

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">表單名稱與功能設定 (Form & Sheet Customizer)</h2>
          <p class="text-xs text-muted mt-1">修改任何欄位後立即自動存檔，無需手動按儲存鈕</p>
        </div>
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background: var(--emerald-50); border: 1px solid var(--emerald-200);">
          <span style="display:inline-block; width: 8px; height: 8px; background: var(--emerald-500); border-radius: 50%;"></span>
          <span class="text-xs font-bold text-emerald">每個欄位修改後自動即時存檔</span>
        </div>
      </div>

      <!-- 學校基本資訊 -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">🏫 學校基本資訊 (每格即存)</div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">學校全銜</label>
              <input type="text" id="cfg-schoolName" class="form-control" value="${schoolConfig.schoolName}"
                     oninput="FormConfigModule.scheduleAutoSave()" placeholder="如：新北市新林國民小學">
            </div>
            <div class="form-group">
              <label class="form-label">學年學期</label>
              <input type="text" id="cfg-academicYear" class="form-control" value="${schoolConfig.academicYear}"
                     oninput="FormConfigModule.scheduleAutoSave()" placeholder="如：114學年度第2學期">
            </div>
          </div>
        </div>
      </div>

      <!-- 費率設定 -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">💰 費率與加給設定 (每格即存)</div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-3">
            <div class="form-group">
              <label class="form-label">鐘點代課費 (元/節)</label>
              <input type="number" id="cfg-hourlyRate" class="form-control" value="${schoolConfig.hourlyRateDefault}"
                     oninput="FormConfigModule.scheduleAutoSave()">
              <div class="form-help">校內超鐘點與一般代課每節鐘點費</div>
            </div>
            <div class="form-group">
              <label class="form-label">全日日薪代課費 (元/天)</label>
              <input type="number" id="cfg-dailyRate" class="form-control" value="${schoolConfig.dailyRateDefault}"
                     oninput="FormConfigModule.scheduleAutoSave()">
              <div class="form-help">全日派代代課日薪費</div>
            </div>
            <div class="form-group">
              <label class="form-label">代理導師加給 (元/天)</label>
              <input type="number" id="cfg-tutorAllowance" class="form-control" value="${schoolConfig.tutorAllowanceDefault}"
                     oninput="FormConfigModule.scheduleAutoSave()">
              <div class="form-help">日薪代理導師班附加導師費</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Excel 工作表名稱 -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">📊 Excel 5 大工作表名稱自訂 (每格即存)</div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-5">
            <div class="form-group">
              <label class="form-label">Sheet 1 名稱</label>
              <input type="text" id="cfg-sheet1Name" class="form-control" value="${formTitlesConfig.sheet1Name}"
                     oninput="FormConfigModule.scheduleAutoSave()">
            </div>
            <div class="form-group">
              <label class="form-label">Sheet 2 名稱</label>
              <input type="text" id="cfg-sheet2Name" class="form-control" value="${formTitlesConfig.sheet2Name}"
                     oninput="FormConfigModule.scheduleAutoSave()">
            </div>
            <div class="form-group">
              <label class="form-label">Sheet 3 名稱</label>
              <input type="text" id="cfg-sheet3Name" class="form-control" value="${formTitlesConfig.sheet3Name}"
                     oninput="FormConfigModule.scheduleAutoSave()">
            </div>
            <div class="form-group">
              <label class="form-label">Sheet 4 名稱</label>
              <input type="text" id="cfg-sheet4Name" class="form-control" value="${formTitlesConfig.sheet4Name}"
                     oninput="FormConfigModule.scheduleAutoSave()">
            </div>
            <div class="form-group">
              <label class="form-label">Sheet 5 名稱</label>
              <input type="text" id="cfg-sheet5Name" class="form-control" value="${formTitlesConfig.sheet5Name}"
                     oninput="FormConfigModule.scheduleAutoSave()">
            </div>
          </div>
          <p class="text-xs text-muted mt-2">⚡ 以上名稱將直接套用至「匯出官方印領清冊 Excel」的活頁標籤名稱</p>
        </div>
      </div>

      <!-- 7 級行政簽核欄 -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">✍️ 7 級行政簽核欄職稱自訂 (每格即存)</div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-7">
            ${(sigs.length >= 7 ? sigs : [...sigs, ...Array(7 - sigs.length).fill('')]).slice(0, 7).map((sig, i) => `
              <div class="form-group">
                <label class="form-label">第 ${i + 1} 欄</label>
                <input type="text" id="cfg-sig-${i}" class="form-control form-control-sm" value="${sig}"
                       oninput="FormConfigModule.scheduleAutoSave()">
              </div>
            `).join('')}
          </div>

          <!-- 即時預覽簽核欄 -->
          <div class="signature-box mt-3">
            ${(sigs.length >= 7 ? sigs : [...sigs, ...Array(7 - sigs.length).fill('')]).slice(0, 7).map(sig => `
              <div class="signature-col">
                <div class="signature-title">${sig || '-'}</div>
                <div class="signature-space"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 目前設定總覽 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📋 目前已儲存設定總覽</div>
          <span class="badge badge-emerald">自動存檔中</span>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-3 gap-3">
            <div class="p-3 rounded" style="background: var(--slate-50); border: 1px solid var(--slate-200);">
              <div class="text-xs font-bold text-slate-700 mb-1">學校名稱</div>
              <div class="font-bold text-slate-900">${schoolConfig.schoolName}</div>
            </div>
            <div class="p-3 rounded" style="background: var(--slate-50); border: 1px solid var(--slate-200);">
              <div class="text-xs font-bold text-slate-700 mb-1">鐘點單價</div>
              <div class="font-bold text-primary">$${schoolConfig.hourlyRateDefault}/節</div>
            </div>
            <div class="p-3 rounded" style="background: var(--slate-50); border: 1px solid var(--slate-200);">
              <div class="text-xs font-bold text-slate-700 mb-1">日薪費率</div>
              <div class="font-bold text-emerald">$${schoolConfig.dailyRateDefault}/天</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 節流器：輸入後 600ms 自動存檔
  scheduleAutoSave() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.autoSaveConfig();
    }, 600);
  },

  // 自動存檔函式 (由 scheduleAutoSave 和 app.js 引擎呼叫)
  async autoSaveConfig() {
    const schoolName = document.getElementById('cfg-schoolName')?.value || '';
    const academicYear = document.getElementById('cfg-academicYear')?.value || '';
    const hourlyRateDefault = parseInt(document.getElementById('cfg-hourlyRate')?.value || '405', 10);
    const dailyRateDefault = parseInt(document.getElementById('cfg-dailyRate')?.value || '1760', 10);
    const tutorAllowanceDefault = parseInt(document.getElementById('cfg-tutorAllowance')?.value || '133', 10);

    const signatories = [];
    for (let i = 0; i < 7; i++) {
      const val = document.getElementById(`cfg-sig-${i}`)?.value || '';
      signatories.push(val);
    }

    const sheet1Name = document.getElementById('cfg-sheet1Name')?.value || '114學年超鐘點總表';
    const sheet2Name = document.getElementById('cfg-sheet2Name')?.value || '代課(鐘點)';
    const sheet3Name = document.getElementById('cfg-sheet3Name')?.value || '代課(日薪)';
    const sheet4Name = document.getElementById('cfg-sheet4Name')?.value || '身心調適假';
    const sheet5Name = document.getElementById('cfg-sheet5Name')?.value || '各專案超鐘點';

    // 儲存學校設定
    await window.appDB.saveConfig('schoolInfo', {
      schoolName,
      academicYear,
      hourlyRateDefault,
      dailyRateDefault,
      tutorAllowanceDefault,
      signatories
    });

    // 儲存表單標題設定
    await window.appDB.saveConfig('formTitlesConfig', {
      mainReportTitle: `${schoolName} ${academicYear} 教師超鐘點及代課鐘點費印領清冊`,
      sheet1Name,
      sheet1Title: `${schoolName} ${academicYear} 教師超鐘點印領清冊`,
      sheet2Name,
      sheet2Title: `${schoolName} ${academicYear} 教師公假派代(鐘點)印領清冊`,
      sheet3Name,
      sheet3Title: `${schoolName} ${academicYear} 全日公假派代(日薪)印領清冊`,
      sheet4Name,
      sheet4Title: `${schoolName} ${academicYear} 教師身心調適假派代印領清冊`,
      sheet5Name,
      sheet5Title: `${schoolName} ${academicYear} 各項專案計畫減課超鐘點印領清冊`
    });

    // 更新 Header 學校名稱
    const headerSchool = document.getElementById('header-school-name');
    if (headerSchool) {
      headerSchool.textContent = `${schoolName} ${academicYear}`;
    }

    window.appDB.markAutoSaved();
  }
};

window.FormConfigModule = FormConfigModule;
