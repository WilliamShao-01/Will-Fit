import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Settings, Info, AlertTriangle, CheckCircle2, XCircle, Camera, 
  TrendingUp, Home, Utensils, Download, Upload, Calendar, ChevronLeft, ChevronRight, X, Plus, Edit2, ExternalLink
} from 'lucide-react';


// --- Utilities ---
const getTodayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

const getDayOfWeek = (dateStr) => {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(dateStr);
  return `星期${days[d.getDay()]}`;
};

const calculateAge = (birthYear) => {
  return new Date().getFullYear() - birthYear;
};

// Find the applicable parameters for a given date (for immutable history)
const getParamsForDate = (dateStr, dynamicParams = []) => {
  if (!dynamicParams || dynamicParams.length === 0) return null;
  const sorted = [...dynamicParams].sort((a, b) => new Date(b.date) - new Date(a.date));
  const found = sorted.find(p => p.date <= dateStr);
  return found || sorted[sorted.length - 1];
};

// Calculate effective weight based on previous week's average, or earliest weight if first week
const getEffectiveWeightForDate = (dateStr, weights) => {
  const weightEntries = Object.entries(weights).sort((a,b) => new Date(a[0]) - new Date(b[0]));
  if (weightEntries.length === 0) return null;

  const targetDate = new Date(dateStr);
  const day = targetDate.getDay();
  const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
  const currentMonday = new Date(targetDate);
  currentMonday.setDate(diff);

  // Previous week Monday & Sunday
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

  // Fallback: If no records in previous week (first week), use earliest recorded weight
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
  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0 ml-2 shadow-sm active:scale-95 transition-transform">
    <Info size={14} />
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const ACTIVITY_OPTIONS = [
  { value: '1.2', label: '1.2 (久坐/幾乎不運動)' },
  { value: '1.375', label: '1.375 (輕度/每週運動 1-3 天)' },
  { value: '1.55', label: '1.55 (中度/每週運動 3-5 天)' },
  { value: '1.725', label: '1.725 (高度/每週運動 6-7 天)' },
  { value: '1.9', label: '1.9 (極度/重勞力或雙重訓練)' }
];

const DeficitHelpContent = () => (
  <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
    <p><strong>什麼是赤字目標？</strong></p>
    <p>想要減重，你需要創造「熱量赤字」，也就是讓「每天消耗的熱量 (TDEE) 大於 攝取的熱量」。</p>
    <p>一般建議將赤字設定在 <strong>300 ~ 500 大卡</strong> 之間，這樣每週大約可以健康減去 0.3 ~ 0.5 公斤。不宜設定過高，以免流失肌肉、引發報復性飲食或影響內分泌健康。</p>
    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
      <a href="https://blog.worldgymtaiwan.com/calorie-calculator" target="_blank" rel="noreferrer" className="underline flex items-center gap-1">
         <ExternalLink size={14} /> 點此參考 World Gym：卡路里計算機教學
      </a>
    </p>
  </div>
);

const ActivityHelpContent = () => (
  <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
    <p><strong>如何選擇活動係數？</strong></p>
    <p>活動係數用來評估你日常消耗的活動量，請根據你「一整週」的真實生活型態來選擇：</p>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>1.2 (久坐)：</strong> 上班族、幾乎沒有運動習慣，日常生活多為坐姿。</li>
      <li><strong>1.375 (輕度)：</strong> 每週有 1~3 天進行輕度運動（如散步、瑜珈、輕鬆騎車）。</li>
      <li><strong>1.55 (中度)：</strong> 每週有 3~5 天進行中等強度運動（如慢跑、游泳、重訓）。</li>
      <li><strong>1.725 (高度)：</strong> 每週有 6~7 天進行高強度運動，或從事體力勞動工作。</li>
      <li><strong>1.9 (極度)：</strong> 每天進行兩次高強度訓練，或是極重度勞力工作者。</li>
    </ul>
    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
      <a href="https://tools.heho.com.tw/bmr/" target="_blank" rel="noreferrer" className="underline flex items-center gap-1">
        <ExternalLink size={14} /> 點此參考 Heho 健康：BMR 與 TDEE 計算機
      </a>
    </p>
  </div>
);

// ==========================================
// 1.5 Onboarding (首次載入流程)
// ==========================================
const Onboarding = ({ setProfile, setDynamicParams }) => {
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
      birthYear: Number(profileForm.birthYear)
    });
    setDynamicParams([{
      date: getTodayStr(),
      height: Number(paramForm.height),
      deficit: Number(paramForm.deficit),
      activityFactor: Number(paramForm.activityFactor)
    }]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">歡迎使用 Will Fit</h2>
        
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">步驟 1: 基本資料</h3>
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">性別</label>
                <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none">
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">出生年</label>
                <input type="number" required value={profileForm.birthYear} onChange={e => setProfileForm({...profileForm, birthYear: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 mt-6 rounded-xl bg-blue-600 text-white font-bold shadow-lg">下一步</button>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300">步驟 2: 動態目標</h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">身高 (cm)</label>
              <input type="number" step="0.5" required value={paramForm.height} onChange={e => setParamForm({...paramForm, height: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  赤字目標 (kcal) <InfoButton onClick={() => setShowDeficitHelp(true)} />
                </label>
                <input type="number" step="50" required value={paramForm.deficit} onChange={e => setParamForm({...paramForm, deficit: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1">
                  活動係數 <InfoButton onClick={() => setShowActivityHelp(true)} />
                </label>
                <select value={paramForm.activityFactor} onChange={e => setParamForm({...paramForm, activityFactor: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 rounded-xl bg-gray-200 dark:bg-gray-700 font-bold">上一步</button>
              <button type="submit" className="w-2/3 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg">完成設定</button>
            </div>
          </form>
        )}
      </Card>

      <Modal isOpen={showDeficitHelp} onClose={() => setShowDeficitHelp(false)} title="什麼是赤字目標？">
        <DeficitHelpContent />
      </Modal>

      <Modal isOpen={showActivityHelp} onClose={() => setShowActivityHelp(false)} title="如何選擇活動係數？">
        <ActivityHelpContent />
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


export default function App() {
  const [profile, setProfile] = useLocalStorage('willfit_profile', null);
  const [dynamicParams, setDynamicParams] = useLocalStorage('willfit_params', []);
  const [weights, setWeights] = useLocalStorage('willfit_weights', {}); 
  const [diets, setDiets] = useLocalStorage('willfit_diets', {}); 
  
  const [currentTab, setCurrentTab] = useState('weight'); 
  const [activeDate, setActiveDate] = useState(getTodayStr()); 
  const [isBleeding, setIsBleeding] = useState(false);
  const [bleedingDays, setBleedingDays] = useState(0);
  const [scrollTarget, setScrollTarget] = useState(null); // 新增：用於跨元件控制頁面捲動目標

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
    } else {
      setIsBleeding(false);
      setBleedingDays(0);
    }
  }, [diets, weights, dynamicParams, profile]);


  if (!profile || dynamicParams.length === 0) {
    return <Onboarding setProfile={setProfile} setDynamicParams={setDynamicParams} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 ${isBleeding ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''}`}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-xl bg-white/50 dark:bg-black/20">
        
        {isBleeding && (
          <div className="pointer-events-none fixed inset-0 z-[100] border-[8px] border-red-600/30 shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]"></div>
        )}

        <TopBar 
          profile={profile} 
          weights={weights}
          diets={diets}
          dynamicParams={dynamicParams}
          isBleeding={isBleeding}
          bleedingDays={bleedingDays}
          setCurrentTab={setCurrentTab}
          setScrollTarget={setScrollTarget}
        />

        <main className="flex-1 overflow-y-auto pb-24 pt-20 px-4 space-y-6 scroll-smooth">
          {currentTab === 'weight' && (
            <WeightTab 
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

        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
    </div>
  );
}


// ==========================================
// 2. Top Bar (With Settings Dropdown)
// ==========================================
const TopBar = ({ profile, weights, diets, dynamicParams, isBleeding, bleedingDays, setCurrentTab, setScrollTarget }) => {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const today = getTodayStr();
  const todayWeight = weights[today];
  const dayMeals = diets[today] || [];
  const totalCal = dayMeals.reduce((sum, m) => sum + Number(m.calories), 0);
  
  // 計算 TopBar 顯示所需的數據
  const currentParams = getParamsForDate(today, dynamicParams);
  const effectiveW = getEffectiveWeightForDate(today, weights);
  const metrics = effectiveW !== null && currentParams ? calculateMetrics(effectiveW, currentParams.height, calculateAge(profile.birthYear), profile?.gender, currentParams.activityFactor, currentParams.deficit) : null;
  const target = metrics?.target || 0;
  const remainingCal = target > 0 ? target - totalCal : (effectiveW === null ? '需量體重' : '-');

  // 計算連續達標天數
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

  const baseClasses = "fixed top-0 w-full max-w-md z-40 px-4 py-3 transition-all duration-500 backdrop-blur-md shadow-sm";
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
            Will Fit
            {isBleeding && <AlertTriangle size={18} className="text-yellow-300 animate-pulse" />}
          </h1>
          <div className="flex items-center text-xs space-x-3 mt-0.5 font-medium opacity-80">
            <span>{todayWeight ? `${todayWeight} kg` : '未量體重'}</span>
            <span>|</span>
            <span>剩餘 {remainingCal} kcal</span>
            <span>|</span>
            <span>🔥 {streak} 天達標</span>
          </div>
          {isBleeding && (
            <div className="text-xs font-bold text-yellow-300 mt-1 flex items-center animate-bounce">
              ⚠️ 已連續 {bleedingDays} 天嚴重超標！請注意飲食！
            </div>
          )}
        </div>

        {/* 右上角設定選單 */}
        <div className="relative z-50">
          <button 
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} 
            className="p-1.5 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Settings size={22} className={isBleeding ? "text-white" : "text-gray-700 dark:text-gray-300"} />
          </button>
          
          {isSettingsMenuOpen && (
            <>
              {/* 透明背景遮罩，點擊選單外自動關閉 */}
              <div className="fixed inset-0 z-40" onClick={() => setIsSettingsMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden text-gray-800 dark:text-gray-200 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => handleMenuClick('basicInfo')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  👤 修改基本資料
                </button>
                <button onClick={() => handleMenuClick('dynamicParams')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  ⚙️ 修改動態目標
                </button>
                <button onClick={() => handleMenuClick('backup')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors">
                  💾 資料備份與匯入
                </button>
                <button onClick={() => handleMenuClick('recentRecords')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  📊 近期歷史數據
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
const WeightTab = ({ profile, dynamicParams, weights, setWeights, activeDate, setActiveDate }) => {
  const date = activeDate;
  const setDate = setActiveDate;
  const [inputWeight, setInputWeight] = useState(weights[date] || '');
  const resultRef = useRef(null);
  const [showMetricsInfo, setShowMetricsInfo] = useState(false);
  const [chartMode, setChartMode] = useState('daily'); 

  useEffect(() => {
    setInputWeight(weights[date] || '');
  }, [date, weights]);

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
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500"/> 每日體重記錄</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">日期</label>
            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus-within:border-blue-500">
              <input type="date" 
                className="bg-transparent font-semibold text-lg outline-none w-full dark:[color-scheme:dark]"
                value={date} onChange={e => setDate(e.target.value)}
                max={getTodayStr()}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium shrink-0 ml-2">
                {getDayOfWeek(date)}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">體重 (kg)</label>
            <input type="number" step="0.1"
              className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 focus:border-blue-500 focus:ring-0 outline-none font-bold text-2xl"
              value={inputWeight} onChange={e => setInputWeight(e.target.value)}
              placeholder="0.0"
            />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-gray-900 dark:bg-blue-600 text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
            記錄儲存
          </button>
        </form>
      </Card>

      {metrics && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-none shadow-md overflow-hidden relative" >
           <div ref={resultRef} className="absolute -top-20"></div>
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">當日計算結果 (基於上週平均體重)</h3>
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
                <div className="text-xs text-gray-300 mb-1">攝取目標</div>
                <div className="font-bold text-xl">{metrics.target}</div>
              </div>
           </div>
           <div className="text-xs text-center mt-3 text-gray-400">
              使用計算體重: {effectiveW} kg (上一週平均或首週最早記錄)
           </div>
        </Card>
      )}

      <Modal isOpen={showMetricsInfo} onClose={() => setShowMetricsInfo(false)} title="計算算式與體重選取規則">
         <div className="space-y-4 text-sm">
            <div>
              <strong className="text-blue-600 dark:text-blue-400">攝取目標體重選取規則</strong>
              <p className="mt-1">本週每日的熱量目標，是以上一週的「平均體重」來計算；若為第一週或尚無前週記錄，則以系統內「最早記錄的那天體重」計算，確保減重計劃穩定。</p>
            </div>
            <div>
              <strong className="text-purple-600 dark:text-purple-400">BMR 與 TDEE</strong>
              <p className="mt-1">BMR 為基礎代謝率，TDEE 為總熱量消耗（BMR × 活動係數）。</p>
            </div>
            {metrics && (
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-xs leading-relaxed">
                <div>計算體重: {effectiveW} kg</div>
                <div>身高: {currentParams?.height} cm | 年齡: {age} 歲</div>
                <div className="mt-1 text-blue-500">TDEE = BMR({metrics.bmr}) × {currentParams?.activityFactor} = {metrics.tdee}</div>
                <div className="text-green-500">攝取目標 = {metrics.tdee} - {currentParams?.deficit} = {metrics.target} kcal</div>
              </div>
            )}
         </div>
      </Modal>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold">體重趨勢</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm">
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${chartMode === 'daily' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium' : 'text-gray-500'}`}
              onClick={() => setChartMode('daily')}
            >日</button>
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${chartMode === 'weekly' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium' : 'text-gray-500'}`}
              onClick={() => setChartMode('weekly')}
            >週平均</button>
          </div>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">尚無足夠數據繪製圖表</div>
        )}
      </Card>
    </div>
  );
};


// ==========================================
// 4. Diet Tab
// ==========================================
const DietTab = ({ profile, dynamicParams, weights, diets, setDiets, activeDate, setActiveDate }) => {
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
    e.target.value = ''; // 清空 input 讓下次可選同個檔案
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
    // 兼容舊資料的單一 photoUrl，轉換為陣列格式
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

  const confirmDelete = () => {
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
      
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ChevronLeft/></button>
        <div className="flex items-center gap-2">
          <input type="date" className="bg-transparent font-bold text-center outline-none dark:[color-scheme:dark]" 
            value={date} onChange={(e) => setDate(e.target.value)} max={getTodayStr()} />
          <span className="text-xs text-gray-500">{getDayOfWeek(date)}</span>
        </div>
        <button onClick={() => changeDate(1)} disabled={date === getTodayStr()} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl disabled:opacity-20"><ChevronRight/></button>
      </div>

      <Card className="text-center py-8 relative overflow-hidden">
        {target > 0 && totalCal >= target + 750 && <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 z-0"></div>}
        {target > 0 && totalCal <= target && <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 z-0"></div>}
        
        <div className="relative z-10">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">今日剩餘額度 (kcal)</div>
          <div className={`text-6xl font-black tracking-tighter mb-4 ${remaining < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
            {remaining !== null ? remaining : '-'}
          </div>
          
          <div className="flex justify-center items-center gap-4">
            <div className="text-sm">
              <div className="text-gray-400">目標</div>
              <div className="font-bold">{target || '需填體重'}</div>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center justify-center w-12 h-12">{getStatusIcon()}</div>
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            <div className="text-sm">
              <div className="text-gray-400">已攝取</div>
              <div className="font-bold text-blue-600 dark:text-blue-400">{totalCal}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-lg">飲食紀錄</h3>
          <button onClick={openAddModal} className="flex items-center gap-1 text-sm bg-gray-900 dark:bg-blue-600 text-white px-3 py-1.5 rounded-lg active:scale-95 shadow-sm">
            <Plus size={16} /> 新增
          </button>
        </div>

        {dayMeals.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <Utensils size={40} className="mx-auto mb-3 opacity-20" />
            <p>尚無紀錄，點擊新增</p>
          </div>
        ) : (
          dayMeals.map(meal => {
            const mealPhotos = meal.photos || (meal.photoUrl ? [meal.photoUrl] : []);
            return (
              <Card key={meal.id} className="flex flex-col gap-2 p-3 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm font-bold text-gray-400 dark:text-gray-500 w-12 text-center shrink-0">{meal.time}</div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer group-hover:opacity-80 transition-opacity" onClick={() => openEditModal(meal)} title="點擊修改餐點">
                    <div className="font-bold truncate text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
                      {meal.name} <Edit2 size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">{meal.calories} <span className="text-xs text-gray-500">kcal</span></div>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); setMealToDelete(meal.id); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors shrink-0" title="刪除">
                    <X size={20} />
                  </button>
                </div>
                
                {/* 顯示多圖預覽 */}
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingMealId ? "修改餐點" : "新增餐點"}>
        <form onSubmit={handleAddMeal} className="space-y-4 mt-2">
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">時間</label>
              <input type="time" required value={mealForm.time} onChange={e => setMealForm({...mealForm, time: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
            </div>
            <div className="w-2/3">
              <label className="block text-sm font-medium mb-1">熱量 (kcal)</label>
              <input type="number" step="10" required value={mealForm.calories} onChange={e => setMealForm({...mealForm, calories: e.target.value})} placeholder="例如: 450"
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">餐點名稱</label>
            <input type="text" required value={mealForm.name} onChange={e => setMealForm({...mealForm, name: e.target.value})} placeholder="例如: 排骨便當"
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">照片紀錄 (可上傳多張)</label>
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
                <span className="text-[10px] text-gray-400">加入照片</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-gray-900 dark:bg-blue-600 text-white font-bold text-lg shadow-lg">儲存紀錄</button>
        </form>
      </Modal>

      <Modal isOpen={!!photoPreview} onClose={() => setPhotoPreview(null)} title="照片檢視">
        {photoPreview && <img src={photoPreview} alt="large view" className="w-full rounded-lg" />}
      </Modal>

      <Modal isOpen={!!mealToDelete} onClose={() => setMealToDelete(null)} title="確認刪除">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">確定要刪除這筆餐點紀錄嗎？此動作無法復原。</p>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setMealToDelete(null)} className="w-1/2 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 font-bold">取消</button>
            <button onClick={confirmDelete} className="w-1/2 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg">確認刪除</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


// ==========================================
// 5. Dashboard (Settings & Stats with Quick Jump Buttons)
// ==========================================
const Dashboard = ({ profile, setProfile, dynamicParams, setDynamicParams, weights, diets, setWeights, setDiets, setCurrentTab, setActiveDate, scrollTarget, setScrollTarget }) => {
  const [showEditParams, setShowEditParams] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [paramForm, setParamForm] = useState({ height: '', deficit: '', activityFactor: '1.2' });
  const [profileForm, setProfileForm] = useState({ name: profile.name, gender: profile.gender, birthYear: profile.birthYear });
  const [showImport, setShowImport] = useState(false);
  
  const [showDeficitHelp, setShowDeficitHelp] = useState(false);
  const [showActivityHelp, setShowActivityHelp] = useState(false);
  const [sysMessage, setSysMessage] = useState(null); 

  const importRef = useRef(null);

  // Refs for quick-jump scrolling
  const basicInfoRef = useRef(null);
  const dynamicParamsRef = useRef(null);
  const backupRef = useRef(null);
  const recentRecordsRef = useRef(null);

  // 監聽來自 TopBar 的滾動請求
  useEffect(() => {
    if (scrollTarget) {
      setTimeout(() => {
        const refs = {
          basicInfo: basicInfoRef,
          dynamicParams: dynamicParamsRef,
          backup: backupRef,
          recentRecords: recentRecordsRef,
        };
        const targetRef = refs[scrollTarget];
        if (targetRef && targetRef.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setScrollTarget(null); // 滾動完畢後清除目標
      }, 150); // 給予一點緩衝時間讓 DOM 渲染完成
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
    setSysMessage('已儲存並建立新的生效日期設定！過去歷史計算不受影響。');
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
    // 改為輸出 JSON 結構，以完整支援多張 Base64 圖片
    const exportData = { weights: [], meals: [] };
    
    Object.entries(weights).forEach(([date, weight]) => {
      exportData.weights.push({ date, weight });
    });

    Object.entries(diets).forEach(([date, dayMeals]) => {
      dayMeals.forEach(m => {
        exportData.meals.push({
          date,
          time: m.time,
          name: m.name,
          calories: Number(m.calories),
          photos: m.photos || (m.photoUrl ? [m.photoUrl] : [])
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
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
              // 避免重複匯入，簡單檢查時間與名稱
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
        setSysMessage('資料匯入成功！已完整整合至目前資料庫中。');
        setShowImport(false);
      } catch (err) {
        setSysMessage('檔案格式錯誤或解析失敗。請確認您上傳的是標準的 JSON 格式檔案。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. Basic Info */}
      <div ref={basicInfoRef}>
        <Card className="flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none">
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-gray-400 text-sm">{profile.gender === 'male' ? '男性' : '女性'} • {calculateAge(profile.birthYear)} 歲</p>
          </div>
          <button onClick={() => setShowEditProfile(true)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            修改資料
          </button>
        </Card>
      </div>

      {/* 2. Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <div className="text-xs text-gray-500 mb-1">連續達標</div>
          <div className="text-2xl font-black text-orange-500">{stats.currentStreak} <span className="text-sm font-normal text-gray-400">天</span></div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-xs text-gray-500 mb-1">最長連勝</div>
          <div className="text-2xl font-black">{stats.maxStreak} <span className="text-sm font-normal text-gray-400">天</span></div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-xs text-gray-500 mb-1">日均熱量</div>
          <div className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.avgCal}</div>
        </Card>
      </div>

      {/* 3. Heatmap */}
      <Heatmap diets={diets} weights={weights} dynamicParams={dynamicParams} profile={profile} setCurrentTab={setCurrentTab} setActiveDate={setActiveDate} />

      {/* 4. Dynamic Params Section */}
      <div ref={dynamicParamsRef}>
        <Card className="flex justify-between items-center">
          <div>
            <div className="font-bold text-base">動態目標設定</div>
            <div className="text-xs text-gray-500 mt-0.5">身高: {dynamicParams[0]?.height}cm | 赤字: {dynamicParams[0]?.deficit}kcal</div>
          </div>
          <button onClick={() => setShowEditParams(true)} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl">
            新增生效目標
          </button>
        </Card>
      </div>

      {/* 5. Recent Records List */}
      <div ref={recentRecordsRef}>
        <Card>
          <h3 className="font-bold mb-4">近期歷史數據</h3>
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
                      title="雙擊前往修改體重">
                      {w ? `${w} kg` : '+ 體重'}
                    </span>
                    <span onDoubleClick={() => { setActiveDate(d); setCurrentTab('diet'); }}
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded transition-colors font-medium text-purple-600 dark:text-purple-400"
                      title="雙擊前往修改餐點">
                      {mealsCount > 0 ? `${mealsCount} 筆餐點` : '+ 餐點'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 6. Backup & Import with InfoButton */}
      <div ref={backupRef}>
        <Card className="bg-blue-50/50 dark:bg-gray-800/80 border-blue-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">資料備份與匯入<span className="text-xs font-normal text-gray-500 ml-1">(其他APP也可，詳見「i」)</span></h3>
            <InfoButton onClick={() => setShowImport(true)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow text-blue-600 dark:text-blue-400">
              <Download size={24} className="mb-2" />
              <span className="text-sm font-medium">匯出 (.json)</span>
            </button>
            <button onClick={() => setShowImport(true)} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700 dark:text-gray-300">
              <Upload size={24} className="mb-2" />
              <span className="text-sm font-medium">資料匯入</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="修改基本資料">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">性別</label>
              <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none">
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">出生年</label>
              <input type="number" step="1" required value={profileForm.birthYear} onChange={e => setProfileForm({...profileForm, birthYear: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg">儲存變更</button>
        </form>
      </Modal>

      <Modal isOpen={showEditParams} onClose={() => setShowEditParams(false)} title="修改動態目標">
        <form onSubmit={handleSaveParams} className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm mb-4">
            儲存後將建立新的生效日期設定，過去歷史計算不受影響。
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">身高 (cm)</label>
            <input type="number" step="0.5" required value={paramForm.height} onChange={e => setParamForm({...paramForm, height: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              赤字目標 (kcal) <InfoButton onClick={() => setShowDeficitHelp(true)} />
            </label>
            <input type="number" step="50" required value={paramForm.deficit} onChange={e => setParamForm({...paramForm, deficit: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none" />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              活動係數 <InfoButton onClick={() => setShowActivityHelp(true)} />
            </label>
            <select value={paramForm.activityFactor} onChange={e => setParamForm({...paramForm, activityFactor: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none">
              {ACTIVITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg">儲存新目標</button>
        </form>
      </Modal>

      <Modal isOpen={showDeficitHelp} onClose={() => setShowDeficitHelp(false)} title="什麼是赤字目標？">
        <DeficitHelpContent />
      </Modal>

      <Modal isOpen={showActivityHelp} onClose={() => setShowActivityHelp(false)} title="如何選擇活動係數？">
        <ActivityHelpContent />
      </Modal>

      <Modal isOpen={!!sysMessage} onClose={() => setSysMessage(null)} title="系統提示">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 font-medium">{sysMessage}</p>
          <button onClick={() => setSysMessage(null)} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg mt-4">確認</button>
        </div>
      </Modal>

      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title="資料備份與匯入教學">
        <div className="space-y-4 text-sm">
          <p>我們支援完整的 <strong>JSON 格式</strong> 匯入。你可以複製以下 Prompt 交給 AI（如 ChatGPT 或 Gemini），讓它幫你將其他 APP 的雜亂紀錄轉換為可直接匯入的格式：</p>
          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-[10px] sm:text-xs overflow-x-auto whitespace-pre-wrap select-all border border-gray-200 dark:border-gray-700 font-mono text-gray-700 dark:text-gray-300">
{`我有一份從其他 APP 匯出的飲食與體重紀錄（包含圖片與表格數據）。請幫我過濾掉無關資訊（如心率、步數、睡眠等），並將所有內容嚴格轉換為符合以下 JSON 格式的純文字內容：

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
2. 照片內容與名稱比對：若缺乏明確時間標籤，請分析照片中的食物內容，與表格中的餐點名稱（例如：辨識出便當照片 ➔ 自動配對至「雞腿便當」）進行語意邏輯對應。
3. 多張圖片處理：若同一餐對應到多張照片，請將所有對應圖片轉換為 Base64 字串，並統一存放在 "photos" 陣列中；若該餐無照片，則 "photos" 欄位請留為空陣列 []。
4. 無法確認時：若完全無法確定某張照片屬於哪一餐，請勿隨意猜測填入，直接忽略該張無法對應的照片即可。

【注意事項】
請直接輸出完整的 JSON 文字內容即可，不要加上任何 Markdown 說明文字或額外的解釋。`}
          </div>
          <div className="pt-2">
             <input type="file" accept=".json" ref={importRef} className="hidden" onChange={handleImport} />
             <button onClick={() => importRef.current.click()} className="w-full py-4 rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg">
               <Upload size={20} /> 選擇 JSON 檔案並匯入
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};


// --- Heatmap Component ---
const Heatmap = ({ diets, weights, dynamicParams, profile, setCurrentTab, setActiveDate }) => {
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
      <h3 className="font-bold mb-4">飲食達成率 (近30天)</h3>
      <div className="grid grid-cols-7 gap-2">
        {gridData.map((day) => {
          let bg = 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
          if (day.status === 'ok') bg = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] border-none';
          if (day.status === 'over') bg = 'bg-red-400 border-none';
          if (day.status === 'skull') bg = 'bg-red-900 border-2 border-red-500 animate-pulse';

          return (
            <div 
              key={day.date} 
              onClick={() => handleBlockClick(day)}
              className={`relative group aspect-square rounded-md ${bg} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
            >
               {day.status === 'skull' && <span className="text-[10px]">☠️</span>}
               <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                 <div className="font-bold text-center">{day.date}</div>
                 <div className="text-gray-300">雙擊修改查看</div>
               </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 flex gap-4 justify-center text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500"></div> 達標</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-400"></div> 超標</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-900 border border-red-500"></div> 嚴重</div>
      </div>

      {selectedInfo && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-center animate-in fade-in">
          <strong>{selectedInfo.date}</strong> 
          <span className="mx-2">|</span> 
          攝取 {selectedInfo.cal} kcal ({selectedInfo.meals} 筆)
          <div className="text-xs text-gray-400 mt-1">(雙擊方塊可前往紀錄頁面)</div>
        </div>
      )}
    </Card>
  );
};


// ==========================================
// 6. Bottom Navigation
// ==========================================
const BottomNav = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'weight', icon: TrendingUp, label: '體重' },
    { id: 'diet', icon: Utensils, label: '飲食' },
    { id: 'dashboard', icon: Home, label: '記錄' },
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
