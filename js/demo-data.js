/**
 * Demo Data Generator - 新北市新林國民小學 114學年度第2學期 6月份真實情境範例資料
 * 包含 30+ 位校內外與退休教師、全校週課表、6個經費計畫、6月份完整排代紀錄
 */

const DemoDataGenerator = {
  getTeachers() {
    return [
      // 行政主管與組長
      { id: 'T_DIR_01', name: '', type: 'INSIDE', title: 'DIRECTOR', basePeriods: 2, reductionReason: '教務主任減課', reductionPeriods: 18, phone: '', salaryPoint: 500, note: '教務主任', tags: ['數學', '行政管理'] },
      { id: 'T_LEA_01', name: '', type: 'INSIDE', title: 'LEADER', basePeriods: 8, reductionReason: '教學組長減課', reductionPeriods: 12, phone: '', salaryPoint: 450, note: '教學組長', tags: ['國語', '社會', '課程規劃'] },
      { id: 'T_DIR_02', name: '', type: 'INSIDE', title: 'DIRECTOR', basePeriods: 2, reductionReason: '學務主任減課', reductionPeriods: 18, phone: '', salaryPoint: 475, note: '學務主任', tags: ['體育', '童軍'] },
      { id: 'T_LEA_02', name: '', type: 'INSIDE', title: 'LEADER', basePeriods: 8, reductionReason: '生教組長減課', reductionPeriods: 12, phone: '', salaryPoint: 410, note: '生教組長', tags: ['體育', '品德教育'] },
      { id: 'T_DIR_03', name: '', type: 'INSIDE', title: 'DIRECTOR', basePeriods: 2, reductionReason: '總務主任減課', reductionPeriods: 18, phone: '', salaryPoint: 475, note: '總務主任', tags: ['自然', '環境教育'] },
      { id: 'T_DIR_04', name: '', type: 'INSIDE', title: 'DIRECTOR', basePeriods: 2, reductionReason: '輔導主任減課', reductionPeriods: 18, phone: '', salaryPoint: 490, note: '輔導主任', tags: ['綜合活動', '諮商輔導'] },
      { id: 'T_LEA_03', name: '', type: 'INSIDE', title: 'LEADER', basePeriods: 8, reductionReason: '輔導組長減課', reductionPeriods: 12, phone: '', salaryPoint: 370, note: '輔導組長', tags: ['綜合活動', '生命教育'] },

      // 導師群 (101~602)
      { id: 'T_HOM_101', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 330, note: '101導師', tags: ['低年級', '國語', '生活'] },
      { id: 'T_HOM_102', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '額滿學校減課', reductionPeriods: 2, phone: '', salaryPoint: 350, note: '102導師 (額滿減課2節)', tags: ['低年級', '生活', '繪本'] },
      { id: 'T_HOM_103', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 290, note: '103導師', tags: ['低年級', '生活', '美勞'] },
      { id: 'T_HOM_201', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '二年級學年主任減課', reductionPeriods: 1, phone: '', salaryPoint: 390, note: '201導師 (學年主任)', tags: ['低年級', '國語', '數學'] },
      { id: 'T_HOM_202', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 310, note: '202導師', tags: ['低年級', '資訊融入', '數學'] },
      { id: 'T_HOM_301', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 350, note: '301導師', tags: ['中年級', '數學', '社會'] },
      { id: 'T_HOM_302', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 430, note: '302導師', tags: ['中年級', '國語', '自然'] },
      { id: 'T_HOM_401', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '數位學習精進方案減課', reductionPeriods: 1, phone: '', salaryPoint: 370, note: '401導師 (平板推動種子)', tags: ['中年級', '資訊', '數學'] },
      { id: 'T_HOM_402', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 330, note: '402導師', tags: ['中年級', '國語', '英語'] },
      { id: 'T_HOM_501', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 390, note: '501導師', tags: ['高年級', '社會', '作文'] },
      { id: 'T_HOM_502', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 290, note: '502導師', tags: ['高年級', '自然', '數學'] },
      { id: 'T_HOM_601', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 410, note: '601導師 (畢業班)', tags: ['高年級', '數學', '體育'] },
      { id: 'T_HOM_602', name: '', type: 'INSIDE', title: 'HOMEROOM', basePeriods: 16, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 370, note: '602導師 (畢業班)', tags: ['高年級', '國語', '社會'] },

      // 專任科任教師
      { id: 'T_SUB_PE', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 350, note: '體育科任 (超鐘點2節/週)', tags: ['體育', '桌球', '田徑'] },
      { id: 'T_SUB_ENG', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 390, note: '英語科任 (超鐘點1節/週)', tags: ['英語', '雙語教學'] },
      { id: 'T_SUB_SCI', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 450, note: '自然科任 (每週20節)', tags: ['自然', '科學實驗', '創客'] },
      { id: 'T_SUB_MUS', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 370, note: '音樂科任 (超鐘點2節/週)', tags: ['音樂', '合唱團', '直笛'] },
      { id: 'T_SUB_ART', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 330, note: '美勞科任 (每週20節)', tags: ['美勞', '立體造型', '書法'] },
      { id: 'T_SUB_ICT', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 350, note: '資訊科任 (超鐘點3節/週)', tags: ['資訊', '程式設計', '無人機'] },
      { id: 'T_SUB_SOC', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 410, note: '社會科任 (每週20節)', tags: ['社會', '鄉土文化'] },
      { id: 'T_SUB_MIN', name: '', type: 'INSIDE', title: 'SUBJECT', basePeriods: 20, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 430, note: '閩南語專任 (每週20節)', tags: ['閩南語', '鄉土語言', '認證中高級'] },

      // 外聘代課師資庫 (人才庫)
      { id: 'T_EXT_01', name: '', type: 'EXTERNAL', title: 'SUBJECT', basePeriods: 0, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 190, note: '配合度極高、週二四全天、具閩南語與國語專長', tags: ['閩南語', '國語', '低年級'] },
      { id: 'T_EXT_02', name: '', type: 'EXTERNAL', title: 'SUBJECT', basePeriods: 0, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 190, note: '體育系畢業、專長田徑、球類，上午皆可排課', tags: ['體育', '健康', '活動帶領'] },
      { id: 'T_EXT_03', name: '', type: 'EXTERNAL', title: 'SUBJECT', basePeriods: 0, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 190, note: '資訊與自然專長、生生用平板授課經驗豐富', tags: ['資訊', '自然', '數學'] },
      { id: 'T_EXT_04', name: '', type: 'EXTERNAL', title: 'SUBJECT', basePeriods: 0, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 170, note: '英語系碩士、具國小雙語合格教師證', tags: ['英語', '雙語教學', '國際教育'] },
      
      // 退休人才庫
      { id: 'T_RET_01', name: '', type: 'RETIRED', title: 'HOMEROOM', basePeriods: 0, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 625, note: '本校資深優良退休教師、班級經營極佳、隨傳隨到', tags: ['導師', '低年級', '中年級', '國語'] },
      { id: 'T_RET_02', name: '', type: 'RETIRED', title: 'SUBJECT', basePeriods: 0, reductionReason: '', reductionPeriods: 0, phone: '', salaryPoint: 625, note: '退休自然科教師、課堂秩序掌控良好', tags: ['自然', '數學', '美勞'] }
    ];
  },

  getBudgetPlans() {
    return [
      {
        id: 'BP_OVERTIME_NORM',
        name: '',
        voucherNo: '1101',
        accountSubject: '532國民小學教育-53263624國小教育行政-124兼職人員酬金',
        defaultRate: 405,
        category: 'OVERTIME',
        templateLayout: 'OVERTIME_STANDARD'
      },
      {
        id: 'BP_SUB_HOURLY',
        name: '',
        voucherNo: '1102',
        accountSubject: '532國民小學教育-53263624國小教育行政-124兼職人員酬金',
        defaultRate: 405,
        category: 'HOURLY_SUB',
        templateLayout: 'SUB_HOURLY_STANDARD'
      },
      {
        id: 'BP_SUB_DAILY',
        name: '',
        voucherNo: '1103',
        accountSubject: '532國民小學教育-53263624國小教育行政-124兼職人員酬金',
        defaultRate: 1760,
        category: 'DAILY_SUB',
        templateLayout: 'SUB_DAILY_STANDARD'
      },
      {
        id: 'BP_SUB_WELLNESS',
        name: '',
        voucherNo: '1104',
        accountSubject: '532國民小學教育-53263624國小教育行政-124兼職人員酬金',
        defaultRate: 405,
        category: 'HOURLY_SUB',
        templateLayout: 'SUB_WELLNESS_STANDARD'
      },
      {
        id: 'BP_PROJ_OVERFULL',
        name: '',
        voucherNo: '1120',
        accountSubject: '532國民小學教育-專案補助-124兼職人員酬金',
        defaultRate: 405,
        category: 'SPECIAL_PROJECT',
        templateLayout: 'PROJECT_OVERFULL'
      },
      {
        id: 'BP_PROJ_DIGITAL',
        name: '',
        voucherNo: '1125',
        accountSubject: '532國民小學教育-數位學習精進專案-124兼職人員酬金',
        defaultRate: 405,
        category: 'SPECIAL_PROJECT',
        templateLayout: 'PROJECT_DIGITAL'
      },
      {
        id: 'BP_PROJ_MINNAN',
        name: '',
        voucherNo: '1128',
        accountSubject: '532國民小學教育-中央補助本土語文專案-124兼職人員酬金',
        defaultRate: 405,
        category: 'SPECIAL_PROJECT',
        templateLayout: 'PROJECT_MINNAN'
      }
    ];
  },

  getTimetableSlots() {
    const slots = [];
    let slotId = 1;

    const add = (teacherId, teacherName, dayOfWeek, period, className, subject) => {
      slots.push({
        id: `SLOT_${slotId++}`,
        teacherId,
        teacherName,
        dayOfWeek,
        period,
        className,
        subject
      });
    };

    // 1. 李家豪 (體育 22節，超鐘點 2 節)
    const peClasses = [
      { d: 1, p: 2, c: '101' }, { d: 1, p: 3, c: '102' }, { d: 1, p: 5, c: '301' }, { d: 1, p: 6, c: '302' },
      { d: 2, p: 1, c: '201' }, { d: 2, p: 2, c: '202' }, { d: 2, p: 5, c: '401' }, { d: 2, p: 6, c: '402' },
      { d: 3, p: 2, c: '501' }, { d: 3, p: 3, c: '502' }, { d: 3, p: 4, c: '103' },
      { d: 4, p: 1, c: '601' }, { d: 4, p: 2, c: '602' }, { d: 4, p: 3, c: '201' }, { d: 4, p: 5, c: '301' }, { d: 4, p: 6, c: '302' },
      { d: 5, p: 1, c: '401' }, { d: 5, p: 2, c: '402' }, { d: 5, p: 3, c: '501' }, { d: 5, p: 4, c: '502' }, { d: 5, p: 5, c: '601' }, { d: 5, p: 6, c: '602' }
    ];
    peClasses.forEach(item => add('T_SUB_PE', '李家豪', item.d, item.p, item.c, '體育'));

    // 2. 羅美娟 (英語 21節，超鐘點 1 節)
    const engClasses = [
      { d: 1, p: 1, c: '301' }, { d: 1, p: 2, c: '302' }, { d: 1, p: 4, c: '401' }, { d: 1, p: 5, c: '402' },
      { d: 2, p: 2, c: '501' }, { d: 2, p: 3, c: '502' }, { d: 2, p: 5, c: '601' }, { d: 2, p: 6, c: '602' },
      { d: 3, p: 1, c: '301' }, { d: 3, p: 2, c: '302' }, { d: 3, p: 3, c: '401' }, { d: 3, p: 4, c: '402' },
      { d: 4, p: 3, c: '501' }, { d: 4, p: 4, c: '502' }, { d: 4, p: 5, c: '601' }, { d: 4, p: 6, c: '602' },
      { d: 5, p: 1, c: '301' }, { d: 5, p: 2, c: '302' }, { d: 5, p: 3, c: '401' }, { d: 5, p: 4, c: '402' }, { d: 5, p: 6, c: '501' }
    ];
    engClasses.forEach(item => add('T_SUB_ENG', '羅美娟', item.d, item.p, item.c, '英語'));

    // 3. 邱雅惠 (音樂 22節，超鐘點 2 節)
    const musClasses = [
      { d: 1, p: 3, c: '101' }, { d: 1, p: 4, c: '102' }, { d: 1, p: 6, c: '201' }, { d: 1, p: 7, c: '202' },
      { d: 2, p: 1, c: '301' }, { d: 2, p: 2, c: '302' }, { d: 2, p: 3, c: '401' }, { d: 2, p: 4, c: '402' },
      { d: 3, p: 1, c: '501' }, { d: 3, p: 2, c: '502' }, { d: 3, p: 3, c: '601' }, { d: 3, p: 4, c: '602' },
      { d: 4, p: 1, c: '103' }, { d: 4, p: 2, c: '101' }, { d: 4, p: 4, c: '201' }, { d: 4, p: 5, c: '202' },
      { d: 5, p: 1, c: '301' }, { d: 5, p: 2, c: '302' }, { d: 5, p: 3, c: '401' }, { d: 5, p: 4, c: '402' }, { d: 5, p: 5, c: '501' }, { d: 5, p: 6, c: '502' }
    ];
    musClasses.forEach(item => add('T_SUB_MUS', '邱雅惠', item.d, item.p, item.c, '音樂'));

    // 4. 葉芳儀 (資訊 23節，超鐘點 3 節)
    const ictClasses = [
      { d: 1, p: 1, c: '401' }, { d: 1, p: 2, c: '402' }, { d: 1, p: 3, c: '501' }, { d: 1, p: 4, c: '502' }, { d: 1, p: 5, c: '601' },
      { d: 2, p: 2, c: '602' }, { d: 2, p: 3, c: '301' }, { d: 2, p: 4, c: '302' }, { d: 2, p: 6, c: '401' }, { d: 2, p: 7, c: '402' },
      { d: 3, p: 1, c: '501' }, { d: 3, p: 2, c: '502' }, { d: 3, p: 3, c: '601' }, { d: 3, p: 4, c: '602' },
      { d: 4, p: 2, c: '301' }, { d: 4, p: 3, c: '302' }, { d: 4, p: 5, c: '501' }, { d: 4, p: 6, c: '502' },
      { d: 5, p: 1, c: '601' }, { d: 5, p: 2, c: '602' }, { d: 5, p: 4, c: '401' }, { d: 5, p: 5, c: '402' }, { d: 5, p: 6, c: '301' }
    ];
    ictClasses.forEach(item => add('T_SUB_ICT', '葉芳儀', item.d, item.p, item.c, '資訊'));

    // 5. 范姜慧敏 (閩南語 20節)
    const minClasses = [
      { d: 1, p: 1, c: '101' }, { d: 1, p: 2, c: '102' }, { d: 1, p: 3, c: '103' }, { d: 1, p: 4, c: '201' },
      { d: 2, p: 1, c: '202' }, { d: 2, p: 2, c: '301' }, { d: 2, p: 3, c: '302' }, { d: 2, p: 4, c: '401' },
      { d: 3, p: 1, c: '402' }, { d: 3, p: 2, c: '501' }, { d: 3, p: 3, c: '502' }, { d: 3, p: 4, c: '601' },
      { d: 4, p: 1, c: '602' }, { d: 4, p: 2, c: '101' }, { d: 4, p: 3, c: '102' }, { d: 4, p: 4, c: '201' },
      { d: 5, p: 1, c: '202' }, { d: 5, p: 2, c: '301' }, { d: 5, p: 3, c: '501' }, { d: 5, p: 4, c: '601' }
    ];
    minClasses.forEach(item => add('T_SUB_MIN', '范姜慧敏', item.d, item.p, item.c, '閩南語'));

    // 6. 劉德華 (自然 20節)
    const sciClasses = [
      { d: 1, p: 1, c: '302' }, { d: 1, p: 2, c: '301' }, { d: 1, p: 5, c: '501' }, { d: 1, p: 6, c: '502' },
      { d: 2, p: 1, c: '401' }, { d: 2, p: 2, c: '402' }, { d: 2, p: 5, c: '601' }, { d: 2, p: 6, c: '602' },
      { d: 3, p: 2, c: '301' }, { d: 3, p: 3, c: '302' }, { d: 3, p: 4, c: '401' },
      { d: 4, p: 1, c: '402' }, { d: 4, p: 2, c: '501' }, { d: 4, p: 4, c: '502' }, { d: 4, p: 5, c: '601' }, { d: 4, p: 6, c: '602' },
      { d: 5, p: 2, c: '301' }, { d: 5, p: 3, c: '302' }, { d: 5, p: 5, c: '401' }, { d: 5, p: 6, c: '402' }
    ];
    sciClasses.forEach(item => add('T_SUB_SCI', '劉德華', item.d, item.p, item.c, '自然'));

    // 7. 教學組長 陳美惠 (8節)
    const leadClasses = [
      { d: 1, p: 1, c: '501', s: '社會' }, { d: 1, p: 2, c: '502', s: '社會' },
      { d: 2, p: 2, c: '501', s: '社會' }, { d: 2, p: 3, c: '502', s: '社會' }, { d: 2, p: 4, c: '501', s: '閱讀' },
      { d: 4, p: 3, c: '501', s: '社會' }, { d: 4, p: 4, c: '502', s: '社會' },
      { d: 5, p: 5, c: '502', s: '閱讀' }
    ];
    leadClasses.forEach(item => add('T_LEA_01', '陳美惠', item.d, item.p, item.c, item.s));

    // 8. 導師 101 王雅婷 (16節)
    const hom101Classes = [
      { d: 1, p: 4, c: '101', s: '國語' }, { d: 1, p: 5, c: '101', s: '生活' },
      { d: 2, p: 2, c: '101', s: '國語' }, { d: 2, p: 3, c: '101', s: '數學' }, { d: 2, p: 4, c: '101', s: '生活' },
      { d: 3, p: 1, c: '101', s: '國語' }, { d: 3, p: 2, c: '101', s: '數學' }, { d: 3, p: 3, c: '101', s: '生活' }, { d: 3, p: 4, c: '101', s: '生活' },
      { d: 4, p: 3, c: '101', s: '國語' }, { d: 4, p: 4, c: '101', s: '數學' }, { d: 4, p: 5, c: '101', s: '生活' },
      { d: 5, p: 2, c: '101', s: '國語' }, { d: 5, p: 3, c: '101', s: '數學' }, { d: 5, p: 4, c: '101', s: '生活' }, { d: 5, p: 5, c: '101', s: '班會' }
    ];
    hom101Classes.forEach(item => add('T_HOM_101', '王雅婷', item.d, item.p, item.c, item.s));

    // 9. 導師 401 楊斯涵 (15節，數位精進減課1節)
    const hom401Classes = [
      { d: 1, p: 3, c: '401', s: '國語' }, { d: 1, p: 6, c: '401', s: '數學' },
      { d: 2, p: 2, c: '401', s: '國語' }, { d: 2, p: 4, c: '401', s: '數學' },
      { d: 3, p: 1, c: '401', s: '國語' }, { d: 3, p: 2, c: '401', s: '數學' }, { d: 3, p: 5, c: '401', s: '綜合' }, { d: 3, p: 6, c: '401', s: '綜合' },
      { d: 4, p: 3, c: '401', s: '國語' }, { d: 4, p: 4, c: '401', s: '數學' }, { d: 4, p: 5, c: '401', s: '社會' }, { d: 4, p: 6, c: '401', s: '社會' },
      { d: 5, p: 3, c: '401', s: '國語' }, { d: 5, p: 4, c: '401', s: '數學' }, { d: 5, p: 7, c: '401', s: '班會' }
    ];
    hom401Classes.forEach(item => add('T_HOM_401', '楊斯涵', item.d, item.p, item.c, item.s));

    // 10. 導師 601 鄧宇廷 (16節，六年級畢業班)
    const hom601Classes = [
      { d: 1, p: 2, c: '601', s: '國語' }, { d: 1, p: 3, c: '601', s: '數學' }, { d: 1, p: 6, c: '601', s: '綜合' }, { d: 1, p: 7, c: '601', s: '綜合' },
      { d: 2, p: 1, c: '601', s: '國語' }, { d: 2, p: 3, c: '601', s: '數學' }, { d: 2, p: 4, c: '601', s: '社會' },
      { d: 3, p: 2, c: '601', s: '國語' }, { d: 3, p: 3, c: '601', s: '數學' }, { d: 3, p: 5, c: '601', s: '彈性' }, { d: 3, p: 6, c: '601', s: '彈性' },
      { d: 4, p: 2, c: '601', s: '國語' }, { d: 4, p: 4, c: '601', s: '數學' },
      { d: 5, p: 3, c: '601', s: '國語' }, { d: 5, p: 4, c: '601', s: '社會' }, { d: 5, p: 7, c: '601', s: '班會' }
    ];
    hom601Classes.forEach(item => add('T_HOM_601', '鄧宇廷', item.d, item.p, item.c, item.s));

    return slots;
  },

  getSubstituteRecords() {
    return [
      // 1. 陳美惠 (教學組長) 公假研習 2026-06-02 (週二) 第2, 3, 4節
      {
        id: 'SUB_20260602_01',
        date: '2026-06-02',
        dayOfWeek: 2,
        period: 2,
        absentTeacherId: 'T_LEA_01',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教研字第1150882190號函（新北市114學年度國小課表研討會）',
        substituteTeacherId: 'T_EXT_01',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 501 社會'
      },
      {
        id: 'SUB_20260602_02',
        date: '2026-06-02',
        dayOfWeek: 2,
        period: 3,
        absentTeacherId: 'T_LEA_01',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教研字第1150882190號函（新北市114學年度國小課表研討會）',
        substituteTeacherId: 'T_EXT_01',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 502 社會'
      },
      {
        id: 'SUB_20260602_03',
        date: '2026-06-02',
        dayOfWeek: 2,
        period: 4,
        absentTeacherId: 'T_LEA_01',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教研字第1150882190號函（新北市114學年度國小課表研討會）',
        substituteTeacherId: 'T_EXT_01',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 501 閱讀'
      },

      // 2. 李家豪 (體育) 公假帶隊 2026-06-04 (週四) 第1, 2節
      {
        id: 'SUB_20260604_01',
        date: '2026-06-04',
        dayOfWeek: 4,
        period: 1,
        absentTeacherId: 'T_SUB_PE',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教體字第1150893321號（新北市國小師生田徑錦標賽）',
        substituteTeacherId: 'T_EXT_02',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 601 體育'
      },
      {
        id: 'SUB_20260604_02',
        date: '2026-06-04',
        dayOfWeek: 4,
        period: 2,
        absentTeacherId: 'T_SUB_PE',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教體字第1150893321號（新北市國小師生田徑錦標賽）',
        substituteTeacherId: 'T_EXT_02',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 602 體育'
      },

      // 3. 王雅婷 (101導師) 2026-06-05 (週五) 全日公假 (日薪代導師)
      {
        id: 'SUB_20260605_01',
        date: '2026-06-05',
        dayOfWeek: 5,
        period: 1, // 全日以代表性註記或整日計
        absentTeacherId: 'T_HOM_101',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教幼字第1150901144號（新進教師初階輔導評量研習）',
        substituteTeacherId: 'T_RET_01',
        substituteTeachername: '',
        substituteType: 'DAILY',
        rate: 1760,
        tutorAllowance: 133,
        budgetPlanId: 'BP_SUB_DAILY',
        laborInsuranceDeduction: 102,
        healthInsuranceDeduction: 78,
        note: '全日代導師 (日薪1760 + 導師費133 = 1893)'
      },

      // 4. 羅美娟 (英語) 2026-06-08 (週一) 身心調適假 第3, 4節 (身心調適假專案款)
      {
        id: 'SUB_20260608_01',
        date: '2026-06-08',
        dayOfWeek: 1,
        period: 3,
        absentTeacherId: 'T_SUB_ENG',
        absentTeachername: '',
        leaveType: 'WELLNESS',
        reasonDocument: '公立高級中等以下學校教師請假規則第3條（身心調適假）',
        substituteTeacherId: 'T_EXT_04',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_WELLNESS',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '身心調適假 (專案核銷)'
      },
      {
        id: 'SUB_20260608_02',
        date: '2026-06-08',
        dayOfWeek: 1,
        period: 4,
        absentTeacherId: 'T_SUB_ENG',
        absentTeachername: '',
        leaveType: 'WELLNESS',
        reasonDocument: '公立高級中等以下學校教師請假規則第3條（身心調適假）',
        substituteTeacherId: 'T_EXT_04',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_WELLNESS',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 401 英語'
      },

      // 5. 楊斯涵 (401導師) 2026-06-11 (週四) 第5, 6節 公假發表
      {
        id: 'SUB_20260611_01',
        date: '2026-06-11',
        dayOfWeek: 4,
        period: 5,
        absentTeacherId: 'T_HOM_401',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '臺教資(二)字第1150920031號（生生用平板成果發表會）',
        substituteTeacherId: 'T_EXT_03',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 401 社會'
      },
      {
        id: 'SUB_20260611_02',
        date: '2026-06-11',
        dayOfWeek: 4,
        period: 6,
        absentTeacherId: 'T_HOM_401',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '臺教資(二)字第1150920031號（生生用平板成果發表會）',
        substituteTeacherId: 'T_EXT_03',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 401 社會'
      },

      // 6. 邱雅惠 (音樂) 2026-06-16 (週二) 第1, 2節 病假
      {
        id: 'SUB_20260616_01',
        date: '2026-06-16',
        dayOfWeek: 2,
        period: 1,
        absentTeacherId: 'T_SUB_MUS',
        absentTeachername: '',
        leaveType: 'SICK',
        reasonDocument: '病假診斷證明書（聲帶急性發炎就醫）',
        substituteTeacherId: 'T_EXT_01',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 301 音樂'
      },
      {
        id: 'SUB_20260616_02',
        date: '2026-06-16',
        dayOfWeek: 2,
        period: 2,
        absentTeacherId: 'T_SUB_MUS',
        absentTeachername: '',
        leaveType: 'SICK',
        reasonDocument: '病假診斷證明書（聲帶急性發炎就醫）',
        substituteTeacherId: 'T_EXT_01',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 302 音樂'
      },

      // 7. 郭佩琪 (201導師) 2026-06-18 (週四) 全日喪假 (日薪代導師)
      {
        id: 'SUB_20260618_01',
        date: '2026-06-18',
        dayOfWeek: 4,
        period: 1,
        absentTeacherId: 'T_HOM_201',
        absentTeachername: '',
        leaveType: 'BEREAVEMENT',
        reasonDocument: '二等親喪假訃聞證明',
        substituteTeacherId: 'T_RET_01',
        substituteTeachername: '',
        substituteType: 'DAILY',
        rate: 1760,
        tutorAllowance: 133,
        budgetPlanId: 'BP_SUB_DAILY',
        laborInsuranceDeduction: 102,
        healthInsuranceDeduction: 78,
        note: '全日代導師 (日薪1760 + 導師費133 = 1893)'
      },

      // 8. 葉芳儀 (資訊) 2026-06-23 (週二) 第2, 3節 公假
      {
        id: 'SUB_20260623_01',
        date: '2026-06-23',
        dayOfWeek: 2,
        period: 2,
        absentTeacherId: 'T_SUB_ICT',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教研字第1150931289號（智慧校園資訊組長工作坊）',
        substituteTeacherId: 'T_EXT_03',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 602 資訊'
      },
      {
        id: 'SUB_20260623_02',
        date: '2026-06-23',
        dayOfWeek: 2,
        period: 3,
        absentTeacherId: 'T_SUB_ICT',
        absentTeachername: '',
        leaveType: 'PUBLIC',
        reasonDocument: '新北教研字第1150931289號（智慧校園資訊組長工作坊）',
        substituteTeacherId: 'T_EXT_03',
        substituteTeachername: '',
        substituteType: 'HOURLY',
        rate: 405,
        tutorAllowance: 0,
        budgetPlanId: 'BP_SUB_HOURLY',
        laborInsuranceDeduction: 0,
        healthInsuranceDeduction: 0,
        note: '原授 301 資訊'
      }
    ];
  },

  async loadIntoDatabase(dbInstance) {
    const teachers = this.getTeachers();
    const plans = this.getBudgetPlans();
    const timetables = this.getTimetableSlots();
    const subRecords = this.getSubstituteRecords();

    await dbInstance.db.teachers.clear();
    await dbInstance.db.budgetPlans.clear();
    await dbInstance.db.timetables.clear();
    await dbInstance.db.substituteRecords.clear();

    await dbInstance.db.teachers.bulkPut(teachers);
    await dbInstance.db.budgetPlans.bulkPut(plans);
    await dbInstance.db.timetables.bulkPut(timetables);
    await dbInstance.db.substituteRecords.bulkPut(subRecords);
    await dbInstance.initDefaults();

    return {
      teachers: teachers.length,
      plans: plans.length,
      timetables: timetables.length,
      substituteRecords: subRecords.length
    };
  }
};

window.DemoDataGenerator = DemoDataGenerator;

