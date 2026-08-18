/**
 * ExcelJS Multi-Sheet Official Report Generator
 * 符合公家機關標準格式之多 Sheet 印領清冊 Excel 產生引擎 (含動態自訂名稱、7 級簽核欄與 SUM 公式)
 */

const ExcelGeneratorModule = {
  async exportOfficialWorkbook() {
    if (typeof ExcelJS === 'undefined') {
      window.app.showToast('ExcelJS 尚未載入，無法匯出', 'error');
      return;
    }

    window.app.showToast('正在產生官方印領清冊活頁簿...', 'info');

    const teachers = await window.appDB.getAllTeachers();
    const allSlots = await window.appDB.getAllTimetableSlots();
    const records = await window.appDB.getSubstituteRecordsByDateRange(
      SettlementModule.startDate || '2026-06-01',
      SettlementModule.endDate || '2026-06-30'
    );
    const plans = await window.appDB.getAllBudgetPlans();
    
    const schoolConfig = await window.appDB.getConfig('schoolInfo') || {
      schoolName: '新北市新林國民小學',
      academicYear: '114學年度第2學期',
      currentMonth: '2026-06',
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
    };

    const formTitles = await window.appDB.getConfig('formTitlesConfig') || {
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
    };

    const monthStr = schoolConfig.currentMonth ? `${parseInt(schoolConfig.currentMonth.split('-')[1] || '6', 10)}月份` : '6月份';

    const formatTitle = (tpl) => {
      return (tpl || '')
        .replace(/{schoolName}/g, schoolConfig.schoolName || '')
        .replace(/{academicYear}/g, schoolConfig.academicYear || '')
        .replace(/{month}/g, monthStr);
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'School Administrative Suite';
    workbook.lastModifiedBy = '教學組長';
    workbook.created = new Date();
    workbook.modified = new Date();

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' } // Slate 200
    };

    const totalFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' } // Slate 100
    };

    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };

    const applySignatureBlock = (worksheet, startRow) => {
      const sigTitles = schoolConfig.signatories && schoolConfig.signatories.length > 0 ? schoolConfig.signatories : [
        '製表人 / 教學組長',
        '出納組長(所得登錄)',
        '幹事(勞健保費)',
        '人事主任',
        '教務主任',
        '會計主任',
        '校長'
      ];

      const titleRow = worksheet.getRow(startRow);
      sigTitles.forEach((title, idx) => {
        const cell = titleRow.getCell(idx + 1);
        cell.value = title;
        cell.font = { name: '微軟正黑體', bold: true, size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = totalFill;
        cell.border = thinBorder;
      });
      titleRow.height = 24;

      const spaceRow = worksheet.getRow(startRow + 1);
      sigTitles.forEach((_, idx) => {
        const cell = spaceRow.getCell(idx + 1);
        cell.value = '';
        cell.border = thinBorder;
      });
      spaceRow.height = 45;
    };

    // =========================================================================
    // Sheet 1: 自訂超鐘點總表
    // =========================================================================
    const s1Name = formTitles.sheet1Name || '114學年超鐘點總表';
    const sheet1 = workbook.addWorksheet(s1Name);
    sheet1.views = [{ showGridLines: true }];

    sheet1.mergeCells('A1:L1');
    const s1Title = sheet1.getCell('A1');
    s1Title.value = formatTitle(formTitles.sheet1Title) || `${schoolConfig.schoolName} ${schoolConfig.academicYear} ${monthStr}教師超鐘點印領清冊`;
    s1Title.font = { name: '微軟正黑體', bold: true, size: 15 };
    s1Title.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getRow(1).height = 32;

    sheet1.mergeCells('A2:L2');
    const s1Sub = sheet1.getCell('A2');
    s1Sub.value = `憑證編號：1101  |  預算科目：532國民小學教育-53263624國小教育行政-124兼職人員酬金  |  單價：$${schoolConfig.hourlyRateDefault || 405} 元/節`;
    s1Sub.font = { name: '微軟正黑體', size: 10, italic: true };
    s1Sub.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getRow(2).height = 20;

    const s1Headers = ['序號', '教師姓名', '職稱', '基本節數', '減課節數', '應授節數', '實排節數', '每週超節', '月總節數', '應發金額', '勞健保扣繳', '實領金額'];
    const s1HeadRow = sheet1.getRow(4);
    s1HeadRow.values = s1Headers;
    s1HeadRow.height = 24;
    s1HeadRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = headerFill;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let s1CurrentRow = 5;
    const insideTeachers = teachers.filter(t => t.type === 'INSIDE');
    insideTeachers.forEach((t, idx) => {
      const slots = allSlots.filter(s => s.teacherId === t.id);
      const weeklyActual = slots.length;
      const netBase = Math.max(0, (t.basePeriods || 0) - (t.reductionPeriods || 0));
      const weeklyOvertime = Math.max(0, weeklyActual - netBase);

      if (weeklyOvertime > 0 || (t.reductionPeriods || 0) > 0) {
        const monthPeriods = weeklyOvertime * (SettlementModule.weeksInMonth || 4);
        const deductions = SettlementModule.overtimeDeductions[t.id] || { labor: 0, health: 0 };
        const totalDeduct = (deductions.labor || 0) + (deductions.health || 0);

        const row = sheet1.getRow(s1CurrentRow);
        row.values = [
          idx + 1,
          t.name,
          t.title === 'HOMEROOM' ? '導師' : t.title === 'LEADER' ? '組長' : '科任',
          t.basePeriods || 0,
          t.reductionPeriods || 0,
          netBase,
          weeklyActual,
          weeklyOvertime,
          monthPeriods,
          { formula: `I${s1CurrentRow}*${schoolConfig.hourlyRateDefault || 405}` },
          totalDeduct,
          { formula: `J${s1CurrentRow}-K${s1CurrentRow}` }
        ];

        row.eachCell((cell, colNum) => {
          cell.font = { name: '微軟正黑體', size: 10 };
          cell.border = thinBorder;
          if (colNum >= 4 && colNum <= 9) cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (colNum >= 10) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            cell.numFmt = '#,##0';
          }
        });
        s1CurrentRow++;
      }
    });

    const s1TotalRow = sheet1.getRow(s1CurrentRow);
    s1TotalRow.getCell(1).value = '合計';
    sheet1.mergeCells(`A${s1CurrentRow}:H${s1CurrentRow}`);
    s1TotalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    s1TotalRow.getCell(9).value = { formula: `SUM(I5:I${s1CurrentRow - 1})` };
    s1TotalRow.getCell(10).value = { formula: `SUM(J5:J${s1CurrentRow - 1})` };
    s1TotalRow.getCell(11).value = { formula: `SUM(K5:K${s1CurrentRow - 1})` };
    s1TotalRow.getCell(12).value = { formula: `SUM(L5:L${s1CurrentRow - 1})` };

    s1TotalRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = totalFill;
      cell.border = thinBorder;
      if (cell.col >= 9) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
    s1TotalRow.height = 24;

    applySignatureBlock(sheet1, s1CurrentRow + 3);

    sheet1.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 10 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 11 }, { width: 13 },
      { width: 12 }, { width: 14 }
    ];

    // =========================================================================
    // Sheet 2: 代課(鐘點)
    // =========================================================================
    const s2Name = formTitles.sheet2Name || '代課(鐘點)';
    const sheet2 = workbook.addWorksheet(s2Name);
    sheet2.views = [{ showGridLines: true }];

    sheet2.mergeCells('A1:J1');
    const s2Title = sheet2.getCell('A1');
    s2Title.value = formatTitle(formTitles.sheet2Title) || `${schoolConfig.schoolName} ${schoolConfig.academicYear} ${monthStr}教師公假派代(鐘點)印領清冊`;
    s2Title.font = { name: '微軟正黑體', bold: true, size: 15 };
    s2Title.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet2.getRow(1).height = 32;

    sheet2.mergeCells('A2:J2');
    const s2Sub = sheet2.getCell('A2');
    s2Sub.value = `憑證編號：1102  |  預算科目：532國民小學教育-53263624國小教育行政-124兼職人員酬金  |  單價：$${schoolConfig.hourlyRateDefault || 405} 元/節`;
    s2Sub.font = { name: '微軟正黑體', size: 10, italic: true };
    s2Sub.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet2.getRow(2).height = 20;

    const s2Headers = ['序號', '代課日期', '節次', '原任請假教師', '假別', '公文依據 / 事由', '代課教師', '單價', '扣繳保費', '實領金額'];
    const s2HeadRow = sheet2.getRow(4);
    s2HeadRow.values = s2Headers;
    s2HeadRow.height = 24;
    s2HeadRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = headerFill;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let s2CurrentRow = 5;
    const hourlyList = records.filter(r => r.substituteType === 'HOURLY' && r.leaveType !== 'WELLNESS');
    hourlyList.forEach((r, idx) => {
      const row = sheet2.getRow(s2CurrentRow);
      row.values = [
        idx + 1,
        r.date,
        `第 ${r.period} 節`,
        r.absentTeacherName,
        r.leaveType,
        r.reasonDocument || '-',
        r.substituteTeacherName,
        r.rate || schoolConfig.hourlyRateDefault || 405,
        (r.laborInsuranceDeduction || 0) + (r.healthInsuranceDeduction || 0),
        { formula: `H${s2CurrentRow}-I${s2CurrentRow}` }
      ];

      row.eachCell((cell, colNum) => {
        cell.font = { name: '微軟正黑體', size: 10 };
        cell.border = thinBorder;
        if (colNum <= 3 || colNum === 5) cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNum >= 8) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0';
        }
      });
      s2CurrentRow++;
    });

    const s2TotalRow = sheet2.getRow(s2CurrentRow);
    s2TotalRow.getCell(1).value = '合計';
    sheet2.mergeCells(`A${s2CurrentRow}:G${s2CurrentRow}`);
    s2TotalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    s2TotalRow.getCell(8).value = { formula: `SUM(H5:H${s2CurrentRow - 1})` };
    s2TotalRow.getCell(9).value = { formula: `SUM(I5:I${s2CurrentRow - 1})` };
    s2TotalRow.getCell(10).value = { formula: `SUM(J5:J${s2CurrentRow - 1})` };

    s2TotalRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = totalFill;
      cell.border = thinBorder;
      if (cell.col >= 8) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
    s2TotalRow.height = 24;

    applySignatureBlock(sheet2, s2CurrentRow + 3);

    sheet2.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 13 }, { width: 10 },
      { width: 34 }, { width: 13 }, { width: 11 }, { width: 11 }, { width: 13 }
    ];

    // =========================================================================
    // Sheet 3: 代課(日薪)
    // =========================================================================
    const s3Name = formTitles.sheet3Name || '代課(日薪)';
    const sheet3 = workbook.addWorksheet(s3Name);
    sheet3.views = [{ showGridLines: true }];

    sheet3.mergeCells('A1:J1');
    const s3Title = sheet3.getCell('A1');
    s3Title.value = formatTitle(formTitles.sheet3Title) || `${schoolConfig.schoolName} ${schoolConfig.academicYear} ${monthStr}全日公假派代(日薪)印領清冊`;
    s3Title.font = { name: '微軟正黑體', bold: true, size: 15 };
    s3Title.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet3.getRow(1).height = 32;

    sheet3.mergeCells('A2:J2');
    const s3Sub = sheet3.getCell('A2');
    s3Sub.value = `憑證編號：1103  |  預算科目：532國民小學教育-53263624國小教育行政-124兼職人員酬金  |  日薪：$${schoolConfig.dailyRateDefault || 1760} 元/日 (代導師加給 $${schoolConfig.tutorAllowanceDefault || 133}/日)`;
    s3Sub.font = { name: '微軟正黑體', size: 10, italic: true };
    s3Sub.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet3.getRow(2).height = 20;

    const s3Headers = ['序號', '請假日期', '原任請假教師', '假別', '公文依據 / 事由', '代課教師', '日薪金額', '導師加給', '勞健保扣繳', '實領金額'];
    const s3HeadRow = sheet3.getRow(4);
    s3HeadRow.values = s3Headers;
    s3HeadRow.height = 24;
    s3HeadRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = headerFill;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let s3CurrentRow = 5;
    const dailyList = records.filter(r => r.substituteType === 'DAILY');
    dailyList.forEach((r, idx) => {
      const row = sheet3.getRow(s3CurrentRow);
      row.values = [
        idx + 1,
        r.date,
        r.absentTeacherName,
        r.leaveType,
        r.reasonDocument || '-',
        r.substituteTeacherName,
        r.rate || schoolConfig.dailyRateDefault || 1760,
        r.tutorAllowance || schoolConfig.tutorAllowanceDefault || 133,
        (r.laborInsuranceDeduction || 0) + (r.healthInsuranceDeduction || 0),
        { formula: `G${s3CurrentRow}+H${s3CurrentRow}-I${s3CurrentRow}` }
      ];

      row.eachCell((cell, colNum) => {
        cell.font = { name: '微軟正黑體', size: 10 };
        cell.border = thinBorder;
        if (colNum <= 4) cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNum >= 7) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0';
        }
      });
      s3CurrentRow++;
    });

    const s3TotalRow = sheet3.getRow(s3CurrentRow);
    s3TotalRow.getCell(1).value = '合計';
    sheet3.mergeCells(`A${s3CurrentRow}:F${s3CurrentRow}`);
    s3TotalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    s3TotalRow.getCell(7).value = { formula: `SUM(G5:G${s3CurrentRow - 1})` };
    s3TotalRow.getCell(8).value = { formula: `SUM(H5:H${s3CurrentRow - 1})` };
    s3TotalRow.getCell(9).value = { formula: `SUM(I5:I${s3CurrentRow - 1})` };
    s3TotalRow.getCell(10).value = { formula: `SUM(J5:J${s3CurrentRow - 1})` };

    s3TotalRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = totalFill;
      cell.border = thinBorder;
      if (cell.col >= 7) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
    s3TotalRow.height = 24;

    applySignatureBlock(sheet3, s3CurrentRow + 3);

    sheet3.columns = [
      { width: 6 }, { width: 12 }, { width: 13 }, { width: 10 },
      { width: 34 }, { width: 13 }, { width: 11 }, { width: 11 }, { width: 12 }, { width: 13 }
    ];

    // =========================================================================
    // Sheet 4: 身心調適假
    // =========================================================================
    const s4Name = formTitles.sheet4Name || '身心調適假';
    const sheet4 = workbook.addWorksheet(s4Name);
    sheet4.views = [{ showGridLines: true }];

    sheet4.mergeCells('A1:I1');
    const s4Title = sheet4.getCell('A1');
    s4Title.value = formatTitle(formTitles.sheet4Title) || `${schoolConfig.schoolName} ${schoolConfig.academicYear} ${monthStr}教師身心調適假派代印領清冊`;
    s4Title.font = { name: '微軟正黑體', bold: true, size: 15 };
    s4Title.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet4.getRow(1).height = 32;

    sheet4.mergeCells('A2:I2');
    const s4Sub = sheet4.getCell('A2');
    s4Sub.value = `憑證編號：1104  |  預算科目：532國民小學教育-身心調適假專款-124兼職人員酬金  |  單價：$${schoolConfig.hourlyRateDefault || 405} 元/節`;
    s4Sub.font = { name: '微軟正黑體', size: 10, italic: true };
    s4Sub.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet4.getRow(2).height = 20;

    const s4Headers = ['序號', '請假日期', '節次', '原任教師', '請假事由依據', '代課教師', '鐘點單價', '節數', '實領總額'];
    const s4HeadRow = sheet4.getRow(4);
    s4HeadRow.values = s4Headers;
    s4HeadRow.height = 24;
    s4HeadRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = headerFill;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let s4CurrentRow = 5;
    const wellnessList = records.filter(r => r.leaveType === 'WELLNESS');
    wellnessList.forEach((r, idx) => {
      const row = sheet4.getRow(s4CurrentRow);
      row.values = [
        idx + 1,
        r.date,
        `第 ${r.period} 節`,
        r.absentTeacherName,
        r.reasonDocument || '身心調適假實施辦法',
        r.substituteTeacherName,
        r.rate || schoolConfig.hourlyRateDefault || 405,
        1,
        { formula: `G${s4CurrentRow}*H${s4CurrentRow}` }
      ];

      row.eachCell((cell, colNum) => {
        cell.font = { name: '微軟正黑體', size: 10 };
        cell.border = thinBorder;
        if (colNum <= 3 || colNum === 8) cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNum === 7 || colNum === 9) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0';
        }
      });
      s4CurrentRow++;
    });

    const s4TotalRow = sheet4.getRow(s4CurrentRow);
    s4TotalRow.getCell(1).value = '合計';
    sheet4.mergeCells(`A${s4CurrentRow}:G${s4CurrentRow}`);
    s4TotalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    s4TotalRow.getCell(8).value = { formula: `SUM(H5:H${s4CurrentRow - 1})` };
    s4TotalRow.getCell(9).value = { formula: `SUM(I5:I${s4CurrentRow - 1})` };

    s4TotalRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = totalFill;
      cell.border = thinBorder;
      if (cell.col >= 8) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
    s4TotalRow.height = 24;

    applySignatureBlock(sheet4, s4CurrentRow + 3);

    sheet4.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 13 },
      { width: 34 }, { width: 13 }, { width: 11 }, { width: 9 }, { width: 13 }
    ];

    // =========================================================================
    // Sheet 5: 各專案超鐘點
    // =========================================================================
    const s5Name = formTitles.sheet5Name || '各專案超鐘點';
    const sheet5 = workbook.addWorksheet(s5Name);
    sheet5.views = [{ showGridLines: true }];

    sheet5.mergeCells('A1:I1');
    const s5Title = sheet5.getCell('A1');
    s5Title.value = formatTitle(formTitles.sheet5Title) || `${schoolConfig.schoolName} ${schoolConfig.academicYear} ${monthStr}各項專案計畫減課超鐘點印領清冊`;
    s5Title.font = { name: '微軟正黑體', bold: true, size: 15 };
    s5Title.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet5.getRow(1).height = 32;

    sheet5.mergeCells('A2:I2');
    const s5Sub = sheet5.getCell('A2');
    s5Sub.value = `專案包含：額滿學校減課 (憑證1120)、數位精進 (憑證1125)、央款閩南語鐘點 (憑證1128) 等`;
    s5Sub.font = { name: '微軟正黑體', size: 10, italic: true };
    s5Sub.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet5.getRow(2).height = 20;

    const s5Headers = ['序號', '教師姓名', '職稱', '專案計畫名稱', '每週減課', '全月總節數', '鐘點單價', '勞健保扣繳', '實領金額'];
    const s5HeadRow = sheet5.getRow(4);
    s5HeadRow.values = s5Headers;
    s5HeadRow.height = 24;
    s5HeadRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = headerFill;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let s5CurrentRow = 5;
    const reducedTeachers = teachers.filter(t => t.type === 'INSIDE' && (t.reductionPeriods || 0) > 0);
    reducedTeachers.forEach((t, idx) => {
      const row = sheet5.getRow(s5CurrentRow);
      const monthPeriods = (t.reductionPeriods || 0) * (SettlementModule.weeksInMonth || 4);
      row.values = [
        idx + 1,
        t.name,
        t.title === 'HOMEROOM' ? '導師' : t.title === 'LEADER' ? '組長' : '主任',
        t.reductionReason || '專案減課',
        t.reductionPeriods,
        monthPeriods,
        schoolConfig.hourlyRateDefault || 405,
        0,
        { formula: `F${s5CurrentRow}*G${s5CurrentRow}-H${s5CurrentRow}` }
      ];

      row.eachCell((cell, colNum) => {
        cell.font = { name: '微軟正黑體', size: 10 };
        cell.border = thinBorder;
        if (colNum === 1 || colNum === 3 || colNum === 5 || colNum === 6) cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNum >= 7) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0';
        }
      });
      s5CurrentRow++;
    });

    const s5TotalRow = sheet5.getRow(s5CurrentRow);
    s5TotalRow.getCell(1).value = '合計';
    sheet5.mergeCells(`A${s5CurrentRow}:E${s5CurrentRow}`);
    s5TotalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    s5TotalRow.getCell(6).value = { formula: `SUM(F5:F${s5CurrentRow - 1})` };
    s5TotalRow.getCell(8).value = { formula: `SUM(H5:H${s5CurrentRow - 1})` };
    s5TotalRow.getCell(9).value = { formula: `SUM(I5:I${s5CurrentRow - 1})` };

    s5TotalRow.eachCell(cell => {
      cell.font = { name: '微軟正黑體', bold: true, size: 10 };
      cell.fill = totalFill;
      cell.border = thinBorder;
      if (cell.col >= 6) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
    s5TotalRow.height = 24;

    applySignatureBlock(sheet5, s5CurrentRow + 3);

    sheet5.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 26 },
      { width: 11 }, { width: 12 }, { width: 11 }, { width: 12 }, { width: 14 }
    ];

    // 匯出並下載
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schoolConfig.schoolName}_${schoolConfig.academicYear}_${monthStr}鐘點代課印領清冊.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.app.showToast('🎉 已成功產生並下載自訂格式之官方印領清冊 Excel 活頁簿！', 'success');
  }
};

window.ExcelGeneratorModule = ExcelGeneratorModule;
