import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
  Settings, Info, AlertTriangle, CheckCircle2, XCircle, Camera, 
  TrendingUp, Home, Utensils, Download, Upload, ChevronLeft, ChevronRight, X, Plus, Edit2, ExternalLink,
  Sun, Moon, Globe
} from 'lucide-react';

// ==========================================
// i18n Dictionary (多國語言字典)
// ==========================================
const dict = {
  zh: {
    appName: 'Will Fit',
    welcome: '歡迎使用 Will Fit',
    step1: '步驟 1: 基本資料',
    step2: '步驟 2: 動態目標',
    name: '姓名',
    gender: '性別',
    male: '男性',
    female: '女性',
    birthYear: '出生年',
    next: '下一步',
    prev: '上一步',
    finish: '完成設定',
    height: '身高 (cm)',
    deficit: '赤字目標 (kcal)',
    activity: '活動係數',
    todayWeight: '今日體重',
    noWeight: '未量體重',
    remain: '剩餘',
    streak: '天達標',
    warning: '⚠️ 已連續 {days} 天嚴重超標！',
    settings: '設定',
    basicInfo: '👤 修改基本資料',
    dynParams: '⚙️ 修改動態目標',
    backupMenu: '💾 資料備份與匯入',
    recentMenu: '📊 近期歷史數據',
    deleteAllMenu: '🗑️ 刪除所有資料',
    weightTab: '體重',
    dietTab: '飲食',
    dashboardTab: '記錄',
    date: '日期',
    weightInput: '體重 (kg)',
    saveRecord: '記錄儲存',
    daily: '日',
    weekly: '週平均',
    chartEmpty: '尚無足夠數據繪製圖表',
    trend: '體重趨勢',
    target: '目標',
    consumed: '已攝取',
    dietRecord: '飲食紀錄',
    addMeal: '新增',
    noRecord: '尚無紀錄，點擊新增',
    time: '時間',
    kcal: '熱量 (kcal)',
    mealName: '餐點名稱',
    uploadPhoto: '照片紀錄 (可上傳多張)',
    saveMeal: '儲存紀錄',
    confirmDelete: '確認刪除',
    deleteMsg: '確定要刪除這筆紀錄嗎？此動作無法復原。',
    cancel: '取消',
    curStreak: '連續達標',
    maxStreak: '最長連勝',
    avgCal: '日均熱量',
    heatmap: '飲食達成率 (近30天)',
    newTargetBtn: '新增生效目標',
    export: '匯出 (.json)',
    importBtn: '資料匯入',
    sysMsg: '系統提示',
    confirm: '確認',
    deleteWarning: '警告：此動作將清除您所有的體重與飲食紀錄，且無法復原！建議您先進行資料備份。',
    backupData: '備份資料',
    backToRecord: '回到紀錄',
    importSuccess: '資料匯入成功！已完整整合至目前資料庫中。',
    importFail: '檔案格式錯誤或解析失敗。請確認您上傳的是標準的 JSON 格式。',
    themeLight: '日間模式',
    themeDark: '深色模式',
    switchLang: 'Switch to English',
    
    // New Additions for Full i18n
    act12: '1.2 (久坐/幾乎不運動)',
    act1375: '1.375 (輕度/每週 1-3 天)',
    act155: '1.55 (中度/每週 3-5 天)',
    act1725: '1.725 (高度/每週 6-7 天)',
    act19: '1.9 (極度/重勞力)',
    deficitHelpTitle: '什麼是赤字目標？',
    deficitHelp1: '想要減重，你需要創造「熱量赤字」，也就是讓「每天消耗的熱量 (TDEE) 大於 攝取的熱量」。',
    deficitHelp2: '一般建議將赤字設定在 300 ~ 500 大卡 之間，這樣每週大約可以健康減去 0.3 ~ 0.5 公斤。不宜設定過高以免流失肌肉。',
    deficitHelpLink: 'World Gym：卡路里計算機教學',
    activityHelpTitle: '如何選擇活動係數？',
    activityHelp1: '請根據你「一整週」的生活型態來選擇：',
    activityHelpLink: 'Heho 健康：BMR 與 TDEE',
    calcResultTitle: '當日計算結果 (基於上週平均體重)',
    calcFormulaTitle: '計算算式與體重選取規則',
    weightRuleTitle: '攝取目標體重選取規則',
    weightRuleDesc: '本週每日的熱量目標，是以上一週的「平均體重」來計算；若為第一週或尚無前週記錄，則以系統內「最早記錄的那天體重」計算，確保減重計劃穩定。',
    bmrTdeeTitle: 'BMR 與 TDEE',
    bmrTdeeDesc: 'BMR 為基礎代謝率，TDEE 為總熱量消耗（BMR × 活動係數）。',
    calcWeightDesc: '使用計算體重: {weight} kg (上一週平均或首週最早記錄)',
    calcWeightLabel: '計算體重',
    ageLabel: '年齡',
    ageUnit: '歲',
    intakeTarget: '攝取目標',
    editMealTitle: '修改餐點',
    newMealTitle: '新增餐點',
    mealPlaceholder: '例如: 排骨便當',
    addPhotoTxt: '加入照片',
    photoViewTitle: '照片檢視',
    saveChanges: '儲存變更',
    saveNewTarget: '儲存新目標',
    dynParamsNotice: '儲存後將建立新的生效日期設定，過去歷史計算不受影響。',
    dynParamsSaved: '已儲存並建立新的生效日期設定！過去歷史計算不受影響。',
    aiPromptIntro: '請將其他 APP 紀錄交給 AI 整理，並匯入產出的 .json 檔案：',
    chooseJsonFile: '選擇 JSON 檔案並匯入',
    dblClickEdit: '雙擊修改查看',
    statusOk: '達標',
    statusOver: '超標',
    statusDanger: '嚴重',
    heatmapHint: '(雙擊方塊可前往紀錄頁面)',
    dblClickWeight: '雙擊前往修改體重',
    dblClickDiet: '雙擊前往修改餐點',
  },
  en: {
    appName: 'Will Fit',
    welcome: 'Welcome to Will Fit',
    step1: 'Step 1: Basic Info',
    step2: 'Step 2: Dynamic Goals',
    name: 'Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    birthYear: 'Birth Year',
    next: 'Next',
    prev: 'Previous',
    finish: 'Finish Setup',
    height: 'Height (cm)',
    deficit: 'Deficit Goal (kcal)',
    activity: 'Activity Factor',
    todayWeight: 'Today\'s Weight',
    noWeight: 'No Record',
    remain: 'Left',
    streak: 'days streak',
    warning: '⚠️ Over goal for {days} days!',
    settings: 'Settings',
    basicInfo: '👤 Edit Basic Info',
    dynParams: '⚙️ Edit Dynamic Goals',
    backupMenu: '💾 Backup & Import',
    recentMenu: '📊 Recent Records',
    deleteAllMenu: '🗑️ Delete All Data',
    weightTab: 'Weight',
    dietTab: 'Diet',
    dashboardTab: 'Records',
    date: 'Date',
    weightInput: 'Weight (kg)',
    saveRecord: 'Save Record',
    daily: 'Daily',
    weekly: 'Weekly',
    chartEmpty: 'Not enough data for chart',
    trend: 'Weight Trend',
    target: 'Target',
    consumed: 'Consumed',
    dietRecord: 'Diet Records',
    addMeal: 'Add',
    noRecord: 'No records, tap to add',
    time: 'Time',
    kcal: 'Calories (kcal)',
    mealName: 'Meal Name',
    uploadPhoto: 'Photos (Multiple allowed)',
    saveMeal: 'Save Meal',
    confirmDelete: 'Confirm Delete',
    deleteMsg: 'Are you sure you want to delete this? This cannot be undone.',
    cancel: 'Cancel',
    curStreak: 'Current Streak',
    maxStreak: 'Max Streak',
    avgCal: 'Avg Daily Cals',
    heatmap: 'Goal Achievement (30 Days)',
    newTargetBtn: 'New Active Goal',
    export: 'Export (.json)',
    importBtn: 'Import Data',
    sysMsg: 'System Message',
    confirm: 'Confirm',
    deleteWarning: 'WARNING: This will erase ALL your weight and diet records permanently! Please backup first.',
    backupData: 'Backup Data',
    backToRecord: 'Back to Records',
    importSuccess: 'Import successful! Data merged.',
    importFail: 'Format error. Please ensure you upload a standard JSON file.',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    switchLang: '切換至中文',
    
    act12: '1.2 (Sedentary / No exercise)',
    act1375: '1.375 (Light / 1-3 days/wk)',
    act155: '1.55 (Moderate / 3-5 days/wk)',
    act1725: '1.725 (Active / 6-7 days/wk)',
    act19: '1.9 (Very Active / Physical job)',
    deficitHelpTitle: 'What is a Deficit Goal?',
    deficitHelp1: 'To lose weight, you need a "calorie deficit" – meaning you burn more calories (TDEE) than you consume.',
    deficitHelp2: 'A deficit of 300 ~ 500 kcal is recommended for a healthy weight loss of 0.3 ~ 0.5 kg per week. Don\'t set it too high to avoid muscle loss.',
    deficitHelpLink: 'World Gym: Calorie Calculator Guide',
    activityHelpTitle: 'Choosing an Activity Factor',
    activityHelp1: 'Choose based on your general lifestyle over a week:',
    activityHelpLink: 'Heho Health: BMR & TDEE',
    calcResultTitle: 'Today\'s Calculation (Last week\'s avg)',
    calcFormulaTitle: 'Calculation Rules',
    weightRuleTitle: 'Target Weight Selection Rule',
    weightRuleDesc: 'This week\'s daily target uses the "average weight" of the previous week. If it\'s the first week, it uses the earliest recorded weight to ensure stability.',
    bmrTdeeTitle: 'BMR & TDEE',
    bmrTdeeDesc: 'BMR is Basal Metabolic Rate. TDEE is Total Daily Energy Expenditure (BMR × Activity Factor).',
    calcWeightDesc: 'Calculated Weight: {weight} kg (Prev week avg / earliest)',
    calcWeightLabel: 'Calc. Weight',
    ageLabel: 'Age',
    ageUnit: 'yrs',
    intakeTarget: 'Target',
    editMealTitle: 'Edit Meal',
    newMealTitle: 'Add Meal',
    mealPlaceholder: 'e.g., Chicken Salad',
    addPhotoTxt: 'Add Photo',
    photoViewTitle: 'View Photo',
    saveChanges: 'Save Changes',
    saveNewTarget: 'Save New Goal',
    dynParamsNotice: 'Saving will create a new active date setting. Past calculations will not be affected.',
    dynParamsSaved: 'Saved! A new active goal has been set. Past records remain unaffected.',
    aiPromptIntro: 'Ask AI to format your old APP records and import the .json file:',
    chooseJsonFile: 'Select JSON File to Import',
    dblClickEdit: 'Double-click to edit',
    statusOk: 'Hit',
    statusOver: 'Over',
    statusDanger: 'Danger',
    heatmapHint: '(Double-click block to jump to records)',
    dblClickWeight: 'Double-click to edit weight',
    dblClickDiet: 'Double-click to edit meals',
  }
};

const t = (lang, key, params = {}) => {
  let str = dict[lang]?.[key] || dict['zh'][key] || key;
  Object.keys(params).forEach(k => {
    str = str.replace(`{${k}}`, params[k]);
  });
  return str;
};

// --- Constant / Prompt Text (Keep Chinese as requested by user) ---
const AI_PROMPT_TEXT = `我有一份從其他 APP 匯出的飲食與體重紀錄（包含圖片與表格數據）。請幫我過濾掉無關資訊（如心率、步數、睡眠等），並將所有內容嚴格轉換為符合以下 JSON 格式的內容。
【重要要求】請直接輸出一個 .json 檔案讓我下載。不要只有純文字。

【輸出 JSON 結構規範】
{
  "weights": [
    { 
      "date": "YYYY-MM-DD", 
      "weight": 75.5 
    }
  ],
  "meals": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "name": "餐點名稱",
      "calories": 750,
      "photos": [
        "data:image/jpeg;base64,...",
        "data:image/jpeg;base64,..."
      ] 
    }
  ]
}

【圖片與餐點精準配對規則】
1. 時間/日期比對：優先根據圖片檔名（例如 IMG_20260801_1230.jpg）、Exif 時間標籤，或表格中的「時間/備註」欄位進行日期與時間配對。
2. 照片內容與名稱比對：若缺乏明確時間標籤，請分析照片中的食物內容，與表格中的餐點名稱進行語意邏輯對應。
3. 多張圖片處理：若同一餐對應到多張照片，請將所有對應圖片轉換為 Base64 字串，並統一存放在 "photos" 陣列中；若該餐無照片，則 "photos" 欄位請留為空陣列 []。
4. 無法確認時：直接忽略該張無法對應的照片即可。

【注意事項】
請直接提供下載檔案，不要加上任何 Markdown 說明文字或額外的解釋。`;


// --- Utilities ---
const getTodayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

const getDayOfWeek = (dateStr, lang) => {
  const d = new Date(dateStr);
  if (lang === 'en') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  }
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `星期${days[d.getDay()]}`;
};

const calculateAge = (birthYear) => {
  return new Date().getFullYear() - birthYear;
};

const getParamsForDate = (dateStr, dynamicParams = []) => {
  if (!dynamicParams || dynamicParams.length === 0) return null;
  const sorted = [...dynamicParams].sort((a, b) => new Date(b.date) - new Date(a.date));
  const found = sorted.find(p => p.date <= dateStr);
  return found || sorted[sorted.length - 1];
};

const getEffectiveWeightForDate = (dateStr, weights) => {
  const weightEntries = Object.entries(weights).sort((a,b) => new Date(a[0]) - new Date(b[0]));
  if (weightEntries.length === 0) return null;

  const targetDate = new Date(dateStr);
  const day = targetDate.getDay();
  const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
  const currentMonday = new Date(targetDate);
  currentMonday.setDate(diff);

  const prevMonday = new Date(currentMonday);
  prevMonday.setDate(prevMonday.getDate() - 7);
  const prevSunday = new Date(currentMonday);
  prevSunday.setDate(prevSunday.getDate() - 1);

  const prevWeekWeights = weightEntries.filter(([d]) => {
    const dt = new Date(d);
    return dt >= prevMonday && dt <= prevSunday;
  });

  if (prevWeekWeights.length > 0) {
    const sum = prevWeekWeights.reduce((acc, curr) => acc + curr[1], 0);
    return Number((sum / prevWeekWeights.length).toFixed(1));
  }
  return weightEntries[0][1];
};

const calculateMetrics = (weight, height, age, gender, activityFactor, deficit) => {
  if (!weight || !height || !age) return { bmr: 0, tdee: 0, target: 0 };
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const tdee = bmr * activityFactor;
  const target = tdee - deficit;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target)
  };
};

const resizeImage = (dataUrl, maxWidth = 400) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};


// --- Shared UI Components ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

const InfoButton = ({ onClick }) => (
  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }} className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0 ml-1 shadow-sm active:scale-95 transition-transform">
    <Info size={12} />
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const NumberControl = ({ value, onChange, step = "1", min, max, placeholder }) => (
  <div className="flex items-center rounded-xl border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus-within:border-blue-500 overflow-hidden transition-colors">
    <button type="button" onClick={() => onChange(Math.max(min ?? -9999, Number(value) - Number(step)))} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors shrink-0 font-bold">-</button>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} step={step} placeholder={placeholder} className="w-full text-center bg-transparent outline-none p-3 font-bold dark:text-white" />
    <button type="button" onClick={() => onChange(Math.min(max ?? 9999, Number(value) + Number(step)))} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors shrink-0 font-bold">+</button>
  </div>
);

const getActivityOptions = (lang) => [
  { value: '1.2', label: t(lang, 'act12') },
  { value: '1.375', label: t(lang, 'act1375') },
  { value: '1.55', label: t(lang, 'act155') },
  { value: '1.725', label: t(lang, 'act1725') },
  { value: '1.9', label: t(lang, 'act19') }
];

const DeficitHelpContent = ({ lang }) => (
  <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
    <p><strong>{t(lang, 'deficitHelpTitle')}</strong></p>
    <p>{t(lang, 'deficitHelp1')}</p>
    <p>{t(lang, 'deficitHelp2')}</p>
    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
      <a href="https://blog.worldgymtaiwan.com/calorie-calculator" target="_blank" rel="noreferrer" className="underline flex items-center gap-1">
         <ExternalLink size={14} /> {t(lang, 'deficitHelpLink')}
      </a>
    </p>
  </div>
);

const ActivityHelpContent = ({ lang }) => (
  <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
    <p><strong>{t(lang, 'activityHelpTitle')}</strong></p>
    <p>{t(lang, 'activityHelp1')}</p>
    <ul className="list-disc pl-5 space-y-2">
      {getActivityOptions(lang).map(opt => <li key={opt.value}><strong>{opt.value}：</strong> {opt.label.replace(opt.value, '')}</li>)}
    </ul>
    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
      <a href="https://tools.heho.com.tw/bmr/" target="_blank" rel="noreferrer" className="underline flex items-center gap-1">
        <ExternalLink size={14} /> {t(lang, 'activityHelpLink')}
      </a>
    </p>
  </div>
);


// ==========================================
// 1.5 Onboarding (首次載入流程)
// ==========================================
const Onboarding = ({ setProfile, setDynamicParams, lang, setLang, theme, setTheme }) => {
  const [step, setStep] = useState(1);
  const [profileForm, setProfileForm] = useState({ name: '韶輝', gender: 'male', birthYear: '1990' });
  const [paramForm, setParamForm] = useState({ height: '170', deficit: '300', activityFactor: '1.2' });
  const [showDeficitHelp, setShowDeficitHelp] = useState(false);
  const [showActivityHelp, setShowActivityHelp] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinish = (e) => {
    e.preventDefault();
    setProfile({
      name: profileForm.name,
      gender: profileForm.gender,
      birthYear: Number(profileForm.birthYear),
    });
    setDynamicParams([{
      date: getTodayStr(),
      height: Number(paramForm.height),
      deficit: Number(paramForm.deficit),
      activityFactor: Number(paramForm.activityFactor)
    }]);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 語言與主題切換 (右上角) */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
        <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1 text-xs font-bold">
          <Globe size={16} /> {lang === 'zh' ? 'EN' : '中'}
        </button>
      </div>

      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">{t(lang, 'welcome')}</h2>
        
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">{t(lang, 'step1')}</h3>
            <div>
              <label className="block text-sm font-medium mb-1">{t(lang, 'name')}</label>
              <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t(lang, 'gender')}</label>
                <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none">
                  <option value="male">{t(lang, 'male')}</option>
                  <option value="female">{t(lang, 'female')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t(lang, 'birthYear')}</label>
                <NumberControl value={profileForm.birthYear} onChange={val => setProfileForm({...profileForm, birthYear: val})} step="1" min="1900" max="2100" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 mt-6 rounded-xl bg-blue-600 text-white font-bold shadow-lg">{t(lang, 'next')}</button>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300">{t(lang, 'step2')}</h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t(lang, 'height')}</label>
              <NumberControl value={paramForm.height} onChange={val => setParamForm({...paramForm, height: val})} step="0.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  {t(lang, 'deficit')} <InfoButton onClick={() => setShowDeficitHelp(true)} />
                </label>
                <NumberControl value={paramForm.deficit} onChange={val => setParamForm({...paramForm, deficit: val})} step="50" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  {t(lang, 'activity')} <InfoButton onClick={() => setShowActivityHelp(true)} />
                </label>
                <select value={paramForm.activityFactor} onChange={e => setParamForm({...paramForm, activityFactor: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none h-[52px]">
                  {getActivityOptions(lang).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold">{t(lang, 'prev')}</button>
              <button type="submit" className="w-2/3 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg">{t(lang, 'finish')}</button>
            </div>
          </form>
        )}
      </Card>

      <Modal isOpen={showDeficitHelp} onClose={() => setShowDeficitHelp(false)} title={t(lang, 'deficitHelpTitle')}>
        <DeficitHelpContent lang={lang} />
      </Modal>

      <Modal isOpen={showActivityHelp} onClose={() => setShowActivityHelp(false)} title={t(lang, 'activityHelpTitle')}>
        <ActivityHelpContent lang={lang} />
      </Modal>
    </div>
  );
};

// --- Custom Hooks ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

// ==========================================
// Main App Component
// ==========================================
export default function App() {
  const [theme, setTheme] = useLocalStorage('willfit_theme', 'light');
  const [lang, setLang] = useLocalStorage('willfit_lang', 'zh');
  
  const [profile, setProfile] = useLocalStorage('willfit_profile', null);
  const [dynamicParams, setDynamicParams] = useLocalStorage('willfit_params', []);
  const [weights, setWeights] = useLocalStorage('willfit_weights', {}); 
  const [diets, setDiets] = useLocalStorage('willfit_diets', {}); 
  
  const [currentTab, setCurrentTab] = useState('weight'); 
  const [activeDate, setActiveDate] = useState(getTodayStr()); 
  
  const [isBleeding, setIsBleeding] = useState(false);
  const [bleedingDays, setBleedingDays] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(true);
  
  const [scrollTarget, setScrollTarget] = useState(null); 

  // --- Bleeding UI Logic ---
  useEffect(() => {
    if (!profile) return;
    
    let consecutiveSkulls = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayMeals = diets[dateStr] || [];
      const totalCal = dayMeals.reduce((sum, m) => sum + Number(m.calories), 0);
      
      const dayParams = getParamsForDate(dateStr, dynamicParams);
      const effectiveW = getEffectiveWeightForDate(dateStr, weights);
      
      if (!dayParams || effectiveW === null || dayMeals.length === 0) {
         break;
      }
      
      const metrics = calculateMetrics(effectiveW, dayParams.height, calculateAge(profile.birthYear), profile.gender, dayParams.activityFactor, dayParams.deficit);
      
      if (totalCal >= metrics.target + 750) {
        consecutiveSkulls++;
      } else {
        break; 
      }
    }

    if (consecutiveSkulls >= 2) {
      setIsBleeding(true);
      setBleedingDays(consecutiveSkulls);
      // Ensure flash resets when component mounts or bleeding condition triggers anew
      setFlashEnabled(true);
    } else {
      setIsBleeding(false);
      setBleedingDays(0);
    }
  }, [diets, weights, dynamicParams, profile]);

  // Flash limit logic (5 seconds)
  useEffect(() => {
    if (isBleeding && flashEnabled) {
      const timer = setTimeout(() => setFlashEnabled(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isBleeding, flashEnabled]);


  if (!profile || dynamicParams.length === 0) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Onboarding setProfile={setProfile} setDynamicParams={setDynamicParams} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
      </div>
    );
  }

  const pulseClass = (isBleeding && flashEnabled) ? 'animate-[pulse_1s_ease-in-out_infinite]' : '';

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 ${pulseClass}`}>
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-xl bg-white/50 dark:bg-black/20">
          
          {isBleeding && (
            <div className="pointer-events-none fixed inset-0 z-[100] border-[8px] border-red-600/30 shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]"></div>
          )}

          <TopBar 
            lang={lang}
            profile={profile} 
            weights={weights}
            diets={diets}
            dynamicParams={dynamicParams}
            isBleeding={isBleeding}
            bleedingDays={bleedingDays}
            setCurrentTab={setCurrentTab}
            setScrollTarget={setScrollTarget}
          />

          <main className="flex-1 overflow-y-auto pb-24 pt-4 px-4 space-y-6 scroll-smooth">
            {currentTab === 'weight' && (
              <WeightTab 
                lang={lang}
                profile={profile} 
                dynamicParams={dynamicParams} 
                weights={weights} 
                setWeights={setWeights} 
                activeDate={activeDate}
                setActiveDate={setActiveDate}
              />
            )}
            {currentTab === 'diet' && (
              <DietTab 
                lang={lang}
                profile={profile} 
                dynamicParams={dynamicParams} 
                weights={weights} 
                diets={diets} 
                setDiets={setDiets}
                activeDate={activeDate}
                setActiveDate={setActiveDate} 
              />
            )}
            {currentTab === 'dashboard' && (
              <Dashboard 
                lang={lang}
                setLang={setLang}
                theme={theme}
                setTheme={setTheme}
                profile={profile}
                setProfile={setProfile}
                dynamicParams={dynamicParams}
                setDynamicParams={setDynamicParams}
                weights={weights}
                diets={diets}
                setWeights={setWeights}
                setDiets={setDiets}
                setCurrentTab={setCurrentTab}
                setActiveDate={setActiveDate}
                scrollTarget={scrollTarget}
                setScrollTarget={setScrollTarget}
              />
            )}
          </main>

          <BottomNav lang={lang} currentTab={currentTab} setCurrentTab={setCurrentTab} />
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 2. Top Bar (With Settings Dropdown)
// ==========================================
const TopBar = ({ lang, profile, weights, diets, dynamicParams, isBleeding, bleedingDays, setCurrentTab, setScrollTarget }) => {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const today = getTodayStr();
  const todayWeight = weights[today];
  const dayMeals = diets[today] || [];
  const totalCal = dayMeals.reduce((sum, m) => sum + Number(m.calories), 0);
  
  const currentParams = getParamsForDate(today, dynamicParams);
  const effectiveW = getEffectiveWeightForDate(today, weights);
  const metrics = effectiveW !== null && currentParams ? calculateMetrics(effectiveW, currentParams.height, calculateAge(profile.birthYear), profile?.gender, currentParams.activityFactor, currentParams.deficit) : null;
  const target = metrics?.target || 0;
  const remainingCal = target > 0 ? target - totalCal : (effectiveW === null ? t(lang, 'noWeight') : '-');

  let streak = 0;
  let tempStreak = 0;
  for (let i = 0; i < 365; i++) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     const dateStr = d.toISOString().split('T')[0];
     
     const meals = diets[dateStr] || [];
     if (meals.length === 0) {
       if (i === 0) continue;
       tempStreak = 0; 
       continue;
     }
     
     const cal = meals.reduce((sum, m) => sum + Number(m.calories), 0);
     const params = getParamsForDate(dateStr, dynamicParams);
     const effW = getEffectiveWeightForDate(dateStr, weights);
     
     if (params && effW !== null) {
       const m = calculateMetrics(effW, params.height, calculateAge(profile.birthYear), profile.gender, params.activityFactor, params.deficit);
       if (cal > 0 && cal <= m.target) {
         tempStreak++;
         if (i === tempStreak - 1 || (i===1 && tempStreak===1)) streak = tempStreak;
       } else {
         tempStreak = 0;
       }
     } else {
       tempStreak = 0;
     }
  }

  const baseClasses = "sticky top-0 w-full max-w-md z-40 px-4 py-3 transition-all duration-500 backdrop-blur-md shadow-sm";
  const bgClasses = isBleeding 
    ? "bg-red-900/90 text-white border-b-4 border-red-500" 
    : "bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800";

  const handleMenuClick = (target) => {
    setCurrentTab('dashboard');
    setScrollTarget(target);
    setIsSettingsMenuOpen(false);
  };

  return (
    <header className={`${baseClasses} ${bgClasses}`}>
      <div className="flex justify-between items-start w-full relative">
        <div className="flex flex-col flex-1">
          <h1 className="font-extrabold text-lg flex items-center gap-2 tracking-tight">
            {t(lang, 'appName')}
            {isBleeding && <AlertTriangle size={18} className="text-yellow-300 animate-pulse" />}
          </h1>
          <div className="flex items-center text-xs space-x-3 mt-0.5 font-medium opacity-80">
            <span>{todayWeight ? `${todayWeight} kg` : t(lang, 'noWeight')}</span>
            <span>|</span>
            <span>{t(lang, 'remain')} {remainingCal} kcal</span>
            <span>|</span>
            <span>🔥 {streak} {t(lang, 'streak')}</span>
          </div>
          {isBleeding && (
            <div className="text-xs font-bold text-yellow-300 mt-1 flex items-center animate-bounce">
              {t(lang, 'warning', {days: bleedingDays})}
            </div>
          )}
        </div>

        <div className="relative z-50">
          <button 
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} 
            className="p-1.5 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Settings size={22} className={isBleeding ? "text-white" : "text-gray-700 dark:text-gray-300"} />
          </button>
          
          {isSettingsMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSettingsMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden text-gray-800 dark:text-gray-200 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => handleMenuClick('basicInfo')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  {t(lang, 'basicInfo')}
                </button>
                <button onClick={() => handleMenuClick('dynamicParams')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  {t(lang, 'dynParams')}
                </button>
                <button onClick={() => handleMenuClick('backup')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  {t(lang, 'backupMenu')}
                </button>
                <button onClick={() => handleMenuClick('recentRecords')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  {t(lang, 'recentMenu')}
                </button>
                <button onClick={() => handleMenuClick('deleteAll')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  {t(lang, 'deleteAllMenu')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};


// ==========================================
// 3. Weight Tab
// ==========================================
const WeightTab = ({ lang, profile, dynamicParams, weights, setWeights, activeDate, setActiveDate }) => {
  const date = activeDate;
  const setDate = setActiveDate;
  const [inputWeight, setInputWeight] = useState(weights[date] || '');
  const resultRef = useRef(null);
  const [showMetricsInfo, setShowMetricsInfo] = useState(false);
  const [chartMode, setChartMode] = useState('daily'); 

  useEffect(() => {
    setInputWeight(weights[date] || '');
  }, [date, weights]);

  const changeDate = (offset) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!inputWeight) return;
    setWeights(prev => ({ ...prev, [date]: Number(inputWeight) }));
    
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const currentParams = getParamsForDate(date, dynamicParams);
  const age = calculateAge(profile.birthYear);
  const effectiveW = getEffectiveWeightForDate(date, weights);
  const metrics = effectiveW !== null ? calculateMetrics(effectiveW, currentParams?.height, age, profile?.gender, currentParams?.activityFactor, currentParams?.deficit) : null;

  const chartData = useMemo(() => {
    const dates = Object.keys(weights).sort();
    if (dates.length === 0) return [];

    if (chartMode === 'daily') {
      return dates.map(d => ({
        date: d.substring(5), 
        weight: weights[d]
      })).slice(-30);
    } else {
      const weeks = {};
      dates.forEach(d => {
        const dateObj = new Date(d);
        const day = dateObj.getDay();
        const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(dateObj.setDate(diff));
        const weekKey = monday.toISOString().split('T')[0];
        
        if (!weeks[weekKey]) weeks[weekKey] = [];
        weeks[weekKey].push(weights[d]);
      });

      return Object.entries(weeks).map(([weekStart, wList]) => {
        const avg = wList.reduce((a,b) => a+b, 0) / wList.length;
        return {
          date: weekStart.substring(5),
          weight: Number(avg.toFixed(1))
        };
      }).slice(-12);
    }
  }, [weights, chartMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500"/> {t(lang, 'weightTab')}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">{t(lang, 'date')}</label>
            <div className="flex items-center justify-between p-2 rounded-xl border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus-within:border-blue-500 transition-colors">
              <button type="button" onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg dark:text-white"><ChevronLeft size={20}/></button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium shrink-0">
                  {getDayOfWeek(date, lang)}
                </span>
                <input type="date" 
                  className="bg-transparent font-semibold text-lg outline-none dark:text-white dark:[color-scheme:dark]"
                  value={date} onChange={e => setDate(e.target.value)}
                  max={getTodayStr()}
                />
              </div>

              <button type="button" onClick={() => changeDate(1)} disabled={date === getTodayStr()} 
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-20 dark:text-white"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">{t(lang, 'weightInput')}</label>
            <NumberControl value={inputWeight} onChange={setInputWeight} step="0.1" placeholder="0.0" />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-gray-900 dark:bg-blue-600 text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
            {t(lang, 'saveRecord')}
          </button>
        </form>
      </Card>

      {metrics && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-none shadow-md overflow-hidden relative" >
           <div ref={resultRef} className="absolute -top-20"></div>
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{t(lang, 'calcResultTitle')}</h3>
              <InfoButton onClick={() => setShowMetricsInfo(true)} />
           </div>
           
           <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">BMR</div>
                <div className="font-bold text-lg">{metrics.bmr}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">TDEE</div>
                <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{metrics.tdee}</div>
              </div>
              <div className="bg-gray-900 dark:bg-blue-900 p-3 rounded-xl shadow-sm text-white">
                <div className="text-xs text-gray-300 mb-1">{t(lang, 'intakeTarget')}</div>
                <div className="font-bold text-xl">{metrics.target}</div>
              </div>
           </div>
           <div className="text-xs text-center mt-3 text-gray-400">
              {t(lang, 'calcWeightDesc', {weight: effectiveW})}
           </div>
        </Card>
      )}

      <Modal isOpen={showMetricsInfo} onClose={() => setShowMetricsInfo(false)} title={t(lang, 'calcFormulaTitle')}>
         <div className="space-y-4 text-sm">
            <div>
              <strong className="text-blue-600 dark:text-blue-400">{t(lang, 'weightRuleTitle')}</strong>
              <p className="mt-1">{t(lang, 'weightRuleDesc')}</p>
            </div>
            <div>
              <strong className="text-purple-600 dark:text-purple-400">{t(lang, 'bmrTdeeTitle')}</strong>
              <p className="mt-1">{t(lang, 'bmrTdeeDesc')}</p>
            </div>
            {metrics && (
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                <div>{t(lang, 'calcWeightLabel')}: {effectiveW} kg</div>
                <div>{t(lang, 'height')}: {currentParams?.height} cm | {t(lang, 'ageLabel')}: {age} {t(lang, 'ageUnit')}</div>
                <div className="mt-1 text-blue-600 dark:text-blue-400">TDEE = BMR({metrics.bmr}) × {currentParams?.activityFactor} = {metrics.tdee}</div>
                <div className="text-green-600 dark:text-green-400">{t(lang, 'intakeTarget')} = {metrics.tdee} - {currentParams?.deficit} = {metrics.target} kcal</div>
              </div>
            )}
         </div>
      </Modal>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold">{t(lang, 'trend')}</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm">
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${chartMode === 'daily' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium' : 'text-gray-500'}`}
              onClick={() => setChartMode('daily')}
            >{t(lang, 'daily')}</button>
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${chartMode === 'weekly' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium' : 'text-gray-500'}`}
              onClick={() => setChartMode('weekly')}
            >{t(lang, 'weekly')}</button>
          </div>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: theme==='dark'?'#1f2937':'#fff', color: theme==='dark'?'#f3f4f6':'#111827' }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">{t(lang, 'chartEmpty')}</div>
        )}
      </Card>
    </div>
  );
};


// ==========================================
// 4. Diet Tab
// ==========================================
const DietTab = ({ lang, profile, dynamicParams, weights, diets, setDiets, activeDate, setActiveDate }) => {
  const date = activeDate;
  const setDate = setActiveDate;
  const [showAddModal, setShowAddModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);
  
  const [mealForm, setMealForm] = useState({ time: '12:00', name: '', calories: '', photos: [] });
  const [editingMealId, setEditingMealId] = useState(null);
  
  const currentParams = getParamsForDate(date, dynamicParams);
  const effectiveW = getEffectiveWeightForDate(date, weights);
  const metrics = effectiveW !== null ? calculateMetrics(effectiveW, currentParams?.height, calculateAge(profile.birthYear), profile?.gender, currentParams?.activityFactor, currentParams?.deficit) : null;
  const target = metrics?.target || 0;

  const dayMeals = diets[date] || [];
  const totalCal = dayMeals.reduce((sum, m) => sum + Number(m.calories), 0);
  const remaining = target > 0 ? target - totalCal : null;

  const changeDate = (offset) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newPhotos = await Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const resized = await resizeImage(event.target.result, 600);
          resolve(resized);
        };
        reader.readAsDataURL(file);
      });
    }));

    setMealForm(prev => ({ ...prev, photos: [...(prev.photos || []), ...newPhotos] }));
    e.target.value = ''; 
  };

  const removePhoto = (indexToRemove) => {
    setMealForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const openAddModal = () => {
    setMealForm({ time: '12:00', name: '', calories: '', photos: [] });
    setEditingMealId(null);
    setShowAddModal(true);
  };

  const openEditModal = (meal) => {
    const currentPhotos = meal.photos || (meal.photoUrl ? [meal.photoUrl] : []);
    setMealForm({ time: meal.time, name: meal.name, calories: meal.calories, photos: currentPhotos });
    setEditingMealId(meal.id);
    setShowAddModal(true);
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!mealForm.name || !mealForm.calories) return;
    
    if (editingMealId) {
      setDiets(prev => ({
        ...prev,
        [date]: prev[date].map(m => m.id === editingMealId ? { ...m, ...mealForm, photoUrl: undefined } : m).sort((a,b) => a.time.localeCompare(b.time))
      }));
    } else {
      const newMeal = { id: Date.now().toString(), ...mealForm };
      setDiets(prev => ({
        ...prev,
        [date]: [...(prev[date] || []), newMeal].sort((a,b) => a.time.localeCompare(b.time))
      }));
    }
    
    setMealForm({ time: '12:00', name: '', calories: '', photos: [] });
    setEditingMealId(null);
    setShowAddModal(false);
  };

  const confirmDeleteAction = () => {
    if(mealToDelete) {
      setDiets(prev => ({
        ...prev,
        [date]: prev[date].filter(m => m.id !== mealToDelete)
      }));
      setMealToDelete(null);
    }
  }

  const getStatusIcon = () => {
    if (target === 0) return null;
    if (totalCal <= target) return <CheckCircle2 className="text-green-500" size={32} />;
    if (totalCal >= target + 750) return <div className="text-3xl animate-bounce">☠️</div>;
    return <XCircle className="text-red-500" size={32} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl dark:text-white"><ChevronLeft/></button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">{getDayOfWeek(date, lang)}</span>
          <input type="date" className="bg-transparent font-bold text-center outline-none dark:text-white dark:[color-scheme:dark]" 
            value={date} onChange={(e) => setDate(e.target.value)} max={getTodayStr()} />
        </div>
        <button onClick={() => changeDate(1)} disabled={date === getTodayStr()} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl disabled:opacity-20 dark:text-white"><ChevronRight/></button>
      </div>

      <Card className="text-center py-8 relative overflow-hidden">
        {target > 0 && totalCal >= target + 750 && <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 z-0"></div>}
        {target > 0 && totalCal <= target && <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 z-0"></div>}
        
        <div className="relative z-10">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{t(lang, 'remain')} (kcal)</div>
          <div className={`text-6xl font-black tracking-tighter mb-4 ${remaining < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
            {remaining !== null ? remaining : '-'}
          </div>
          
          <div className="flex justify-center items-center gap-4">
            <div className="text-sm">
              <div className="text-gray-400">{t(lang, 'target')}</div>
              <div className="font-bold">{target || t(lang, 'noWeight')}</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center justify-center w-12 h-12">{getStatusIcon()}</div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="text-sm">
              <div className="text-gray-400">{t(lang, 'consumed')}</div>
              <div className="font-bold text-blue-600 dark:text-blue-400">{totalCal}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-lg">{t(lang, 'dietRecord')}</h3>
          <button onClick={openAddModal} className="flex items-center gap-1 text-sm bg-gray-900 dark:bg-blue-600 text-white px-3 py-1.5 rounded-lg active:scale-95 shadow-sm">
            <Plus size={16} /> {t(lang, 'addMeal')}
          </button>
        </div>

        {dayMeals.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <Utensils size={40} className="mx-auto mb-3 opacity-20" />
            <p>{t(lang, 'noRecord')}</p>
          </div>
        ) : (
          dayMeals.map(meal => {
            const mealPhotos = meal.photos || (meal.photoUrl ? [meal.photoUrl] : []);
            return (
              <Card key={meal.id} className="flex flex-col gap-2 p-3 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm font-bold text-gray-400 dark:text-gray-500 w-12 text-center shrink-0">{meal.time}</div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer group-hover:opacity-80 transition-opacity" onClick={() => openEditModal(meal)} title={t(lang, 'dblClickEdit')}>
                    <div className="font-bold truncate text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
                      {meal.name} <Edit2 size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">{meal.calories} <span className="text-xs text-gray-500">kcal</span></div>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); setMealToDelete(meal.id); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors shrink-0" title={t(lang, 'confirmDelete')}>
                    <X size={20} />
                  </button>
                </div>
                
                {mealPhotos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto snap-x ml-16 pb-1">
                    {mealPhotos.map((url, idx) => (
                      <img key={idx} src={url} alt={`meal-${idx}`} 
                        className="w-16 h-16 rounded-xl object-cover cursor-pointer shadow-sm border border-gray-100 dark:border-gray-700 shrink-0 snap-start" 
                        onClick={(e) => { e.stopPropagation(); setPhotoPreview(url); }} 
                      />
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingMealId ? t(lang, 'editMealTitle') : t(lang, 'newMealTitle')}>
        <form onSubmit={handleAddMeal} className="space-y-4 mt-2">
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">{t(lang, 'time')}</label>
              <input type="time" required value={mealForm.time} onChange={e => setMealForm({...mealForm, time: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none" />
            </div>
            <div className="w-2/3">
              <label className="block text-sm font-medium mb-1">{t(lang, 'kcal')}</label>
              <NumberControl value={mealForm.calories} onChange={val => setMealForm({...mealForm, calories: val})} step="10" placeholder="e.g. 450" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t(lang, 'mealName')}</label>
            <input type="text" required value={mealForm.name} onChange={e => setMealForm({...mealForm, name: e.target.value})} placeholder={t(lang, 'mealPlaceholder')}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t(lang, 'uploadPhoto')}</label>
            <div className="flex flex-wrap gap-3">
              {mealForm.photos.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 group">
                  <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-gray-600" />
                  <button type="button" onClick={() => removePhoto(idx)} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Camera size={24} className="text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-400">{t(lang, 'addPhotoTxt')}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-gray-900 dark:bg-blue-600 text-white font-bold text-lg shadow-lg">{t(lang, 'saveMeal')}</button>
        </form>
      </Modal>

      <Modal isOpen={!!photoPreview} onClose={() => setPhotoPreview(null)} title={t(lang, 'photoViewTitle')}>
        {photoPreview && <img src={photoPreview} alt="large view" className="w-full rounded-lg" />}
      </Modal>

      <Modal isOpen={!!mealToDelete} onClose={() => setMealToDelete(null)} title={t(lang, 'confirmDelete')}>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">{t(lang, 'deleteMsg')}</p>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setMealToDelete(null)} className="w-1/2 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 dark:text-white font-bold">{t(lang, 'cancel')}</button>
            <button onClick={confirmDeleteAction} className="w-1/2 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg">{t(lang, 'confirmDelete')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


// ==========================================
// 5. Dashboard (Settings & Stats)
// ==========================================
const Dashboard = ({ lang, setLang, theme, setTheme, profile, setProfile, dynamicParams, setDynamicParams, weights, diets, setWeights, setDiets, setCurrentTab, setActiveDate, scrollTarget, setScrollTarget }) => {
  const [showEditParams, setShowEditParams] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [paramForm, setParamForm] = useState({ height: '', deficit: '', activityFactor: '1.2' });
  const [profileForm, setProfileForm] = useState({ name: profile.name, gender: profile.gender, birthYear: profile.birthYear });
  
  const [showImport, setShowImport] = useState(false);
  
  const [showDeficitHelp, setShowDeficitHelp] = useState(false);
  const [showActivityHelp, setShowActivityHelp] = useState(false);
  const [sysMessage, setSysMessage] = useState(null); 
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const importRef = useRef(null);

  const basicInfoRef = useRef(null);
  const dynamicParamsRef = useRef(null);
  const backupRef = useRef(null);
  const recentRecordsRef = useRef(null);

  useEffect(() => {
    if (scrollTarget) {
      if (scrollTarget === 'deleteAll') {
        setShowDeleteAll(true);
        setScrollTarget(null);
        return;
      }
      setTimeout(() => {
        const refs = { basicInfo: basicInfoRef, dynamicParams: dynamicParamsRef, backup: backupRef, recentRecords: recentRecordsRef };
        const targetRef = refs[scrollTarget];
        if (targetRef && targetRef.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setScrollTarget(null);
      }, 150);
    }
  }, [scrollTarget, setScrollTarget]);

  useEffect(() => {
    if (showEditParams && dynamicParams.length > 0) {
      const current = dynamicParams[0];
      setParamForm({ height: current.height, deficit: current.deficit, activityFactor: current.activityFactor });
    }
  }, [showEditParams, dynamicParams]);

  const handleSaveParams = (e) => {
    e.preventDefault();
    const today = getTodayStr();
    const newEntry = {
      date: today,
      height: Number(paramForm.height),
      deficit: Number(paramForm.deficit),
      activityFactor: Number(paramForm.activityFactor)
    };
    setDynamicParams(prev => {
      if (prev[0] && prev[0].date === today) {
        return [newEntry, ...prev.slice(1)];
      }
      return [newEntry, ...prev];
    });
    setShowEditParams(false);
    setSysMessage(t(lang, 'dynParamsSaved'));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({
      name: profileForm.name,
      gender: profileForm.gender,
      birthYear: Number(profileForm.birthYear)
    });
    setShowEditProfile(false);
  };

  const confirmDeleteAll = () => {
    window.localStorage.removeItem('willfit_profile');
    window.localStorage.removeItem('willfit_params');
    window.localStorage.removeItem('willfit_weights');
    window.localStorage.removeItem('willfit_diets');
    window.location.reload();
  };

  const stats = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalCalAllTime = 0;
    let daysWithMeals = 0;
    
    const dates = Object.keys(diets).sort((a,b) => new Date(b) - new Date(a));
    
    for (let i = 0; i < 365; i++) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       
       const meals = diets[dateStr] || [];
       if (meals.length === 0) {
         if (i === 0) continue;
         tempStreak = 0; 
         continue;
       }
       
       const cal = meals.reduce((sum, m) => sum + Number(m.calories), 0);
       const params = getParamsForDate(dateStr, dynamicParams);
       const effW = getEffectiveWeightForDate(dateStr, weights);
       
       if (params && effW !== null) {
         const m = calculateMetrics(effW, params.height, calculateAge(profile.birthYear), profile.gender, params.activityFactor, params.deficit);
         if (cal > 0 && cal <= m.target) {
           tempStreak++;
           if (i === tempStreak - 1 || (i===1 && tempStreak===1)) currentStreak = tempStreak;
         } else {
           tempStreak = 0;
         }
         if (tempStreak > maxStreak) maxStreak = tempStreak;
       } else {
         tempStreak = 0;
       }
    }

    dates.forEach(d => {
      const cal = diets[d].reduce((sum, m) => sum + Number(m.calories), 0);
      if (cal > 0) {
        totalCalAllTime += cal;
        daysWithMeals++;
      }
    });

    return {
      currentStreak,
      maxStreak,
      avgCal: daysWithMeals ? Math.round(totalCalAllTime / daysWithMeals) : 0
    };
  }, [diets, weights, dynamicParams, profile]);

  const handleExport = () => {
    const exportData = { weights: [], meals: [] };
    Object.entries(weights).forEach(([date, weight]) => {
      exportData.weights.push({ date, weight });
    });
    Object.entries(diets).forEach(([date, dayMeals]) => {
      dayMeals.forEach(m => {
        exportData.meals.push({
          date, time: m.time, name: m.name, calories: Number(m.calories), photos: m.photos || (m.photoUrl ? [m.photoUrl] : [])
        });
      });
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WillFit_Backup_${getTodayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processImportData = (dataStr) => {
    try {
      const data = JSON.parse(dataStr);
      let newWeights = { ...weights };
      let newDiets = { ...diets };
      
      if (data.weights && Array.isArray(data.weights)) {
        data.weights.forEach(w => {
          if (w.date && w.weight !== undefined) {
            newWeights[w.date] = Number(w.weight);
          }
        });
      }

      if (data.meals && Array.isArray(data.meals)) {
        data.meals.forEach(m => {
          if (m.date && m.time && m.name && m.calories !== undefined) {
            if (!newDiets[m.date]) newDiets[m.date] = [];
            if (!newDiets[m.date].find(exist => exist.time === m.time && exist.name === m.name)) {
              newDiets[m.date].push({ 
                id: Date.now().toString() + Math.random(), 
                time: m.time, 
                name: m.name, 
                calories: Number(m.calories),
                photos: Array.isArray(m.photos) ? m.photos : []
              });
            }
          }
        });
      }
      
      setWeights(newWeights);
      setDiets(newDiets);
      setSysMessage(t(lang, 'importSuccess'));
      setShowImport(false);
    } catch (err) {
      setSysMessage(t(lang, 'importFail'));
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => processImportData(event.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-in slide-in-from-bottom-4 duration-300">
      
      <div ref={basicInfoRef}>
        <Card className="flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none">
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-gray-400 text-sm">{profile.gender === 'male' ? t(lang, 'male') : t(lang, 'female')} • {calculateAge(profile.birthYear)}</p>
          </div>
          <button onClick={() => setShowEditProfile(true)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            {t(lang, 'basicInfo').replace('👤 ', '')}
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t(lang, 'curStreak')}</div>
          <div className="text-2xl font-black text-orange-500">{stats.currentStreak}</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t(lang, 'maxStreak')}</div>
          <div className="text-2xl font-black dark:text-white">{stats.maxStreak}</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t(lang, 'avgCal')}</div>
          <div className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.avgCal}</div>
        </Card>
      </div>

      <Heatmap lang={lang} diets={diets} weights={weights} dynamicParams={dynamicParams} profile={profile} setCurrentTab={setCurrentTab} setActiveDate={setActiveDate} />

      <div ref={dynamicParamsRef}>
        <Card className="flex justify-between items-center">
          <div>
            <div className="font-bold text-base">{t(lang, 'step2')}</div>
            <div className="text-xs text-gray-500 mt-0.5">H: {dynamicParams[0]?.height}cm | D: {dynamicParams[0]?.deficit}kcal</div>
          </div>
          <button onClick={() => setShowEditParams(true)} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl">
            {t(lang, 'newTargetBtn')}
          </button>
        </Card>
      </div>

      <div ref={recentRecordsRef}>
        <Card>
          <h3 className="font-bold mb-4">{t(lang, 'recentMenu').replace('📊 ', '')}</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {Object.keys({...weights, ...diets}).sort().reverse().slice(0, 15).map(d => {
              const w = weights[d];
              const mealsCount = diets[d]?.length || 0;
              if (!w && mealsCount === 0) return null;
              return (
                <div key={d} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="font-medium text-sm w-24">{d.substring(5)}</div>
                  <div className="flex-1 flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <span onDoubleClick={() => { setActiveDate(d); setCurrentTab('weight'); }}
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors font-medium text-blue-600 dark:text-blue-400"
                      title={t(lang, 'dblClickWeight')}>
                      {w ? `${w} kg` : '+ Weight'}
                    </span>
                    <span onDoubleClick={() => { setActiveDate(d); setCurrentTab('diet'); }}
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors font-medium text-purple-600 dark:text-purple-400"
                      title={t(lang, 'dblClickDiet')}>
                      {mealsCount > 0 ? `${mealsCount} meals` : '+ Diet'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div ref={backupRef}>
        <Card className="bg-blue-50/50 dark:bg-gray-800/80 border-blue-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{t(lang, 'backupMenu').replace('💾 ', '')}<span className="text-xs font-normal text-gray-500 ml-1">(i)</span></h3>
            <InfoButton onClick={() => setShowImport(true)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow text-blue-600 dark:text-blue-400">
              <Download size={24} className="mb-2" />
              <span className="text-sm font-medium">{t(lang, 'export')}</span>
            </button>
            <button onClick={() => setShowImport(true)} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700 dark:text-gray-300">
              <Upload size={24} className="mb-2" />
              <span className="text-sm font-medium">{t(lang, 'importBtn')}</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title={t(lang, 'basicInfo').replace('👤 ', '')}>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-2 rounded-xl mb-4">
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex-1 py-2 text-sm font-bold bg-white dark:bg-gray-800 rounded shadow-sm text-gray-700 dark:text-gray-200">
              {theme === 'dark' ? t(lang, 'themeLight') : t(lang, 'themeDark')}
            </button>
            <button type="button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex-1 py-2 text-sm font-bold bg-white dark:bg-gray-800 rounded shadow-sm text-gray-700 dark:text-gray-200">
              {t(lang, 'switchLang')}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t(lang, 'name')}</label>
            <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t(lang, 'gender')}</label>
              <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none">
                <option value="male">{t(lang, 'male')}</option>
                <option value="female">{t(lang, 'female')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t(lang, 'birthYear')}</label>
              <NumberControl value={profileForm.birthYear} onChange={val => setProfileForm({...profileForm, birthYear: val})} step="1" min="1900" max="2100" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg">{t(lang, 'saveChanges')}</button>
        </form>
      </Modal>

      <Modal isOpen={showEditParams} onClose={() => setShowEditParams(false)} title={t(lang, 'dynParams').replace('⚙️ ', '')}>
        <form onSubmit={handleSaveParams} className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm mb-4">
            {t(lang, 'dynParamsNotice')}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t(lang, 'height')}</label>
            <NumberControl value={paramForm.height} onChange={val => setParamForm({...paramForm, height: val})} step="0.5" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              {t(lang, 'deficit')} <InfoButton onClick={() => setShowDeficitHelp(true)} />
            </label>
            <NumberControl value={paramForm.deficit} onChange={val => setParamForm({...paramForm, deficit: val})} step="50" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              {t(lang, 'activity')} <InfoButton onClick={() => setShowActivityHelp(true)} />
            </label>
            <select value={paramForm.activityFactor} onChange={e => setParamForm({...paramForm, activityFactor: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none h-[52px]">
              {getActivityOptions(lang).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg">{t(lang, 'saveNewTarget')}</button>
        </form>
      </Modal>

      <Modal isOpen={showDeficitHelp} onClose={() => setShowDeficitHelp(false)} title={t(lang, 'deficitHelpTitle')}>
        <DeficitHelpContent lang={lang} />
      </Modal>

      <Modal isOpen={showActivityHelp} onClose={() => setShowActivityHelp(false)} title={t(lang, 'activityHelpTitle')}>
        <ActivityHelpContent lang={lang} />
      </Modal>

      <Modal isOpen={!!sysMessage} onClose={() => setSysMessage(null)} title={t(lang, 'sysMsg')}>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 font-medium">{sysMessage}</p>
          <button onClick={() => setSysMessage(null)} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg mt-4">{t(lang, 'confirm')}</button>
        </div>
      </Modal>

      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title={t(lang, 'backupMenu').replace('💾 ', '')}>
        <div className="space-y-4 text-sm">
          <p>{t(lang, 'aiPromptIntro')}</p>
          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-[10px] sm:text-xs overflow-x-auto whitespace-pre-wrap select-all border border-gray-200 dark:border-gray-700 font-mono text-gray-700 dark:text-gray-300 h-40 overflow-y-auto">
            {AI_PROMPT_TEXT}
          </div>
          
          <div className="pt-2 flex flex-col gap-3">
             <input type="file" accept=".json" ref={importRef} className="hidden" onChange={handleImportFile} />
             <button onClick={() => importRef.current.click()} className="w-full py-3 rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg">
               <Upload size={20} /> {t(lang, 'chooseJsonFile')}
             </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteAll} onClose={() => setShowDeleteAll(false)} title={t(lang, 'deleteAllMenu').replace('🗑️ ', '')}>
        <div className="space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold leading-relaxed">
            {t(lang, 'deleteWarning')}
          </div>
          <div className="flex gap-2">
            <button onClick={confirmDeleteAll} className="w-1/3 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              {t(lang, 'confirm')}
            </button>
            <button onClick={() => { setShowDeleteAll(false); setScrollTarget('backup'); }} className="w-1/3 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              {t(lang, 'backupData')}
            </button>
            <button onClick={() => setShowDeleteAll(false)} className="w-1/3 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
              {t(lang, 'backToRecord')}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};


// --- Heatmap Component ---
const Heatmap = ({ lang, diets, weights, dynamicParams, profile, setCurrentTab, setActiveDate }) => {
  const [selectedInfo, setSelectedInfo] = useState(null);

  const gridData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const meals = diets[dateStr] || [];
      const totalCal = meals.reduce((sum, m) => sum + Number(m.calories), 0);
      
      let status = 'none';
      const params = getParamsForDate(dateStr, dynamicParams);
      const effW = getEffectiveWeightForDate(dateStr, weights);

      if (meals.length > 0 && params && effW !== null) {
        const m = calculateMetrics(effW, params.height, calculateAge(profile.birthYear), profile.gender, params.activityFactor, params.deficit);
        if (totalCal <= m.target) status = 'ok';
        else if (totalCal >= m.target + 750) status = 'skull';
        else status = 'over';
      }

      data.push({ date: dateStr, status, cal: totalCal, meals: meals.length });
    }
    return data;
  }, [diets, weights, dynamicParams, profile]);

  let clickTimer = null;
  const handleBlockClick = (info) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      setActiveDate(info.date);
      setCurrentTab('diet');
    } else {
      clickTimer = setTimeout(() => {
        setSelectedInfo(info);
        clickTimer = null;
      }, 250);
    }
  };

  return (
    <Card>
      <h3 className="font-bold mb-4">{t(lang, 'heatmap')}</h3>
      <div className="grid grid-cols-7 gap-2">
        {gridData.map((day) => {
          let bg = 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
          if (day.status === 'ok') bg = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] border-none';
          if (day.status === 'over') bg = 'bg-red-400 border-none';
          if (day.status === 'skull') bg = 'bg-red-900 border-2 border-red-500 animate-[pulse_2s_ease-in-out_infinite]';

          return (
            <div 
              key={day.date} 
              onClick={() => handleBlockClick(day)}
              className={`relative group aspect-square rounded-md ${bg} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
            >
               {day.status === 'skull' && <span className="text-[10px]">☠️</span>}
               <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                 <div className="font-bold text-center">{day.date}</div>
                 <div className="text-gray-300">{t(lang, 'dblClickEdit')}</div>
               </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 flex gap-4 justify-center text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500"></div> {t(lang, 'statusOk')}</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-400"></div> {t(lang, 'statusOver')}</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-900 border border-red-500"></div> {t(lang, 'statusDanger')}</div>
      </div>

      {selectedInfo && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-center animate-in fade-in">
          <strong>{selectedInfo.date}</strong> 
          <span className="mx-2">|</span> 
          {t(lang, 'consumed')} {selectedInfo.cal} kcal ({selectedInfo.meals})
          <div className="text-xs text-gray-400 mt-1">{t(lang, 'heatmapHint')}</div>
        </div>
      )}
    </Card>
  );
};


// ==========================================
// 6. Bottom Navigation
// ==========================================
const BottomNav = ({ lang, currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'weight', icon: TrendingUp, label: t(lang, 'weightTab') },
    { id: 'diet', icon: Utensils, label: t(lang, 'dietTab') },
    { id: 'dashboard', icon: Home, label: t(lang, 'dashboardTab') },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center p-2">
        {tabs.map(tab => {
          const active = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-2xl min-w-[64px] transition-all duration-300 ${active ? 'scale-110 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <div className={`p-1.5 rounded-xl mb-1 ${active ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );
};
