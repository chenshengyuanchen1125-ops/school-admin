/**
 * Main Application Controller & Router
 * 國小校務教學行政與鐘點代課整合系統 - 主控制器
 * v3.0 - 全面即時自動存檔版 (完全不需要手動按儲存按鈕)
 */

class SchoolApp {
  constructor() {
    this.currentRoute = 'dashboard';
    this.routes = {
      dashboard: window.DashboardModule,
      substitute: window.SubstituteModule,
      timetable: window.TimetableModule,
      teachers: window.TeacherModule,
      settlement: window.SettlementModule,
      'budget-plans': window.BudgetPlanModule,
      'template-manager': window.TemplateManagerModule,
      'form-config': window.FormConfigModule,
      'user-guide': window.UserGuideModule
    };

    // 全域 Modal 即時自動存檔用：記錄目前開啟的 Modal 型態
    this._activeModalType = null;
    this._autoSaveDebounceTimer = null;
  }

  async init() {
    console.log('Initializing Modular School Administrative Suite v3.0 (全自動即時存檔版)...');

    // 初始化 DB 預設設定
    await window.appDB.initDefaults();

    // 檢查是否初次啟用
    const initFlag = await window.appDB.getConfig('hasInitialized');
    if (!initFlag) {
      const teacherCount = (await window.appDB.getAllTeachers()).length;
      if (teacherCount === 0 && window.DemoDataGenerator) {
        console.log('First launch detected, populating initial demo dataset...');
        await window.DemoDataGenerator.loadIntoDatabase(window.appDB);
      }
      await window.appDB.saveConfig('hasInitialized', { status: true });
    }

    // 更新頂部學校資訊抬頭
    const schoolConfig = await window.appDB.getConfig('schoolInfo');
    if (schoolConfig) {
      const headerSchool = document.getElementById('header-school-name');
      if (headerSchool) {
        headerSchool.textContent = `${schoolConfig.schoolName} ${schoolConfig.academicYear} (6月份)`;
      }
    }

    // 繫結側邊欄導航點擊
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const route = item.getAttribute('data-route');
        if (route) {
          e.preventDefault();
          // 切換頁面前先嘗試即時自動存檔
          this._tryAutoSaveCurrentModal();
          this.navigate(route);
        }
      });
    });

    // Modal 背景點擊關閉 (關閉前先自動存檔)
    const modalBackdrop = document.getElementById('app-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this._tryAutoSaveCurrentModal();
          this.closeModal();
        }
      });
    }

    // 啟動第一個路由
    this.navigate('dashboard');

    // 設定頁面離開前自動存檔 (防止意外關閉瀏覽器)
    window.addEventListener('beforeunload', () => {
      this._tryAutoSaveCurrentModal();
    });
  }

  navigate(route) {
    if (!this.routes[route]) return;
    this.currentRoute = route;

    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-route') === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    this.routes[route].init();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =============================================
  // Modal 管理器 (支援自動存檔型態標記)
  // =============================================
  openModal(title, bodyHtml, footerHtml = '', sizeClass = '', modalType = null) {
    const modalBackdrop = document.getElementById('app-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    const modalDialog = document.getElementById('modal-dialog');

    if (!modalBackdrop) return;

    this._activeModalType = modalType;

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;

    // 自動存檔版：不顯示「儲存」按鈕，只顯示「關閉」，底部提示自動存檔
    if (footerHtml === '__AUTO_SAVE__') {
      modalFooter.innerHTML = `
        <div class="flex items-center gap-2 mr-auto text-xs text-emerald" style="font-size: 0.78rem;">
          <span style="display:inline-block; width: 8px; height: 8px; background: var(--emerald-500); border-radius: 50%; animation: pulse 1.5s infinite;"></span>
          每個欄位變動後自動即時存檔，無需手動儲存
        </div>
        <button class="btn btn-secondary" onclick="window.app.closeModal()">關閉</button>
      `;
    } else {
      modalFooter.innerHTML = footerHtml;
    }

    modalDialog.className = 'modal-dialog ' + sizeClass;
    modalBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';

    // 為 Modal 內所有表單欄位綁定自動存檔事件
    setTimeout(() => {
      this._bindModalAutoSave(modalType);
    }, 100);
  }

  closeModal() {
    const modalBackdrop = document.getElementById('app-modal');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
    this._activeModalType = null;
  }

  // =============================================
  // 即時自動存檔核心引擎
  // =============================================

  /**
   * 為 Modal 內的所有 input/select/textarea 元素
   * 綁定 change/input 事件，觸發自動存檔
   */
  _bindModalAutoSave(modalType) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody || !modalType) return;

    const fields = modalBody.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      field.addEventListener('change', () => {
        this._scheduleAutoSave(modalType);
      });
      field.addEventListener('input', () => {
        this._scheduleAutoSave(modalType);
      });
    });
  }

  /**
   * 節流自動存檔：欄位修改後 600ms 執行一次自動存檔
   */
  _scheduleAutoSave(modalType) {
    if (this._autoSaveDebounceTimer) {
      clearTimeout(this._autoSaveDebounceTimer);
    }
    this._autoSaveDebounceTimer = setTimeout(() => {
      this._executeAutoSave(modalType);
    }, 600);
  }

  /**
   * 根據 Modal 型態執行對應的自動存檔函式
   */
  async _executeAutoSave(modalType) {
    try {
      if (modalType === 'TEACHER') {
        await TeacherModule.autoSaveTeacher();
      } else if (modalType === 'SUBSTITUTE') {
        await SubstituteModule.autoSaveRecord();
      } else if (modalType === 'BUDGET_PLAN') {
        await BudgetPlanModule.autoSavePlan();
      } else if (modalType === 'FORM_CONFIG') {
        await FormConfigModule.autoSaveConfig();
      }
      this._showAutoSaveIndicator();
    } catch (err) {
      console.warn('Auto-save error:', err);
    }
  }

  /**
   * 頁面切換或 Modal 關閉前觸發一次強制存檔
   */
  _tryAutoSaveCurrentModal() {
    if (this._activeModalType) {
      if (this._autoSaveDebounceTimer) {
        clearTimeout(this._autoSaveDebounceTimer);
      }
      this._executeAutoSave(this._activeModalType);
    }
  }

  _showAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
      indicator.textContent = '🟢 已即時自動存檔';
      indicator.style.background = 'var(--emerald-100)';
      indicator.style.color = 'var(--emerald-700)';
    }

    // 輕微提示 (不打擾的小通知)
    const floatBadge = document.createElement('div');
    floatBadge.style.cssText = `
      position: fixed; bottom: 80px; right: 24px; z-index: 200;
      background: var(--emerald-600); color: #fff;
      font-size: 0.75rem; font-weight: 600;
      padding: 6px 14px; border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(5,150,105,0.25);
      opacity: 1; transition: opacity 0.5s ease;
      pointer-events: none;
    `;
    floatBadge.textContent = '🟢 自動存檔完成';
    document.body.appendChild(floatBadge);
    setTimeout(() => {
      floatBadge.style.opacity = '0';
      setTimeout(() => document.body.removeChild(floatBadge), 500);
    }, 1800);
  }

  // =============================================
  // Toast 通知管理器
  // =============================================
  showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, duration);
  }

  // =============================================
  // 手動載入範例資料
  // =============================================
  async loadDemoData() {
    if (confirm('確定要載入「新北市新林國民小學 114學年度第2學期 6月份」完整範例資料嗎？（這將重置現有排代與課表為官方範例情境）')) {
      const res = await window.DemoDataGenerator.loadIntoDatabase(window.appDB);
      this.showToast(`已載入範例：${res.teachers}位教師、${res.timetables}節課表、${res.substituteRecords}筆排代紀錄`, 'success', 4000);
      this.navigate(this.currentRoute);
    }
  }

  // =============================================
  // JSON 備份與還原 Modal
  // =============================================
  async openBackupModal() {
    const content = `
      <div class="flex flex-col gap-4">
        <div class="p-3 rounded" style="background: var(--emerald-50); border: 1px solid var(--emerald-200); font-size: 0.82rem; color: var(--emerald-800);">
          🟢 <strong>自動存檔保證：</strong> 系統已啟用全面即時自動存檔，每一個欄位修改後立即存入本機 IndexedDB。您不需要手動按任何儲存鈕。
        </div>

        <div class="card" style="box-shadow: none;">
          <div class="card-header">
            <div class="font-bold text-sm">📤 匯出完整系統 JSON 備份（換電腦或給同事時使用）</div>
          </div>
          <div class="card-body">
            <p class="text-xs text-muted mb-3">包含全校教師名冊、課表矩陣、各月份請假排代明細、經費計畫與表單設定。</p>
            <button class="btn btn-primary" onclick="window.app.exportBackupFile()">
              <span>下載 JSON 備份檔案</span>
            </button>
          </div>
        </div>

        <div class="card" style="box-shadow: none;">
          <div class="card-header">
            <div class="font-bold text-sm">📥 匯入 JSON 備份還原資料（在新電腦恢復資料）</div>
          </div>
          <div class="card-body">
            <p class="text-xs text-muted mb-3">選取先前匯出的 JSON 備份檔案，系統將自動解析並覆蓋現有資料庫。</p>
            <input type="file" id="backup-file-input" accept=".json" class="form-control mb-3" onchange="window.app.handleBackupFileSelect(event)">
            <button class="btn btn-secondary" id="btn-do-restore" disabled onclick="window.app.commitRestore()">
              <span>確認還原備份資料</span>
            </button>
          </div>
        </div>

        <div class="card" style="box-shadow: none; border-color: var(--rose-200);">
          <div class="card-header" style="background: var(--rose-50);">
            <div class="font-bold text-sm text-rose">⚠️ 清空重置資料庫</div>
          </div>
          <div class="card-body">
            <p class="text-xs text-muted mb-3">清空所有排代、課表與教師資料並重置為初始空白狀態（可配合空白範本重新建庫）。</p>
            <button class="btn btn-danger btn-sm" onclick="window.app.resetDatabase()">
              <span>清空所有資料庫資料</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.openModal('系統資料備份、還原與重置', content, `
      <button class="btn btn-secondary" onclick="window.app.closeModal()">關閉</button>
    `, 'modal-lg');
  }

  async exportBackupFile() {
    try {
      const jsonStr = await window.appDB.exportFullBackupJSON();
      const schoolConfig = await window.appDB.getConfig('schoolInfo') || { schoolName: '新林國小' };
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${schoolConfig.schoolName}_教學行政排代系統備份_${dateStr}.json`;

      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast('備份檔案已成功下載！', 'success');
    } catch (err) {
      console.error(err);
      this.showToast('匯出備份失敗：' + err.message, 'error');
    }
  }

  restoreFileContent = null;

  handleBackupFileSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.restoreFileContent = e.target.result;
        document.getElementById('btn-do-restore').disabled = false;
        this.showToast('備份檔案已讀取完畢，請點擊確認還原', 'info');
      };
      reader.readAsText(file);
    }
  }

  async commitRestore() {
    if (!this.restoreFileContent) return;
    if (confirm('確定要以此備份檔案還原資料庫嗎？這將覆蓋現有所有資料！')) {
      try {
        const res = await window.appDB.importFullBackupJSON(this.restoreFileContent, true);
        this.closeModal();
        this.showToast(`備份還原成功！已匯入 ${res.count.teachers}位教師、${res.count.timetables}節課表、${res.count.substituteRecords}筆排代紀錄`, 'success', 4000);
        this.navigate(this.currentRoute);
      } catch (err) {
        this.showToast('還原失敗：' + err.message, 'error');
      }
    }
  }

  async resetDatabase() {
    if (confirm('警告：確定要清空所有資料庫紀錄嗎？此動作無法復原！')) {
      await window.appDB.clearAllData();
      this.closeModal();
      this.showToast('資料庫已清空重置為空白狀態', 'info');
      this.navigate(this.currentRoute);
    }
  }
}

// 實例化全域 App
window.app = new SchoolApp();

// DOM 載入後啟動
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
