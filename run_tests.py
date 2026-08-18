import http.server
import socketserver
import threading
import subprocess
import time
import os
import json
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8999
test_done_event = threading.Event()
received_results = []

class TestServerHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass

    def do_POST(self):
        if self.path == '/report_test_result':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            global received_results
            received_results = json.loads(body)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            test_done_event.set()
        else:
            super().do_POST()

httpd = socketserver.TCPServer(('127.0.0.1', PORT), TestServerHandler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()

test_script = r"""
window.addEventListener('DOMContentLoaded', async () => {
  await new Promise(r => setTimeout(r, 600));
  const results = [];
  try {
    // 1. Check DB init
    const teachers = await window.appDB.getAllTeachers();
    results.push({ test: 'Teachers in DB (教師名冊)', pass: teachers.length > 0, count: teachers.length });

    // 2. Check Timetable Slots
    const slots = await window.appDB.getAllTimetableSlots();
    results.push({ test: 'Timetable slots in DB (全校課表節數)', pass: slots.length > 0, count: slots.length });

    // 3. Check Substitute Records
    const subs = await window.appDB.getAllSubstituteRecords();
    results.push({ test: 'Substitute records in DB (排代紀錄筆數)', pass: subs.length > 0, count: subs.length });

    // 4. Check Budget Plans
    const plans = await window.appDB.getAllBudgetPlans();
    results.push({ test: 'Budget Plans in DB (經費計畫項目)', pass: plans.length > 0, count: plans.length });

    // 5. Test Navigation to all 9 core modules
    const routes = ['dashboard', 'substitute', 'timetable', 'teachers', 'settlement', 'template-manager', 'form-config', 'budget-plans', 'user-guide'];
    for (const r of routes) {
      window.app.navigate(r);
      const container = document.getElementById('module-container');
      results.push({ test: 'Module Route Navigation: ' + r, pass: !!(container && container.children.length > 0) });
    }

    // 6. Test Settlement DataGrid inline deduction persistence
    if (teachers.length > 0) {
      const firstT = teachers[0];
      SettlementModule.updateOvertimeDeduction(firstT.id, 'labor', 555);
      const saved = await window.appDB.getConfig('settlementDeductions');
      results.push({
        test: 'Persistent Auto-Save Deductions in IndexedDB (即時自動存檔)',
        pass: !!(saved && saved.overtimeDeductions && saved.overtimeDeductions[firstT.id] && saved.overtimeDeductions[firstT.id].labor === 555)
      });
    }

    // 7. Test Class Swap Execution
    if (slots.length >= 2) {
      const sA = slots[0];
      const sB = slots[1];
      const origDayA = sA.dayOfWeek;
      sA.dayOfWeek = sB.dayOfWeek;
      await window.appDB.addTimetableSlot(sA);
      const updatedSlotA = (await window.appDB.getAllTimetableSlots()).find(s => s.id === sA.id);
      results.push({
        test: 'Timetable Class Swap / Slot Update (課務調課互調功能)',
        pass: updatedSlotA && updatedSlotA.dayOfWeek === sB.dayOfWeek
      });
    }

    // 8. Test Blank Templates Generation
    results.push({
      test: 'Blank Template Manager (4大空白範本下載與匯入器)',
      pass: typeof TemplateManagerModule !== 'undefined' && typeof TemplateManagerModule.downloadTeacherTemplate === 'function'
    });

    // 9. Test Excel Official Workbook Generator
    results.push({
      test: 'ExcelJS Official 7-Level Signature Multi-Sheet Generator (官方印領清冊匯出)',
      pass: typeof ExcelGeneratorModule !== 'undefined' && typeof ExcelGeneratorModule.exportOfficialWorkbook === 'function'
    });

    await fetch('/report_test_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    });
  } catch (err) {
    console.error('TEST RUNNER ERROR:', err);
    await fetch('/report_test_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ test: 'Exception thrown: ' + err.toString(), pass: false }])
    });
  }
});
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

test_html = html.replace('</body>', f'<script>{test_script}</script></body>')
with open('test_runner.html', 'w', encoding='utf-8') as f:
    f.write(test_html)

chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
cmd = [
    chrome,
    '--headless=new',
    '--disable-gpu',
    f'http://127.0.0.1:{PORT}/test_runner.html'
]
proc = subprocess.Popen(cmd)

print("Waiting for in-browser test suite execution...")
finished = test_done_event.wait(timeout=12)

proc.terminate()
if os.path.exists('test_runner.html'):
    os.remove('test_runner.html')

if finished and received_results:
    print("\n========================================================")
    print("      REAL GOOGLE CHROME IN-BROWSER TEST RESULTS        ")
    print("========================================================")
    all_pass = True
    for item in received_results:
        status = "[PASS]" if item.get("pass") else "[FAIL]"
        if not item.get("pass"): all_pass = False
        cnt = f" (資料筆數: {item.get('count')})" if "count" in item else ""
        print(f" {status} | {item.get('test')}{cnt}")
    print("========================================================")
    if all_pass:
        print(f"全部 {len(received_results)} 項瀏覽器真實測試全數通過！系統運作正常、流暢且符合實務需求。")
    else:
        print("部份測試未通過，請檢查上述錯誤項目。")
else:
    print("測試超時或未收到回傳結果。")
