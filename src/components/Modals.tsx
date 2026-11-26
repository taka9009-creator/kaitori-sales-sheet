import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Plus, X, Coins, FileSpreadsheet, Copy, Check, ExternalLink,
  Download, Upload, RotateCcw, ArrowRight, Sparkles, Trash2, ShoppingBag,
  Calendar, Gavel, ArrowDownToLine, ChevronDown, ChevronUp, ShieldCheck,
  UserCheck, FileText, RefreshCw
} from 'lucide-react';
import {
  DealRecord, MarketItem, GoldPreset, GoldBasketItem,
  STAFF_LIST, MEDIA_LIST, STATUS_LIST, CATEGORY_PRESETS,
  ID_DOC_TYPES, OCCUPATION_PRESETS,
  formatCurrency, calcDefaultPlatformFee,
  parseRecordDate, formatDateYYYYMMDD, formatRecordFullDate, calcAgeAtDate
} from '../data';

const EXCEL_HEADERS = [
  '日付', '担当者', 'お客様名/案件', '訪問地域', '品目分類',
  '買取金額(仕入)', '集客媒体', '翌月繰越(未売却)', '市場売上', '金売上(即換金)',
  'Y売上(EC)', 'メルカリShops売上', '回収・不用品売上', '仮金粗利', '仮Y粗利',
  '販売手数料', '送料・梱包費', '交通費', '処分費', '状態', '備考・メモ'
];

export const exportToExcel = (records: DealRecord[], marketItems: MarketItem[], monthName = '2026-09') => {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [
    ['松浦 出張買取 売上管理表', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['対象年月:', monthName, '', '作成日:', new Date().toLocaleDateString('ja-JP')],
    [],
    EXCEL_HEADERS,
  ];
  records.forEach(r => {
    rows.push([
      r.date, r.staff, r.customerName, r.area || '', r.category || '',
      r.purchaseAmount || 0, r.media, r.carryover || 0, r.marketSales || 0, r.goldSales || 0,
      r.yahooSales || 0, r.mercariSales || 0, r.recoverySales || 0,
      r.estimatedGoldGrossProfit || 0, r.estimatedYahooGrossProfit || 0,
      r.platformFee || 0, r.shippingCost || 0,
      r.transportCost || 0, r.disposalCost || 0, r.status, r.memo || '',
    ]);
  });
  const lastRow = Math.max(5, rows.length);
  rows.push([
    '合計', '', '', '', '',
    { t: 'n', f: `SUM(F5:F${lastRow})` }, '',
    { t: 'n', f: `SUM(H5:H${lastRow})` },
    { t: 'n', f: `SUM(I5:I${lastRow})` },
    { t: 'n', f: `SUM(J5:J${lastRow})` },
    { t: 'n', f: `SUM(K5:K${lastRow})` },
    { t: 'n', f: `SUM(L5:L${lastRow})` },
    { t: 'n', f: `SUM(M5:M${lastRow})` },
    { t: 'n', f: `SUM(N5:N${lastRow})` },
    { t: 'n', f: `SUM(O5:O${lastRow})` },
    { t: 'n', f: `SUM(P5:P${lastRow})` },
    { t: 'n', f: `SUM(Q5:Q${lastRow})` },
    { t: 'n', f: `SUM(R5:R${lastRow})` },
    { t: 'n', f: `SUM(S5:S${lastRow})` },
    '', '',
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws1, `${monthName.replace('/', '-')}_売上明細`);

  const mRows: any[][] = [
    ['古物市場・オークション管理表', '', '', '', '', '', '', '', ''],
    [],
    ['仕入日', '品目詳細', '担当者', '仕入原価(買取額)', '市場予想落札額', '出品予定市場名', '競売日(オークション日)', '実際落札額', '手数料率(%)', 'ステータス', '備考']
  ];
  marketItems.forEach(m => {
    mRows.push([
      m.purchaseDate, m.itemDescription, m.staff, m.purchaseCost,
      m.estimatedMarketPrice, m.targetMarketName, m.auctionDate,
      m.actualSoldPrice === null ? '未成約' : m.actualSoldPrice,
      m.commissionRate, m.status, m.notes || '',
    ]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(mRows);
  XLSX.utils.book_append_sheet(wb, ws2, '市場管理');
  XLSX.writeFile(wb, `出張買取_売上管理表_${monthName.replace('/', '-')}.xlsx`);
};

export const copyRecordsAsTSV = async (records: DealRecord[]): Promise<boolean> => {
  const lines = records.map(r => [
    r.date, r.staff, r.customerName, r.area || '', r.category || '',
    r.purchaseAmount || 0, r.media, r.carryover || 0, r.marketSales || 0, r.goldSales || 0,
    r.yahooSales || 0, r.mercariSales || 0, r.recoverySales || 0,
    r.estimatedGoldGrossProfit || 0, r.estimatedYahooGrossProfit || 0,
    r.platformFee || 0, r.shippingCost || 0,
    r.transportCost || 0, r.disposalCost || 0, r.status, r.memo || '',
  ].join('\t'));
  const tsv = [EXCEL_HEADERS.join('\t'), ...lines].join('\n');
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (e) {
    console.error('Failed to copy TSV:', e);
    return false;
  }
};

const KOBUTSU_HEADERS = [
  '取引年月日',
  '区分（カテゴリ）',
  '品名・特徴',
  '数量',
  '代価（買取金額）',
  '相手方の氏名',
  '住所',
  '職業',
  '年齢',
  '本人確認書類の種類',
  '本人確認書類の番号',
];

const buildKobutsuRow = (r: DealRecord): (string | number)[] => {
  const parsed = parseRecordDate(r);
  const age = calcAgeAtDate(r.customerBirthDate, parsed);
  return [
    formatRecordFullDate(r, '/'),
    r.category || '',
    r.itemFeatures || r.memo || '',
    r.itemQuantity ?? 1,
    r.purchaseAmount || 0,
    r.customerName || '',
    r.customerAddress || r.area || '',
    r.customerOccupation || '',
    age !== null ? `${age}歳` : '',
    r.idDocType || '',
    r.idDocNumber || '',
  ];
};

export const exportKobutsuLedgerExcel = (records: DealRecord[], startDate: string, endDate: string) => {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [
    ['古物台帳（古物営業法第16条に基づく記録）', '', '', '', '', '', '', '', '', '', ''],
    ['対象期間:', `${startDate || '指定なし'} 〜 ${endDate || '指定なし'}`, '', '作成日:', new Date().toLocaleDateString('ja-JP'), '', '該当件数:', `${records.length}件`],
    [],
    KOBUTSU_HEADERS,
  ];
  records.forEach(r => {
    rows.push(buildKobutsuRow(r));
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 13 }, { wch: 16 }, { wch: 28 }, { wch: 6 }, { wch: 14 },
    { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, '古物台帳');
  const rangeLabel = startDate && endDate ? `${startDate}_${endDate}` : 'all';
  XLSX.writeFile(wb, `古物台帳_${rangeLabel}.xlsx`);
};

export const exportKobutsuLedgerCSV = (records: DealRecord[], startDate: string, endDate: string) => {
  const escapeCsv = (val: string | number): string => {
    const str = String(val ?? '');
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvRows = [
    KOBUTSU_HEADERS.map(escapeCsv).join(','),
    ...records.map(r => buildKobutsuRow(r).map(escapeCsv).join(',')),
  ];
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const rangeLabel = startDate && endDate ? `${startDate}_${endDate}` : 'all';
  a.download = `古物台帳_${rangeLabel}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export interface AddDealOptions {
  sendToMarket?: boolean;
  targetMarketName?: string;
  estimatedMarketPrice?: number;
}

interface CustomerProfile {
  customerName: string;
  area: string;
  customerAddress: string;
  customerOccupation: string;
  customerBirthDate: string;
  idDocType: string;
  idDocNumber: string;
}

export const AddDealModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (r: DealRecord, options?: AddDealOptions) => void;
  preset: GoldPreset | null;
  currentMonth: string;
  existingRecords?: DealRecord[];
  editingRecord?: DealRecord | null;
  onUpdate?: (r: DealRecord) => void;
}> = ({
  isOpen,
  onClose,
  onAdd,
  preset,
  currentMonth,
  existingRecords = [],
  editingRecord = null,
  onUpdate,
}) => {
  const getFormattedMD = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const monthPrefix = currentMonth.split('/')[1] || String(new Date().getMonth() + 1);
  const todayStr = `${monthPrefix}/${new Date().getDate()}`;
  const [date, setDate] = useState(todayStr);
  const [customerName, setCustomerName] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [media, setMedia] = useState('チラシ');
  const [goldSales, setGoldSales] = useState(0);
  const [marketSales, setMarketSales] = useState(0);
  const [yahooSales, setYahooSales] = useState(0);
  const [mercariSales, setMercariSales] = useState(0);
  const [recoverySales, setRecoverySales] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [isManualFee, setIsManualFee] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [carryover, setCarryover] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [disposalCost, setDisposalCost] = useState(0);
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState('完結');
  const [sendToMarket, setSendToMarket] = useState(false);
  const [targetMarketName, setTargetMarketName] = useState('関東道具市場');
  const [estimatedMarketPrice, setEstimatedMarketPrice] = useState(0);

  // 古物台帳・本人確認フィールド
  const [isKobutsuOpen, setIsKobutsuOpen] = useState(false);
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerOccupation, setCustomerOccupation] = useState('');
  const [customerBirthDate, setCustomerBirthDate] = useState('');
  const [idDocType, setIdDocType] = useState('');
  const [idDocNumber, setIdDocNumber] = useState('');
  const [itemFeatures, setItemFeatures] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  const [repeaterBadge, setRepeaterBadge] = useState<string | null>(null);
  const lastAutoFilledNameRef = useRef<string>('');

  // 過去レコードからリピーター顧客辞書を作成
  const customerProfiles = useMemo(() => {
    const map = new Map<string, CustomerProfile>();
    const genericNames = new Set(['お客様', '新規お客様', 'インポート案件', '']);
    existingRecords.forEach(r => {
      const name = (r.customerName || '').replace(/ \(複製\)$/, '').trim();
      if (!name || genericNames.has(name)) return;
      const prev = map.get(name);
      const hasKobutsu = Boolean(
        r.customerAddress || r.customerOccupation || r.customerBirthDate || r.idDocType || r.idDocNumber || r.area
      );
      if (!prev) {
        map.set(name, {
          customerName: name,
          area: r.area || '',
          customerAddress: r.customerAddress || '',
          customerOccupation: r.customerOccupation || '',
          customerBirthDate: r.customerBirthDate || '',
          idDocType: r.idDocType || '',
          idDocNumber: r.idDocNumber || '',
        });
      } else if (hasKobutsu) {
        map.set(name, {
          customerName: name,
          area: prev.area || r.area || '',
          customerAddress: prev.customerAddress || r.customerAddress || '',
          customerOccupation: prev.customerOccupation || r.customerOccupation || '',
          customerBirthDate: prev.customerBirthDate || r.customerBirthDate || '',
          idDocType: prev.idDocType || r.idDocType || '',
          idDocNumber: prev.idDocNumber || r.idDocNumber || '',
        });
      }
    });
    return map;
  }, [existingRecords]);

  useEffect(() => {
    if (!isOpen) return;
    setRepeaterBadge(null);
    lastAutoFilledNameRef.current = '';

    if (editingRecord) {
      setDate(editingRecord.date);
      setCustomerName(editingRecord.customerName);
      setArea(editingRecord.area || '');
      setCategory(editingRecord.category || '');
      setPurchaseAmount(editingRecord.purchaseAmount || 0);
      setMedia(editingRecord.media || 'チラシ');
      setGoldSales(editingRecord.goldSales || 0);
      setMarketSales(editingRecord.marketSales || 0);
      const yVal = editingRecord.yahooSales || 0;
      const mVal = editingRecord.mercariSales || 0;
      setYahooSales(yVal);
      setMercariSales(mVal);
      const autoFee = calcDefaultPlatformFee(yVal, mVal);
      const existingFee = editingRecord.platformFee ?? 0;
      setPlatformFee(existingFee);
      setIsManualFee((yVal > 0 || mVal > 0) ? existingFee !== autoFee : existingFee > 0);
      setShippingCost(editingRecord.shippingCost || 0);
      setCarryover(editingRecord.carryover || 0);
      setTransportCost(editingRecord.transportCost || 0);
      setDisposalCost(editingRecord.disposalCost || 0);
      setMemo(editingRecord.memo || '');
      setStatus(editingRecord.status || '完結');
      setSendToMarket(false);

      setCustomerAddress(editingRecord.customerAddress || '');
      setCustomerOccupation(editingRecord.customerOccupation || '');
      setCustomerBirthDate(editingRecord.customerBirthDate || '');
      setIdDocType(editingRecord.idDocType || '');
      setIdDocNumber(editingRecord.idDocNumber || '');
      setItemFeatures(editingRecord.itemFeatures || '');
      setItemQuantity(editingRecord.itemQuantity ?? 1);
      setIsKobutsuOpen(false);
      return;
    }

    const now = new Date();
    const curMonthNum = currentMonth.split('/')[1];
    if (curMonthNum && Number(curMonthNum) === now.getMonth() + 1) {
      setDate(`${now.getMonth() + 1}/${now.getDate()}`);
    } else {
      setDate(`${currentMonth.split('/')[1] || '9'}/${now.getDate()}`);
    }

    if (preset) {
      setPurchaseAmount(preset.purchaseAmount);
      setGoldSales(preset.goldSales);
      setCategory(preset.category);
      setMemo(preset.memo);
      setStatus('完結');
      setSendToMarket(false);
    } else {
      setPurchaseAmount(0);
      setGoldSales(0);
      setCategory('');
      setMemo('');
      setStatus('完結');
      setSendToMarket(false);
    }
    setCustomerName('');
    setArea('');
    setMarketSales(0);
    setYahooSales(0);
    setMercariSales(0);
    setRecoverySales(0);
    setPlatformFee(0);
    setIsManualFee(false);
    setShippingCost(0);
    setCarryover(0);
    setTransportCost(0);
    setDisposalCost(0);
    setTargetMarketName('関東道具市場');
    setEstimatedMarketPrice(0);
    setCustomerAddress('');
    setCustomerOccupation('');
    setCustomerBirthDate('');
    setIdDocType('');
    setIdDocNumber('');
    setItemFeatures('');
    setItemQuantity(1);
    setIsKobutsuOpen(false);
  }, [preset, isOpen, currentMonth, editingRecord]);

  const applyCustomerProfile = (profile: CustomerProfile) => {
    if (profile.area) setArea(profile.area);
    if (profile.customerAddress) setCustomerAddress(profile.customerAddress);
    if (profile.customerOccupation) setCustomerOccupation(profile.customerOccupation);
    if (profile.customerBirthDate) setCustomerBirthDate(profile.customerBirthDate);
    if (profile.idDocType) setIdDocType(profile.idDocType);
    if (profile.idDocNumber) setIdDocNumber(profile.idDocNumber);
    lastAutoFilledNameRef.current = profile.customerName;
    const filledItems = [
      profile.customerAddress && '住所',
      profile.customerOccupation && '職業',
      profile.customerBirthDate && '生年月日',
      profile.idDocType && '本人確認書類',
    ].filter(Boolean);
    setRepeaterBadge(
      filledItems.length > 0
        ? `過去履歴から「${filledItems.join('・')}」を自動補完しました`
        : `リピーター様（${profile.area || '地域登録あり'}）を補完しました`
    );
  };

  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (editingRecord) return;
    const trimmed = val.trim();
    const matched = customerProfiles.get(trimmed);
    if (matched && lastAutoFilledNameRef.current !== trimmed) {
      applyCustomerProfile(matched);
    } else if (!matched && repeaterBadge) {
      setRepeaterBadge(null);
    }
  };

  if (!isOpen) return null;

  const estGoldProfit = goldSales > 0 ? Math.max(0, goldSales - purchaseAmount) : 0;
  const estYahooProfit = yahooSales > 0 ? Math.max(0, yahooSales - purchaseAmount) : 0;
  const totalSales = goldSales + marketSales + yahooSales + mercariSales + recoverySales;
  const totalGross = totalSales - purchaseAmount;
  const totalExpenses = (Number(transportCost) || 0) + (Number(disposalCost) || 0) + (Number(platformFee) || 0) + (Number(shippingCost) || 0);
  const netProfitPreview = totalGross - totalExpenses;

  const parsedDealDate = parseRecordDate({ date, month: editingRecord?.month || currentMonth });
  const calculatedAge = calcAgeAtDate(customerBirthDate, parsedDealDate);

  const kobutsuFilledCount = [
    customerAddress.trim(),
    customerOccupation.trim(),
    customerBirthDate.trim(),
    idDocType.trim(),
    idDocNumber.trim(),
    itemFeatures.trim(),
    itemQuantity !== 1 ? String(itemQuantity) : '',
  ].filter(Boolean).length;

  const handleYahooChange = (val: number) => {
    setYahooSales(val);
    if (!isManualFee) {
      setPlatformFee(calcDefaultPlatformFee(val, mercariSales));
    }
  };

  const handleMercariChange = (val: number) => {
    setMercariSales(val);
    if (!isManualFee) {
      setPlatformFee(calcDefaultPlatformFee(yahooSales, val));
    }
  };

  const handleCategoryPresetClick = (tag: string) => {
    if (!category.trim()) {
      setCategory(tag);
      return;
    }
    const existing = category.split('、').map(s => s.trim()).filter(Boolean);
    if (!existing.includes(tag)) {
      setCategory([...existing, tag].join('、'));
    }
  };

  const handleSetFullCarryover = () => {
    const val = Number(purchaseAmount) || 0;
    setCarryover(val);
    setStatus('全量繰越(未売却)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseRecord: DealRecord = {
      id: editingRecord ? editingRecord.id : `rec-${Date.now()}`,
      month: editingRecord ? editingRecord.month : currentMonth,
      date,
      staff: editingRecord?.staff || STAFF_LIST[0],
      customerName: customerName.trim() || '新規お客様',
      area: area.trim(),
      category: category.trim(),
      purchaseAmount: Number(purchaseAmount) || 0,
      media,
      carryover: Number(carryover) || 0,
      marketSales: Number(marketSales) || 0,
      goldSales: Number(goldSales) || 0,
      yahooSales: Number(yahooSales) || 0,
      mercariSales: Number(mercariSales) || 0,
      recoverySales: Number(recoverySales) || 0,
      estimatedGoldGrossProfit: estGoldProfit,
      estimatedYahooGrossProfit: estYahooProfit,
      platformFee: Number(platformFee) || 0,
      shippingCost: Number(shippingCost) || 0,
      transportCost: Number(transportCost) || 0,
      disposalCost: Number(disposalCost) || 0,
      memo: memo.trim(),
      status: !editingRecord && sendToMarket ? '市場出品中' : status,
      customerAddress: customerAddress.trim() || undefined,
      customerOccupation: customerOccupation.trim() || undefined,
      customerBirthDate: customerBirthDate.trim() || undefined,
      idDocType: idDocType.trim() || undefined,
      idDocNumber: idDocNumber.trim() || undefined,
      itemFeatures: itemFeatures.trim() || undefined,
      itemQuantity: Math.max(1, Number(itemQuantity) || 1),
    };

    if (editingRecord && onUpdate) {
      onUpdate(baseRecord);
    } else {
      onAdd(baseRecord, {
        sendToMarket,
        targetMarketName,
        estimatedMarketPrice,
      });
    }
    setCustomerName('');
    onClose();
  };

  const profileList = Array.from(customerProfiles.values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <datalist id="customer-history-list">
        {profileList.map(p => (
          <option key={p.customerName} value={p.customerName}>
            {p.customerAddress || p.area || '過去取引あり'}
          </option>
        ))}
      </datalist>
      <datalist id="occupation-presets">
        {OCCUPATION_PRESETS.map(o => (
          <option key={o} value={o} />
        ))}
      </datalist>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 my-auto">
        <div className={`flex items-center justify-between px-6 py-4 text-white ${editingRecord ? 'bg-slate-800' : 'bg-emerald-700'}`}>
          <div className="flex items-center gap-2 flex-wrap">
            {editingRecord ? <FileText className="w-5 h-5 text-emerald-300" /> : <Plus className="w-5 h-5" />}
            <h2 className="font-bold text-base">
              {editingRecord
                ? `買取案件・古物台帳の詳細編集（${editingRecord.customerName}）`
                : `新規買取案件の登録（松浦専用 ${currentMonth} 台帳）`}
            </h2>
            {preset && !editingRecord && (
              <span className="ml-1 px-2 py-0.5 text-[11px] bg-amber-400 text-amber-950 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 金相場計算から自動反映済
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 text-xs text-gray-700 max-h-[85vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-gray-800">訪問日付</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDate(getFormattedMD(0))}
                    className="px-1.5 py-0.5 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold cursor-pointer"
                  >
                    今日
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(getFormattedMD(-1))}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded font-semibold cursor-pointer"
                  >
                    昨日
                  </button>
                  <label
                    className="px-1.5 py-0.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold cursor-pointer flex items-center gap-0.5 relative overflow-hidden"
                    title="カレンダーから日付選択"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>選択</span>
                    <input
                      type="date"
                      onChange={e => {
                        if (e.target.value) {
                          const [, m, d] = e.target.value.split('-');
                          setDate(`${Number(m)}/${Number(d)}`);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="例: 9/23"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-800">集客媒体</label>
              <div className="grid grid-cols-5 gap-1">
                {MEDIA_LIST.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMedia(m)}
                    className={`py-2 px-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer truncate ${
                      media === m
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    {m === '看板/その他' ? 'その他' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-gray-800">
                  お客様名
                  {profileList.length > 0 && !editingRecord && (
                    <span className="ml-1.5 text-[10px] text-cyan-700 font-normal">
                      （過去顧客選択で自動補完）
                    </span>
                  )}
                </label>
              </div>
              <input
                type="text"
                list="customer-history-list"
                value={customerName}
                onChange={e => handleCustomerNameChange(e.target.value)}
                placeholder="例: 佐藤様"
                required
                autoFocus={!editingRecord}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none"
              />
              {repeaterBadge && (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-semibold">
                  <UserCheck className="w-3 h-3 text-cyan-600" />
                  <span>{repeaterBadge}</span>
                </div>
              )}
              {!editingRecord && !repeaterBadge && profileList.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-gray-400">リピート候補:</span>
                  {profileList.slice(0, 4).map(p => (
                    <button
                      key={p.customerName}
                      type="button"
                      onClick={() => {
                        setCustomerName(p.customerName);
                        applyCustomerProfile(p);
                      }}
                      className="px-1.5 py-0.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded text-[10px] font-medium cursor-pointer"
                    >
                      {p.customerName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-800">訪問地域・エリア</label>
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="例: 横浜市港北区"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-800">品目カテゴリ（下のタグをクリックして簡単入力）</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="例: 貴金属・金、古銭・切手（自由入力または下から選択）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {CATEGORY_PRESETS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleCategoryPresetClick(tag)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    category.includes(tag)
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold'
                      : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 border-gray-200'
                  }`}
                >
                  ＋ {tag}
                </button>
              ))}
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className="px-2 py-1 rounded-md text-[10px] text-gray-400 hover:text-rose-600 cursor-pointer"
                >
                  クリア
                </button>
              )}
            </div>
          </div>

          {/* 古物台帳・本人確認情報アコーディオン（任意） */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50/70">
            <button
              type="button"
              onClick={() => setIsKobutsuOpen(!isKobutsuOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100/90 hover:bg-slate-200/70 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-900 text-xs">
                  古物台帳・本人確認情報（任意）
                </span>
                {kobutsuFilledCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                    入力済 {kobutsuFilledCount}項目
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    ※ 住所・職業・生年月日・身分証・型番/数量（あとから入力も可）
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 shrink-0">
                {isKobutsuOpen ? (
                  <>
                    <span>閉じる</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>開く</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>

            {isKobutsuOpen && (
              <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-gray-800">相手方のご住所</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="例: 神奈川県横浜市港北区〇〇 1-2-3"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">ご職業</label>
                    <input
                      type="text"
                      list="occupation-presets"
                      value={customerOccupation}
                      onChange={e => setCustomerOccupation(e.target.value)}
                      placeholder="例: 会社員"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-gray-800">生年月日</label>
                      {calculatedAge !== null && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                          取引時 満{calculatedAge}歳
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={customerBirthDate}
                      onChange={e => setCustomerBirthDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md font-mono focus:border-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">本人確認書類</label>
                    <select
                      value={idDocType}
                      onChange={e => setIdDocType(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white outline-none focus:border-slate-500"
                    >
                      <option value="">-- 未選択 --</option>
                      {ID_DOC_TYPES.map(doc => (
                        <option key={doc} value={doc}>{doc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">書類の記号・番号</label>
                    <input
                      type="text"
                      value={idDocNumber}
                      onChange={e => setIdDocNumber(e.target.value)}
                      placeholder="例: 第451234567890号"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono focus:border-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block font-semibold mb-1 text-gray-800">品物の特徴・型番・シリアル番号</label>
                    <input
                      type="text"
                      value={itemFeatures}
                      onChange={e => setItemFeatures(e.target.value)}
                      placeholder="例: ROLEX 16233 シリアルX番、K18刻印あり、共箱付"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:border-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-gray-800">数量</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onFocus={e => e.target.select()}
                      onChange={e => setItemQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono font-bold text-center focus:border-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-emerald-950 text-xs">
                買取仕入れ金額（支払額） <span className="text-rose-600">*必須</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={purchaseAmount}
                  onFocus={e => e.target.select()}
                  onChange={e => setPurchaseAmount(Number(e.target.value))}
                  required
                  min="0"
                  className="w-full pl-7 pr-3 py-1.5 border border-emerald-300 rounded-md bg-white font-mono font-bold text-sm focus:border-emerald-600 outline-none"
                />
              </div>
              <p className="text-[10px] text-emerald-800 mt-1">※ お客様にお支払いした現金（0円引取の場合は0）</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-purple-900 text-xs">翌月繰越額（未売却在庫）</label>
                <button
                  type="button"
                  onClick={handleSetFullCarryover}
                  className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold shadow-2xs cursor-pointer"
                  title="買取金額を全額翌月繰越へセットし、ステータスを未売却にする"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>未売却(全額繰越)</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={carryover}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setCarryover(val);
                    if (val > 0 && totalSales === 0) setStatus('全量繰越(未売却)');
                    else if (val > 0 && totalSales > 0) setStatus('一部繰越');
                  }}
                  min="0"
                  className="w-full pl-7 pr-3 py-1.5 border border-purple-300 rounded-md bg-white font-mono font-bold text-sm focus:border-purple-600 outline-none"
                />
              </div>
              <p className="text-[10px] text-purple-700 mt-1">※ 次回市場・オークション出品予定の在庫評価</p>
            </div>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" /> 販路別売上（即時換金・市場・ヤフオク・メルカリShops・回収）
              </span>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className={`font-bold ${totalGross >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  粗利: ¥{formatCurrency(totalGross)}
                </span>
                <span className={`font-bold ${netProfitPreview >= 0 ? 'text-cyan-800' : 'text-rose-700'}`}>
                  実質純利: ¥{formatCurrency(netProfitPreview)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-0.5">金売上 (即現金化)</label>
                <input
                  type="number"
                  value={goldSales}
                  onFocus={e => e.target.select()}
                  onChange={e => setGoldSales(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-amber-300 rounded bg-white font-mono text-xs focus:border-amber-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-0.5">市場売上 (古物市場)</label>
                <input
                  type="number"
                  value={marketSales}
                  onFocus={e => e.target.select()}
                  onChange={e => setMarketSales(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-emerald-300 rounded bg-white font-mono text-xs focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-800 mb-0.5">Y売上 (ヤフオク)</label>
                <input
                  type="number"
                  value={yahooSales}
                  onFocus={e => e.target.select()}
                  onChange={e => handleYahooChange(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white font-mono text-xs focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">メルカリShops売上</label>
                <input
                  type="number"
                  value={mercariSales}
                  onFocus={e => e.target.select()}
                  onChange={e => handleMercariChange(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-rose-300 rounded bg-white font-mono text-xs focus:border-rose-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-800 mb-0.5">回収・処分料売上</label>
                <input
                  type="number"
                  value={recoverySales}
                  onFocus={e => e.target.select()}
                  onChange={e => setRecoverySales(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white font-mono text-xs focus:border-gray-600 outline-none"
                />
              </div>
            </div>

            {/* EC販売手数料(10%自動/手動) & 送料・梱包費 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-amber-200/80">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] font-semibold text-amber-950 flex items-center gap-1">
                    <span>EC販売手数料計</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isManualFee ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isManualFee ? '手動上書中' : '10%自動計算'}
                    </span>
                  </label>
                  {isManualFee && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualFee(false);
                        setPlatformFee(calcDefaultPlatformFee(yahooSales, mercariSales));
                      }}
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> 10%自動に戻す
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={platformFee}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    setIsManualFee(true);
                    setPlatformFee(Number(e.target.value) || 0);
                  }}
                  className="w-full px-2.5 py-1 border border-amber-300 rounded bg-white font-mono text-xs outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-950 mb-0.5">送料・梱包資材費</label>
                <input
                  type="number"
                  value={shippingCost}
                  onFocus={e => e.target.select()}
                  onChange={e => setShippingCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1 border border-amber-300 rounded bg-white font-mono text-xs outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-gray-800">交通費・ガソリン代</label>
              <input
                type="number"
                value={transportCost}
                onFocus={e => e.target.select()}
                onChange={e => setTransportCost(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-800">ゴミ・処分費用</label>
              <input
                type="number"
                value={disposalCost}
                onFocus={e => e.target.select()}
                onChange={e => setDisposalCost(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-800">案件ステータス</label>
              <select
                value={!editingRecord && sendToMarket ? '市場出品中' : status}
                onChange={e => setStatus(e.target.value)}
                disabled={!editingRecord && sendToMarket}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium outline-none disabled:bg-gray-100"
              >
                {STATUS_LIST.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-800">商品詳細・社内メモ</label>
            <input
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="例: K18喜平30g、骨董掛け軸箱書きあり、次回道具市出品"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          {/* 同時に古物市場出品リスト登録オプション（新規登録時のみ表示） */}
          {!editingRecord && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 space-y-2">
              <label className="flex items-center gap-2 font-bold text-blue-950 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendToMarket}
                  onChange={e => {
                    setSendToMarket(e.target.checked);
                    if (e.target.checked && estimatedMarketPrice === 0 && purchaseAmount > 0) {
                      setEstimatedMarketPrice(Math.round(purchaseAmount * 1.5));
                    }
                  }}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <Gavel className="w-4 h-4 text-blue-600" />
                <span>同時に「市場管理（古物競売）」の出品リストにも登録する</span>
              </label>
              {sendToMarket && (
                <div className="grid grid-cols-2 gap-3 pt-1 pl-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-0.5">出品予定市場名</label>
                    <input
                      type="text"
                      value={targetMarketName}
                      onChange={e => setTargetMarketName(e.target.value)}
                      placeholder="例: 関東道具市場"
                      className="w-full px-2.5 py-1 bg-white border border-blue-300 rounded text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-0.5">市場予想落札額 (見込)</label>
                    <input
                      type="number"
                      value={estimatedMarketPrice}
                      onFocus={e => e.target.select()}
                      onChange={e => setEstimatedMarketPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1 bg-white border border-blue-300 rounded font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-lg font-bold shadow-md transition-all cursor-pointer ${
                editingRecord ? 'bg-slate-800 hover:bg-slate-900' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {editingRecord ? '変更内容を保存する' : '売上表に登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GoldCalcModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApplyToNewDeal: (preset: GoldPreset) => void;
}> = ({ isOpen, onClose, onApplyToNewDeal }) => {
  const [metal, setMetal] = useState<'K24' | 'K18' | 'K14' | 'Pt900' | 'Pt850' | 'SV925'>('K18');
  const [goldBase, setGoldBase] = useState(14800);
  const [ptBase, setPtBase] = useState(5200);
  const [svBase, setSvBase] = useState(180);
  const [weight, setWeight] = useState(0);
  const [rate, setRate] = useState(65);
  const [basket, setBasket] = useState<GoldBasketItem[]>([]);

  if (!isOpen) return null;

  const getMetalInfo = (m: typeof metal) => {
    switch (m) {
      case 'K24': return { basePrice: goldBase, setBase: setGoldBase, factor: 1.0, label: '純金(K24) 1g基準相場' };
      case 'K18': return { basePrice: goldBase, setBase: setGoldBase, factor: 0.75, label: '純金(K24) 1g基準相場 (×75%)' };
      case 'K14': return { basePrice: goldBase, setBase: setGoldBase, factor: 0.585, label: '純金(K24) 1g基準相場 (×58.5%)' };
      case 'Pt900': return { basePrice: ptBase, setBase: setPtBase, factor: 0.9, label: '純Pt(Pt1000) 1g基準相場 (×90%)' };
      case 'Pt850': return { basePrice: ptBase, setBase: setPtBase, factor: 0.85, label: '純Pt(Pt1000) 1g基準相場 (×85%)' };
      case 'SV925': return { basePrice: svBase, setBase: setSvBase, factor: 0.925, label: '純銀(SV1000) 1g基準相場 (×92.5%)' };
    }
  };

  const info = getMetalInfo(metal);
  const unitMeltPrice = Math.floor(info.basePrice * info.factor);
  const wholesaleValue = Math.floor(unitMeltPrice * weight);
  const offerPrice = Math.floor((wholesaleValue * rate) / 100);
  const grossProfit = wholesaleValue - offerPrice;
  const marginPct = wholesaleValue > 0 ? (grossProfit / wholesaleValue) * 100 : 0;

  const handleAddToBasket = () => {
    if (weight <= 0) return;
    setBasket(prev => [
      ...prev,
      {
        id: `gb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        metal,
        weight,
        unitPrice: unitMeltPrice,
        rate,
        wholesaleValue,
        offerPrice,
        grossProfit,
      },
    ]);
    setWeight(0);
  };

  const basketWholesaleTotal = basket.reduce((s, i) => s + i.wholesaleValue, 0);
  const basketOfferTotal = basket.reduce((s, i) => s + i.offerPrice, 0);
  const basketGrossTotal = basketWholesaleTotal - basketOfferTotal;

  const handleApplyAll = () => {
    const finalItems: GoldBasketItem[] = [...basket];
    if (weight > 0) {
      finalItems.push({
        id: 'gb-current',
        metal,
        weight,
        unitPrice: unitMeltPrice,
        rate,
        wholesaleValue,
        offerPrice,
        grossProfit,
      });
    }
    if (finalItems.length === 0) {
      onApplyToNewDeal({
        purchaseAmount: offerPrice,
        goldSales: wholesaleValue,
        category: `${metal}貴金属 (${weight}g)`,
        memo: `${metal} ${weight}g (単価¥${formatCurrency(unitMeltPrice)}/g・掛率${rate}%)`,
      });
      onClose();
      return;
    }

    if (finalItems.length === 1) {
      const it = finalItems[0];
      onApplyToNewDeal({
        purchaseAmount: it.offerPrice,
        goldSales: it.wholesaleValue,
        category: `${it.metal}貴金属 (${it.weight}g)`,
        memo: `${it.metal} ${it.weight}g (単価¥${formatCurrency(it.unitPrice)}/g・掛率${it.rate}%) 即時地金卸`,
      });
    } else {
      const totalOffer = finalItems.reduce((s, i) => s + i.offerPrice, 0);
      const totalWholesale = finalItems.reduce((s, i) => s + i.wholesaleValue, 0);
      const totalWeight = finalItems.reduce((s, i) => s + i.weight, 0);
      const uniqueMetals = Array.from(new Set(finalItems.map(i => i.metal))).join('・');
      const breakdownStr = finalItems
        .map(
          (i, idx) =>
            `${idx + 1}.${i.metal} ${i.weight}g(買¥${formatCurrency(i.offerPrice)}/売¥${formatCurrency(i.wholesaleValue)})`
        )
        .join(' + ');

      onApplyToNewDeal({
        purchaseAmount: totalOffer,
        goldSales: totalWholesale,
        category: `${uniqueMetals} 貴金属まとめ (${finalItems.length}点 / 計${totalWeight.toFixed(1)}g)`,
        memo: `【まとめ査定内訳】${breakdownStr}`,
      });
    }
    setBasket([]);
    setWeight(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 bg-amber-600 text-white">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">出張査定用 貴金属・金相場シミュレーター（複数まとめ対応）</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-700 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block font-bold mb-1.5 text-gray-800">貴金属種別（刻印）</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(['K24', 'K18', 'K14', 'Pt900', 'Pt850', 'SV925'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetal(m)}
                  className={`py-1.5 px-2 rounded-lg font-bold text-center border transition-all cursor-pointer ${
                    metal === m
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
              <label className="block font-semibold mb-1 text-gray-600">{info.label}</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-gray-500">¥</span>
                <input
                  type="number"
                  value={info.basePrice}
                  onFocus={e => e.target.select()}
                  onChange={e => info.setBase(Number(e.target.value))}
                  className="w-full pl-6 pr-2 py-1 bg-white border border-gray-300 rounded font-mono font-bold text-xs"
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-1 font-mono">
                {metal} 1g単価: ¥{formatCurrency(unitMeltPrice)}/g
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1 text-amber-900">計測重量 (グラム数)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onFocus={e => e.target.select()}
                  onChange={e => setWeight(Number(e.target.value))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToBasket();
                    }
                  }}
                  className="w-full pl-3 pr-7 py-1 bg-white border border-amber-400 rounded font-mono font-bold text-sm text-amber-950 focus:border-amber-600 outline-none"
                />
                <span className="absolute right-2.5 top-1.5 text-gray-500 font-bold">g</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-amber-950">お客様提示率 (仕入掛け率)</label>
              <span className="font-mono font-bold text-sm text-amber-900">
                {rate}% (粗利率 {marginPct.toFixed(0)}%)
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>30% (粗利重視)</span>
              <span>標準 (65%)</span>
              <span>90% (成約重視)</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-700">
              <span className="text-slate-300 font-sans">現在入力中 ({metal} / {weight}g) 卸売却額:</span>
              <span className="text-sm font-bold text-amber-400">¥{formatCurrency(wholesaleValue)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-700">
              <span className="text-slate-300 font-sans">お客様への買取提示額 (仕入):</span>
              <span className="text-sm font-bold text-rose-400">¥{formatCurrency(offerPrice)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-0.5">
              <span className="text-slate-300 font-sans font-bold">単体粗利益:</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-extrabold text-emerald-400">+¥{formatCurrency(grossProfit)}</span>
                <button
                  type="button"
                  onClick={handleAddToBasket}
                  disabled={weight <= 0}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-sans font-bold rounded-md text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>まとめ査定リストに追加</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-item Basket */}
          {basket.length > 0 && (
            <div className="border-2 border-amber-400 bg-amber-50/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  まとめ査定リスト ({basket.length}品目 合算中)
                </span>
                <button
                  type="button"
                  onClick={() => setBasket([])}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  リストをクリア
                </button>
              </div>
              <div className="divide-y divide-amber-200/70 bg-white rounded-lg border border-amber-200 max-h-36 overflow-y-auto">
                {basket.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{idx + 1}. {item.metal}</span>
                      <span className="font-bold">{item.weight}g</span>
                      <span className="text-gray-400">(掛率{item.rate}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-700">買:¥{formatCurrency(item.offerPrice)}</span>
                      <span className="text-blue-700 font-bold">売:¥{formatCurrency(item.wholesaleValue)}</span>
                      <button
                        type="button"
                        onClick={() => setBasket(basket.filter(b => b.id !== item.id))}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="bg-white p-2 rounded border border-amber-200">
                  <div className="text-[10px] text-gray-500 font-sans">合算買取額(仕入)</div>
                  <div className="font-bold text-sm text-rose-700">¥{formatCurrency(basketOfferTotal)}</div>
                </div>
                <div className="bg-white p-2 rounded border border-amber-200">
                  <div className="text-[10px] text-gray-500 font-sans">合算卸売額(金売上)</div>
                  <div className="font-bold text-sm text-blue-800">¥{formatCurrency(basketWholesaleTotal)}</div>
                </div>
                <div className="bg-emerald-50 p-2 rounded border border-emerald-300">
                  <div className="text-[10px] text-emerald-800 font-sans font-bold">合算獲得粗利</div>
                  <div className="font-extrabold text-sm text-emerald-700">+¥{formatCurrency(basketGrossTotal)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              閉じる
            </button>
            <button
              onClick={handleApplyAll}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {basket.length > 0
                  ? `まとめ査定(${basket.length + (weight > 0 ? 1 : 0)}点)を新規案件に反映`
                  : '新規案件入力に自動反映'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  records: DealRecord[];
  allRecords?: DealRecord[];
  marketItems: MarketItem[];
  monthName: string;
  onImportRecords: (recs: DealRecord[]) => void;
  onResetDefault: () => void;
}> = ({
  isOpen,
  onClose,
  records,
  allRecords,
  marketItems,
  monthName,
  onImportRecords,
  onResetDefault,
}) => {
  const [modalTab, setModalTab] = useState<'spreadsheet' | 'kobutsu'>('spreadsheet');
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const getMonthRange = (mName: string) => {
    const [yStr, mStr] = mName.split('/');
    const y = Number(yStr) || new Date().getFullYear();
    const m = Number(mStr) || new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return {
      start: formatDateYYYYMMDD(start, '-'),
      end: formatDateYYYYMMDD(end, '-'),
    };
  };

  const initialRange = getMonthRange(monthName);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);

  useEffect(() => {
    if (isOpen) {
      const r = getMonthRange(monthName);
      setStartDate(r.start);
      setEndDate(r.end);
    }
  }, [isOpen, monthName]);

  const sourceRecords = allRecords && allRecords.length > 0 ? allRecords : records;

  const kobutsuFilteredRecords = useMemo(() => {
    const startObj = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const endObj = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return [...sourceRecords]
      .filter(r => {
        const d = parseRecordDate(r);
        if (!d) return !startObj && !endObj;
        if (startObj && d < startObj) return false;
        if (endObj && d > endObj) return false;
        return true;
      })
      .sort((a, b) => {
        const da = parseRecordDate(a)?.getTime() ?? 0;
        const db = parseRecordDate(b)?.getTime() ?? 0;
        return da - db;
      });
  }, [sourceRecords, startDate, endDate]);

  if (!isOpen) return null;

  const handlePasteImport = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.trim().split(/\r?\n/);
    const imported: DealRecord[] = [];
    lines.forEach((line, idx) => {
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (idx === 0 && (cols[0].includes('日付') || cols[0].includes('date'))) return;
      if (cols.length < 3) return;
      const toNum = (s?: string) => Number((s || '0').replace(/[^0-9.-]/g, '')) || 0;
      const isExtended21 = cols.length >= 21;

      const purchaseAmount = toNum(cols[5]);
      const carryover = toNum(cols[7]);
      const marketSales = toNum(cols[8]);
      const goldSales = toNum(cols[9]);
      const yahooSales = toNum(cols[10]);
      const mercariSales = isExtended21 ? toNum(cols[11]) : 0;
      const recoverySales = isExtended21 ? toNum(cols[12]) : toNum(cols[11]);
      const platformFee = isExtended21 ? toNum(cols[15]) : calcDefaultPlatformFee(yahooSales, 0);
      const shippingCost = isExtended21 ? toNum(cols[16]) : 0;
      const transportCost = isExtended21 ? toNum(cols[17]) : toNum(cols[14]);
      const disposalCost = isExtended21 ? toNum(cols[18]) : toNum(cols[15]);
      const statusVal = (isExtended21 ? cols[19] : cols[16])?.trim() || '完結';
      const memoVal = (isExtended21 ? cols[20] : cols[17])?.trim() || '';

      imported.push({
        id: `rec-imp-${Date.now()}-${idx}`,
        month: monthName,
        date: cols[0]?.trim() || '9/25',
        staff: cols[1]?.trim() || '松浦',
        customerName: cols[2]?.trim() || 'インポート案件',
        area: cols[3]?.trim() || '',
        category: cols[4]?.trim() || '',
        purchaseAmount,
        media: cols[6]?.trim() || 'チラシ',
        carryover,
        marketSales,
        goldSales,
        yahooSales,
        mercariSales,
        recoverySales,
        estimatedGoldGrossProfit: goldSales > 0 ? Math.max(0, goldSales - purchaseAmount) : 0,
        estimatedYahooGrossProfit: yahooSales > 0 ? Math.max(0, yahooSales - purchaseAmount) : 0,
        platformFee,
        shippingCost,
        transportCost,
        disposalCost,
        status: statusVal,
        memo: memoVal,
      });
    });
    if (imported.length > 0) {
      onImportRecords(imported);
      setImportMsg(`${imported.length}件の案件データをインポートしました！`);
      setPasteText('');
      setTimeout(() => setImportMsg(null), 4000);
    }
  };

  const kobutsuTotalPurchase = kobutsuFilteredRecords.reduce((s, r) => s + (r.purchaseAmount || 0), 0);
  const kobutsuVerifiedCount = kobutsuFilteredRecords.filter(r => r.idDocType || r.idDocNumber).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 my-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base">入出力・古物台帳エクスポート / データ管理</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setModalTab('spreadsheet')}
            className={`px-4 py-2 font-bold rounded-t-lg border-t-2 border-x transition-colors flex items-center gap-1.5 cursor-pointer ${
              modalTab === 'spreadsheet'
                ? 'bg-white border-t-emerald-600 border-x-gray-200 text-emerald-900 -mb-px pb-2.5'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>売上表・スプレッドシート入出力</span>
          </button>
          <button
            type="button"
            onClick={() => setModalTab('kobutsu')}
            className={`px-4 py-2 font-bold rounded-t-lg border-t-2 border-x transition-colors flex items-center gap-1.5 cursor-pointer ${
              modalTab === 'kobutsu'
                ? 'bg-white border-t-slate-700 border-x-gray-200 text-slate-900 -mb-px pb-2.5'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>古物台帳（Excel / BOM付CSV）出力</span>
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-gray-700 max-h-[75vh] overflow-y-auto">
          {modalTab === 'spreadsheet' ? (
            <>
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">1クリックでGoogleスプレッドシートに貼り付け (推奨)</h4>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      当月（{monthName}）の全明細データをクリップボードにコピーし、GoogleスプレッドシートのA1セルで貼り付け(Ctrl+V)するだけで即座に表が再現されます。
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (await copyRecordsAsTSV(records)) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer ${
                      copied ? 'bg-emerald-800 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'コピー完了！' : '全データをコピー'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/70 text-[11px] text-emerald-900">
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="font-bold">ステップ 1:</span> 「全データをコピー」をクリック
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200 flex items-center justify-between">
                    <span><span className="font-bold">ステップ 2:</span> sheets.new を開く</span>
                    <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold">
                      開く <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="font-bold">ステップ 3:</span> A1セルで <kbd className="px-1 py-0.5 bg-gray-100 border rounded font-mono font-bold">Ctrl+V</kbd> で貼り付け
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Excelワークブック (.xlsx) ファイルのダウンロード</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    「売上明細（メルカリShops・手数料含む）」と「市場管理」の複数シートおよびSUM計算式を含んだExcelファイルを出力します。
                  </p>
                </div>
                <button
                  onClick={() => exportToExcel(records, marketItems, monthName)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors shrink-0 ml-3 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>.xlsx 出力</span>
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 space-y-2.5 bg-white">
                <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>スプレッドシート / CSV データの貼り付けインポート（追加取込）</span>
                </h4>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={3}
                  placeholder="ExcelやGoogleスプレッドシートの行をコピーしてここに貼り付け (日付 / 担当 / お客様名 / 地域 / 品目 / 買取額 / 媒体...)"
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono text-[11px] focus:border-emerald-500 outline-none"
                />
                <div className="flex items-center justify-between">
                  {importMsg ? (
                    <span className="text-emerald-700 font-bold">{importMsg}</span>
                  ) : (
                    <span className="text-[11px] text-gray-400">※ タブ区切り(TSV)またはカンマ区切り(CSV)に対応（旧18列・新21列自動判別）</span>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteImport}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    貼り付けデータを追加取込
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 古物台帳出力タブ */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-slate-700" />
                      <span>古物台帳（法定項目対応）期間指定エクスポート</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      全月データ（全{sourceRecords.length}件）から指定期間の取引を抽出し、年齢自動計算付きで出力します。
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const r = getMonthRange(monthName);
                        setStartDate(r.start);
                        setEndDate(r.end);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      表示中({monthName})のみ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold cursor-pointer"
                    >
                      全期間
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">開始日</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">終了日</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans">抽出件数</div>
                    <div className="font-bold text-sm text-slate-900">{kobutsuFilteredRecords.length} 件</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans">代価合計(買取総額)</div>
                    <div className="font-bold text-sm text-rose-700">¥{formatCurrency(kobutsuTotalPurchase)}</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans">本人確認書類 入力済</div>
                    <div className="font-bold text-sm text-emerald-700">{kobutsuVerifiedCount} / {kobutsuFilteredRecords.length} 件</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={kobutsuFilteredRecords.length === 0}
                    onClick={() => exportKobutsuLedgerExcel(kobutsuFilteredRecords, startDate, endDate)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>古物台帳 Excel (.xlsx) 出力</span>
                  </button>
                  <button
                    type="button"
                    disabled={kobutsuFilteredRecords.length === 0}
                    onClick={() => exportKobutsuLedgerCSV(kobutsuFilteredRecords, startDate, endDate)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>UTF-8 BOM付 CSV (.csv) 出力</span>
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between font-bold text-[11px] text-gray-700">
                  <span>出力プレビュー（取引日順 / 先頭5件表示）</span>
                  <span className="font-normal text-gray-500">出力項目: 全11項目（取引年月日〜本人確認番号）</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                        <th className="py-1.5 px-2 border-r whitespace-nowrap">取引日</th>
                        <th className="py-1.5 px-2 border-r whitespace-nowrap">区分</th>
                        <th className="py-1.5 px-2 border-r whitespace-nowrap">品名・特徴</th>
                        <th className="py-1.5 px-2 border-r text-center whitespace-nowrap">数量</th>
                        <th className="py-1.5 px-2 border-r text-right whitespace-nowrap">代価</th>
                        <th className="py-1.5 px-2 border-r whitespace-nowrap">相手方氏名</th>
                        <th className="py-1.5 px-2 border-r whitespace-nowrap">住所 / 年齢</th>
                        <th className="py-1.5 px-2 whitespace-nowrap">本人確認書類</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {kobutsuFilteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-gray-400">
                            指定期間に該当する取引データがありません。
                          </td>
                        </tr>
                      ) : (
                        kobutsuFilteredRecords.slice(0, 5).map(r => {
                          const age = calcAgeAtDate(r.customerBirthDate, parseRecordDate(r));
                          return (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2 border-r font-mono whitespace-nowrap">{formatRecordFullDate(r, '/')}</td>
                              <td className="py-1.5 px-2 border-r">{r.category || '-'}</td>
                              <td className="py-1.5 px-2 border-r max-w-36 truncate">{r.itemFeatures || r.memo || '-'}</td>
                              <td className="py-1.5 px-2 border-r text-center font-mono">{r.itemQuantity ?? 1}</td>
                              <td className="py-1.5 px-2 border-r text-right font-mono text-rose-700">¥{formatCurrency(r.purchaseAmount)}</td>
                              <td className="py-1.5 px-2 border-r font-semibold">{r.customerName}</td>
                              <td className="py-1.5 px-2 border-r max-w-40 truncate">
                                {r.customerAddress || r.area || '-'}
                                {age !== null && <span className="ml-1 text-blue-700 font-semibold">({age}歳)</span>}
                              </td>
                              <td className="py-1.5 px-2 whitespace-nowrap">
                                {r.idDocType ? `${r.idDocType}${r.idDocNumber ? ` (${r.idDocNumber})` : ''}` : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('すべてのデータを消去し、ゼロ（初期状態）にリセットしますか？')) {
                  onResetDefault();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>全データをゼロにリセット</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
