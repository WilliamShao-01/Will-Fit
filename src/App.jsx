import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { 
  Scale, Utensils, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CheckCircle, Circle, ArrowRight,
  HelpCircle, AlertTriangle, X, Plus, ExternalLink, Download, Upload, FileText, Camera, Trash2, LogOut, Copy
} from 'lucide-react';
import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './config';

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
    importInstruction: "資料備份與匯入 (其他APP也可，詳見「i」)",
    deleteConfirmTitle: "確定要刪除所有資料嗎？",
    deleteConfirmDesc: "此動作無法復原！刪除前請務必先備份您的資料。",
    formulaDesc: "每日熱量消耗與目標",
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
    downloadPromptDesc: "請直接上傳由 AI 產生的 .json 檔案：",
    copyPrompt: "複製給 AI 的指令",
    copied: "指令已複製！",
    target: "目標",
    intake: "已攝取",
    bmrDesc: "你在靜止休息狀態下，身體維持運作所需的最低熱量。",
    tdeeDesc: "包含日常活動與運動後，你一天總共消耗的熱量。",
    importHelp1: "您可以直接匯入從本程式匯出的 .json 備份檔。",
    importHelp2: "若是從其他 APP 匯出的資料，您可以複製下方指令交給 AI（如 ChatGPT），請它幫您轉換成可匯入的格式：",
    todayInfo: "今日",
    streakInfo: "連續達標"
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
    formulaDesc: "Daily Burn & Target",
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
    downloadPromptDesc: "Upload the .json file generated by AI:",
    copyPrompt: "Copy AI Prompt",
    copied: "Copied!",
    target: "Target",
    intake: "Intake",
    bmrDesc: "The minimum calories your body needs at rest to function.",
    tdeeDesc: "The total calories you burn in a day, including physical activities.",
    importHelp1: "You can directly import the .json backup file exported from this app.",
    importHelp2: "If exporting from another app, copy the prompt below to an AI (like ChatGPT) to convert your data:",
    todayInfo: "Today",
    streakInfo: "Streak"
  }
};

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


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCloudMerge, setPendingCloudMerge] = useState(null);
  const [showCloudPromo, setShowCloudPromo] = useState(() => {
    return localStorage.getItem('willfit_cloud_promo_dismissed') !== 'true';
  });

  useEffect(() => {
    let snapshotUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Resolve loading immediately after auth state is known
      
      if (snapshotUnsubscribe) {
        snapshotUnsubscribe();
        snapshotUnsubscribe = null;
      }
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          snapshotUnsubscribe = onSnapshot(userDocRef, async (userSnap) => {
            if (userSnap.exists()) {
              const data = userSnap.data();
              const cloudLastUpdated = data.lastUpdated;
              const localLastUpdated = localStorage.getItem('willfit_lastUpdated');
              
              const localMeals = JSON.parse(localStorage.getItem('willfit_meals') || '[]');
              const localWeights = JSON.parse(localStorage.getItem('willfit_weights') || '[]');
              const hasLocalData = localMeals.length > 0 || localWeights.length > 0;
              const hasCloudData = (data.meals && data.meals.length > 0) || (data.weights && data.weights.length > 0);
              const shouldPromptMerge = sessionStorage.getItem('willfit_prompt_merge') === 'true';

              // Perform daily auto-backup of the latest cloud state
              const lastBackupDate = localStorage.getItem('willfit_lastCloudBackup');
              const todayStr = new Date().toISOString().split('T')[0];
              if (lastBackupDate !== todayStr && hasCloudData) {
                createCloudBackup(currentUser.uid, data, 'daily');
                localStorage.setItem('willfit_lastCloudBackup', todayStr);
              }

              if (shouldPromptMerge && hasLocalData && hasCloudData) {
                setPendingCloudMerge(data);
                sessionStorage.removeItem('willfit_prompt_merge');
              } else {
                // Only overwrite local state if cloud has newer data, or we have no local data
                // This prevents old cloud data from overwriting offline local changes
                if (!localLastUpdated || !cloudLastUpdated || new Date(cloudLastUpdated) > new Date(localLastUpdated)) {
                  isReceivingCloudData.current = true;
                  if (data.profile) setProfile(data.profile);
                  if (data.dynamicParams) setDynamicParams(data.dynamicParams);
                  if (data.weights) setWeights(data.weights);
                  if (data.meals) setMeals(data.meals);
                  // Sync local timestamp to match cloud to prevent flip-flopping
                  if (cloudLastUpdated) localStorage.setItem('willfit_lastUpdated', cloudLastUpdated);
                  
                  // Reset safely after render queue
                  setTimeout(() => {
                    isReceivingCloudData.current = false;
                  }, 50);
                } else if (new Date(localLastUpdated) > new Date(cloudLastUpdated)) {
                  // Local is newer! Push to cloud (only on initial load or offline recovery)
                  if (!isCloudDataFetched.current) {
                    if (!hasLocalData && hasCloudData) {
                      // CRITICAL FIX: If local has no meals/weights but is "newer" (e.g. they just finished onboarding after logout)
                      // Do NOT overwrite the cloud with empty data! Pull from cloud instead.
                      if (data.profile) setProfile(data.profile);
                      if (data.dynamicParams) setDynamicParams(data.dynamicParams);
                      if (data.weights) setWeights(data.weights);
                      if (data.meals) setMeals(data.meals);
                      if (cloudLastUpdated) localStorage.setItem('willfit_lastUpdated', cloudLastUpdated);
                    } else {
                      const localProfile = JSON.parse(localStorage.getItem('willfit_profile') || 'null');
                      const localDynamic = JSON.parse(localStorage.getItem('willfit_dynamicParams') || '[]');
                      
                      if (localProfile) {
                        await setDoc(userDocRef, {
                          profile: localProfile,
                          dynamicParams: localDynamic,
                          weights: localWeights,
                          meals: localMeals,
                          lastUpdated: localLastUpdated
                        }, { merge: true });
                      }
                    }
                  }
                }
              }
            } else {
              // First time login: Upload local data to cloud
              const localProfile = JSON.parse(localStorage.getItem('willfit_profile') || 'null');
              const localDynamic = JSON.parse(localStorage.getItem('willfit_dynamicParams') || '[]');
              const localWeights = JSON.parse(localStorage.getItem('willfit_weights') || '[]');
              const localMeals = JSON.parse(localStorage.getItem('willfit_meals') || '[]');
              
              if (localProfile) {
                await setDoc(userDocRef, {
                  profile: localProfile,
                  dynamicParams: localDynamic,
                  weights: localWeights,
                  meals: localMeals,
                  lastUpdated: localStorage.getItem('willfit_lastUpdated') || new Date().toISOString()
                });
              }
            }
            isCloudDataFetched.current = true;
          }, (error) => {
            console.error("Snapshot error:", error);
          });
        } catch (error) {
          console.error("Error setting up user snapshot:", error);
        }
      }
    });
    
    return () => {
      if (snapshotUnsubscribe) snapshotUnsubscribe();
      authUnsubscribe();
    };
  }, []);

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
    // 預設先檢查本地儲存，若無則偵測系統偏好
    const saved = localStorage.getItem('willfit_theme');
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [currentTab, setCurrentTab] = useState('weight'); 
  const [activeDate, setActiveDate] = useState(getTodayDateStr());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [dashboardScrollTarget, setDashboardScrollTarget] = useState(null);
  
  const [isDangerActive, setIsDangerActive] = useState(false);
  const [isDangerFlashing, setIsDangerFlashing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isInitialMount = useRef(true);
  const isCloudDataFetched = useRef(false);
  const isClearingData = useRef(false);
  const isReceivingCloudData = useRef(false);

  const createCloudBackup = async (uid, dataToBackup, type = 'daily') => {
    if (!uid || uid === 'guest_user') return;
    try {
      // Use fixed document IDs instead of timestamp to prevent infinite storage growth
      const backupRef = doc(db, 'users', uid, 'backups', type);
      await setDoc(backupRef, {
        ...dataToBackup,
        backupTime: new Date().toISOString()
      });
      console.log('Cloud backup created safely.');
    } catch (e) {
      console.error('Failed to create cloud backup:', e);
    }
  };

  useEffect(() => { 
    if (!isInitialMount.current && !isClearingData.current) {
      localStorage.setItem('willfit_profile', JSON.stringify(profile)); 
      if (!isReceivingCloudData.current) localStorage.setItem('willfit_lastUpdated', new Date().toISOString());
    }
  }, [profile]);
  useEffect(() => { 
    if (!isInitialMount.current && !isClearingData.current) {
      localStorage.setItem('willfit_dynamicParams', JSON.stringify(dynamicParams)); 
      if (!isReceivingCloudData.current) localStorage.setItem('willfit_lastUpdated', new Date().toISOString());
    }
  }, [dynamicParams]);
  useEffect(() => { 
    if (!isInitialMount.current && !isClearingData.current) {
      localStorage.setItem('willfit_weights', JSON.stringify(weights)); 
      if (!isReceivingCloudData.current) localStorage.setItem('willfit_lastUpdated', new Date().toISOString());
    }
  }, [weights]);
  useEffect(() => { 
    if (!isInitialMount.current && !isClearingData.current) {
      localStorage.setItem('willfit_meals', JSON.stringify(meals)); 
      if (!isReceivingCloudData.current) localStorage.setItem('willfit_lastUpdated', new Date().toISOString());
    }
  }, [meals]);

  // Immediate Cloud Sync
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Prevent auto-syncing if the state change was triggered by incoming cloud data
    if (isReceivingCloudData.current) return;
    
    // Prevent accidental overwrites before cloud data is fetched and evaluated
    if (!isCloudDataFetched.current) return;
    
    if (!user || user.uid === 'guest_user') return;

    const syncToCloud = async () => {
      try {
        const lastUpdated = localStorage.getItem('willfit_lastUpdated') || new Date().toISOString();
        await setDoc(doc(db, 'users', user.uid), {
          profile,
          dynamicParams,
          weights,
          meals,
          lastUpdated
        }, { merge: true });
      } catch (err) {
        console.error('Cloud auto-sync failed:', err);
      }
    };
    
    syncToCloud();
  }, [profile, dynamicParams, weights, meals]);
  useEffect(() => { 
    localStorage.setItem('willfit_lang', lang); 
    document.documentElement.lang = lang === 'en' ? 'en-US' : 'zh-TW';
  }, [lang]);
  
  // 監聽系統主題變化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 只有在沒有強制設定過本地儲存的情況下，才自動跟隨系統切換
      // 但為了確保體驗一致性，這裡設定為永遠跟隨系統
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    };

    // 初始設定一次
    handleChange(mediaQuery);

    // 監聽變化
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('willfit_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const strings = t[lang] || t.zh;

  const streakData = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let consecutiveDangerDays = 0;

    const datesWithMeals = [...new Set(meals.map(m => m.date))].sort().reverse();
    
    // 嚴謹計算：從最近有紀錄的一天起算，連續幾天嚴重超標
    for (let i = 0; i < datesWithMeals.length; i++) {
        const dateStr = datesWithMeals[i];
        const dayMeals = meals.filter(m => m.date === dateStr);
        const totalCal = dayMeals.reduce((acc, curr) => acc + curr.calories, 0);
        const dyn = getActiveDynamicParam(dateStr, dynamicParams);
        const wAvg = getEffectiveWeight(dateStr, weights);
        const age = profile ? new Date().getFullYear() - profile.birthYear : 30;
        const bmr = calculateBMR(profile?.gender || 'male', wAvg, dyn.height, age);
        const targetCal = Math.round(bmr * dyn.activity - dyn.deficit);

        if (totalCal >= targetCal + 750) {
            consecutiveDangerDays++;
        } else {
            break;
        }
    }

    const today = new Date();
    let isStreakActive = true;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayMeals = meals.filter(m => m.date === dateStr);
      if (dayMeals.length === 0) {
        if (i > 0) isStreakActive = false;
        continue;
      }

      const totalCal = dayMeals.reduce((acc, curr) => acc + curr.calories, 0);
      const dyn = getActiveDynamicParam(dateStr, dynamicParams);
      const wAvg = getEffectiveWeight(dateStr, weights);
      const age = profile ? new Date().getFullYear() - profile.birthYear : 30;
      const bmr = calculateBMR(profile?.gender || 'male', wAvg, dyn.height, age);
      const targetCal = Math.round(bmr * dyn.activity - dyn.deficit);

      if (isStreakActive) {
          if (totalCal > 0 && totalCal <= targetCal) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
            isStreakActive = false;
          }
      } else {
          if (totalCal > 0 && totalCal <= targetCal) {
              // 只更新最高連勝，不更新當前連勝
              let tempStreak = 1;
              for(let j = i+1; j < 60; j++) {
                  const d2 = new Date(today);
                  d2.setDate(today.getDate() - j);
                  const dateStr2 = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
                  const dayMeals2 = meals.filter(m => m.date === dateStr2);
                  if (dayMeals2.length === 0) break;
                  
                  const totalCal2 = dayMeals2.reduce((acc, curr) => acc + curr.calories, 0);
                  const dyn2 = getActiveDynamicParam(dateStr2, dynamicParams);
                  const wAvg2 = getEffectiveWeight(dateStr2, weights);
                  const bmr2 = calculateBMR(profile?.gender || 'male', wAvg2, dyn2.height, age);
                  const targetCal2 = Math.round(bmr2 * dyn2.activity - dyn2.deficit);
                  if (totalCal2 > 0 && totalCal2 <= targetCal2) {
                      tempStreak++;
                      if (tempStreak > maxStreak) maxStreak = tempStreak;
                  } else {
                      break;
                  }
              }
          }
      }
    }
    
    const isBleeding = consecutiveDangerDays >= 2;
    return { currentStreak, maxStreak, isBleeding, consecutiveDangerDays };
  }, [meals, dynamicParams, weights, profile]);

  // 控制 5 秒閃爍動畫
  useEffect(() => {
    setIsDangerActive(streakData.isBleeding);
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
  const todayAge = profile ? new Date().getFullYear() - profile.birthYear : 30;
  const todayBmr = calculateBMR(profile?.gender || 'male', todayWAvg, todayDyn?.height || 170, todayAge);
  const todayTargetCal = Math.round(todayBmr * (todayDyn?.activity || 1.2) - (todayDyn?.deficit || 300));
  const todayRemainingCal = todayTargetCal - todayTotalCal;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
          <Scale className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Will Fit</h1>
        <p className="opacity-60 mb-12 text-center">{lang === 'zh' ? '雲端同步版・開始健康之旅' : 'Cloud Sync Edition'}</p>
        
        <button 
          onClick={() => {
            sessionStorage.setItem('willfit_prompt_merge', 'true');
            signInWithPopup(auth, googleProvider).catch(err => {
              console.error("登入錯誤:", err);
              alert("登入失敗：" + err.message);
            });
          }}
          className={`w-full max-w-sm flex items-center justify-center gap-4 px-6 py-4 rounded-2xl shadow border font-bold text-lg active:scale-95 transition-all mb-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-8 h-8 bg-white rounded-full" />
          {lang === 'zh' ? '使用 Google 帳號登入' : 'Sign in with Google'}
        </button>

        <button 
          onClick={() => {
            setUser({ uid: 'guest_user', isAnonymous: true });
            setLoading(false);
          }}
          className={`w-full max-w-sm flex items-center justify-center gap-4 px-6 py-4 rounded-2xl border font-bold text-lg active:scale-95 transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}
        >
          {lang === 'zh' ? '先試用看看 (Try it out)' : 'Try it out'}
        </button>
      </div>
    );
  }



  if (!profile || dynamicParams.length === 0) {
    return <Onboarding profile={profile} setProfile={setProfile} setDynamicParams={setDynamicParams} lang={lang} setLang={setLang} strings={strings} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} relative`}>
      
      {/* 血紅警告邊框 (永遠存在若超標，前 5 秒會閃爍) */}
      {isDangerActive && (
        <div className={`pointer-events-none fixed inset-0 z-50 transition-all duration-1000 border-[6px] sm:border-[8px] border-red-500/80 shadow-[inset_0_0_30px_rgba(239,68,68,0.4)] ${isDangerFlashing ? 'animate-pulse bg-red-600/15' : 'bg-transparent'}`}></div>
      )}

      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-40 transition-all duration-300 shadow-md ${isDangerActive ? 'bg-red-950 text-white border-b border-red-500' : (theme === 'dark' ? 'bg-slate-800 text-white border-b border-slate-700' : 'bg-white text-slate-800 border-b border-slate-200')}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 relative z-10 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
                Will Fit
              </h1>
              <div className="flex items-center space-x-3 text-xs font-medium opacity-90 mt-1">
                <span>{strings.todayInfo}：{weights.find(w => w.date === todayStr)?.weight || '--'} kg</span>
                <span>|</span>
                <span>{strings.remainingCal}：<strong className={`${todayRemainingCal < 0 ? 'text-red-400 font-bold' : ''}`}>{todayRemainingCal}</strong></span>
                <span>|</span>
                <span>{strings.streakInfo}：{streakData.currentStreak} {strings.streakDays}</span>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-xl transition-colors ${theme === 'dark' || isDangerActive ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}>
                <Settings className="w-5 h-5" />
              </button>
              
              {isSettingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}></div>
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border z-50 overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <div className="p-2 border-b text-[10px] font-bold opacity-60 px-4 uppercase tracking-wider">{strings.settingsTitle}</div>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('profile'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors">{strings.editProfile}</button>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('dynamic'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors">{strings.editDynamic}</button>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('recent'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors">{strings.recentRecords}</button>
                    <button onClick={() => { setIsSettingsOpen(false); setCurrentTab('dashboard'); setDashboardScrollTarget('backup'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">{strings.backupImport}</button>
                    <div className="h-2 bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700"></div>
                    {user && user.uid !== 'guest_user' ? (
                      <button onClick={async () => {
                        setIsLoggingOut(true);
                        isClearingData.current = true; // Prevent useEffect from writing empty states to local storage
                        
                        if (user.uid !== 'guest_user') {
                          try {
                            await setDoc(doc(db, 'users', user.uid), { profile, dynamicParams, weights, meals, lastUpdated: new Date().toISOString() }, { merge: true });
                          } catch (e) {
                            console.error("Force save on logout failed:", e);
                            alert(lang === 'zh' ? '登出前儲存失敗，請檢查連線或資料大小。' : 'Failed to save data before logout.');
                          }
                          
                          // Clear local storage on logout to avoid mixing user data
                          localStorage.removeItem('willfit_profile');
                          localStorage.removeItem('willfit_dynamicParams');
                          localStorage.removeItem('willfit_weights');
                          localStorage.removeItem('willfit_meals');
                          localStorage.removeItem('willfit_lastUpdated');
                          localStorage.removeItem('willfit_lastCloudBackup');
                          
                          isCloudDataFetched.current = false;
                          
                          setProfile(null);
                          setDynamicParams([]);
                          setWeights([]);
                          setMeals([]);
                          
                          auth.signOut();
                        }
                        
                        setUser(null); // Return to login screen
                        
                        // Force a full page reload to ensure all React states and snapshot listeners are completely wiped and reset
                        window.location.reload();
                      }} disabled={isLoggingOut} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <LogOut size={16}/> {isLoggingOut ? (lang === 'zh' ? '儲存並登出中...' : 'Saving & Logging out...') : (lang === 'zh' ? '登出 (Logout)' : 'Logout')}
                      </button>
                    ) : (
                      <button onClick={() => {
                        setIsSettingsOpen(false);
                        sessionStorage.setItem('willfit_prompt_merge', 'true');
                        signInWithPopup(auth, googleProvider).catch(err => {
                          console.error("Login error:", err);
                          alert(lang === 'zh' ? '登入失敗：' + err.message : 'Login failed: ' + err.message);
                        });
                      }} className="w-full text-left px-4 py-3 text-sm font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2">
                        <Upload size={16}/> {lang === 'zh' ? '登入 Google 備份至雲端' : 'Login to Cloud Sync'}
                      </button>
                    )}
                    <button onClick={() => { setIsSettingsOpen(false); setActiveModal('deleteConfirm'); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-colors">{strings.deleteAllData}</button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {isDangerActive && (
            <div className="mt-2 text-yellow-300 text-xs font-bold flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              {strings.dangerStreak.replace('{days}', streakData.consecutiveDangerDays)}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 pb-28">
        {currentTab === 'weight' && <WeightTab lang={lang} theme={theme} profile={profile} dynamicParams={dynamicParams} weights={weights} setWeights={setWeights} activeDate={activeDate} setActiveDate={setActiveDate} strings={strings} />}
        {currentTab === 'diet' && <DietTab lang={lang} theme={theme} profile={profile} dynamicParams={dynamicParams} weights={weights} meals={meals} setMeals={setMeals} activeDate={activeDate} setActiveDate={setActiveDate} strings={strings} user={user} />}
        {currentTab === 'dashboard' && <DashboardTab user={user} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} profile={profile} setProfile={setProfile} dynamicParams={dynamicParams} setDynamicParams={setDynamicParams} weights={weights} setWeights={setWeights} meals={meals} setMeals={setMeals} streakData={streakData} scrollTarget={dashboardScrollTarget} setScrollTarget={setDashboardScrollTarget} setCurrentTab={setCurrentTab} setActiveDate={setActiveDate} strings={strings} />}
      </main>

      <nav className={`fixed bottom-0 w-full z-40 border-t shadow-lg backdrop-blur-md pb-safe ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-600'}`}>
        <div className="max-w-4xl mx-auto flex justify-around py-3">
          <button onClick={() => setCurrentTab('weight')} className={`flex flex-col items-center space-y-1 ${currentTab === 'weight' ? 'text-blue-500 font-bold scale-110' : ''} transition-all`}><Scale className="w-5 h-5" /><span className="text-[10px]">{strings.weightTab}</span></button>
          <button onClick={() => setCurrentTab('diet')} className={`flex flex-col items-center space-y-1 ${currentTab === 'diet' ? 'text-blue-500 font-bold scale-110' : ''} transition-all`}><Utensils className="w-5 h-5" /><span className="text-[10px]">{strings.dietTab}</span></button>
          <button onClick={() => setCurrentTab('dashboard')} className={`flex flex-col items-center space-y-1 ${currentTab === 'dashboard' ? 'text-blue-500 font-bold scale-110' : ''} transition-all`}><FileText className="w-5 h-5" /><span className="text-[10px]">{strings.dashboardTab}</span></button>
        </div>
      </nav>

      <Modal isOpen={showCloudPromo && !user} onClose={() => { setShowCloudPromo(false); localStorage.setItem('willfit_cloud_promo_dismissed', 'true'); }} title={lang === 'zh' ? '🎉 新功能上線：雲端自動同步！' : '🎉 New Feature: Cloud Sync!'}>
        <div className="space-y-4">
          <p className="text-sm opacity-90 leading-relaxed">
            {lang === 'zh' 
              ? '現在你可以綁定 Google 帳號，所有的飲食與體重紀錄都會自動備份到雲端，換手機也不怕資料遺失囉！'
              : 'You can now link your Google account to automatically backup all your diet and weight records to the cloud. Never lose your data again!'}
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={() => {
              setShowCloudPromo(false);
              localStorage.setItem('willfit_cloud_promo_dismissed', 'true');
              signInWithPopup(auth, googleProvider).catch(err => {
                console.error("Login error:", err);
                alert(lang === 'zh' ? '登入失敗：' + err.message : 'Login failed: ' + err.message);
              });
            }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Upload size={18}/> {lang === 'zh' ? '立即綁定 Google 帳號' : 'Link Google Account Now'}
            </button>
            <button onClick={() => {
              setShowCloudPromo(false);
              localStorage.setItem('willfit_cloud_promo_dismissed', 'true');
            }} className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              {lang === 'zh' ? '稍後再說' : 'Maybe Later'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'deleteConfirm'} onClose={() => setActiveModal(null)} title={strings.deleteConfirmTitle}>
        <div className="space-y-4">
          <p className="text-sm opacity-80 mb-6">{strings.deleteConfirmDesc}</p>
          <div className="flex flex-col gap-3">
            <button onClick={async () => { 
              if (user && user.uid !== 'guest_user') {
                await createCloudBackup(user.uid, { profile, dynamicParams, weights, meals }, 'pre_delete');
                try {
                  const { deleteDoc, doc } = await import('firebase/firestore');
                  await deleteDoc(doc(db, 'users', user.uid));
                } catch (e) { console.error(e); }
              }
              localStorage.clear();
              setProfile(null);
              setDynamicParams([]);
              setWeights([]);
              setMeals([]);
              setActiveModal(null);
            }} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors">{strings.confirmDelete}</button>
            <button onClick={() => { setActiveModal(null); setCurrentTab('dashboard'); setDashboardScrollTarget('backup'); }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">{strings.backupImport}</button>
            <button onClick={() => { setActiveModal(null); setCurrentTab('dashboard'); }} className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-xl transition-colors">{strings.backToRecords}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!pendingCloudMerge} onClose={() => {}} title={lang === 'zh' ? '發現雲端備份' : 'Cloud Backup Found'}>
        <div className="space-y-4">
          <p className="text-sm opacity-90 leading-relaxed">
            {lang === 'zh' 
              ? '系統發現您的 Google 帳號中存有過去的備份資料。是否要將舊資料帶入，並與目前的試用資料合併？（新資料一定會被保留）' 
              : 'We found previous backup data in your Google account. Do you want to merge it with your current trial data? (Your new data will be kept)'}
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={async () => {
              if (!pendingCloudMerge) return;
              
              const mergedMeals = [...meals];
              const existingMealIds = new Set(meals.map(m => m.id));
              const cloudMeals = pendingCloudMerge.meals || [];
              cloudMeals.forEach(cm => {
                if (!existingMealIds.has(cm.id)) mergedMeals.push(cm);
              });

              const mergedWeights = [...weights];
              const existingWeightDates = new Set(weights.map(w => w.date));
              const cloudWeights = pendingCloudMerge.weights || [];
              cloudWeights.forEach(cw => {
                if (!existingWeightDates.has(cw.date)) mergedWeights.push(cw);
              });

              const finalProfile = profile || pendingCloudMerge.profile;
              const finalDyn = dynamicParams.length > 0 ? dynamicParams : pendingCloudMerge.dynamicParams;

              setMeals(mergedMeals);
              setWeights(mergedWeights);
              setProfile(finalProfile);
              setDynamicParams(finalDyn);
              setPendingCloudMerge(null);
            }} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
              {lang === 'zh' ? '合併舊資料與試用資料' : 'Merge Old & Trial Data'}
            </button>
            <button onClick={async () => {
              setPendingCloudMerge(null);
              try {
                await setDoc(doc(db, 'users', user.uid), {
                  profile, dynamicParams, weights, meals, lastUpdated: new Date().toISOString()
                }, { merge: true });
              } catch (err) {
                console.error("Failed to overwrite cloud data:", err);
              }
            }} className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              {lang === 'zh' ? '不要帶入舊資料（只保留目前的試用紀錄）' : 'Keep Trial Data Only'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// Reusable Component: Modal
// ----------------------------------------------------------------------
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-5 text-slate-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Onboarding Component
// ----------------------------------------------------------------------
function Onboarding({ profile, setProfile, setDynamicParams, lang, setLang, strings }) {
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
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Will Fit</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className={btnClass}>{lang === 'zh' ? 'EN' : '中文'}</button>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
            <h3 className="font-bold border-b pb-2 dark:border-slate-700">步驟 1: 基本資料</h3>
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
              <div className="flex gap-2 w-full">
                <button type="button" onClick={() => setBirthYear(Number(birthYear) - 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg shrink-0">-</button>
                <input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)} required className={`${inputClass} text-center font-bold flex-1 min-w-0`} />
                <button type="button" onClick={() => setBirthYear(Number(birthYear) + 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg shrink-0">+</button>
              </div>
            </div>
            <button type="submit" className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.next}</button>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="space-y-4">
            <h3 className="font-bold border-b pb-2 dark:border-slate-700">步驟 2: 動態目標</h3>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{strings.height}</label>
              <div className="flex gap-2 w-full">
                <button type="button" onClick={() => setHeight(Math.max(0, Number(height) - 1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg shrink-0">-</button>
                <input type="number" step="0.5" value={height} onChange={e => setHeight(e.target.value)} required className={`${inputClass} text-center font-bold flex-1 min-w-0`} />
                <button type="button" onClick={() => setHeight(Number(height) + 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg shrink-0">+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">
                  {strings.deficitTarget}
                  <button type="button" onClick={() => setActiveInfo('deficit')} className="ml-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-0.5 rounded-full"><HelpCircle size={14}/></button>
                </label>
                <input type="number" step="50" value={deficit} onChange={e => setDeficit(e.target.value)} required className={`${inputClass} text-center font-bold`} />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">
                  {strings.activityLevel}
                  <button type="button" onClick={() => setActiveInfo('activity')} className="ml-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-0.5 rounded-full"><HelpCircle size={14}/></button>
                </label>
                <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={inputClass}>
                  <option value={1.2}>{strings.activity12}</option>
                  <option value={1.375}>{strings.activity1375}</option>
                  <option value={1.55}>{strings.activity155}</option>
                  <option value={1.725}>{strings.activity1725}</option>
                  <option value={1.9}>{strings.activity19}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{strings.prev}</button>
              <button type="submit" className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.complete}</button>
            </div>
          </form>
        )}
      </div>
      
      {activeInfo && <DynamicInfoModal type={activeInfo} onClose={() => setActiveInfo(null)} strings={strings} />}
    </div>
  );
}

// ----------------------------------------------------------------------
// Weight Tab
// ----------------------------------------------------------------------
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
      return { date: mStr, weight: Number(avg.toFixed(1)) };
    });
  }, [weights, chartMode]);

  const changeDate = (days) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + days);
    const newDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (newDateStr > getTodayDateStr()) return; // 防止選擇未來的日期
    setActiveDate(newDateStr);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
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
                <input type="date" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={activeDate} max={getTodayDateStr()} onChange={e => setActiveDate(e.target.value)} style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} className="bg-transparent text-center font-bold outline-none text-slate-900 dark:text-white w-full" />
              </div>
              <button type="button" onClick={() => changeDate(1)} className={`px-4 rounded-xl border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}><ChevronRight size={20}/></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-500">{strings.weight}</label>
            <div className="flex gap-2 w-full">
              <button type="button" onClick={() => setWeightInput(prev => Math.max(0, Number(prev||70)-0.1).toFixed(1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0 text-slate-900 dark:text-white">-</button>
              <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)} required className={`${inputClass} text-center font-bold text-xl flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white`} placeholder="70.0" />
              <button type="button" onClick={() => setWeightInput(prev => (Number(prev||70)+0.1).toFixed(1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0 text-slate-900 dark:text-white">+</button>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors">{strings.submit}</button>
        </form>
        )}
      </div>

      <div ref={resultRef} className={`p-6 rounded-3xl shadow border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{strings.formulaDesc}</h3>
          <button onClick={() => setShowFormula(true)} className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 p-1 rounded-full transition-colors"><HelpCircle className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="flex flex-col gap-3">
            <div className={`p-3 rounded-2xl shadow-sm flex flex-col justify-center flex-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
              <span className="text-xs opacity-60 block">{strings.bmr}</span>
              <strong className="text-lg">{Math.ceil(bmr)}</strong>
            </div>
            <div className={`p-3 rounded-2xl shadow-sm flex flex-col justify-center flex-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
              <span className="text-xs opacity-60 block">{strings.tdee}</span>
              <strong className="text-lg text-blue-500">{Math.ceil(tdee)}</strong>
            </div>
          </div>
          <div className="p-4 rounded-2xl shadow-sm bg-blue-600 text-white flex flex-col items-center justify-center">
            <span className="text-sm opacity-90 block mb-1">{strings.targetCal}</span>
            <strong className="text-4xl">{Math.ceil(targetCal)}</strong>
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

      <Modal isOpen={showFormula} onClose={() => setShowFormula(false)} title={strings.formulaDesc}>
        <div className="text-sm space-y-2 opacity-90">
          <p>{lang === 'zh' ? '當日熱量目標是根據「上一週的平均體重」來計算，避免每天體重波動影響目標。若是第一週則使用最早紀錄的體重。' : 'Target is based on previous week avg weight.'}</p>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p><strong>BMR</strong>: {strings.bmrDesc}</p>
            <p><strong>TDEE</strong>: {strings.tdeeDesc}</p>
          </div>
          <div className={`p-4 mt-4 rounded-xl font-mono text-xs leading-relaxed ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
            <div className="text-slate-500 mb-2">{lang === 'zh' ? '使用體重' : 'Weight'}: {wAvg.toFixed(1)} kg | {lang === 'zh' ? '身高' : 'Height'}: {dyn.height} cm</div>
            <div>BMR = {Math.ceil(bmr)} kcal</div>
            <div className="text-blue-500 mt-1">TDEE = {Math.ceil(bmr)} × {dyn.activity} = {Math.ceil(tdee)} kcal</div>
            <div className="text-green-600 mt-1 font-bold">{lang === 'zh' ? '目標' : 'Target'} = {Math.ceil(tdee)} - {dyn.deficit} = {Math.ceil(targetCal)} kcal</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// Diet Tab
// ----------------------------------------------------------------------
function DietTab({ lang, theme, profile, dynamicParams, weights, meals, setMeals, activeDate, setActiveDate, strings, user }) {
  const [mealTime, setMealTime] = useState('12:00');
  const [mealName, setMealName] = useState('');
  const [mealCal, setMealCal] = useState('');
  const [photos, setPhotos] = useState([]); 
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [duplicatingMeal, setDuplicatingMeal] = useState(null);
  const [duplicateTargetDate, setDuplicateTargetDate] = useState('');
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingMealCopy, setPendingMealCopy] = useState(null);
  const [copyCal, setCopyCal] = useState(true);
  const [copyPhoto, setCopyPhoto] = useState(true);
  const [showLoginReminder, setShowLoginReminder] = useState(false);

  useEffect(() => {
    if (user && user.uid === 'guest_user') {
      const today = getTodayDateStr();
      const lastReminder = localStorage.getItem('willfit_lastLoginReminder');
      if (lastReminder !== today) {
        setShowLoginReminder(true);
        localStorage.setItem('willfit_lastLoginReminder', today);
      }
    }
  }, [user]);

  const suggestedFoods = useMemo(() => {
    if (!mealName) return [];
    const uniqueMeals = [];
    const seen = new Set();
    const sortedMeals = [...meals].sort((a,b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    sortedMeals.forEach(m => {
      if (m.name.toLowerCase().includes(mealName.toLowerCase()) && !seen.has(m.name)) {
        seen.add(m.name);
        uniqueMeals.push(m);
      }
    });
    return uniqueMeals;
  }, [meals, mealName]);

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
    const newDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (newDateStr > getTodayDateStr()) return; // 防止選擇未來的日期
    setActiveDate(newDateStr);
  };

  const handlePhotoUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      // Generate blob URLs for optimistic UI
      const localPhotoUrls = files.map(f => URL.createObjectURL(f));
      
      // Immediately show local photos
      setPhotos(prev => [...prev, ...localPhotoUrls]);
      
      // Process and upload in background
      const uploadedUrls = await Promise.all(files.map(async (file, index) => {
        let processedFile = file;
        
        // Convert HEIC/HEIF to JPEG
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
          try {
            const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
            processedFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            processedFile = new File([processedFile], file.name.replace(/\.heic|\.heif/i, '.jpg'), { type: 'image/jpeg' });
          } catch (err) {
            console.error("HEIC conversion error:", err);
            // If HEIC conversion fails, fallback to original file
          }
        }
        
        try {
          const compressedFile = await imageCompression(processedFile, {
            maxWidthOrHeight: 1280, // Increased for better text readability
            useWebWorker: true,
            initialQuality: 0.85 // Increased for better quality
          });
          
          const formData = new FormData();
          formData.append('file', compressedFile);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
          });
          
          if (!res.ok) throw new Error("Cloudinary upload failed");
          
          const data = await res.json();
          return { local: localPhotoUrls[index], cloud: data.secure_url };
        } catch (err) {
          console.error("Upload failed for a file:", err);
          return { local: localPhotoUrls[index], cloud: null }; // Mark as failed
        }
      }));

      // Update state to replace local blob URLs with cloud URLs
      setPhotos(prev => prev.map(url => {
        const match = uploadedUrls.find(u => u.local === url);
        if (match) return match.cloud || url; // If failed, keep local or it will be broken. We keep local so it shows up until refresh.
        return url;
      }));
      
      // Update any meals that might have been saved prematurely with the blob URLs
      setMeals(prevMeals => prevMeals.map(meal => {
        if (!meal.photos) return meal;
        let changed = false;
        const updatedPhotos = meal.photos.map(url => {
           const match = uploadedUrls.find(u => u.local === url);
           if (match && match.cloud) {
             changed = true;
             return match.cloud;
           }
           return url;
        });
        return changed ? { ...meal, photos: updatedPhotos } : meal;
      }));
      
    } catch (error) {
      console.error("Photo upload error:", error);
      alert(lang === 'zh' ? '圖片上傳處理發生錯誤。' : 'An error occurred during upload processing.');
    } finally {
      e.target.value = '';
    }
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
    if (totalCal <= targetCal) return <div className="text-3xl font-bold bg-green-500 rounded-md w-10 h-10 flex items-center justify-center text-white shadow-sm">✅</div>;
    if (totalCal >= targetCal + 750) return <div className="text-3xl font-bold bg-red-900 border-2 border-red-500 rounded-md w-10 h-10 flex items-center justify-center text-white shadow-sm">☠️</div>;
    return <div className="text-3xl font-bold bg-purple-500 rounded-md w-10 h-10 flex items-center justify-center text-white shadow-sm">❌</div>;
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      <div className={`sticky top-[68px] z-30 p-2 rounded-2xl shadow border flex items-center justify-between backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/90 border-slate-200 text-slate-900'}`}>
        <button onClick={() => changeDate(-1)} className={`p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}><ChevronLeft size={20}/></button>
        <div className="flex justify-center items-center gap-2 flex-1">
          <span className="text-xs opacity-60 font-bold whitespace-nowrap">{getDayOfWeek(activeDate, lang)}</span>
          <input type="date" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={activeDate} max={getTodayDateStr()} onChange={e => setActiveDate(e.target.value)} style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} className="bg-transparent font-bold text-center outline-none text-slate-900 dark:text-white w-full max-w-[150px]" />
        </div>
        <button onClick={() => changeDate(1)} className={`p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}><ChevronRight size={20}/></button>
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
          <div className="flex flex-col"><span className="text-slate-400 text-xs">{strings.target}</span><strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{targetCal}</strong></div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div>{getStatusIcon()}</div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex flex-col"><span className="text-slate-400 text-xs">{strings.intake}</span><strong className="text-blue-500">{totalCal}</strong></div>
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
          <div className="relative">
            <label className="block text-xs font-bold mb-1 text-slate-500">{strings.mealName}</label>
            <input type="text" value={mealName} 
              onChange={e => { setMealName(e.target.value); setShowSuggestions(true); }} 
              onFocus={() => setShowSuggestions(true)} 
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
              required className={`${inputClass} bg-transparent text-slate-900 dark:text-white`} 
              placeholder={lang === 'zh' ? '例如: 排骨便當' : 'e.g. Chicken Salad'} 
            />
            {showSuggestions && suggestedFoods.length > 0 && mealName && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {suggestedFoods.map(m => (
                  <div key={m.id} className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer" onClick={() => {
                    setMealName(m.name);
                    setPendingMealCopy(m);
                    setShowSuggestions(false);
                  }}>
                    <div className="font-bold">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.calories} kcal</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-xs font-bold mb-1 text-slate-500">{strings.mealTime}</label>
              <input type="time" lang="en-GB" value={mealTime} onChange={e => setMealTime(e.target.value)} required style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} className={`${inputClass} bg-transparent text-slate-900 dark:text-white`} />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold mb-1 text-slate-500">{strings.mealCal}</label>
              <div className="flex gap-2 w-full">
                <button type="button" onClick={() => setMealCal(Math.max(0,Number(mealCal||0)-50))} className="px-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0 text-slate-900 dark:text-white">-</button>
                <input type="number" step="10" value={mealCal} onChange={e => setMealCal(e.target.value)} required className={`${inputClass} text-center font-bold flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white px-1`} placeholder="450" />
                <button type="button" onClick={() => setMealCal(Number(mealCal||0)+50)} className="px-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0 text-slate-900 dark:text-white">+</button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-500">{strings.photos}</label>
            <div className="flex flex-wrap gap-3">
              {photos.map((url, idx) => {
                const isUploading = url.startsWith('blob:');
                return (
                  <div key={idx} className="relative w-20 h-20 group">
                    <img src={url} alt={`preview-${idx}`} className={`w-full h-full object-cover rounded-xl border border-slate-200 dark:border-slate-600 transition-opacity ${isUploading ? 'opacity-50 blur-[2px]' : ''}`} />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!isUploading && (
                      <button type="button" onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
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
                <div className="flex shrink-0">
                  <button onClick={() => { setDuplicatingMeal(m); setDuplicateTargetDate(getTodayDateStr()); }} className="p-2 text-slate-300 hover:text-blue-500 transition-colors" title={lang === 'zh' ? '複製' : 'Duplicate'}>
                    <Copy size={20}/>
                  </button>
                  <button onClick={() => setDeleteConfirmId(m.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title={lang === 'zh' ? '刪除' : 'Delete'}>
                    <Trash2 size={20}/>
                  </button>
                </div>
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

      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title={lang === 'zh' ? '確認刪除此餐點？' : 'Delete this meal?'}>
        <div className="flex gap-4">
          <button onClick={() => setDeleteConfirmId(null)} className="w-1/2 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold">{strings.cancel}</button>
          <button onClick={() => { setMeals(prev => prev.filter(m => m.id !== deleteConfirmId)); setDeleteConfirmId(null); }} className="w-1/2 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">{strings.confirmDelete}</button>
        </div>
      </Modal>

      <Modal isOpen={!!duplicatingMeal} onClose={() => setDuplicatingMeal(null)} title={lang === 'zh' ? '複製紀錄' : 'Duplicate Meal'}>
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2 text-slate-500">{lang === 'zh' ? '選擇目標日期' : 'Target Date'}</label>
          <div className={`w-full overflow-hidden rounded-2xl ${theme === 'dark' ? 'bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]' : 'bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'}`}>
            <input type="date" max={getTodayDateStr()} value={duplicateTargetDate} onChange={e => setDuplicateTargetDate(e.target.value)} required style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} className="w-full p-4 bg-transparent text-slate-900 dark:text-white font-bold outline-none block min-w-0" />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setDuplicatingMeal(null)} className="w-1/2 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold">{strings.cancel}</button>
          <button onClick={() => {
            if (!duplicateTargetDate) return;
            setMeals(prev => [...prev, { ...duplicatingMeal, id: Date.now().toString(), date: duplicateTargetDate }]);
            setDuplicatingMeal(null);
            setActiveDate(duplicateTargetDate); // Automatically switch to the target date
          }} className="w-1/2 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">{lang === 'zh' ? '確認複製' : 'Confirm'}</button>
        </div>
      </Modal>

      <Modal isOpen={!!pendingMealCopy} onClose={() => setPendingMealCopy(null)} title={lang === 'zh' ? '發現歷史紀錄' : 'Historical Record Found'}>
        {pendingMealCopy && (
          <div className="animate-in fade-in zoom-in duration-200">
            <p className="text-sm mb-4">{lang === 'zh' ? `是否要沿用之前的熱量和照片？` : `Do you want to use the previous calories and photo?`}</p>
            
            <div className="flex flex-col gap-3 mb-6">
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input type="checkbox" checked={copyCal} onChange={e => setCopyCal(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                <div className="flex-1">
                  <div className="font-bold">{lang === 'zh' ? '沿用熱量' : 'Use Calories'}</div>
                  <div className="text-blue-600 font-bold text-lg">{pendingMealCopy.calories} kcal</div>
                </div>
              </label>
              
              {pendingMealCopy.photos && pendingMealCopy.photos.length > 0 && (
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input type="checkbox" checked={copyPhoto} onChange={e => setCopyPhoto(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                <div className="flex-1">
                  <div className="font-bold">{lang === 'zh' ? '沿用照片' : 'Use Photo'}</div>
                </div>
                <img src={pendingMealCopy.photos[0]} className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-600" alt="history preview"/>
              </label>
              )}
            </div>
            
            <button type="button" onClick={() => {
              if (copyCal) setMealCal(pendingMealCopy.calories);
              if (copyPhoto && pendingMealCopy.photos) setPhotos(pendingMealCopy.photos);
              setPendingMealCopy(null);
            }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors">{lang === 'zh' ? '確認' : 'Confirm'}</button>
          </div>
        )}
      </Modal>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" alt="View" />
        </div>
      )}

      <Modal isOpen={showLoginReminder} onClose={() => setShowLoginReminder(false)} title={lang === 'zh' ? '溫馨提示' : 'Reminder'}>
        <div className="space-y-4">
          <p className="text-sm opacity-90 leading-relaxed">
            {lang === 'zh' ? '為了避免試用資料遺失，建議您登入 Google 帳號將資料備份到雲端！' : 'To prevent data loss, we recommend logging in to backup your data.'}
          </p>
          <div className="flex gap-4 pt-2">
            <button onClick={() => setShowLoginReminder(false)} className="w-1/2 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold">{lang === 'zh' ? '稍後再說' : 'Later'}</button>
            <button onClick={() => {
              setShowLoginReminder(false);
              sessionStorage.setItem('willfit_prompt_merge', 'true');
              signInWithPopup(auth, googleProvider).catch(err => {
                console.error("登入錯誤:", err);
                alert("登入失敗：" + err.message);
              });
            }} className="w-1/2 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">{lang === 'zh' ? '立即登入' : 'Login Now'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// Dashboard Tab
// ----------------------------------------------------------------------
function DashboardTab({ user, lang, setLang, theme, setTheme, profile, setProfile, dynamicParams, setDynamicParams, weights, setWeights, meals, setMeals, streakData, scrollTarget, setScrollTarget, setCurrentTab, setActiveDate, strings }) {
  const basicInfoRef = useRef(null);
  const dynamicParamsRef = useRef(null);
  const backupRef = useRef(null);
  const recentRecordsRef = useRef(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: profile.name, gender: profile.gender, birthYear: profile.birthYear });

  useEffect(() => {
    if (profile) {
      setEditProfileForm({ name: profile.name, gender: profile.gender, birthYear: profile.birthYear });
    }
  }, [profile]);

  useEffect(() => {
    if (scrollTarget) {
      setTimeout(() => {
        const refs = { profile: basicInfoRef, dynamic: dynamicParamsRef, backup: backupRef, recent: recentRecordsRef };
        const target = refs[scrollTarget];
        if (target && target.current) {
          target.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      <div ref={basicInfoRef}>
        <div className={`p-6 rounded-3xl shadow border flex justify-between items-center ${theme === 'dark' ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-r from-blue-600 to-blue-800 border-none text-white'}`}>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-sm opacity-80 mt-1">{profile.gender === 'male' ? strings.male : strings.female} • {new Date().getFullYear() - profile.birthYear} yrs</p>
            {user && <p className="text-xs opacity-60 mt-1">{user.email}</p>}
          </div>
          <button onClick={() => setShowEditProfileModal(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors">{strings.editProfile}</button>
        </div>
      </div>

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

      <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold mb-4">{strings.heatmapTitle}</h3>
        <div className="grid grid-cols-7 gap-2">
          {heatmapDays.map((day) => {
            let bg = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100';
            let icon = '';
            if (day.status === 'success') { bg = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] border-none text-white'; icon = '✅'; }
            if (day.status === 'over') { bg = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] border-none text-white'; icon = '❌'; }
            if (day.status === 'danger') { bg = 'bg-red-900 border-2 border-red-500 text-white'; icon = '☠️'; }

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
         <BackupImportArea profile={profile} setProfile={setProfile} dynamicParams={dynamicParams} setDynamicParams={setDynamicParams} weights={weights} meals={meals} setWeights={setWeights} setMeals={setMeals} theme={theme} strings={strings} lang={lang} getTodayDateStr={getTodayDateStr} />
      </div>

      <Modal isOpen={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} title={strings.editProfile}>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{strings.name}</label>
            <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} required className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{strings.gender}</label>
            <select value={editProfileForm.gender} onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 bg-transparent">
              <option value="male">{strings.male}</option>
              <option value="female">{strings.female}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{strings.birthYear}</label>
            <div className="flex gap-2 w-full">
              <button type="button" onClick={() => setEditProfileForm(p => ({...p, birthYear: Number(p.birthYear) - 1}))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg shrink-0">-</button>
              <input type="number" value={editProfileForm.birthYear} onChange={e => setEditProfileForm({...editProfileForm, birthYear: e.target.value})} required className="w-full text-center px-4 py-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold flex-1 min-w-0 bg-transparent" />
              <button type="button" onClick={() => setEditProfileForm(p => ({...p, birthYear: Number(p.birthYear) + 1}))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-lg shrink-0">+</button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium mb-2 opacity-80">{strings.settingsTitle}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                {lang === 'zh' ? '切換為 English' : 'Switch to 中文'}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors mt-4">{strings.save}</button>
        </form>
      </Modal>

    </div>
  );
}

// ----------------------------------------------------------------------
// Edit Dynamic Area Component
// ----------------------------------------------------------------------
function EditDynamicArea({ dynamicParams, setDynamicParams, theme, strings, lang }) {
  const [date, setDate] = useState(getTodayDateStr());
  const [height, setHeight] = useState(dynamicParams[0]?.height || 170);
  const [deficit, setDeficit] = useState(dynamicParams[0]?.deficit || 300);
  const [activity, setActivity] = useState(dynamicParams[0]?.activity || 1.2);
  const [activeInfo, setActiveInfo] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (dynamicParams && dynamicParams.length > 0) {
      const latest = dynamicParams[0];
      setHeight(latest.height);
      setDeficit(latest.deficit);
      setActivity(latest.activity);
    }
  }, [dynamicParams]);

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
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 p-3 rounded-lg text-xs leading-relaxed font-medium">
          {lang === 'zh' ? '設定後將於指定生效日期起作用，不會影響過去的歷史紀錄計算。' : 'Changes will take effect from the selected date and will not affect past historical records.'}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-500">{lang === 'zh' ? '生效日期' : 'Effective Date'}</label>
          <div className="flex gap-2">
            <input type="date" lang={lang === 'en' ? 'en-US' : 'zh-TW'} value={date} onChange={e => setDate(e.target.value)} required style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} className={`${inputClass} flex-1 text-center font-bold bg-transparent text-slate-900 dark:text-white`} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-500">{strings.height}</label>
          <div className="flex gap-2 w-full">
            <button type="button" onClick={() => setHeight(Math.max(0, Number(height) - 1))} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors shrink-0 text-slate-900 dark:text-white">-</button>
            <input type="number" step="0.5" value={height} onChange={e => setHeight(e.target.value)} required className={`${inputClass} text-center font-bold flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white`} />
            <button type="button" onClick={() => setHeight(Number(height) + 1)} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors shrink-0 text-slate-900 dark:text-white">+</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium mb-1 text-slate-500">
              {strings.deficitTarget}
              <button type="button" onClick={() => setActiveInfo('deficit')} className="ml-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-0.5 rounded-full"><HelpCircle size={14}/></button>
            </label>
            <input type="number" step="50" value={deficit} onChange={e => setDeficit(e.target.value)} required className={`${inputClass} font-bold bg-transparent text-slate-900 dark:text-white`} />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium mb-1 text-slate-500">
              {strings.activityLevel}
              <button type="button" onClick={() => setActiveInfo('activity')} className="ml-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-0.5 rounded-full"><HelpCircle size={14}/></button>
            </label>
            <select value={activity} onChange={e => setActivity(Number(e.target.value))} className={`${inputClass} bg-transparent text-slate-900 dark:text-white`}>
              <option value={1.2}>{strings.activity12}</option><option value={1.375}>{strings.activity1375}</option>
              <option value={1.55}>{strings.activity155}</option><option value={1.725}>{strings.activity1725}</option><option value={1.9}>{strings.activity19}</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">{strings.save}</button>
      </form>
      )}

      {isFormOpen && dynamicParams.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
          <details className="group">
            <summary className="text-sm font-bold text-slate-500 cursor-pointer list-none flex items-center gap-2">
              <span className="group-open:hidden">▶</span>
              <span className="hidden group-open:inline">▼</span>
              {lang === 'zh' ? '進階：管理歷史紀錄' : 'Advanced: Manage History'}
            </summary>
            <div className="mt-4 space-y-2">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs leading-relaxed font-bold mb-4">
                {lang === 'zh' ? '警告：刪除或修改過去的紀錄將會改變當時的 BMR 與熱量目標，進而影響歷史達標紀錄！請謹慎操作。' : 'WARNING: Modifying past records will recalculate past BMR and targets, which may alter historical achievement streaks! Proceed with caution.'}
              </div>
              {dynamicParams.map((param, idx) => (
                <div key={param.effectiveDate} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{param.effectiveDate}</span>
                    <span className="text-xs text-slate-500">{param.height}cm, {param.deficit}kcal, {param.activity}x</span>
                  </div>
                  <button 
                    onClick={() => {
                      if(dynamicParams.length === 1) {
                        alert(lang === 'zh' ? '必須保留至少一筆動態目標設定！' : 'Must keep at least one record!');
                        return;
                      }
                      if(confirm(lang === 'zh' ? `確定要刪除 ${param.effectiveDate} 的設定嗎？` : `Delete ${param.effectiveDate}?`)) {
                        setDynamicParams(prev => prev.filter(p => p.effectiveDate !== param.effectiveDate));
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
      
      {activeInfo && <DynamicInfoModal type={activeInfo} onClose={() => setActiveInfo(null)} strings={strings} />}
    </div>
  );
}

// ----------------------------------------------------------------------
// Backup Import Area Component
// ----------------------------------------------------------------------
function BackupImportArea({ profile, setProfile, dynamicParams, setDynamicParams, weights, meals, setWeights, setMeals, theme, strings, lang, getTodayDateStr }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const promptText = `我有一份從其他 APP 匯出的飲食與體重紀錄（包含圖片與表格數據），以及我的個人基本資料。請幫我過濾掉無關資訊（如心率、步數、睡眠等），並將所有內容嚴格轉換為符合以下 JSON 格式。請直接輸出一個 .json 檔案讓我下載，不要包含任何 Markdown 說明文字或額外的解釋：

【輸出 JSON 結構規範】
{
  "profile": {
    "name": "你的名字",
    "gender": "male", // male 或 female
    "birthYear": 1990
  },
  "dynamicParams": [
    { "effectiveDate": "YYYY-MM-DD", "height": 170, "deficit": 300, "activity": 1.2 }
  ],
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

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert(strings.copied);
      setShowPrompt(false);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyPrompt = async () => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(promptText);
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      alert(strings.copied);
      setShowPrompt(false);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      fallbackCopyTextToClipboard(promptText);
    }
  };

  return (
    <div className={`p-6 rounded-3xl shadow border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{strings.importInstruction}</h3>
        <button onClick={() => setShowPrompt(true)} className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1 rounded-full"><HelpCircle size={20}/></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => {
          const blob = new Blob([JSON.stringify({ profile, dynamicParams, weights, meals }, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `WillFit_Backup_${getTodayDateStr()}.json`; a.click();
        }} className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-900 rounded-xl hover:shadow-md transition-shadow text-blue-600">
          <Download size={24} className="mb-2" />
          <span className="text-sm font-bold">{strings.exportCsv}</span>
        </button>
        
        <label className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-900 rounded-xl hover:shadow-md transition-shadow text-slate-600 dark:text-slate-300 cursor-pointer">
          <Upload size={24} className="mb-2" />
          <span className="text-sm font-bold">{isImporting ? (lang === 'zh' ? '處理圖片中...' : 'Processing...') : strings.importCsv}</span>
          <input type="file" accept=".json" className="hidden" disabled={isImporting} onChange={e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = async ev => {
              try {
                setIsImporting(true);
                const data = JSON.parse(ev.target.result);
                
                // Convert Base64 images to Cloudinary URLs
                if (data.meals && Array.isArray(data.meals)) {
                  for (let i = 0; i < data.meals.length; i++) {
                    const meal = data.meals[i];
                    if (meal.photos && Array.isArray(meal.photos)) {
                      for (let j = 0; j < meal.photos.length; j++) {
                        const photo = meal.photos[j];
                        if (typeof photo === 'string' && photo.startsWith('data:image/')) {
                          const formData = new FormData();
                          formData.append('file', photo);
                          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                            method: 'POST', body: formData
                          });
                          if (res.ok) {
                            const cloudData = await res.json();
                            meal.photos[j] = cloudData.secure_url;
                          }
                        }
                      }
                    }
                  }
                }

                if (data.profile) setProfile(data.profile);
                if (data.dynamicParams) setDynamicParams(data.dynamicParams);
                if (data.weights) setWeights(data.weights);
                if (data.meals) setMeals(data.meals);
                alert(strings.importSuccess); 
              } catch (err) { 
                console.error(err);
                alert(strings.importError); 
              } finally {
                setIsImporting(false);
              }
            };
            reader.readAsText(file);
          }}/>
        </label>
      </div>

      <Modal isOpen={showPrompt} onClose={() => setShowPrompt(false)} title={strings.aiPromptTitle}>
        <div className="text-sm mb-4 opacity-90 leading-relaxed space-y-2">
          <p className="font-bold text-green-600 dark:text-green-400">{strings.importHelp1}</p>
          <p>{strings.importHelp2}</p>
        </div>
        <div className="flex-1 overflow-y-auto mb-4">
          <textarea readOnly value={promptText} className="w-full h-48 p-3 text-xs font-mono rounded-xl border bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 select-all outline-none focus:border-blue-500" />
        </div>
        <p className="text-xs font-bold text-slate-500 mb-2">{strings.downloadPromptDesc}</p>
        <button onClick={handleCopyPrompt} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg">{strings.copyPrompt}</button>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// Dynamic Info Modal Component
// ----------------------------------------------------------------------
function DynamicInfoModal({ type, onClose, strings }) {
  return (
    <Modal isOpen={true} onClose={onClose} title={type === 'deficit' ? strings.deficitHelpTitle : strings.activityHelpTitle}>
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
        <button onClick={onClose} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">{strings.cancel}</button>
    </Modal>
  );
}