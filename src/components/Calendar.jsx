import React, { useState, useMemo, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { getDateInfo } from '../utils/lunar';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 提取 MonthGrid 组件
const MonthGrid = ({ date, selectedDate, onDateClick }) => {
  const days = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) - 6 (Saturday)
    const daysInMonth = lastDayOfMonth.getDate();

    const result = [];

    // 上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      result.push({
        date: d,
        isCurrentMonth: false,
        ...getDateInfo(d)
      });
    }

    // 当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      result.push({
        date: d,
        isCurrentMonth: true,
        isToday: new Date().toDateString() === d.toDateString(),
        ...getDateInfo(d)
      });
    }

    // 下个月的日期
    const remainingCells = 42 - result.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      result.push({
        date: d,
        isCurrentMonth: false,
        ...getDateInfo(d)
      });
    }

    return result;
  }, [date]);

  return (
    <div className="days-grid">
      {days.map((item, index) => {
        const isSelected = selectedDate.toDateString() === item.date.toDateString();
        return (
          <div
            key={index}
            className={classNames('day-cell', {
              'not-current-month': !item.isCurrentMonth,
              'is-today': item.isToday,
              'is-selected': isSelected,
              'is-weekend': item.date.getDay() === 0 || item.date.getDay() === 6
            })}
            onClick={() => onDateClick(item.date)}
          >
            <div className="day-number">{item.date.getDate()}</div>
            <div className={classNames('lunar-text', {
              'is-festival': item.isFestival,
              'is-term': item.isTerm
            })}>
              {item.lunarText}
            </div>
            
            {item.holidayStatus && (
              <div className={classNames('holiday-badge', item.holidayStatus)}>
                {item.holidayStatus === 'holiday' ? '休' : '班'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 动画相关状态
  const [slideDate, setSlideDate] = useState(null);
  const [slideDirection, setSlideDirection] = useState(null); // 'up' | 'down'
  const isAnimating = useRef(false);

  const handlePrevMonth = () => {
    if (isAnimating.current) return;
    triggerAnimation('down');
  };

  const handleNextMonth = () => {
    if (isAnimating.current) return;
    triggerAnimation('up');
  };

  const triggerAnimation = (direction) => {
    isAnimating.current = true;
    setSlideDirection(direction);
    
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'up' ? 1 : -1), 1);
    setSlideDate(nextMonth);

    // 动画结束后清理状态
    setTimeout(() => {
      setCurrentDate(nextMonth);
      setSlideDate(null);
      setSlideDirection(null);
      isAnimating.current = false;
    }, 300); // 对应 CSS transition 时间
  };

  const handleWheel = (e) => {
    if (isAnimating.current) return;
    
    // 简单的防抖阈值
    if (Math.abs(e.deltaY) < 20) return;

    if (e.deltaY > 0) {
      // 向下滚动 -> 看下个月 -> 内容向上移动
      triggerAnimation('up');
    } else {
      // 向上滚动 -> 看上个月 -> 内容向下移动
      triggerAnimation('down');
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // 如果点击非当前月日期，也触发切换
    if (date.getMonth() !== currentDate.getMonth()) {
      const direction = date > currentDate ? 'up' : 'down';
      triggerAnimation(direction);
    }
  };

  return (
    <div className="calendar-container" onWheel={handleWheel}>
      <div className="calendar-header">
        <div className="header-left">
          <span className="current-date-text">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </span>
        </div>
        <div className="header-right">
          <button onClick={handlePrevMonth} className="nav-btn">{'<'}</button>
          <button onClick={handleGoToday} className="today-btn">今天</button>
          <button onClick={handleNextMonth} className="nav-btn">{'>'}</button>
        </div>
      </div>

      <div className="week-header">
        {WEEK_DAYS.map(day => (
          <div key={day} className="week-day">{day}</div>
        ))}
      </div>

      <div className="calendar-body-mask">
        <div 
          className={classNames('calendar-slider', {
            'animating': slideDirection !== null,
            'slide-up': slideDirection === 'up',
            'slide-down': slideDirection === 'down'
          })}
        >
          {/* 当前视图 */}
          <div className="slider-item current">
            <MonthGrid 
              date={currentDate} 
              selectedDate={selectedDate} 
              onDateClick={handleDateClick} 
            />
          </div>
          
          {/* 动画时的下一个视图 */}
          {slideDate && (
            <div className="slider-item next">
              <MonthGrid 
                date={slideDate} 
                selectedDate={selectedDate} 
                onDateClick={handleDateClick} 
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="footer-info">
        <div className="selected-date-detail">
          {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          {' '}
          {getDateInfo(selectedDate).lunarText}
          {' '}
          {getDateInfo(selectedDate).holidayName}
        </div>
      </div>
    </div>
  );
};

export default Calendar;