import React from 'react';
import { useApp } from '../../context/AppContext';
import { TablesView } from './TablesView';
import { Table } from '../../types/pos';

interface TableSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSelectModal: React.FC<TableSelectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setSelectedTable, openTableOrder } = useApp();

  if (!isOpen) return null;

  const handleSelect = (table: Table) => {
    setSelectedTable(table);
    openTableOrder(table);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0a0f1d] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <TablesView onSelectTable={handleSelect} isModal={true} onClose={onClose} />
      </div>
    </div>
  );
};
