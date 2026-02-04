
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Upload, 
  HelpCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { calculateIntervalMinutes, displayDate } from '../utils/time';
import { SurgeryRecord, CleaningRecord } from '../types';

interface ImportManagementProps {
  type: 'turnover' | 'cleaning';
  onBatchAdd: (records: any[]) => void;
}

const TutorialModal: React.FC<{ isOpen: boolean; onClose: () => void; type: 'turnover' | 'cleaning' }> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100005] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-300">
        <div className="bg-[#0f172a] p-6 flex items-center justify-between">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">
            Padrão de Importação - {type === 'turnover' ? 'Turnover' : 'Limpeza'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase">
              1. O arquivo deve estar no formato <span className="text-[#EE3234]">.CSV</span> (Separado por ponto e vírgula). Arquivos .xlsx não funcionam.
            </p>
            <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase">
              2. As colunas devem seguir esta ordem exata:
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[10px] text-[#3583C7] break-all">
              {type === 'turnover' 
                ? "Data;Paciente;Prontuário;Sala;Início Anestesia;Fim Anestesia"
                : "Data;Sala;Tipo;Colaborador;Enfermeiro;Início;Término"
              }
            </div>
            <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase">
              3. Datas: <span className="text-slate-900">DD/MM/AAAA</span>.
            </p>
            <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase">
              4. Horários: <span className="text-slate-900">HH:MM</span>.
            </p>
            {type === 'cleaning' && (
              <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase">
                5. Tipo: <span className="text-slate-900">CONCORRENTE</span> ou <span className="text-slate-900">TERMINAL</span>.
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#3583C7] text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#2d70ab] transition-all"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const ImportManagement: React.FC<ImportManagementProps> = ({ type, onBatchAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRecords, setPendingRecords] = useState<any[] | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      alert("ERRO: O sistema não aceita arquivos .xlsx. Salve como 'CSV (Separado por ponto e vírgula)' no Excel.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        if (text.includes('PK\u0003\u0004')) {
          throw new Error("Arquivo Excel binário detectado. Por favor, salve como CSV.");
        }

        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) throw new Error("Arquivo vazio ou sem registros.");

        const importedItems: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(';').map(c => c.trim().replace(/^"|"$/g, ''));
          
          if (type === 'turnover') {
            if (cols.length < 6) continue;
            const rawDate = cols[0].replace(/\//g, '-');
            const [d, m, y] = rawDate.split('-');
            if (!d || !m || !y) continue;
            const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            const diff = calculateIntervalMinutes(cols[4], cols[5]);
            
            importedItems.push({
              id: Math.random().toString(36).substr(2, 9),
              date: isoDate,
              patientName: cols[1].toUpperCase(),
              medicalRecord: cols[2],
              roomNumber: cols[3].padStart(2, '0'),
              endAnesthesiaPrev: cols[4],
              startAnesthesiaNext: cols[5],
              intervalMinutes: diff,
              isDelay: diff > 60
            } as SurgeryRecord);
          } else {
            if (cols.length < 7) continue;
            const rawDate = cols[0].replace(/\//g, '-');
            const [d, m, y] = rawDate.split('-');
            if (!d || !m || !y) continue;
            const isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            const duration = calculateIntervalMinutes(cols[5], cols[6]);

            importedItems.push({
              id: Math.random().toString(36).substr(2, 9),
              date: isoDate,
              roomNumber: cols[1].padStart(2, '0'),
              cleaningType: cols[2] as any,
              staffName: cols[3].toUpperCase(),
              nurseName: cols[4].toUpperCase(),
              startTime: cols[5],
              endTime: cols[6],
              durationMinutes: duration
            } as CleaningRecord);
          }
        }

        if (importedItems.length > 0) {
          setPendingRecords(importedItems);
        } else {
          alert("Nenhum registro válido encontrado. Verifique se o separador é ';' (ponto e vírgula).");
        }
      } catch (err: any) {
        alert(err.message || "Erro ao processar arquivo.");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const removeRecord = (id: string) => {
    if (!pendingRecords) return;
    setPendingRecords(pendingRecords.filter(r => r.id !== id));
  };

  const confirmImport = () => {
    if (!pendingRecords) return;
    onBatchAdd(pendingRecords);
    alert(`Sucesso! ${pendingRecords.length} registros importados.`);
    setPendingRecords(null);
  };

  if (pendingRecords) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in py-2">
        <div className="bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-160px)]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPendingRecords(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Revisar Importação</h2>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{pendingRecords.length} registros extraídos</p>
              </div>
            </div>
            <button 
              onClick={confirmImport}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all active:scale-95"
            >
              <CheckCircle size={14} /> Confirmar Todos
            </button>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-[#0f172a] text-white z-10">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-[9px] [&>th]:font-black [&>th]:uppercase [&>th]:tracking-widest [&>th]:border-b [&>th]:border-slate-800">
                  <th className="w-[100px]">Data</th>
                  {type === 'turnover' ? (
                    <>
                      <th className="w-auto">Paciente</th>
                      <th className="w-[80px]">Sala</th>
                      <th className="w-[70px]">Tempo</th>
                    </>
                  ) : (
                    <>
                      <th className="w-[80px]">Sala</th>
                      <th className="w-auto">Colaborador</th>
                      <th className="w-[70px]">Tempo</th>
                    </>
                  )}
                  <th className="w-[60px] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {pendingRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 border-b border-slate-200">
                    <td className="px-4 py-3 text-[10px] font-bold text-slate-500">{displayDate(r.date)}</td>
                    {type === 'turnover' ? (
                      <>
                        <td className="px-4 py-3 text-[10px] font-black text-slate-900 uppercase truncate">{r.patientName}</td>
                        <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 text-[9px] font-black">{r.roomNumber}</span></td>
                        <td className="px-4 py-3 text-center text-[10px] font-black">{r.intervalMinutes}m</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-center"><span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 text-[9px] font-black">{r.roomNumber}</span></td>
                        <td className="px-4 py-3 text-[10px] font-black text-slate-900 uppercase truncate">{r.staffName}</td>
                        <td className="px-4 py-3 text-center text-[10px] font-black">{r.durationMinutes}m</td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => removeRecord(r.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        title="Remover da lista"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4 animate-fade-in">
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} type={type} />
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv,.txt" className="hidden" />

      <div className="bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
        <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50 relative">
          <button 
            onClick={() => setShowTutorial(true)}
            className="absolute right-4 top-4 text-slate-400 hover:text-[#3583C7] opacity-60 hover:opacity-100 transition-all"
            title="Como importar?"
          >
            <HelpCircle size={20} />
          </button>

          <div className="w-16 h-16 bg-blue-50 text-[#3583C7] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
            <Upload size={24} />
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Importar Dados</h2>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">
            Selecione o arquivo CSV de {type === 'turnover' ? 'Turnover Cirúrgico' : 'Registro de Limpeza'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-[#3583C7] hover:bg-blue-50/30 transition-all flex flex-col items-center gap-3"
          >
            <FileText size={40} className="text-slate-200 group-hover:text-[#3583C7] transition-colors" />
            <div className="text-center">
              <span className="block text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-[#3583C7]">Clique para selecionar</span>
              <span className="block text-[9px] text-slate-300 font-bold uppercase mt-1">Apenas .CSV (Ponto e vírgula)</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[9px] text-amber-700 font-bold uppercase leading-relaxed">
              O sistema exige o formato CSV (;). <br/>
              Consulte a ajuda (?) para ver a ordem correta das colunas.
            </p>
          </div>

          <button 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 bg-[#3583C7] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#2d70ab] transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Processando...' : 'Escolher Arquivo'}
          </button>
        </div>
      </div>
    </div>
  );
};
