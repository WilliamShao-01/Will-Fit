import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { 
  Scale, Utensils, Settings, ChevronLeft, ChevronRight, ChevronUp,
  HelpCircle, AlertTriangle, X, Plus, ExternalLink, Download, Upload, FileText, Camera, Trash2
} from 'lucide-react';

// ==========================================
// 0. Translations & Localization Data
// ==========================================
const t = {
  zh: {
    appName: "Will Fit",
    todayWeight: "今日體重",
    remainingCal: "剩餘熱量",
    streak: "連續達標",
    streakDays: "天",
    dangerStreak: "已連續 {days} 天嚴重超標！請注意飲食！",
    weightTab: "每日體重",
    dietTab: "飲食紀錄",
    dashboardTab: "個人記錄",
    settingsTitle: "設定與選項",
    editProfile: "修改基本資料",
    editDynamic: "修改動態目標",
    backupImport: "資料備份與匯入",
    recentRecords: "近期歷史數據",
    deleteAllData: "刪除所有資料",
    backToRecords: "回到紀錄",
    confirmDelete: "確認刪除",
    cancel: "取消",
    save: "儲存設定",
    next: "下一步",
    prev: "上一步",
    complete: "完成設定",
    name: "姓名",
    gender: "性別",
    male: "男性",
    female: "女性",
    birthYear: "出生年",
    height: "身高 (cm)",
    deficitTarget: "赤字目標 (kcal)",
    activityLevel: "活動係數",
    activity12: "1.2 (久坐/幾乎不動)",
    activity1375: "1.375 (輕度運動 1-3次/週)",
    activity155: "1.55 (中度運動 3-5次/週)",
    activity1725: "1.725 (高度運動 6-7次/週)",
    activity19: "1.9 (極高度運動/勞力工作)",
    language: "語言 (Language)",
    theme: "主題模式 (Theme)",
    darkMode: "深色模式",
    lightMode: "日間模式",
    date: "日期",
    weight: "體重 (kg)",
    submit: "送出並計算",
    bmr: "基礎代謝率 (BMR)",
    tdee: "總消耗熱量 (TDEE)",
    targetCal: "每日熱量目標",
    dailyTrend: "日趨勢 (每日體重)",
    weeklyTrend: "週趨勢 (週平均體重)",
    mealTime: "時間",
    mealName: "餐點名稱",
    mealCal: "熱量 (kcal)",
    addMeal: "新增餐點",
    photos: "餐點照片",
    uploadPhoto: "加入照片",
    maxStreak: "最長連續天數",
    avgCal: "近30天日均熱量",
    heatmapTitle: "飲食達成率 (近 30 天)",
    exportCsv: "匯出備份 (.json)",
    importCsv: "匯入資料",
    importInstruction: "資料備份與匯入 (詳見教學)",
    deleteConfirmTitle: "確定要刪除所有資料嗎？",
    deleteConfirmDesc: "此動作無法復原！刪除前請務必先備份您的資料。",
    formulaDesc: "算式與數值說明",
    viewModal: "檢視照片",
    editMeal: "修改餐點",
    update: "更新",
    noData: "尚無資料",
    importSuccess: "資料匯入成功！",
    importError: "JSON 檔案格式錯誤",
    deficitHelpTitle: "什麼是赤字目標？",
    deficitHelp1: "想要減重，你需要創造「熱量赤字」，也就是讓「每天消耗的熱量 (TDEE) 大於 攝取的熱量」。",
    deficitHelp2: "一般建議將赤字設定在 300 ~ 500 大卡 之間，這樣每週大約可以健康減去 0.3 ~ 0.5 公斤。不宜設定過高，以免流失肌肉、引發報復性飲食或影響內分泌健康。",
    deficitHelpLink: "World Gym：卡路里計算機教學",
    activityHelpTitle: "如何選擇活動係數？",
    activityHelp1: "活動係數用來評估你日常消耗的活動量，請根據你「一整週」的真實生活型態來選擇：",
    activityHelpList: [
      "1.2 (久坐)：上班族、幾乎沒有運動習慣。",
      "1.375 (輕度)：每週 1~3 天進行輕度運動。",
      "1.55 (中度)：每週 3~5 天進行中等強度運動。",
      "1.725 (高度)：每週 6~7 天高強度運動/勞力工作。",
      "1.9 (極度)：每天兩次高強度訓練/極重度勞力。"
    ],
    activityHelpLink: "Heho 健康：BMR 與 TDEE 計算機",
    aiPromptTitle: "資料備份與匯入教學",
    aiPromptDesc: "支援完整 JSON 格式匯入。你可以複製以下指令並交給 ChatGPT / Gemini，讓 AI 幫你把其他 APP 的雜亂資料打包成專用的 JSON 檔案。",
    downloadPromptDesc: "請直接上傳由 AI 產生的 .json 檔案：",
    copyPrompt: "複製給 AI 的指令",
    copied: "指令已複製！"
  },
  en: {
    appName: "Will Fit",
    todayWeight: "Weight",
    remainingCal: "Remaining",
    streak: "Streak",
    streakDays: "Days",
    dangerStreak: "Severe overeating for {days} days! Be careful!",
    weightTab: "Weight",
    dietTab: "Diet",
    dashboardTab: "Dashboard",
    settingsTitle: "Settings",
    editProfile: "Edit Profile",
    editDynamic: "Edit Target",
    backupImport: "Backup & Import",
    recentRecords: "Recent Records",
    deleteAllData: "Delete All Data",
    backToRecords: "Back to Records",
    confirmDelete: "Confirm Delete",
    cancel: "Cancel",
    save: "Save",
    next: "Next",
    prev: "Previous",
    complete: "Complete",
    name: "Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    birthYear: "Birth Year",
    height: "Height (cm)",
    deficitTarget: "Deficit (kcal)",
    activityLevel: "Activity Level",
    activity12: "1.2 (Sedentary)",
    activity1375: "1.375 (Light Exercise)",
    activity155: "1.55 (Moderate Exercise)",
    activity1725: "1.725 (Heavy Exercise)",
    activity19: "1.9 (Extreme Job)",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    date: "Date",
    weight: "Weight (kg)",
    submit: "Submit",
    bmr: "BMR",
    tdee: "TDEE",
    targetCal: "Daily Target",
    dailyTrend: "Daily Trend",
    weeklyTrend: "Weekly Trend",
    mealTime: "Time",
    mealName: "Meal Name",
    mealCal: "Calories",
    addMeal: "Add Meal",
    photos: "Photos",
    uploadPhoto: "Add Photo",
    maxStreak: "Max Streak",
    avgCal: "30-Day Avg Cal",
    heatmapTitle: "30-Day Diet Heatmap",
    exportCsv: "Export (.json)",
    importCsv: "Import Data",
    importInstruction: "Backup & Import (See Help)",
    deleteConfirmTitle: "Delete all data?",
    deleteConfirmDesc: "Cannot be undone! Please backup first.",
    formulaDesc: "Formula Details",
    viewModal: "View Photo",
    editMeal: "Edit Meal",
    update: "Update",
    noData: "No data",
    importSuccess: "Import successful!",
    importError: "Invalid JSON format",
    deficitHelpTitle: "What is a Calorie Deficit?",
    deficitHelp1: "To lose weight, you must create a calorie deficit, meaning your total daily energy expenditure (TDEE) exceeds your calorie intake.",
    deficitHelp2: "A deficit of 300 - 500 kcal is recommended for a healthy weight loss of 0.3 - 0.5 kg per week. Do not set it too high to avoid muscle loss, rebound eating, and hormonal issues.",
    deficitHelpLink: "World Gym: Calorie Calculator Guide",
    activityHelpTitle: "Choosing an Activity Factor",
    activityHelp1: "The activity factor estimates your daily physical activity. Choose based on your actual lifestyle over the whole week:",
    activityHelpList: [
      "1.2 (Sedentary): Office worker, little to no exercise.",
      "1.375 (Light): Light exercise 1-3 days/week.",
      "1.55 (Moderate): Moderate exercise 3-5 days/week.",
      "1.725 (Heavy): Heavy exercise 6-7 days/week or physical job.",
      "1.9 (Extreme): High-intensity training twice daily or heavy labor."
    ],
    activityHelpLink: "Heho Health: BMR & TDEE Calculator",
    aiPromptTitle: "Data Import Guide",
    aiPromptDesc: "We support JSON import. Copy the prompt below to ChatGPT/Gemini to convert your messy data into a clean JSON file.",
    downloadPromptDesc: "Upload the .json file generated by AI:",
    copyPrompt: "Copy AI Prompt",
    copied: "Copied!"
  }
};

// ==========================================
// 1. Helper Functions
// ==========================================
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayOfWeek = (dateStr, lang) => {
  const daysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = new Date(dateStr).getDay();
  return lang === 'en' ? daysEn[dayIndex] : daysZh[dayIndex];
};

const calculateBMR = (gender, weight, height, age) => {
  if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

const getActiveDynamicParam = (dateStr, dynamicParamsList) => {
  if (!dynamicParamsList || dynamicParamsList.length === 0) return { height: 170, deficit: 300, activity: 1.2 };
  const sorted = [...dynamicParamsList].sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
  const found = sorted.find(p => p.effectiveDate <= dateStr);
  return found || sorted[sorted.length - 1];
};

const getEffectiveWeight = (targetDateStr, weightsList) => {
  if (!weightsList || weightsList.length === 0) return 70;
  
  const targetDate = new Date(targetDateStr);
  const day = targetDate.getDay();
  const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
  const currentMonday = new Date(targetDate);
  currentMonday.setDate(diff);

  const prevMonday = new Date(currentMonday);
  prevMonday.setDate(prevMonday.getDate() - 7);
  const prevSunday = new Date(currentMonday);
  prevSunday.setDate(prevSunday.getDate() - 1);

  const prevWeekWeights = weightsList.filter(w => {
    const dt = new Date(w.date);
    return dt >= prevMonday && dt <= prevSunday;
  });

  if (prevWeekWeights.length > 0) {
    const sum = prevWeekWeights.reduce((acc, curr) => acc + curr.weight, 0);
    return sum / prevWeekWeights.length;
  }

  const sorted = [...weightsList].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted[0].weight;
};

const resizeImage = (dataUrl, maxWidth = 600) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      if (ratio >= 1) {
        resolve(dataUrl); 
        return;
      }
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

// ==========================================
// 2. Main App Component
// ==========================================
export default function App() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('willfit_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [dynamicParams, setDynamicParams] = useState(() => {
    const saved = localStorage.getItem('willfit_dynamicParams');
    return saved ? JSON.parse(saved) : [];
  });
  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem('willfit_weights');
    return saved ? JSON.parse(saved) : [];
  });
  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('willfit_meals');
    return saved ? JSON.parse(saved) : [];
  });
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('willfit_lang') || 'zh';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('willfit_theme') || 'dark';
  });

  const [currentTab, setCurrentTab] = useState('weight'); 
  const [activeDate, setActiveDate] = useState(getTodayDateStr());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [dashboardScrollTarget, setDashboardScrollTarget] = useState(null);
  const [isDangerFlashing, setIsDangerFlashing] = useState(false);

  useEffect(() => { localStorage.setItem('willfit_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('willfit_dynamicParams', JSON.stringify(dynamicParams)); }, [dynamicParams]);
  useEffect(() => { localStorage.setItem('willfit_weights', JSON.stringify(weights)); }, [weights]);
  useEffect(() => { localStorage.setItem('willfit_meals', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('willfit_lang', lang); }, [lang]);
  useEffect(() => {
    localStorage.setItem('willfit_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const strings = t[lang] || t.zh;

  // Streak & Danger Calculation
  const streakData = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    // For danger calculation, we want to find the current active danger streak
    let currentDangerStreak = 0;
    let isDangerActive = true;

    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayMeals = meals.filter(m => m.date === dateStr);
      if (dayMeals.length === 0) {
        if (i === 0) {
          // If today has no records, skip it without breaking streaks
          continue;
        } else {
          // Empty past day breaks streaks
          currentStreak = 0;
          isDangerActive = false;
        }
        continue;
      }

      const totalCal = dayMeals.reduce((acc, curr) => acc + curr.calories, 0);
      const dyn = getActiveDynamicParam(dateStr, dynamicParams);
      const wAvg = getEffectiveWeight(dateStr, weights);
      const age = new Date().getFullYear() - (profile?.birthYear || 1990);
      const bmr = calculateBMR(profile?.gender || 'male', wAvg, dyn.height, age);
      const targetCal = Math.round(bmr * dyn.activity - dyn.deficit);

      // Normal Streak Check
      if (totalCal > 0 && totalCal <= targetCal) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      // Danger Streak Check
      if (isDangerActive) {
        if (totalCal >= targetCal + 750) {
          currentDangerStreak++;
        } else {
          isDangerActive = false; // Breaking the danger streak
        }
      }
    }
    
    const isBleeding = currentDangerStreak >= 2;
    return { currentStreak, maxStreak, isBleeding, consecutiveDangerDays: currentDangerStreak };
  }, [meals, dynamicParams, weights, profile]);

  // Handle Flashing Effect (Only 5 seconds on trigger)
  useEffect(() => {
    if (streakData.isBleeding) {
      setIsDangerFlashing(true);
      const timer = setTimeout(() => {
        setIsDangerFlashing(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsDangerFlashing(false);
    }
  }, [streakData.isBleeding]);

  const todayStr = getTodayDateStr();
  const todayMeals = meals.filter(m => m.date === todayStr);
  const todayTotalCal = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const todayDyn = getActiveDynamicParam(todayStr, dynamicParams);
  const todayWAvg = getEffectiveWeight(todayStr, weights);
  const todayAge = new Date().getFullYear() - (profile?.birthYear || 1990);
  const todayBmr = calculateBMR(profile?.gender || 'male', todayWAvg, todayDyn?.height || 170, todayAge);
  const todayTargetCal = Math.round(todayBmr * (todayDyn?.activity || 1.2) - (todayDyn?.deficit || 300));
  const todayRemainingCal = todayTargetCal - todayTotalCal;

  if (!profile || dynamicParams.length === 0) {
    return <Onboarding profile={profile} setProfile={setProfile} setDynamicParams={setDynamicParams} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} strings={strings} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} relative`}>
      
      {/* Global Danger Border Overlay */}
      {streakData.isBleeding && (
        <div className={`pointer-events-none fixed inset-0 z-50 transition-all duration-1000 border-[6px] sm:border-[8px] border-red-500/80 shadow-[inset_0_0_30px_rgba(239,68,68,0.4)] ${isDangerFlashing ? 'animate-pulse bg-red-600/15' : 'bg-transparent'}`}></div>
      )}

      {/* Top Navigation Bar - Sticky */}
      <header className={`sticky top-0 z-40 transition-all duration-300 shadow-md ${streakData.isBleeding ? 'bg-red-950 text-white border-b border-red-500' : (theme === 'dark' ? 'bg-slate-800 text-white border-b border-slate-700' : 'bg-white text-slate-800 border-b border-slate-200')}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 relative z-10 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
                {strings.appName}
              </h1>
              <div className="flex items-center space-x-3 text-xs font-medium opacity-90 mt-1">
                <span>{weights.find(w => w.date === todayStr)?.weight || '--'} kg</span>
                <span>|</span>
                <span>{strings.remainingCal}: <strong className={`${todayRemainingCal < 0 ? 'text-red-400 font-bold' : ''}`}>{todayRemainingCal}</strong></span>
                <span>|</span>
                <span>{streakData.currentStreak} {strings.streakDays}</span>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-xl transition-colors ${theme === 'dark' || streakData.isBleeding ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}>
                <Settings className="w-5 h-5" />
              </button>
              
              {isSettingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}></div>
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border z-50 overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <div className="p-2 border-b text-[10px] font-bold opacity-60 px-4 uppercase tracking-wider">{strings.settingsTitle}</div>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('profile'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors">{strings.editProfile}</button>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('backup'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors">{strings.backupImport}</button>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('recent'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">{strings.recentRecords}</button>
                    <div className="h-2 bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700"></div>
                    <button onClick={() => { setIsSettingsOpen(false); setActiveModal('deleteConfirm'); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-colors">{strings.deleteAllData}</button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {streakData.isBleeding && (
            <div className="mt-2 text-yellow-300 text-xs font-bold flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              {strings.dangerStreak.replace('{days}', streakData.consecutiveDangerDays)}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 pb-28">
        {currentTab === 'weight' && <WeightTab lang={lang} theme={theme} profile={profile} dynamicParams={dynamicParams} weights={weights} setWeights={setWeights} activeDate={activeDate} setActiveDate={setActiveDate} strings={strings} />}
        {currentTab === 'diet' && <DietTab lang={lang} theme={theme} profile={profile} dynamicParams={dynamicParams} weights={weights} meals={meals} setMeals={setMeals} activeDate={activeDate} setActiveDate={setActiveDate} strings={strings} />}
        {currentTab === 'dashboard' && <DashboardTab lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} profile={profile} setProfile={setProfile} dynamicParams={dynamicParams} setDynamicParams={setDynamicParams} weights={weights} setWeights={setWeights} meals={meals} setMeals={setMeals} streakData={streakData} scrollTarget={dashboardScrollTarget} setScrollTarget={setDashboardScrollTarget} setCurrentTab={setCurrentTab} setActiveDate={setActiveDate} strings={strings} />}
      </main>

      <nav className={`fixed bottom-0 w-full z-40 border-t shadow-lg backdrop-blur-md pb-safe ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-600'}`}>
        <div className="max-w-4xl mx-auto flex justify-around py-3">
          <button onClick={() => setCurrentTab('weight')} className={`flex flex-col items-center space-y-1 ${currentTab === 'weight' ? 'text-blue-500 font-bold scale-110' : ''} transition-all`}><Scale className="w-5 h-5" /><span className="text-[10px]">{strings.weightTab}</span></button>
          <button onClick={() => setCurrentTab('diet')} className={`flex flex-col items-center space-y-1 ${currentTab === 'diet' ? 'text-blue-500 font-bold scale-110' : ''} transition-all`}><Utensils className="w-5 h-5" /><span className="text-[10px]">{strings.dietTab}</span></button>
          <button onClick={() => setCurrentTab('dashboard')} className={`flex flex-col items-center space-y-1 ${currentTab === 'dashboard' ? 'text-blue-500 font-bold scale-110' : ''} transition-all`}><FileText className="w-5 h-5" /><span className="text-[10px]">{strings.dashboardTab}</span></button>
        </div>
      </nav>

      {/* Delete Confirmation Modal */}
      {activeModal === 'deleteConfirm' && <DeleteConfirmModal theme={theme} strings={strings} onClose={() => setActiveModal(null)} onBackupClick={() => { setActiveModal(null); setCurrentTab('dashboard'); setDashboardScrollTarget('backup'); }} onGoRecords={() => { setCurrentTab('dashboard'); setActiveModal(null); }} onConfirm={() => { localStorage.clear(); window.location.reload(); }} />}
    </div>
  );
}

// ==========================================
// 3. Onboarding
// ==========================================
function Onboarding({ profile, setProfile, setDynamicParams, lang, setLang, theme, setTheme, strings }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile?.name || 'Will');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [birthYear, setBirthYear] = useState(profile?.birthYear || 2000);
  const [height, setHeight] = useState(170);
  const [deficit, setDeficit] = useState(300);
  const [activity, setActivity] = useState(1.2);
  const [activeInfo, setActiveInfo] = useState(null);

  const handleFinish = (e) => {
    e.preventDefault();
    setProfile({ name, gender, birthYear: Number(birthYear) });
    setDynamicParams([{ effectiveDate: getTodayDateStr(), height: Number(height), deficit: Number(deficit), activity: Number(activity) }]);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors";
  const btnClass = "px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{strings.appName}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={btnClass}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
            <button type="button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className={btnClass}>{lang === 'zh' ? 'EN' : '中文'}</button>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
            <h3 className="font-bold border-b pb-2 dark:border-slate-700">{strings.name} & {strings.gender}</h3>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{strings.name}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{strings.gender}</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
                <option value="male">{strings.male}</option>
                <option value="female">{strings.female}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{strings.birthYear}</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setBirthYear(Number(birthYear) - 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">-</button>
                <input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)} required className={`${inputClass} text-center font-bold`} />
                <button type="button" onClick={() => setBirthYear(Number(birthYear) + 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">+</button>
              </div>
            </div>
            <button type="submit" className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.next}</button>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="space-y-4">
            <h3 className="font-bold border-b pb-2 dark:border-slate-700">{strings.editDynamic}</h3>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{strings.height}</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setHeight(Math.max(0, Number(height) - 1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">-</button>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} required className={`${inputClass} text-center font-bold`} />
                <button type="button" onClick={() => setHeight(Number(height) + 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">+</button>
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">
                {strings.deficitTarget}
                <button type="button" onClick={() => setActiveInfo('deficit')} className="ml-2 text-blue-500 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"><HelpCircle className="w-4 h-4"/></button>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeficit(Math.max(0, Number(deficit) - 50))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">-</button>
                <input type="number" step="50" value={deficit} onChange={e => setDeficit(e.target.value)} required className={`${inputClass} text-center font-bold`} />
                <button type="button" onClick={() => setDeficit(Number(deficit) + 50)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">+</button>
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">
                {strings.activityLevel}
                <button type="button" onClick={() => setActiveInfo('activity')} className="ml-2 text-blue-500 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"><HelpCircle className="w-4 h-4"/></button>
              </label>
              <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={inputClass}>
                <option value={1.2}>{strings.activity12}</option>
                <option value={1.375}>{strings.activity1375}</option>
                <option value={1.55}>{strings.activity155}</option>
                <option value={1.725}>{strings.activity1725}</option>
                <option value={1.9}>{strings.activity19}</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{strings.prev}</button>
              <button type="submit" className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.complete}</button>
            </div>
          </form>
        )}
      </div>
      
      {activeInfo && <DynamicInfoModal type={activeInfo} onClose={() => setActiveInfo(null)} theme={theme} strings={strings} lang={lang} />}
    </div>
  );
}

// ==========================================
// 4. Tab 1: Weight Tracking
// ==========================================
function WeightTab({ lang, theme, profile, dynamicParams, weights, setWeights, activeDate, setActiveDate, strings }) {
  const [weightInput, setWeightInput] = useState('');
  const [showFormula, setShowFormula] = useState(false);
  const [chartMode, setChartMode] = useState('daily'); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    const existing = weights.find(w => w.date === activeDate);
    setWeightInput(existing ? existing.weight : '');
  }, [activeDate, weights]);

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    if (!weightInput) return;
    setWeights(prev => {
      const filtered = prev.filter(w => w.date !== activeDate);
      return [...filtered, { date: activeDate, weight: Number(weightInput) }].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
  };

  const dyn = getActiveDynamicParam(activeDate, dynamicParams);
  const wAvg = getEffectiveWeight(activeDate, weights);
  const age = new Date().getFullYear() - (profile?.birthYear || 1990);
  const bmr = calculateBMR(profile?.gender || 'male', wAvg, dyn.height, age);
  const tdee = bmr * dyn.activity;
  const targetCal = tdee - dyn.deficit;

  const chartData = useMemo(() => {
    if (chartMode === 'daily') return weights.map(w => ({ date: w.date.substring(5), weight: w.weight }));
    
    // Weekly avg
    const weeksMap = {};
    weights.forEach(w => {
      const d = new Date(w.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const mStr = `${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
      if (!weeksMap[mStr]) weeksMap[mStr] = [];
      weeksMap[mStr].push(w.weight);
    });
    return Object.keys(weeksMap).map(mStr => {
      const arr = weeksMap[mStr];
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return { date: `${mStr} (W)`, weight: Number(avg.toFixed(1)) };
    });
  }, [weights, chartMode]);

  const changeDate = (days) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + days);
    setActiveDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const inputClass = "px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFormOpen(!isFormOpen)}>
          <h2 className="text-lg font-bold flex items-center gap-2">{strings.weightTab}</h2>
          <button type="button" className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-colors">
             {isFormOpen ? <ChevronUp size={18}/> : <Plus size={18}/>}
          </button>
        </div>
        
        {isFormOpen && (
        <form onSubmit={handleWeightSubmit} className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-500">{strings.date}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => changeDate(-1)} className={`px-4 rounded-xl border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}><ChevronLeft size={20}/></button>
              <div className={`flex-1 flex justify-center items-center rounded-xl border py-2 gap-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 focus-within:border-blue-500'}`}>
                <span className="text-xs text-slate-500 font-bold whitespace-nowrap">{getDayOfWeek(activeDate, lang)}</span>
                <input type="date" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={activeDate} onChange={e => setActiveDate(e.target.value)} className="bg-transparent text-center font-bold outline-none dark:[color-scheme:dark] text-slate-900 dark:text-white" />
              </div>
              <button type="button" onClick={() => changeDate(1)} className={`px-4 rounded-xl border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}><ChevronRight size={20}/></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-500">{strings.weight}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setWeightInput(prev => Math.max(0, Number(prev||70)-0.1).toFixed(1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">-</button>
              <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)} required className={`${inputClass} text-center font-bold text-xl flex-1`} placeholder="70.0" />
              <button type="button" onClick={() => setWeightInput(prev => (Number(prev||70)+0.1).toFixed(1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white">+</button>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors">{strings.submit}</button>
        </form>
        )}
      </div>

      <div ref={resultRef} className={`p-6 rounded-3xl shadow border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2">{strings.formulaDesc}</h3>
          <button onClick={() => setShowFormula(true)} className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 p-1 rounded-full transition-colors"><HelpCircle className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className={`p-3 rounded-2xl shadow-sm ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <span className="text-xs opacity-60 block">{strings.bmr}</span>
            <strong className="text-lg">{Math.ceil(bmr)}</strong>
          </div>
          <div className={`p-3 rounded-2xl shadow-sm ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <span className="text-xs opacity-60 block">{strings.tdee}</span>
            <strong className="text-lg text-blue-500">{Math.ceil(tdee)}</strong>
          </div>
          <div className="p-3 rounded-2xl shadow-sm bg-blue-600 text-white">
            <span className="text-xs opacity-90 block">{strings.targetCal}</span>
            <strong className="text-xl">{Math.ceil(targetCal)}</strong>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold">{chartMode === 'daily' ? strings.dailyTrend : strings.weeklyTrend}</h3>
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg text-xs font-bold">
            <button onClick={() => setChartMode('daily')} className={`px-3 py-1.5 rounded transition-colors ${chartMode === 'daily' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500'}`}>Daily</button>
            <button onClick={() => setChartMode('weekly')} className={`px-3 py-1.5 rounded transition-colors ${chartMode === 'weekly' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500'}`}>Weekly</button>
          </div>
        </div>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={['auto', 'auto']} stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '12px', color: theme === 'dark' ? '#fff' : '#000' }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          ) : (<div className="h-full flex items-center justify-center opacity-50 text-sm">{strings.noData}</div>)}
        </div>
      </div>

      {showFormula && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h4 className="font-bold mb-3">{strings.formulaDesc}</h4>
            <div className="text-sm space-y-2 opacity-90">
              <p>{lang === 'zh' ? '當日熱量目標是根據「上一週的平均體重」來計算，避免每天體重波動影響目標。若是第一週則使用最早紀錄的體重。' : 'Target is based on previous week avg weight.'}</p>
              <div className={`p-4 mt-4 rounded-xl font-mono text-xs leading-relaxed ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <div className="text-slate-500 mb-2">{lang === 'zh' ? '使用體重' : 'Weight'}: {wAvg.toFixed(1)} kg | {lang === 'zh' ? '身高' : 'Height'}: {dyn.height} cm</div>
                <div>BMR = {Math.ceil(bmr)} kcal</div>
                <div className="text-blue-500 mt-1">TDEE = {Math.ceil(bmr)} × {dyn.activity} = {Math.ceil(tdee)} kcal</div>
                <div className="text-green-600 mt-1 font-bold">{lang === 'zh' ? '目標' : 'Target'} = {Math.ceil(tdee)} - {dyn.deficit} = {Math.ceil(targetCal)} kcal</div>
              </div>
            </div>
            <button onClick={() => setShowFormula(false)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. Tab 2: Diet Tracking
// ==========================================
function DietTab({ lang, theme, profile, dynamicParams, weights, meals, setMeals, activeDate, setActiveDate, strings }) {
  const [mealTime, setMealTime] = useState('12:00');
  const [mealName, setMealName] = useState('');
  const [mealCal, setMealCal] = useState('');
  const [photos, setPhotos] = useState([]); 
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const dayMeals = meals.filter(m => m.date === activeDate);
  const totalCal = dayMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const dyn = getActiveDynamicParam(activeDate, dynamicParams);
  const wAvg = getEffectiveWeight(activeDate, weights);
  const age = new Date().getFullYear() - (profile?.birthYear || 1990);
  const targetCal = Math.round(calculateBMR(profile?.gender || 'male', wAvg, dyn.height, age) * dyn.activity - dyn.deficit);
  const remainingCal = targetCal - totalCal;

  const changeDate = (days) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + days);
    setActiveDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
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

    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const handleMealSubmit = (e) => {
    e.preventDefault();
    if (!mealName || !mealCal) return;
    if (editingMealId) {
      setMeals(prev => prev.map(m => m.id === editingMealId ? { ...m, time: mealTime, name: mealName, calories: Number(mealCal), photos } : m));
      setEditingMealId(null);
    } else {
      setMeals(prev => [...prev, { id: Date.now().toString(), date: activeDate, time: mealTime, name: mealName, calories: Number(mealCal), photos }]);
    }
    setMealName(''); setMealCal(''); setPhotos([]);
    setIsFormOpen(false);
  };

  const startEdit = (m) => {
    setEditingMealId(m.id);
    setMealTime(m.time); setMealName(m.name); setMealCal(m.calories); setPhotos(m.photos || (m.photoUrl ? [m.photoUrl] : []));
    setIsFormOpen(true);
  };

  const getStatusIcon = () => {
    if (targetCal === 0) return null;
    if (totalCal <= targetCal) return <div className="text-3xl text-green-500 font-bold">✅</div>;
    if (totalCal >= targetCal + 750) return <div className="text-3xl font-bold animate-bounce">☠️</div>;
    return <div className="text-3xl text-purple-500 font-bold">❌</div>;
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6">
      
      <div className={`p-2 rounded-2xl shadow border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <button onClick={() => changeDate(-1)} className={`p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}><ChevronLeft size={20}/></button>
        <div className="flex justify-center items-center gap-2">
          <span className="text-xs opacity-60 font-bold whitespace-nowrap">{getDayOfWeek(activeDate, lang)}</span>
          <input type="date" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={activeDate} onChange={e => setActiveDate(e.target.value)} className="bg-transparent font-bold text-center outline-none dark:[color-scheme:dark] text-slate-900 dark:text-white" />
        </div>
        <button onClick={() => changeDate(1)} className={`p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}><ChevronRight size={20}/></button>
      </div>

      <div className={`p-6 rounded-3xl shadow border text-center relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {totalCal >= targetCal + 750 && <div className="absolute inset-0 bg-red-500/10 dark:bg-red-900/30"></div>}
        {totalCal > 0 && totalCal <= targetCal && <div className="absolute inset-0 bg-green-500/10 dark:bg-green-900/20"></div>}
        {totalCal > targetCal && totalCal < targetCal + 750 && <div className="absolute inset-0 bg-purple-500/10 dark:bg-purple-900/20"></div>}
        <span className="text-xs font-bold opacity-60 block mb-2 relative">{strings.remainingCal}</span>
        <div className={`text-6xl font-black tracking-tighter flex items-center justify-center gap-2 relative ${remainingCal < 0 ? 'text-purple-500' : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}>
          {remainingCal} 
        </div>
        <div className="mt-4 flex justify-center items-center gap-6 text-sm relative font-medium">
          <div className="flex flex-col"><span className="text-slate-400 text-xs">{lang === 'zh' ? '目標' : 'Target'}</span><strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{targetCal}</strong></div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div>{getStatusIcon()}</div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex flex-col"><span className="text-slate-400 text-xs">{lang === 'zh' ? '已攝取' : 'Intake'}</span><strong className="text-blue-500">{totalCal}</strong></div>
        </div>
      </div>

      <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFormOpen(!isFormOpen)}>
          <h3 className="font-bold flex items-center gap-2">{editingMealId ? strings.editMeal : strings.addMeal}</h3>
          <div className="flex items-center gap-2">
            {editingMealId && <button type="button" onClick={(e) => { e.stopPropagation(); setEditingMealId(null); setMealName(''); setMealCal(''); setPhotos([]); setIsFormOpen(false); }} className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white">{strings.cancel}</button>}
            <button type="button" className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-colors">
               {isFormOpen || editingMealId ? <ChevronUp size={18}/> : <Plus size={18}/>}
            </button>
          </div>
        </div>
        
        {(isFormOpen || editingMealId) && (
        <form onSubmit={handleMealSubmit} className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-3">
            <div className="w-1/3">
              <label className="block text-xs font-bold mb-1 text-slate-500">{strings.mealTime}</label>
              <input type="time" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={mealTime} onChange={e => setMealTime(e.target.value)} required className={inputClass} />
            </div>
            <div className="w-2/3">
              <label className="block text-xs font-bold mb-1 text-slate-500">{strings.mealCal}</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMealCal(Math.max(0,Number(mealCal||0)-50))} className="px-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">-</button>
                <input type="number" step="10" value={mealCal} onChange={e => setMealCal(e.target.value)} required className={`${inputClass} text-center font-bold flex-1`} placeholder="450" />
                <button type="button" onClick={() => setMealCal(Number(mealCal||0)+50)} className="px-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">+</button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-500">{strings.mealName}</label>
            <input type="text" value={mealName} onChange={e => setMealName(e.target.value)} required className={inputClass} placeholder={lang === 'zh' ? '例如: 排骨便當' : 'e.g. Chicken Salad'} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-500">{strings.photos}</label>
            <div className="flex flex-wrap gap-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 group">
                  <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-slate-600" />
                  <button type="button" onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Camera size={24} className="text-slate-400 mb-1" />
                <span className="text-[10px] text-slate-400 font-medium">{strings.uploadPhoto}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors mt-2">{editingMealId ? strings.update : strings.addMeal}</button>
          </div>
        </form>
        )}
      </div>

      <div className="space-y-3">
        {dayMeals.length === 0 ? (
           <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
             <Utensils size={40} className="mx-auto mb-3 opacity-20" />
             <p className="text-sm">{strings.noData}</p>
           </div>
        ) : (
          dayMeals.sort((a,b) => a.time.localeCompare(b.time)).map(m => (
            <div key={m.id} className={`p-4 rounded-2xl shadow-sm border flex flex-col gap-3 group transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm font-bold text-slate-400 w-12 text-center shrink-0">{m.time}</div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEdit(m)} title={lang === 'zh' ? '點擊修改' : 'Click to edit'}>
                  <div className="font-bold truncate text-lg">{m.name}</div>
                  <div className="text-blue-500 font-semibold">{m.calories} <span className="text-xs text-slate-500">kcal</span></div>
                </div>
                <button onClick={() => setDeleteConfirmId(m.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={20}/>
                </button>
              </div>
              {m.photos && m.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto ml-16 pb-1">
                  {m.photos.map((p, i) => (
                    <img key={i} src={p} alt="meal" onClick={(e) => { e.stopPropagation(); setSelectedPhoto(p); }} 
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h4 className="font-bold mb-4">{lang === 'zh' ? '確認刪除此餐點？' : 'Delete this meal?'}</h4>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirmId(null)} className="w-1/2 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold">{strings.cancel}</button>
              <button onClick={() => { setMeals(prev => prev.filter(m => m.id !== deleteConfirmId)); setDeleteConfirmId(null); }} className="w-1/2 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">{strings.confirmDelete}</button>
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" alt="View" />
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. Tab 3: Dashboard & Settings
// ==========================================
function DashboardTab({ lang, setLang, theme, setTheme, profile, setProfile, dynamicParams, setDynamicParams, weights, setWeights, meals, setMeals, streakData, scrollTarget, setScrollTarget, setCurrentTab, setActiveDate, strings }) {
  const basicInfoRef = useRef(null);
  const dynamicParamsRef = useRef(null);
  const backupRef = useRef(null);
  const recentRecordsRef = useRef(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: profile.name, gender: profile.gender, birthYear: profile.birthYear });

  useEffect(() => {
    if (scrollTarget) {
      setTimeout(() => {
        const refs = { profile: basicInfoRef, dynamic: dynamicParamsRef, backup: backupRef, recent: recentRecordsRef };
        const target = refs[scrollTarget];
        if (target && target.current) {
          target.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); // 置中滾動
        }
        setScrollTarget(null);
      }, 100);
    }
  }, [scrollTarget, setScrollTarget]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ name: editProfileForm.name, gender: editProfileForm.gender, birthYear: Number(editProfileForm.birthYear) });
    setShowEditProfileModal(false);
  };

  const heatmapDays = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      
      const dayMeals = meals.filter(m => m.date === dateStr);
      const total = dayMeals.reduce((acc, curr) => acc + curr.calories, 0);
      const dyn = getActiveDynamicParam(dateStr, dynamicParams);
      const bmr = calculateBMR(profile?.gender || 'male', getEffectiveWeight(dateStr, weights), dyn.height, new Date().getFullYear() - (profile?.birthYear || 1990));
      const target = Math.round(bmr * dyn.activity - dyn.deficit);

      let status = 'none';
      if (dayMeals.length > 0) {
        if (total <= target) status = 'success';
        else if (total >= target + 750) status = 'danger';
        else status = 'over';
      }
      list.push({ date: dateStr, status, cal: total });
    }
    return list;
  }, [meals, dynamicParams, weights, profile]);

  const avgCal30 = useMemo(() => {
    const last30 = meals.filter(m => {
       const dt = new Date(m.date);
       const daysAgo = (new Date().getTime() - dt.getTime()) / (1000 * 3600 * 24);
       return daysAgo <= 30;
    });
    const daysWithMeals = new Set(last30.map(m => m.date)).size;
    return daysWithMeals > 0 ? Math.round(last30.reduce((acc, m) => acc + m.calories, 0) / daysWithMeals) : 0;
  }, [meals]);

  return (
    <div className="space-y-6">
      
      <div ref={basicInfoRef}>
        <div className={`p-6 rounded-3xl shadow border flex justify-between items-center ${theme === 'dark' ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-r from-blue-600 to-blue-800 border-none text-white'}`}>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-sm opacity-80 mt-1">{profile.gender === 'male' ? strings.male : strings.female} • {new Date().getFullYear() - profile.birthYear} yrs</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowEditProfileModal(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors">{strings.editProfile}</button>
          </div>
        </div>
      </div>

      {/* 數據統計區塊 (Data Stats) */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 rounded-2xl shadow-sm text-center border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="text-xs text-slate-500 mb-1">{strings.streak}</div>
          <div className="text-2xl font-black text-orange-500">{streakData.currentStreak} <span className="text-sm font-normal text-slate-400">{strings.streakDays}</span></div>
        </div>
        <div className={`p-3 rounded-2xl shadow-sm text-center border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="text-xs text-slate-500 mb-1">{strings.maxStreak}</div>
          <div className="text-2xl font-black">{streakData.maxStreak} <span className="text-sm font-normal text-slate-400">{strings.streakDays}</span></div>
        </div>
        <div className={`p-3 rounded-2xl shadow-sm text-center border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="text-xs text-slate-500 mb-1">{strings.avgCal}</div>
          <div className="text-xl font-bold mt-1 text-blue-500">{avgCal30}</div>
        </div>
      </div>

      {/* 飲食達成率熱力圖 (Heatmap) */}
      <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold mb-4">{strings.heatmapTitle}</h3>
        <div className="grid grid-cols-7 gap-2">
          {heatmapDays.map((day) => {
            let bg = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100';
            let icon = '';
            if (day.status === 'success') { bg = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] border-none text-white'; icon = '✅'; }
            if (day.status === 'over') { bg = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] border-none text-white'; icon = '❌'; }
            if (day.status === 'danger') { bg = 'bg-red-900 border-2 border-red-500 animate-pulse text-white'; icon = '☠️'; }

            return (
              <div 
                key={day.date} 
                onDoubleClick={() => { setActiveDate(day.date); setCurrentTab('diet'); }}
                className={`relative group aspect-square rounded-md ${bg} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
              >
                <span className="text-[10px]">{icon}</span>
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                  <div className="font-bold text-center">{day.date}</div>
                  <div className="text-center">{lang === 'zh' ? '攝取' : 'Intake'} {day.cal} kcal</div>
                  <div className="text-slate-300 text-[10px] mt-1">{lang === 'zh' ? '雙擊修改查看' : 'Double click to edit'}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex gap-4 justify-center text-xs text-slate-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500 flex items-center justify-center text-[8px] text-white">✅</div> {lang === 'zh' ? '達標' : 'Success'}</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-purple-500 flex items-center justify-center text-[8px] text-white">❌</div> {lang === 'zh' ? '未達標' : 'Failed'}</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-900 border border-red-500 flex items-center justify-center text-[8px] text-white">☠️</div> {lang === 'zh' ? '嚴重' : 'Danger'}</div>
        </div>
      </div>

      <div ref={recentRecordsRef} className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold mb-4">{strings.recentRecords}</h3>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
          {Array.from(new Set([...weights.map(w=>w.date), ...meals.map(m=>m.date)])).sort().reverse().slice(0, 15).map(date => {
             const w = weights.find(x => x.date === date)?.weight;
             const mealCount = meals.filter(m => m.date === date).length;
             return (
               <div key={date} className={`p-3 rounded-2xl flex justify-between items-center border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 <span className="font-bold text-sm w-24 text-slate-900 dark:text-white">{date.substring(5)}</span>
                 <div className="flex gap-3 text-sm flex-1 justify-end">
                    <button onDoubleClick={() => { setActiveDate(date); setCurrentTab('weight'); }} 
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${w ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:bg-slate-300'}`}
                      title={lang === 'zh' ? '雙擊前往修改體重' : 'Double click to edit weight'}>
                      {w ? `${w} kg` : (lang === 'zh' ? '+ 體重' : '+ Weight')}
                    </button>
                    <button onDoubleClick={() => { setActiveDate(date); setCurrentTab('diet'); }}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${mealCount > 0 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:bg-slate-300'}`}
                      title={lang === 'zh' ? '雙擊前往修改餐點' : 'Double click to edit diet'}>
                      {mealCount > 0 ? `${mealCount} ${lang === 'zh' ? '筆紀錄' : 'meals'}` : (lang === 'zh' ? '+ 餐點' : '+ Diet')}
                    </button>
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      <div ref={dynamicParamsRef}>
         <EditDynamicArea dynamicParams={dynamicParams} setDynamicParams={setDynamicParams} theme={theme} strings={strings} lang={lang} />
      </div>

      <div ref={backupRef}>
         <BackupImportArea weights={weights} meals={meals} setWeights={setWeights} setMeals={setMeals} theme={theme} strings={strings} lang={lang} getTodayDateStr={getTodayDateStr} />
      </div>

      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h4 className="font-bold mb-4">{strings.editProfile}</h4>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">{strings.name}</label>
                <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} required className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">{strings.gender}</label>
                <select value={editProfileForm.gender} onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500">
                  <option value="male">{strings.male}</option>
                  <option value="female">{strings.female}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">{strings.birthYear}</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditProfileForm(p => ({...p, birthYear: Number(p.birthYear) - 1}))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">-</button>
                  <input type="number" value={editProfileForm.birthYear} onChange={e => setEditProfileForm({...editProfileForm, birthYear: e.target.value})} required className="w-full text-center px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold" />
                  <button type="button" onClick={() => setEditProfileForm(p => ({...p, birthYear: Number(p.birthYear) + 1}))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg">+</button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium mb-2 opacity-80">{strings.settingsTitle}</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    {theme === 'dark' ? strings.lightMode : strings.darkMode}
                  </button>
                  <button type="button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    {lang === 'zh' ? 'English' : '中文'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="w-1/3 py-3 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl">{strings.cancel}</button>
                <button type="submit" className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors">{strings.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


// ==========================================
// 7. Sub-components (Areas & Modals)
// ==========================================
function EditDynamicArea({ dynamicParams, setDynamicParams, theme, strings, lang }) {
  const [date, setDate] = useState(getTodayDateStr());
  const [height, setHeight] = useState(dynamicParams[0]?.height || 170);
  const [deficit, setDeficit] = useState(dynamicParams[0]?.deficit || 300);
  const [activity, setActivity] = useState(dynamicParams[0]?.activity || 1.2);
  const [activeInfo, setActiveInfo] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const newData = { effectiveDate: date, height: Number(height), deficit: Number(deficit), activity: Number(activity) };
    setDynamicParams(prev => {
      const filtered = prev.filter(p => p.effectiveDate !== date);
      return [newData, ...filtered].sort((a,b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    });
    alert(lang === 'zh' ? '動態目標更新成功！將於指定日期生效。' : 'Dynamic target updated successfully!');
    setIsFormOpen(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors";
  
  return (
    <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFormOpen(!isFormOpen)}>
        <h3 className="font-bold flex items-center gap-2">{strings.editDynamic}</h3>
        <button type="button" className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-colors">
           {isFormOpen ? <ChevronUp size={18}/> : <Plus size={18}/>}
        </button>
      </div>
      
      {isFormOpen && (
      <form onSubmit={handleSave} className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-xs leading-relaxed mb-4">
          {lang === 'zh' ? '設定後將於指定生效日期起作用，不會影響過去的歷史紀錄計算。' : 'Changes will take effect from the selected date and will not affect past historical records.'}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-500">{lang === 'zh' ? '生效日期' : 'Effective Date'}</label>
          <div className="flex gap-2">
            <input type="date" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={date} onChange={e => setDate(e.target.value)} required className={`${inputClass} dark:[color-scheme:dark] flex-1 text-center font-bold`} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-500">{strings.height}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setHeight(Math.max(0, Number(height) - 1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors">-</button>
            <input type="number" step="0.5" value={height} onChange={e => setHeight(e.target.value)} required className={`${inputClass} text-center font-bold`} />
            <button type="button" onClick={() => setHeight(Number(height) + 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors">+</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium mb-1 text-slate-500">
              {strings.deficitTarget}
              <button type="button" onClick={() => setActiveInfo('deficit')} className="ml-1 text-blue-500 hover:bg-blue-100 p-0.5 rounded-full"><HelpCircle size={14}/></button>
            </label>
            <input type="number" step="50" value={deficit} onChange={e => setDeficit(e.target.value)} required className={`${inputClass} font-bold`} />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium mb-1 text-slate-500">
              {strings.activityLevel}
              <button type="button" onClick={() => setActiveInfo('activity')} className="ml-1 text-blue-500 hover:bg-blue-100 p-0.5 rounded-full"><HelpCircle size={14}/></button>
            </label>
            <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={inputClass}>
              <option value={1.2}>{strings.activity12}</option><option value={1.375}>{strings.activity1375}</option>
              <option value={1.55}>{strings.activity155}</option><option value={1.725}>{strings.activity1725}</option><option value={1.9}>{strings.activity19}</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">{strings.save}</button>
      </form>
      )}
      
      {activeInfo && <DynamicInfoModal type={activeInfo} onClose={() => setActiveInfo(null)} theme={theme} strings={strings} lang={lang} />}
    </div>
  );
}

function BackupImportArea({ weights, meals, setWeights, setMeals, theme, strings, lang, getTodayDateStr }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const promptText = `我有一份從其他 APP 匯出的飲食與體重紀錄（包含圖片與表格數據）。請幫我過濾掉無關資訊（如心率、步數、睡眠等），並將所有內容嚴格轉換為符合以下 JSON 格式。請直接輸出一個 .json 檔案讓我下載，不要包含任何 Markdown 說明文字或額外的解釋：

【輸出 JSON 結構規範】
{
  "weights": [
    { "date": "YYYY-MM-DD", "weight": 75.5 }
  ],
  "meals": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "name": "餐點名稱",
      "calories": 750,
      "photos": [ "data:image/jpeg;base64,...", "data:image/jpeg;base64,..." ] 
    }
  ]
}

【圖片與餐點精準配對規則】
1. 時間/日期比對：優先根據圖片檔名或表格中的「時間/備註」欄位配對。
2. 照片內容與名稱比對：若無明確時間，請分析照片食物，與表格名稱進行邏輯對應。
3. 多圖處理：同一餐多張照片請全轉為 Base64 放入 "photos" 陣列；無圖則留空陣列 []。
4. 無法確認時：直接忽略無法對應的照片。`;

  return (
    <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{strings.importInstruction}</h3>
        <button onClick={() => setShowPrompt(true)} className="text-blue-500 hover:bg-blue-100 p-1 rounded-full"><HelpCircle size={20}/></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => {
          const blob = new Blob([JSON.stringify({ weights, meals })], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `WillFit_Backup_${getTodayDateStr()}.json`; a.click();
        }} className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-900 rounded-xl hover:shadow-md transition-shadow text-blue-600">
          <Download size={24} className="mb-2" />
          <span className="text-sm font-bold">{strings.exportCsv}</span>
        </button>
        
        <label className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-900 rounded-xl hover:shadow-md transition-shadow text-slate-600 dark:text-slate-300 cursor-pointer">
          <Upload size={24} className="mb-2" />
          <span className="text-sm font-bold">{strings.importCsv}</span>
          <input type="file" accept=".json" className="hidden" onChange={e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
              try {
                const data = JSON.parse(ev.target.result);
                if (data.weights) setWeights(data.weights);
                if (data.meals) setMeals(data.meals);
                alert(strings.importSuccess); 
              } catch { alert(strings.importError); }
            };
            reader.readAsText(file);
          }}/>
        </label>
      </div>

      {showPrompt && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl border flex flex-col max-h-[90vh] ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h4 className="font-bold mb-3">{strings.aiPromptTitle}</h4>
            <p className="text-sm mb-4 opacity-80 leading-relaxed">{strings.aiPromptDesc}</p>
            <div className="flex-1 overflow-y-auto mb-4">
              <textarea readOnly value={promptText} className="w-full h-48 p-3 text-xs font-mono rounded-xl border bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 select-all outline-none focus:border-blue-500" />
            </div>
            <p className="text-xs font-bold text-slate-500 mb-2">{strings.downloadPromptDesc}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowPrompt(false)} className="w-1/3 py-3 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl">{strings.cancel}</button>
              <button onClick={() => { navigator.clipboard.writeText(promptText); alert(strings.copied); setShowPrompt(false); }} className="w-2/3 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">{strings.copyPrompt}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DynamicInfoModal({ type, onClose, theme, strings, lang }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className={`w-full max-w-sm p-6 rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <HelpCircle size={20} className="text-blue-500" />
          {type === 'deficit' ? strings.deficitHelpTitle : strings.activityHelpTitle}
        </h4>
        
        {type === 'deficit' ? (
          <div className="text-sm opacity-90 mb-6 leading-relaxed space-y-3">
             <p>{strings.deficitHelp1}</p>
             <p>{strings.deficitHelp2}</p>
             <a href="https://blog.worldgymtaiwan.com/calorie-calculator" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold flex items-center gap-1 hover:underline mt-2">
               <ExternalLink size={14} /> {strings.deficitHelpLink}
             </a>
          </div>
        ) : (
          <div className="text-sm opacity-90 mb-6 leading-relaxed space-y-3">
             <p>{strings.activityHelp1}</p>
             <ul className="list-disc pl-5 space-y-1">
               {strings.activityHelpList.map((item, i) => <li key={i}>{item}</li>)}
             </ul>
             <a href="https://tools.heho.com.tw/bmr/" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold flex items-center gap-1 hover:underline pt-2">
               <ExternalLink size={14} /> {strings.activityHelpLink}
             </a>
          </div>
        )}
        
        <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.cancel}</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ theme, strings, onClose, onBackupClick, onGoRecords, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm p-6 rounded-3xl shadow-xl border text-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg mb-2">{strings.deleteConfirmTitle}</h3>
        <p className="text-sm opacity-80 mb-6">{strings.deleteConfirmDesc}</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors">{strings.confirmDelete}</button>
          <button onClick={onBackupClick} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">{strings.backupImport}</button>
          <button onClick={onGoRecords} className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-xl transition-colors">{strings.backToRecords}</button>
        </div>
      </div>
    </div>
  );
}