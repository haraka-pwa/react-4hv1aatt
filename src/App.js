import React, { useState, useEffect } from 'react';
import {
  Calculator,
  LayoutDashboard,
  Settings,
  Truck,
  MapPin,
  Fuel,
  DollarSign,
  Calendar,
  Trash2,
  Edit,
  Plus,
  Coins,
  Zap,
} from 'lucide-react';

const InputField = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  inputMode = 'text',
  placeholder,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-indigo-200 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all shadow-inner"
      />
    </div>
  </div>
);

export default function AgroLogisticsApp() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [trips, setTrips] = useState([]);

  const [settings, setSettings] = useState({
    pricePerKm: 3.5,
    pricePerTon: 450,
    driverSalaryPercent: 15,
    amortizationPerKm: 2.0,
    fuelConsumption: 32,
    fuelPrice: 52.5,
    downtimePrice: 1500,
  });

  const [currentCargo, setCurrentCargo] = useState({
    id: null,
    route: 'Новоархангельськ - Одеса',
    culture: 'Соняшник',
    weight: 25.5,
    distance: 310,
    isRoundTrip: true,
    downtimeDays: 0,
    calculationType: 'tkm',
  });
  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem('agroTrips')) || [];
    const savedSettings = JSON.parse(localStorage.getItem('agroSettings'));
    if (savedTrips.length) setTrips(savedTrips);
    if (savedSettings) setSettings((prev) => ({ ...prev, ...savedSettings }));
  }, []);

  useEffect(() => {
    localStorage.setItem('agroTrips', JSON.stringify(trips));
    localStorage.setItem('agroSettings', JSON.stringify(settings));
  }, [trips, settings]);

  const handleSettingChange = (key, value) => {
    const val = value === '' ? '' : parseFloat(value);
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleCargoChange = (key, value) => {
    const numKeys = ['weight', 'distance', 'downtimeDays'];
    let val = value;
    if (numKeys.includes(key)) {
      val = value === '' ? '' : parseFloat(value);
    }
    setCurrentCargo((prev) => ({ ...prev, [key]: val }));
  };

  const calculateEconomics = () => {
    const weight = Number(currentCargo.weight) || 0;
    const distance = Number(currentCargo.distance) || 0;
    const downtime = Number(currentCargo.downtimeDays) || 0;
    const totalDistance = currentCargo.isRoundTrip ? distance * 2 : distance;

    let baseRevenue = 0;
    if (currentCargo.calculationType === 'tkm') {
      baseRevenue = weight * distance * (Number(settings.pricePerKm) || 0);
    } else {
      baseRevenue = weight * (Number(settings.pricePerTon) || 0);
    }

    const downtimeRevenue = downtime * (Number(settings.downtimePrice) || 0);
    const grossRevenue = baseRevenue + downtimeRevenue;

    const fuelLiters =
      (totalDistance / 100) * (Number(settings.fuelConsumption) || 0);
    const fuelCost = fuelLiters * (Number(settings.fuelPrice) || 0);

    const driverSalary =
      grossRevenue * ((Number(settings.driverSalaryPercent) || 0) / 100);
    const amortization =
      totalDistance * (Number(settings.amortizationPerKm) || 0);

    const totalExpenses = fuelCost + driverSalary + amortization;
    const netProfit = grossRevenue - totalExpenses;

    return {
      grossRevenue,
      fuelCost,
      fuelLiters,
      driverSalary,
      amortization,
      netProfit,
      downtimeRevenue,
    };
  };

  const econ = calculateEconomics();
  const saveTrip = () => {
    if (!currentCargo.route) return alert('Введіть маршрут!');
    const newTrip = {
      ...currentCargo,
      id: currentCargo.id || Date.now(),
      date: new Date().toLocaleDateString('uk-UA'),
      finances: econ,
    };

    if (currentCargo.id) {
      setTrips(trips.map((t) => (t.id === currentCargo.id ? newTrip : t)));
    } else {
      setTrips([newTrip, ...trips]);
    }

    setCurrentCargo({ ...currentCargo, id: null });
    setActiveTab('dashboard');
  };

  const editTrip = (trip) => {
    setCurrentCargo(trip);
    setActiveTab('calculator');
  };

  const deleteTrip = (id) => {
    if (window.confirm('Видалити цей рейс?')) {
      setTrips(trips.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1c2c] to-black text-white pb-24 font-sans selection:bg-fuchsia-500/30">
      {/* HEADER (Фіксований) */}
      <div className="sticky top-0 z-40 pb-4 pt-6 px-6 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500">
          Калькулятор <span className="text-white">Маршруту</span>
        </h1>
        <p className="text-indigo-200/70 text-xs mt-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-fuchsia-400" />
          Agro Logistics Pro
        </p>
      </div>

      <div className="px-5 mt-6">
        {/* TAB: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Truck className="w-6 h-6 text-cyan-400" />
                  {currentCargo.id ? 'Редагувати рейс' : 'Новий рейс'}
                </h2>
                {currentCargo.id && (
                  <button
                    onClick={() =>
                      setCurrentCargo({ ...currentCargo, id: null })
                    }
                    className="text-xs bg-white/10 px-3 py-1.5 rounded-full text-indigo-200 hover:text-white transition-colors"
                  >
                    Скасувати
                  </button>
                )}
              </div>

              <div className="flex p-1 bg-black/40 rounded-2xl mb-6 border border-white/5">
                <button
                  onClick={() => handleCargoChange('calculationType', 'tkm')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    currentCargo.calculationType === 'tkm'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  По Тонно-КМ
                </button>
                <button
                  onClick={() => handleCargoChange('calculationType', 'ton')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    currentCargo.calculationType === 'ton'
                      ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/25'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  Фікса за Тонну
                </button>
              </div>

              <InputField
                label="Маршрут"
                icon={MapPin}
                value={currentCargo.route}
                onChange={(e) => handleCargoChange('route', e.target.value)}
                placeholder="Звідки - Куди"
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-indigo-200 mb-1.5">
                  Вантаж (Культура)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-xl pl-1">🌾</span>
                  </div>
                  <select
                    value={currentCargo.culture}
                    onChange={(e) =>
                      handleCargoChange('culture', e.target.value)
                    }
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none shadow-inner"
                  >
                    <option className="bg-slate-900">Соняшник</option>
                    <option className="bg-slate-900">Пшениця</option>
                    <option className="bg-slate-900">Кукурудза</option>
                    <option className="bg-slate-900">Ріпак</option>
                    <option className="bg-slate-900">Соя</option>
                    <option className="bg-slate-900">Ячмінь</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Вага (т)"
                  icon={Settings}
                  type="number"
                  inputMode="decimal"
                  value={currentCargo.weight}
                  onChange={(e) => handleCargoChange('weight', e.target.value)}
                  placeholder="0.0"
                />
                <InputField
                  label="Відстань (км)"
                  icon={MapPin}
                  type="number"
                  inputMode="decimal"
                  value={currentCargo.distance}
                  onChange={(e) =>
                    handleCargoChange('distance', e.target.value)
                  }
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
                <span className="font-medium text-indigo-100 flex items-center gap-2">
                  Кругорейс (Рахувати пальне х2)
                </span>
                <input
                  type="checkbox"
                  checked={currentCargo.isRoundTrip}
                  onChange={(e) =>
                    handleCargoChange('isRoundTrip', e.target.checked)
                  }
                  className="w-6 h-6 rounded-md accent-fuchsia-500 bg-white/10 border-white/20"
                />
              </div>

              <InputField
                label="Простій (Днів)"
                icon={Calendar}
                type="number"
                inputMode="decimal"
                value={currentCargo.downtimeDays}
                onChange={(e) =>
                  handleCargoChange('downtimeDays', e.target.value)
                }
                placeholder="0"
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h3 className="text-indigo-200 font-medium mb-4 flex items-center gap-2 relative z-10">
                <Coins className="w-5 h-5 text-fuchsia-400" /> Економіка рейсу
              </h3>
              <div className="space-y-3 relative z-10 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-indigo-200">
                    Дохід (Фрахт + Простій):
                  </span>
                  <span className="font-bold text-lg text-white">
                    {econ.grossRevenue.toFixed(0)} ₴
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-rose-300/80">
                    Пальне ({econ.fuelLiters.toFixed(0)} л):
                  </span>
                  <span className="text-rose-200">
                    -{econ.fuelCost.toFixed(0)} ₴
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-rose-300/80">
                    Зарплата водія ({settings.driverSalaryPercent}%):
                  </span>
                  <span className="text-rose-200">
                    -{econ.driverSalary.toFixed(0)} ₴
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5 pb-3">
                  <span className="text-rose-300/80">Амортизація авто:</span>
                  <span className="text-rose-200">
                    -{econ.amortization.toFixed(0)} ₴
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-indigo-100">
                    Чистий прибуток:
                  </span>
                  <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                    {econ.netProfit.toFixed(0)} ₴
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={saveTrip}
              className="w-full py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 hover:opacity-90 shadow-[0_0_20px_rgba(192,38,211,0.3)] text-white transition-all transform hover:scale-[0.98] active:scale-[0.95]"
            >
              {currentCargo.id ? 'Оновити Рейс' : 'Зберегти Рейс у Базу'}
            </button>
          </div>
        )}
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Історія Рейсів</h2>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/5 backdrop-blur-md">
                Всього: {trips.length}
              </span>
            </div>
            {trips.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <Truck className="w-16 h-16 text-indigo-500/30 mx-auto mb-4" />
                <p className="text-indigo-200">
                  База порожня. Додайте перший рейс.
                </p>
              </div>
            ) : (
              trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-3xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 flex gap-2">
                    <button
                      onClick={() => editTrip(trip)}
                      className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl hover:bg-indigo-500/40 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="p-2 bg-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-500/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-indigo-400/70 font-semibold uppercase tracking-wider mb-2">
                    {trip.date}
                  </div>
                  <h3 className="font-bold text-lg text-white pr-20">
                    {trip.route}
                  </h3>
                  <div className="text-sm text-indigo-200 mt-1 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-500/20 px-2 py-1 rounded-lg text-indigo-200">
                      🌾 {trip.culture}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-lg">
                      {trip.weight} т
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-lg">
                      {trip.distance} км
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div>
                      <div className="text-xs text-indigo-300/70 mb-1">
                        Брудними
                      </div>
                      <div className="text-sm text-white font-medium">
                        {trip.finances.grossRevenue.toFixed(0)} ₴
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-emerald-400/70 mb-1 uppercase tracking-wider font-bold">
                        Чистими
                      </div>
                      <div className="text-xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                        +{trip.finances.netProfit.toFixed(0)} ₴
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Конструктор Тарифів
              </h2>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl space-y-2">
              <h3 className="text-cyan-400 font-semibold mb-4 text-sm uppercase tracking-widest">
                Дохідна частина
              </h3>
              <InputField
                label="Тариф за 1 Тонно-КМ (грн)"
                icon={DollarSign}
                type="number"
                inputMode="decimal"
                value={settings.pricePerKm}
                onChange={(e) =>
                  handleSettingChange('pricePerKm', e.target.value)
                }
              />
              <InputField
                label="Тариф за 1 Тонну (грн)"
                icon={DollarSign}
                type="number"
                inputMode="decimal"
                value={settings.pricePerTon}
                onChange={(e) =>
                  handleSettingChange('pricePerTon', e.target.value)
                }
              />
              <InputField
                label="Оплата за простій (грн/день)"
                icon={Calendar}
                type="number"
                inputMode="decimal"
                value={settings.downtimePrice}
                onChange={(e) =>
                  handleSettingChange('downtimePrice', e.target.value)
                }
              />
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl space-y-2">
              <h3 className="text-fuchsia-400 font-semibold mb-4 text-sm uppercase tracking-widest">
                Витратна частина
              </h3>
              <InputField
                label="Ціна пального (грн/л)"
                icon={Fuel}
                type="number"
                inputMode="decimal"
                value={settings.fuelPrice}
                onChange={(e) =>
                  handleSettingChange('fuelPrice', e.target.value)
                }
              />
              <InputField
                label="Витрата пального (л/100км)"
                icon={Fuel}
                type="number"
                inputMode="decimal"
                value={settings.fuelConsumption}
                onChange={(e) =>
                  handleSettingChange('fuelConsumption', e.target.value)
                }
              />
              <InputField
                label="Зарплата водія (% від брудних)"
                icon={Settings}
                type="number"
                inputMode="decimal"
                value={settings.driverSalaryPercent}
                onChange={(e) =>
                  handleSettingChange('driverSalaryPercent', e.target.value)
                }
              />
              <InputField
                label="Амортизація авто (грн/км)"
                icon={Settings}
                type="number"
                inputMode="decimal"
                value={settings.amortizationPerKm}
                onChange={(e) =>
                  handleSettingChange('amortizationPerKm', e.target.value)
                }
              />
            </div>
            <div className="h-10"></div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 w-full bg-[#0a0c16]/80 backdrop-blur-2xl border-t border-white/5 pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {[
            {
              id: 'calculator',
              icon: Plus,
              label: 'Новий Рейс',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10',
            },
            {
              id: 'dashboard',
              icon: LayoutDashboard,
              label: 'Мої Рейси',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              id: 'settings',
              icon: Settings,
              label: 'Тарифи',
              color: 'text-fuchsia-400',
              bg: 'bg-fuchsia-500/10',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-3 rounded-2xl min-w-[90px] transition-all duration-300 ${
                activeTab === tab.id
                  ? `${tab.bg} scale-105`
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <tab.icon
                className={`w-6 h-6 mb-1 ${
                  activeTab === tab.id ? tab.color : 'text-indigo-200'
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-wide uppercase ${
                  activeTab === tab.id ? tab.color : 'text-indigo-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@supports (padding-bottom: env(safe-area-inset-bottom)) { .pb-safe { padding-bottom: env(safe-area-inset-bottom); } }`,
        }}
      />
    </div>
  );
}
