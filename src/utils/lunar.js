import { Lunar, HolidayUtil, Solar } from 'lunar-javascript';

export const getDateInfo = (date) => {
  const solar = Solar.fromDate(date);
  const lunar = Lunar.fromDate(date);
  const holiday = HolidayUtil.getHoliday(date.getFullYear(), date.getMonth() + 1, date.getDate());

  let lunarText = '';
  let isFestival = false;
  let isTerm = false;

  // 1. 节气
  const jieQi = lunar.getJieQi();
  if (jieQi) {
    lunarText = jieQi;
    isTerm = true;
  }

  // 2. 农历节日
  const festivals = lunar.getFestivals();
  if (festivals.length > 0) {
    lunarText = festivals[0];
    isFestival = true;
  }

  // 3. 公历节日 (lunar-javascript 也包含部分公历节日，这里可以补充)
  const solarFestivals = solar.getFestivals();
  if (solarFestivals.length > 0) {
    // 优先级：如果已经有农历节日，可能优先显示农历（如春节），或者并列。
    // 这里简单处理，优先显示农历节日，如果没有则显示公历节日
    if (!lunarText) {
      lunarText = solarFestivals[0];
      isFestival = true;
    }
  }

  // 4. 如果都不是，显示农历日期
  if (!lunarText) {
    if (lunar.getDay() === 1) {
      lunarText = lunar.getMonthInChinese() + '月';
    } else {
      lunarText = lunar.getDayInChinese();
    }
  }

  // 节假日/调休状态
  let holidayStatus = null; // 'holiday' | 'work' | null
  let holidayName = '';

  if (holiday) {
    holidayName = holiday.getName();
    if (holiday.isWork()) {
      holidayStatus = 'work'; // 调休上班
    } else {
      holidayStatus = 'holiday'; // 放假
    }
  } else {
    // 周末判断，虽然不是法定节假日，但通常是休息
    const day = date.getDay();
    if (day === 0 || day === 6) {
      // 周末
    }
  }

  return {
    lunarText,
    isFestival,
    isTerm,
    holidayStatus,
    holidayName
  };
};