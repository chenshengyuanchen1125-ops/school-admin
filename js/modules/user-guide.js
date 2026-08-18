/**
 * In-App Interactive User Manual & Help Center
 * 系統使用說明書與教學指引模組
 */

const UserGuideModule = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('module-container');
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="page-title">系統操作使用說明書 (User Guide & Manual)</h2>
          <p class="text-xs text-muted mt-1">國小校務教學行政與鐘點代課整合系統完整流程指引與常見問題解答</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="window.print()">
            <span>🖨️ 列印使用說明書</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <!-- 主說明書內容 (佔 8 欄) -->
        <div style="grid-column: span 8;" class="flex flex-col gap-4">
          
          <!-- 導讀卡片 -->
          <div class="card">
            <div class="card-header" style="background: var(--primary-50);">
              <div class="card-title text-primary">🏫 系統架構簡介與設計核心</div>
            </div>
            <div class="card-body" style="font-size: 0.88rem; line-height: 1.7;">
              <p>
                本系統專為<strong>國小教學組長、教務處與行政幹事</strong>量身打造，具備<strong>「離線優先 (Offline-First)」、「每一步驟自動即時存檔」、「毫秒級課表空堂媒合」與「官方 7 級簽核多 Sheet Excel 產製」</strong>四大核心能力。
              </p>
              <p class="mt-2 text-xs text-muted">
                🛡️ <strong>資料隱私安全保證：</strong> 所有教師基本資料、排代紀錄與經費計算均直接保存在您的電腦本機瀏覽器資料庫中（IndexedDB），不經過任何外部伺服器，絕無個資外洩風險。
              </p>
            </div>
          </div>

          <!-- 7 大標準作業流程 -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">📖 教學組全學期 7 大標準作業指引</div>
            </div>
            <div class="card-body flex flex-col gap-4">

              <!-- 流程 1 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 1</span> 學期初：建置教師名冊與基本節數
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  1. 前往「<strong>空白範本與批次匯入</strong>」下載「教師名冊空白範本 (Excel)」。<br>
                  2. 填入校內教師、主任(2節)、組長(8節)、導師(16節)、科任(20節)及減課節數（如額滿學校、學年主任、數位精進）。<br>
                  3. 亦可登記外聘師資庫（可配合時段、專長標籤如閩南語、自然、體育等）。<br>
                  4. 將填妥之檔案拖曳匯入，系統即刻完成資料庫建立。
                </div>
              </div>

              <!-- 流程 2 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 2</span> 學期初：匯入全校每週課表
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  1. 從學校排課系統（如欣河、巨耀、教育局課表系統）匯出課表 Excel/CSV。<br>
                  2. 前往「<strong>課表矩陣與匯入</strong>」，拖曳上傳檔案，確認欄位（教師、星期、節次、班級、科目）對應後確認匯入。<br>
                  3. 可於「教師個人週課表」與「班級功課表」中核對每位教師每週實排節數與超鐘點節數。
                </div>
              </div>

              <!-- 流程 3 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 3</span> 平常日：智慧排代登記與毫秒級空堂媒合
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  1. 當有教師請公差假、病假或身心調適假時，點擊「<strong>智慧排代與找人</strong>」按鈕。<br>
                  2. 輸入請假日期與節次（支援多選第 2、3、4 節批次排代），系統右側立即自動運算：<br>
                     - <strong>校內空堂名單：</strong> 列出該時段完全無課的校內教師。<br>
                     - <strong>外聘專長人才：</strong> 自動依請假科目（如美勞、英語）優先推薦專長契合的外聘師資與電話。<br>
                  3. 點選「帶入排代」並填入公文字號，一鍵儲存。
                </div>
              </div>

              <!-- 流程 4 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 4</span> 月末：自選區間經費結算與保費線上微調
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  1. 前往「<strong>經費核算 DataGrid</strong>」，選擇計費起訖日（如 <code>115/06/01 ~ 115/06/30</code>）。<br>
                  2. 系統自動計算：常態超鐘點（週超節 * 4週）、公假鐘點、全日日薪（$1760 + 導師加給$133）、身心調適假。<br>
                  3. <strong>六年級畢業扣課：</strong> 勾選「啟用六年級 6/12 畢業扣課」，系統自動扣除畢業後節數。<br>
                  4. <strong>線上輸入保費：</strong> 於儲存格直接鍵入人事/出納提供之勞保與健保自付額，實領金額即時動態更新。
                </div>
              </div>

              <!-- 流程 5 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 5</span> 月末：一鍵產製官方 7 級簽核 Excel 活頁簿
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  1. 點擊右上角「<strong>📑 匯出官方印領清冊 Excel</strong>」。<br>
                  2. 系統將純離線產出包含 <code>114學年超鐘點總表</code>、<code>代課(鐘點)</code>、<code>代課(日薪)</code>、<code>身心調適假</code>、<code>各專案超鐘點</code> 5 大 Sheet 之 Excel 檔。<br>
                  3. 內建正式公文抬頭、會計預算科目、憑證編號、SUM 算式與底部 7 級行政簽核欄。
                </div>
              </div>

              <!-- 流程 6 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 6</span> 表單名稱與費率彈性自訂
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  若學校有特殊需求（如更改工作表名稱為「114-2兼超鐘點」或自訂簽核職稱），隨時前往「<strong>表單名稱與功能設定</strong>」進行客製化修正，修改後立即即時生效。
                </div>
              </div>

              <!-- 流程 7 -->
              <div class="p-3 border rounded" style="background: var(--slate-50);">
                <div class="font-bold text-slate-900 mb-1">
                  <span class="badge badge-primary mr-1">步驟 7</span> 定期備份與電腦移轉
                </div>
                <div class="text-xs text-slate-700" style="line-height: 1.6;">
                  點擊右上角「<strong>💾 資料備份</strong>」，下載單一 <code>.json</code> 檔案妥善保存。於更換新電腦時，點擊匯入還原即可一秒恢復完整校務資料庫。
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- 右側：常見問題 FAQ (佔 4 欄) -->
        <div style="grid-column: span 4;" class="flex flex-col gap-4">
          <div class="card">
            <div class="card-header">
              <div class="card-title">❓ 常見問題與解答 (FAQ)</div>
            </div>
            <div class="card-body flex flex-col gap-3" style="font-size: 0.8rem; line-height: 1.6;">
              <div class="p-2 border rounded">
                <strong class="text-slate-900">Q1: 每次打開網頁資料會不會不見？</strong>
                <p class="text-xs text-muted mt-1">
                  答：絕對不會！系統內建 IndexedDB 自動持久化，每一步驟輸入皆即時自動存檔，重新整理或關閉瀏覽器後資料均完好如初。
                </p>
              </div>

              <div class="p-2 border rounded">
                <strong class="text-slate-900">Q2: 可以在沒有網路的環境使用嗎？</strong>
                <p class="text-xs text-muted mt-1">
                  答：可以！所有核心函式庫 (Dexie, ExcelJS, SheetJS) 皆已完整內建本地端，完全支援斷網離線環境運作。
                </p>
              </div>

              <div class="p-2 border rounded">
                <strong class="text-slate-900">Q3: 六年級畢業後，超鐘點如何扣除？</strong>
                <p class="text-xs text-muted mt-1">
                  答：前往「經費核算 DataGrid」，勾選「啟用六年級 (6/12畢業) 扣課計算」，系統會自動計算任課教師任教六年級之每週節數並自總節數中扣除。
                </p>
              </div>

              <div class="p-2 border rounded">
                <strong class="text-slate-900">Q4: 如何匯入我們學校自己的真實課表？</strong>
                <p class="text-xs text-muted mt-1">
                  答：點擊左側「空白範本與批次匯入」下載範本，將學校排課資料貼入後上傳即可！
                </p>
              </div>

              <div class="p-2 border rounded">
                <strong class="text-slate-900">Q5: 清冊的預算科目與公文字號如何修改？</strong>
                <p class="text-xs text-muted mt-1">
                  答：前往左側「經費計畫與科目」或「表單名稱與功能設定」，即可自由編輯會計科目字樣與憑證編號。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.UserGuideModule = UserGuideModule;
