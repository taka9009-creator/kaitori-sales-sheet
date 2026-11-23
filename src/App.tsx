import React, { useState, useEffect, useMemo } from 'react';
import {
  TableProperties, Gavel, BarChart3, Layers, Calendar, Plus, ArrowRightLeft
} from 'lucide-react';
import {
  DealRecord, MarketItem, AdCosts, GoldPreset,
  INITIAL_RECORDS, INITIAL_MARKET_ITEMS, INITIAL_AD_COSTS, INITIAL_MONTHS,
  formatCurrency, calcRecordSales
} from './data';
import { SheetHeader, LedgerSheet } from './components/LedgerSheet';
import { MarketView, StaffAnalyticsView, MediaAnalyticsView } from './components/MarketAndAnalytics';
import { AddDealModal, GoldCalcModal, ExportModal } from './components/Modals';

const STORAGE_KEYS = {
  RECORDS: 'kaitori_pro_records_v3',
  MARKET: 'kaitori_pro_market_v3',
  TITLE: 'kaitori_pro_title_v3',
  AD_COSTS: 'kaitori_pro_adcosts_v3',
  PREV_CARRYOVER: 'kaitori_pro_prev_carryover_v3',
  MONTHS: 'kaitori_pro_months_v3',
  TARGET_GROSS: 'kaitori_pro_target_gross_v3',
};

export default function App() {
  const [sheetTitle, setSheetTitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TITLE) || '松浦売上管理表';
  });

  const [months, setMonths] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHS);
      return saved ? JSON.parse(saved) : INITIAL_MONTHS;
    } catch {
      return INITIAL_MONTHS;
    }
  });

  const [activeMonth, setActiveMonth] = useState<string>('2026/9');
  const [activeTab, setActiveTab] = useState<string>('ledger'); // 'ledger' | '市場管理' | 'スタッフ別集計' | '媒体別分析' | '繰越管理'
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const [targetGrossProfit, setTargetGrossProfit] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TARGET_GROSS);
    return saved ? Number(saved) : 0;
  });

  const [records, setRecords] = useState<DealRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  const [history, setHistory] = useState<DealRecord[][]>(() => [records]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MARKET);
      return saved ? JSON.parse(saved) : INITIAL_MARKET_ITEMS;
    } catch {
      return INITIAL_MARKET_ITEMS;
    }
  });

  const [adCosts, setAdCosts] = useState<AdCosts>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AD_COSTS);
      return saved ? JSON.parse(saved) : INITIAL_AD_COSTS;
    } catch {
      return INITIAL_AD_COSTS;
    }
  });

  const [prevCarryover, setPrevCarryover] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREV_CARRYOVER);
    return saved ? Number(saved) : 0;
  });

  const [selectedStaff, setSelectedStaff] = useState<string>('全員');
  const [showOnlyCarryover, setShowOnlyCarryover] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isGoldOpen, setIsGoldOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [goldPreset, setGoldPreset] = useState<GoldPreset | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>('変更を自動保存済');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      localStorage.setItem(STORAGE_KEYS.MARKET, JSON.stringify(marketItems));
      localStorage.setItem(STORAGE_KEYS.TITLE, sheetTitle);
      localStorage.setItem(STORAGE_KEYS.AD_COSTS, JSON.stringify(adCosts));
      localStorage.setItem(STORAGE_KEYS.PREV_CARRYOVER, String(prevCarryover));
      localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(months));
      localStorage.setItem(STORAGE_KEYS.TARGET_GROSS, String(targetGrossProfit));
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedText(`自動保存済 (${timeStr})`);
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  }, [records, marketItems, sheetTitle, adCosts, prevCarryover, months, targetGrossProfit]);

  const currentMonthRecords = useMemo(
    () => records.filter(r => (r.month || '2026/9') === activeMonth),
    [records, activeMonth]
  );

  const pushRecordsState = (nextRecords: DealRecord[]) => {
    const sliced = history.slice(0, historyIndex + 1);
    sliced.push(nextRecords);
    setHistory(sliced);
    setHistoryIndex(sliced.length - 1);
    setRecords(nextRecords);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setRecords(history[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setRecords(history[nextIdx]);
    }
  };

  const handleAddRecord = (rec: DealRecord) => {
    const withMonth = { ...rec, month: rec.month || activeMonth };
    pushRecordsState([withMonth, ...records]);
    setGoldPreset(null);
  };

  const handleUpdateRecord = (rec: DealRecord) => {
    pushRecordsState(records.map(r => (r.id === rec.id ? rec : r)));
  };

  const handleDeleteRecord = (id: string) => {
    pushRecordsState(records.filter(r => r.id !== id));
  };

  const handleDuplicateRecord = (rec: DealRecord) => {
    const copy: DealRecord = {
      ...rec,
      id: `rec-${Date.now()}`,
      customerName: `${rec.customerName} (複製)`,
    };
    const idx = records.findIndex(r => r.id === rec.id);
    const next = [...records];
    next.splice(idx + 1, 0, copy);
    pushRecordsState(next);
  };

  const handleApplyGoldToDeal = (preset: GoldPreset) => {
    setGoldPreset(preset);
    setIsAddOpen(true);
  };

  const handleAddNextMonth = () => {
    const last = months[months.length - 1] || '2026/10';
    const [y, m] = last.split('/').map(Number);
    const nextY = m === 12 ? y + 1 : y;
    const nextM = m === 12 ? 1 : m + 1;
    const nextLabel = `${nextY}/${nextM}`;
    if (!months.includes(nextLabel)) {
      setMonths([...months, nextLabel]);
    }
    setActiveMonth(nextLabel);
    setActiveTab('ledger');
  };

  const handleCarryoverToNextMonth = (fromMonth: string, toMonth: string) => {
    const sourceCarryovers = records.filter(r => (r.month || '2026/9') === fromMonth && r.carryover > 0);
    if (sourceCarryovers.length === 0) {
      alert(`${fromMonth} には翌月繰越（未売却在庫）案件がありません。`);
      return;
    }
    const monthNum = toMonth.split('/')[1] || '10';
    const newRecords: DealRecord[] = sourceCarryovers.map((r, i) => ({
      ...r,
      id: `rec-carry-${Date.now()}-${i}`,
      month: toMonth,
      date: `${monthNum}/1`,
      purchaseAmount: 0, // 仕入は前月計上済みのため0円（繰越在庫評価額を引き継ぎ）
      goldSales: 0,
      marketSales: 0,
      yahooSales: 0,
      recoverySales: 0,
      estimatedGoldGrossProfit: 0,
      estimatedYahooGrossProfit: 0,
      transportCost: 0,
      disposalCost: 0,
      status: '全量繰越(未売却)',
      memo: `[${fromMonth}より繰越引継 (元仕入¥${formatCurrency(r.purchaseAmount)})] ${r.memo || ''}`,
    }));
    pushRecordsState([...newRecords, ...records]);
    setActiveMonth(toMonth);
    setActiveTab('ledger');
    alert(`${fromMonth} の未売却繰越案件 ${newRecords.length}件 を ${toMonth} シートへ引き継ぎました！`);
  };

  const handleSyncMarketToLedger = (item: MarketItem) => {
    if (item.actualSoldPrice === null) return;
    const netProceeds = Math.round(item.actualSoldPrice * (1 - item.commissionRate / 100));
    if (item.linkedDealId) {
      const target = records.find(r => r.id === item.linkedDealId);
      if (target) {
        handleUpdateRecord({
          ...target,
          marketSales: netProceeds,
          carryover: 0,
          status: '完結',
          memo: `${target.memo} [市場落札反映: ¥${formatCurrency(item.actualSoldPrice)} / 手数料控除後 ¥${formatCurrency(netProceeds)}]`,
        });
        alert(`当月台帳（${target.customerName}）の市場売上に ¥${formatCurrency(netProceeds)}（手数料控除後）を反映し、ステータスを「完結」に更新しました！`);
        return;
      }
    }
    const newRec: DealRecord = {
      id: `rec-mkt-${Date.now()}`,
      month: activeMonth,
      date: item.auctionDate.slice(5) || `${activeMonth.split('/')[1]}/28`,
      staff: item.staff,
      customerName: `市場落札: ${item.targetMarketName}`,
      area: '',
      category: item.itemDescription,
      purchaseAmount: item.purchaseCost,
      media: 'チラシ',
      carryover: 0,
      marketSales: netProceeds,
      goldSales: 0,
      yahooSales: 0,
      recoverySales: 0,
      estimatedGoldGrossProfit: 0,
      estimatedYahooGrossProfit: 0,
      transportCost: 0,
      disposalCost: 0,
      memo: `${item.targetMarketName}にて落札(額面¥${formatCurrency(item.actualSoldPrice)}・手数料${item.commissionRate}%)`,
      status: '完結',
    };
    pushRecordsState([newRec, ...records]);
    alert(`${activeMonth} 台帳に市場落札データ（¥${formatCurrency(netProceeds)}）を新規計上しました！`);
  };

  const handleResetDefault = () => {
    setRecords([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setMarketItems([]);
    setAdCosts({
      松浦: 0,
      mediaCosts: {
        チラシ: 0,
        HP: 0,
        リピート: 0,
        紹介: 0,
        '看板/その他': 0,
      },
    });
    setPrevCarryover(0);
    setTargetGrossProfit(0);
    setSelectedStaff('全員');
    setShowOnlyCarryover(false);
  };

  const handleUpdateStaffAdCost = (_staff: '松浦', val: number) => {
    setAdCosts(prev => ({
      ...prev,
      松浦: val,
      mediaCosts: {
        ...prev.mediaCosts,
        チラシ: val,
      },
    }));
  };

  const handleUpdateMediaAdCost = (media: string, val: number) => {
    setAdCosts(prev => {
      const nextMediaCosts = {
        ...prev.mediaCosts,
        [media]: val,
      };
      const totalMediaAd = Object.values(nextMediaCosts).reduce((s, v) => s + v, 0);
      return {
        ...prev,
        松浦: totalMediaAd,
        mediaCosts: nextMediaCosts,
      };
    });
  };

  const totalSales = currentMonthRecords.reduce((s, r) => s + calcRecordSales(r), 0);
  const totalPurchase = currentMonthRecords.reduce((s, r) => s + r.purchaseAmount, 0);
  const totalGross = totalSales - totalPurchase;
  const carryoverRecords = currentMonthRecords.filter(r => r.carryover > 0);
  const currentCarryoverSum = carryoverRecords.reduce((s, r) => s + r.carryover, 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 font-sans">
      <SheetHeader
        sheetTitle={sheetTitle}
        onTitleChange={setSheetTitle}
        onOpenAddModal={() => {
          setGoldPreset(null);
          setIsAddOpen(true);
        }}
        onOpenGoldCalc={() => setIsGoldOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        showOnlyCarryover={showOnlyCarryover}
        onToggleCarryoverFilter={() => setShowOnlyCarryover(!showOnlyCarryover)}
        selectedStaff={selectedStaff}
        onSelectStaff={setSelectedStaff}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        lastSavedText={lastSavedText}
        onResetDefault={handleResetDefault}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === 'ledger' && (
          <LedgerSheet
            records={currentMonthRecords}
            adCosts={adCosts}
            currentMonth={activeMonth}
            targetGrossProfit={targetGrossProfit}
            onUpdateTargetGrossProfit={setTargetGrossProfit}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onDuplicateRecord={handleDuplicateRecord}
            onOpenAddModal={() => {
              setGoldPreset(null);
              setIsAddOpen(true);
            }}
            selectedStaff={selectedStaff}
            showOnlyCarryover={showOnlyCarryover}
            onUpdateStaffAdCost={handleUpdateStaffAdCost}
            viewMode={viewMode}
          />
        )}

        {activeTab === '市場管理' && (
          <MarketView
            items={marketItems}
            onAddItem={item => setMarketItems([...marketItems, item])}
            onUpdateItem={item => setMarketItems(marketItems.map(m => (m.id === item.id ? item : m)))}
            onDeleteItem={id => setMarketItems(marketItems.filter(m => m.id !== id))}
            onSyncToLedger={handleSyncMarketToLedger}
          />
        )}

        {activeTab === 'スタッフ別集計' && (
          <StaffAnalyticsView
            records={currentMonthRecords}
            adCosts={adCosts}
            onUpdateStaffAdCost={handleUpdateStaffAdCost}
          />
        )}

        {activeTab === '媒体別分析' && (
          <MediaAnalyticsView
            records={currentMonthRecords}
            adCosts={adCosts}
            onUpdateMediaAdCost={handleUpdateMediaAdCost}
          />
        )}

        {activeTab === '繰越管理' && (
          <div className="flex-1 overflow-auto bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">月次繰越在庫・未売却プール引き継ぎ管理 ({activeMonth})</h3>
                      <p className="text-xs text-gray-500">前月からの繰越在庫評価額と、翌月シートへの1クリック繰越引き継ぎ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {months.length > 1 && (
                      <button
                        onClick={() => {
                          const idx = months.indexOf(activeMonth);
                          const nextMonth = idx < months.length - 1 ? months[idx + 1] : months[months.length - 1];
                          if (nextMonth === activeMonth) {
                            alert('先に画面下の「＋月追加」ボタンで翌月シートを作成してください。');
                            return;
                          }
                          handleCarryoverToNextMonth(activeMonth, nextMonth);
                        }}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>{activeMonth} の繰越案件を翌月シートへ引き継ぐ</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('ledger')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      {activeMonth} 台帳に戻る
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                    <div className="text-purple-800 font-semibold mb-1">前月確定繰越金 (編集可)</div>
                    <div className="flex items-center gap-1">
                      <span className="text-purple-700 font-bold text-base">¥</span>
                      <input
                        type="number"
                        value={prevCarryover}
                        onChange={e => setPrevCarryover(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-white border border-purple-300 rounded font-mono text-base font-bold text-purple-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="text-blue-800 font-semibold mb-1">{activeMonth} 発生 翌月繰越枠</div>
                    <div className="font-mono text-xl font-bold text-blue-900">¥{formatCurrency(currentCarryoverSum)}</div>
                    <div className="text-[11px] text-blue-700 mt-1">対象案件: {carryoverRecords.length} 件</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="text-emerald-800 font-semibold mb-1">累計在庫プール総額</div>
                    <div className="font-mono text-xl font-bold text-emerald-900">
                      ¥{formatCurrency(prevCarryover + currentCarryoverSum)}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">前月繰越 + 当月繰越合計</div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-700">
                    {activeMonth} 未売却・繰越在庫案件リスト
                  </div>
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200 text-center">
                        <th className="py-2 px-3 border-r">日付</th>
                        <th className="py-2 px-3 border-r">担当</th>
                        <th className="py-2 px-3 border-r text-left">お客様名</th>
                        <th className="py-2 px-3 border-r text-left">品目カテゴリ</th>
                        <th className="py-2 px-3 border-r text-right">買取仕入額</th>
                        <th className="py-2 px-3 border-r text-right text-purple-800">翌月繰越評価額</th>
                        <th className="py-2 px-3 text-left">状態・メモ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {carryoverRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-gray-400 font-sans">
                            未売却・繰越在庫案件は0件です。
                          </td>
                        </tr>
                      ) : (
                        carryoverRecords.map(r => (
                          <tr key={r.id} className="hover:bg-purple-50/30">
                            <td className="py-2 px-3 text-center border-r font-sans">{r.date}</td>
                            <td className="py-2 px-3 text-center border-r font-sans font-bold">{r.staff}</td>
                            <td className="py-2 px-3 border-r font-sans">{r.customerName}</td>
                            <td className="py-2 px-3 border-r font-sans text-gray-600">{r.category}</td>
                            <td className="py-2 px-3 text-right border-r text-rose-700">¥{formatCurrency(r.purchaseAmount)}</td>
                            <td className="py-2 px-3 text-right border-r font-bold text-purple-700 bg-purple-50/40">
                              ¥{formatCurrency(r.carryover)}
                            </td>
                            <td className="py-2 px-3 font-sans text-gray-600">{r.status} / {r.memo}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sheet Tabs */}
      <footer className="h-9 bg-gray-200 border-t border-gray-300 flex items-center justify-between px-2 text-xs select-none shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto h-full py-0.5">
          {months.map(m => {
            const isSelected = activeTab === 'ledger' && activeMonth === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setActiveMonth(m);
                  setActiveTab('ledger');
                }}
                className={`h-full px-3 flex items-center gap-1.5 text-xs font-medium rounded-t border-t-2 transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-600 text-emerald-900 font-bold shadow-2xs'
                    : 'border-transparent text-gray-600 hover:bg-gray-300/60'
                }`}
              >
                <TableProperties className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                <span>{m} (台帳)</span>
              </button>
            );
          })}

          <button
            onClick={handleAddNextMonth}
            className="h-full px-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 rounded transition-colors shrink-0 cursor-pointer"
            title="翌月の新しい台帳シートを追加"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>月追加</span>
          </button>

          <div className="h-4 w-px bg-gray-400 mx-1 shrink-0" />

          {[
            { id: '市場管理', label: '市場管理 (古物競売)', icon: Gavel },
            { id: 'スタッフ別集計', label: 'スタッフ別集計', icon: BarChart3 },
            { id: '媒体別分析', label: '媒体別分析 (チラシ・HP)', icon: Layers },
            { id: '繰越管理', label: '繰越・月次引継', icon: Calendar },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`h-full px-3 flex items-center gap-1.5 text-xs font-medium rounded-t border-t-2 transition-colors shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white border-emerald-600 text-emerald-900 font-bold shadow-2xs'
                    : 'border-transparent text-gray-600 hover:bg-gray-300/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-600' : 'text-gray-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-700 shrink-0 pr-2">
          <div className="hidden sm:flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
            <span className="text-gray-500 text-[10px]">{activeMonth} 仕入:</span>
            <span className="font-bold text-rose-700">¥{formatCurrency(totalPurchase)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-2.5 py-0.5 rounded border border-gray-300 shadow-2xs">
            <span className="text-gray-500 text-[10px]">{activeMonth} 売上:</span>
            <span className="font-extrabold text-blue-800">¥{formatCurrency(totalSales)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 shadow-2xs">
            <span className="text-emerald-700 text-[10px]">{activeMonth} 粗利:</span>
            <span className="font-extrabold text-emerald-800">¥{formatCurrency(totalGross)}</span>
          </div>
        </div>
      </footer>

      <AddDealModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddRecord}
        preset={goldPreset}
        currentMonth={activeMonth}
      />

      <GoldCalcModal
        isOpen={isGoldOpen}
        onClose={() => setIsGoldOpen(false)}
        onApplyToNewDeal={handleApplyGoldToDeal}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        records={currentMonthRecords}
        marketItems={marketItems}
        monthName={activeMonth}
        onImportRecords={imported => pushRecordsState([...imported, ...records])}
        onResetDefault={handleResetDefault}
      />
    </div>
  );
}
