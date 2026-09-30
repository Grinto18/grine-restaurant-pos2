import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Utensils,
  Clock,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react';
import { Table, TableStatus } from '../../types/pos';

interface TablesViewProps {
  onSelectTable?: (table: Table) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const TablesView: React.FC<TablesViewProps> = ({
  onSelectTable,
  isModal = false,
  onClose,
}) => {
  const {
    tables,
    openTableOrder,
    saveTable,
    deleteTable,
    hasPermission,
    t,
    settings,
  } = useApp();

  const [activeFloor, setActiveFloor] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Form states for table CRUD
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formName, setFormName] = useState<string>('');
  const [formCapacity, setFormCapacity] = useState<number>(4);
  const [formFloor, setFormFloor] = useState<string>('Salle Principale');
  const [formStatus, setFormStatus] = useState<TableStatus>('free');

  const floors = Array.from(new Set(tables.map((t) => t.floor || 'Salle Principale')));

  const filteredTables = tables.filter(
    (tbl) => activeFloor === 'all' || (tbl.floor || 'Salle Principale') === activeFloor
  );

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'free':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/50',
          badge: 'bg-emerald-500 text-white',
          text: 'text-emerald-400',
          label: '🟢 متاحة',
        };
      case 'occupied':
        return {
          bg: 'bg-red-950/40',
          border: 'border-red-500/50',
          badge: 'bg-red-500 text-white',
          text: 'text-red-400',
          label: '🔴 مشغولة',
        };
      case 'waiting':
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/50',
          badge: 'bg-amber-500 text-black font-black',
          text: 'text-amber-300',
          label: '🟡 طلب جاهز',
        };
      case 'reserved':
        return {
          bg: 'bg-blue-950/40',
          border: 'border-blue-500/50',
          badge: 'bg-blue-500 text-white',
          text: 'text-blue-400',
          label: '🔵 محجوزة',
        };
    }
  };

  const handleTableClick = (table: Table) => {
    if (onSelectTable) {
      onSelectTable(table);
    } else {
      openTableOrder(table);
    }
    if (onClose) onClose();
  };

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormNumber(tables.length + 1);
    setFormName(`طاولة ${tables.length + 1}`);
    setFormCapacity(4);
    setFormFloor(floors[0] || 'Salle Principale');
    setFormStatus('free');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    setEditingTable(table);
    setFormNumber(table.number);
    setFormName(table.name);
    setFormCapacity(table.capacity);
    setFormFloor(table.floor || 'Salle Principale');
    setFormStatus(table.status);
    setIsEditorOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه الطاولة؟')) {
      deleteTable(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newTable: Table = {
      id: editingTable ? editingTable.id : `tbl-${Date.now()}`,
      number: Number(formNumber),
      name: formName.trim() || `طاولة ${formNumber}`,
      capacity: Number(formCapacity),
      floor: formFloor,
      status: formStatus,
    };
    saveTable(newTable);
    setIsEditorOpen(false);
  };

  // Stats
  const freeCount = tables.filter((t) => t.status === 'free').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const waitingCount = tables.filter((t) => t.status === 'waiting').length;

  return (
    <div
      className={`flex-1 flex flex-col h-full bg-[#120a05] text-[#fef3c7] overflow-hidden p-5 select-none font-['Cairo',sans-serif] ${
        isModal ? 'p-6' : ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#362111] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-950/40">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#fffdfa] flex items-center gap-2">
              <span>خريطة وإدارة الطاولات</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-extrabold">
                {tables.length} طاولات
              </span>
            </h2>
            <p className="text-xs text-amber-200/70">
              اختر طاولة لفتح طلب جديد أو متابعة طلب الزبائن الحاليين
            </p>
          </div>
        </div>

        {/* Legend status indicators */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>متاحة ({freeCount})</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
            <span>مشغولة ({occupiedCount})</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>طلب جاهز ({waitingCount})</span>
          </div>

          {hasPermission(['admin', 'manager']) && !isModal && (
            <button
              onClick={handleOpenAdd}
              className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طاولة</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#26180c] border border-[#422915] text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Floor Filter Tabs */}
      <div className="flex items-center gap-2 pt-4 pb-2 shrink-0">
        <button
          onClick={() => setActiveFloor('all')}
          className={`py-1.5 px-4 rounded-xl text-xs font-black transition ${
            activeFloor === 'all'
              ? 'bg-amber-600 text-white shadow'
              : 'bg-[#1c1209] text-stone-400 border border-[#3e2715] hover:text-white'
          }`}
        >
          جميع الصالات
        </button>
        {floors.map((fl) => (
          <button
            key={fl}
            onClick={() => setActiveFloor(fl)}
            className={`py-1.5 px-4 rounded-xl text-xs font-black transition ${
              activeFloor === fl
                ? 'bg-amber-600 text-white shadow'
                : 'bg-[#1c1209] text-stone-400 border border-[#3e2715] hover:text-white'
            }`}
          >
            {fl}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredTables.map((table) => {
            const style = getStatusColor(table.status);
            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative p-4 rounded-3xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[140px] text-right active:scale-97 hover:shadow-xl ${style.bg} ${style.border}`}
              >
                {/* Table Top: Number & Status Badge */}
                <div className="flex items-start justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${style.badge}`}
                  >
                    {style.label}
                  </span>

                  <div className="w-10 h-10 rounded-2xl bg-[#140d07] border border-[#3e2715] flex items-center justify-center font-black text-amber-400 text-base shadow-inner">
                    {table.number}
                  </div>
                </div>

                {/* Table Middle: Name & Guests */}
                <div className="my-2">
                  <div className="font-black text-sm text-[#fffdfa] truncate">
                    {table.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>سعة: {table.capacity} مقاعد</span>
                  </div>
                </div>

                {/* Table Bottom: Action hint & Admin controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#362111]/60 text-xs">
                  <span className={`font-bold text-[11px] ${style.text}`}>
                    {table.status === 'free' ? 'انقر لفتح الطلب ➔' : 'عرض الفاتورة ➔'}
                  </span>

                  {hasPermission(['admin', 'manager']) && !isModal && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEdit(e, table)}
                        className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition"
                        title="تعديل الطاولة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, table.id)}
                        className="p-1 rounded-lg hover:bg-red-950/60 text-stone-400 hover:text-red-400 transition"
                        title="حذف الطاولة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Modal for Adding/Editing Tables */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleSave}
            className="w-full max-w-sm bg-[#1c1209] border border-[#422915] rounded-3xl p-5 shadow-2xl space-y-4 text-right"
          >
            <div className="flex items-center justify-between border-b border-[#362111] pb-2">
              <h3 className="text-base font-black text-white">
                {editingTable ? 'تعديل بيانات الطاولة' : 'إضافة طاولة جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">رقم الطاولة:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formNumber}
                  onChange={(e) => setFormNumber(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#22150b] border border-[#422915] rounded-xl text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">اسم الطاولة:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-[#22150b] border border-[#422915] rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1">السعة (أشخاص):</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#22150b] border border-[#422915] rounded-xl text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1">الصالة:</label>
                  <input
                    type="text"
                    required
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    className="w-full p-2.5 bg-[#22150b] border border-[#422915] rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">الحالة الأولية:</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TableStatus)}
                  className="w-full p-2.5 bg-[#22150b] border border-[#422915] rounded-xl text-white text-sm"
                >
                  <option value="free">🟢 متاحة (شاغرة)</option>
                  <option value="occupied">🔴 مشغولة</option>
                  <option value="waiting">🟡 طلب جاهز</option>
                  <option value="reserved">🔵 محجوزة</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#362111]">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#26180c] border border-[#422915] text-stone-400 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg"
              >
                حفظ الطاولة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
