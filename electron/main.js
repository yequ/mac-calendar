const { app, BrowserWindow, Tray, screen, nativeImage, systemPreferences, nativeTheme } = require('electron');
const path = require('path');

let tray = null;
let window = null;

// 确保跟随系统主题
nativeTheme.themeSource = 'system';

// 隐藏 Dock 图标
if (process.platform === 'darwin') {
  app.dock.hide();
}

const WINDOW_WIDTH = 380;
const WINDOW_HEIGHT = 520;

function createWindow() {
  window = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    vibrancy: 'popover', // macOS 原生磨砂效果
    visualEffectState: 'active', // 即使窗口未激活也保持效果
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 为了简单演示，允许渲染进程直接使用 node
      backgroundThrottling: false
    }
  });

  // 开发环境加载 localhost，生产环境加载构建后的文件
  const isDev = !app.isPackaged;
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  window.loadURL(startUrl);

  // 失去焦点时隐藏窗口
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
}

function getWindowPosition() {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // 获取鼠标所在屏幕
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  // 计算 x 坐标 (居中对齐 Tray 图标)
  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

  // 计算 y 坐标 (Tray 图标下方)
  let y = Math.round(trayBounds.y + trayBounds.height + 4);

  // 边界检查
  if (x < 0) x = 0;
  if (x + windowBounds.width > screenWidth) x = screenWidth - windowBounds.width;

  return { x, y };
}

function toggleWindow() {
  if (window.isVisible()) {
    window.hide();
  } else {
    const { x, y } = getWindowPosition();
    window.setPosition(x, y, false);
    window.show();
    window.focus();
  }
}

function updateTrayTitle() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[date.getDay()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  const dateStr = `${month}月${day}日 ${weekDay} ${hours}:${minutes}`;
  // macOS 支持 setTitle
  tray.setTitle(dateStr);
}

function createTray() {
  // 创建一个透明的 1x1 图标，确保 Tray 正常显示 Title
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  icon.resize({ width: 16, height: 16 });
  
  tray = new Tray(icon);
  
  updateTrayTitle();
  
  // 每秒更新一次，确保时间准确
  setInterval(updateTrayTitle, 1000);

  tray.on('click', (event) => {
    toggleWindow();
  });

  tray.on('right-click', () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});