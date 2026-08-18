/**
 * Unified Data Access Layer & IndexedDB Manager (Dexie.js)
 * 國小校務教學行政與鐘點代課整合系統 - 資料庫核心
 */

class SchoolDatabase {
  constructor() {
    if (typeof Dexie === 'undefined') {
      console.error('Dexie.js is not loaded.');
    }
    
    this.db = new Dexie('SchoolAdminSuiteDB');
    
    // Schema Version 1: 基礎資料表
    this.db.version(1).stores({
      teachers: 'id, name, type, title, basePeriods, reductionReason, *tags',
      timetables: 'id, teacherId, teacherName, dayOfWeek, period, className, subject',
      substituteRecords: 'id, date, dayOfWeek, period, absentTeacherId, substituteTeacherId, leaveType, budgetPlanId, substituteType',
      budgetPlans: 'id, name, voucherNo, accountSubject, category',
      systemConfigs: 'key'
    });

    // Schema Version 2: 擴充薪級、保費扣繳索引與自訂設定 (Versioned Migration)
    this.db.version(2).stores({
      teachers: 'id, name, type, title, basePeriods, reductionReason, salaryPoint, *tags',
      timetables: 'id, teacherId, teacherName, dayOfWeek, period, className, subject',
      substituteRecords: 'id, date, dayOfWeek, period, absentTeacherId, substituteTeacherId, leaveType, budgetPlanId, substituteType',
      budgetPlans: 'id, name, voucherNo, accountSubject, category, defaultRate',
      systemConfigs: 'key'
    });

    // Schema Version 3: 擴充自訂清冊標題與欄位設定
    this.db.version(3).stores({
      teachers: 'id, name, type, title, basePeriods, reductionReason, salaryPoint, *tags',
      timetables: 'id, teacherId, teacherName, dayOfWeek, period, className, subject',
      substituteRecords: 'id, date, dayOfWeek, period, absentTeacherId, substituteTeacherId, leaveType, budgetPlanId, substituteType',
      budgetPlans: 'id, name, voucherNo, accountSubject, category, defaultRate',
      systemConfigs: 'key'
    });
  }

  /**
   * 初始化系統預設設定（僅在完全初次使用時執行，絕對不覆蓋既有修改）
   */
  async initDefaults() {
    const schoolConfig = await this.db.systemConfigs.get('schoolInfo');
    if (!schoolConfig) {
      await this.db.systemConfigs.put({
        key: 'schoolInfo',
        schoolName: '新北市新林國民小學',
        academicYear: '114學年度第2學期',
        currentMonth: '2026-06',
        gradCutoffDate: '2026-06-12',
        hourlyRateDefault: 405,
        dailyRateDefault: 1760,
        tutorAllowanceDefault: 133,
        signatories: [
          '製表人 / 教學組長',
          '出納組長(所得登錄)',
          '幹事(勞健保費)',
          '人事主任',
          '教務主任',
          '會計主任',
          '校長'
        ]
      });
    }

    const formTitles = await this.db.systemConfigs.get('formTitlesConfig');
    if (!formTitles) {
      await this.db.systemConfigs.put({
        key: 'formTitlesConfig',
        mainReportTitle: '{schoolName} {academicYear} {month}教師超鐘點及代課鐘點費印領清冊',
        sheet1Name: '114學年超鐘點總表',
        sheet1Title: '{schoolName} {academicYear} {month}教師超鐘點印領清冊',
        sheet2Name: '代課(鐘點)',
        sheet2Title: '{schoolName} {academicYear} {month}教師公假派代(鐘點)印領清冊',
        sheet3Name: '代課(日薪)',
        sheet3Title: '{schoolName} {academicYear} {month}全日公假派代(日薪)印領清冊',
        sheet4Name: '身心調適假',
        sheet4Title: '{schoolName} {academicYear} {month}教師身心調適假派代印領清冊',
        sheet5Name: '各專案超鐘點',
        sheet5Title: '{schoolName} {academicYear} {month}各項專案計畫減課超鐘點印領清冊'
      });
    }
  }

  // --- 教師資料 CRUD ---
  async getAllTeachers() {
    return await this.db.teachers.toArray();
  }

  async getTeacherById(id) {
    return await this.db.teachers.get(id);
  }

  async saveTeacher(teacher) {
    if (!teacher.id) {
      teacher.id = 'T_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    await this.db.teachers.put(teacher);
    this.markAutoSaved();
    return teacher;
  }

  async batchSaveTeachers(teachers) {
    for (const t of teachers) {
      if (!t.id) t.id = 'T_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    await this.db.teachers.bulkPut(teachers);
    this.markAutoSaved();
    return teachers;
  }

  async deleteTeacher(id) {
    await this.db.teachers.delete(id);
    await this.db.timetables.where('teacherId').equals(id).delete();
    this.markAutoSaved();
  }

  // --- 課表資料 CRUD ---
  async getAllTimetableSlots() {
    return await this.db.timetables.toArray();
  }

  async getTimetableByTeacher(teacherId) {
    return await this.db.timetables.where('teacherId').equals(teacherId).toArray();
  }

  async getTimetableByClass(className) {
    return await this.db.timetables.where('className').equals(className).toArray();
  }

  async batchSaveTimetable(slots, clearExisting = false) {
    if (clearExisting) {
      await this.db.timetables.clear();
    }
    await this.db.timetables.bulkPut(slots);
    this.markAutoSaved();
  }

  async addTimetableSlot(slot) {
    if (!slot.id) {
      slot.id = 'SLOT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    await this.db.timetables.put(slot);
    this.markAutoSaved();
    return slot;
  }

  async deleteTimetableSlot(id) {
    await this.db.timetables.delete(id);
    this.markAutoSaved();
  }

  // --- 排代紀錄 CRUD ---
  async getAllSubstituteRecords() {
    return await this.db.substituteRecords.toArray();
  }

  async getSubstituteRecordsByDateRange(startDate, endDate) {
    return await this.db.substituteRecords
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async saveSubstituteRecord(record) {
    if (!record.id) {
      record.id = 'SUB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    await this.db.substituteRecords.put(record);
    this.markAutoSaved();
    return record;
  }

  async batchSaveSubstituteRecords(records) {
    for (const rec of records) {
      if (!rec.id) {
        rec.id = 'SUB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      }
    }
    await this.db.substituteRecords.bulkPut(records);
    this.markAutoSaved();
    return records;
  }

  async deleteSubstituteRecord(id) {
    await this.db.substituteRecords.delete(id);
    this.markAutoSaved();
  }

  // --- 經費計畫 CRUD ---
  async getAllBudgetPlans() {
    return await this.db.budgetPlans.toArray();
  }

  async getBudgetPlanById(id) {
    return await this.db.budgetPlans.get(id);
  }

  async saveBudgetPlan(plan) {
    if (!plan.id) {
      plan.id = 'BP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    await this.db.budgetPlans.put(plan);
    this.markAutoSaved();
    return plan;
  }

  async batchSaveBudgetPlans(plans) {
    for (const p of plans) {
      if (!p.id) p.id = 'BP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    }
    await this.db.budgetPlans.bulkPut(plans);
    this.markAutoSaved();
    return plans;
  }

  async deleteBudgetPlan(id) {
    await this.db.budgetPlans.delete(id);
    this.markAutoSaved();
  }

  // --- 系統與表單自訂設定 ---
  async getConfig(key) {
    const res = await this.db.systemConfigs.get(key);
    return res ? res : null;
  }

  async saveConfig(key, value) {
    await this.db.systemConfigs.put({ key, ...value });
    this.markAutoSaved();
  }

  markAutoSaved() {
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
      indicator.innerHTML = '<span class="auto-save-dot"></span> 已即時存檔';
      indicator.style.opacity = '1';
    }
  }

  // --- 全系統資料 JSON 備份與還原 ---
  async exportFullBackupJSON() {
    const teachers = await this.db.teachers.toArray();
    const timetables = await this.db.timetables.toArray();
    const substituteRecords = await this.db.substituteRecords.toArray();
    const budgetPlans = await this.db.budgetPlans.toArray();
    const systemConfigs = await this.db.systemConfigs.toArray();

    const backupData = {
      app: 'ModularSchoolAdminSuite',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      data: {
        teachers,
        timetables,
        substituteRecords,
        budgetPlans,
        systemConfigs
      }
    };

    return JSON.stringify(backupData, null, 2);
  }

  async importFullBackupJSON(jsonString, overwrite = true) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        throw new Error('無效的備份檔案格式：找不到 data 節點。');
      }

      const { teachers, timetables, substituteRecords, budgetPlans, systemConfigs } = parsed.data;

      if (overwrite) {
        await this.db.teachers.clear();
        await this.db.timetables.clear();
        await this.db.substituteRecords.clear();
        await this.db.budgetPlans.clear();
        await this.db.systemConfigs.clear();
      }

      if (teachers && teachers.length) await this.db.teachers.bulkPut(teachers);
      if (timetables && timetables.length) await this.db.timetables.bulkPut(timetables);
      if (substituteRecords && substituteRecords.length) await this.db.substituteRecords.bulkPut(substituteRecords);
      if (budgetPlans && budgetPlans.length) await this.db.budgetPlans.bulkPut(budgetPlans);
      if (systemConfigs && systemConfigs.length) await this.db.systemConfigs.bulkPut(systemConfigs);

      this.markAutoSaved();
      return { success: true, count: {
        teachers: teachers?.length || 0,
        timetables: timetables?.length || 0,
        substituteRecords: substituteRecords?.length || 0,
        budgetPlans: budgetPlans?.length || 0
      }};
    } catch (err) {
      console.error('Import backup failed:', err);
      throw err;
    }
  }

  async clearAllData() {
    await this.db.teachers.clear();
    await this.db.timetables.clear();
    await this.db.substituteRecords.clear();
    await this.db.budgetPlans.clear();
    await this.db.systemConfigs.clear();
    await this.initDefaults();
    this.markAutoSaved();
  }
}

// 實例化全域 DB
window.appDB = new SchoolDatabase();
