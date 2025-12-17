import React from 'react';
import { KeyMapping } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  mappings: KeyMapping[];
  setMappings: (m: KeyMapping[]) => void;
}

const MappingEditor: React.FC<Props> = ({ mappings, setMappings }) => {
  const updateMapping = (id: string, field: keyof KeyMapping, value: any) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addNew = () => {
    const newMap: KeyMapping = {
      id: Date.now().toString(),
      name: '新规则',
      trigger: 'cmd',
      type: 'shortcut',
      key: 'x',
      ctrlKey: true,
      exitKey: 'ArrowRight'
    };
    setMappings([...mappings, newMap]);
  };

  const remove = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id));
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">快捷键映射配置</h3>
        <button onClick={addNew} className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded transition">
          <Plus size={14} /> 添加规则
        </button>
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {mappings.map(m => (
          <div key={m.id} className="bg-slate-900 p-3 rounded border border-slate-700 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <input 
                  type="text" 
                  value={m.name} 
                  onChange={(e) => updateMapping(m.id, 'name', e.target.value)}
                  className="bg-transparent text-emerald-400 font-bold text-sm focus:outline-none w-1/2"
                />
                <button onClick={() => remove(m.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <label className="text-slate-400 block mb-1">LaTeX 触发词</label>
                    <input 
                      type="text" 
                      value={m.trigger}
                      onChange={(e) => updateMapping(m.id, 'trigger', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-2 py-1 rounded"
                      placeholder="例如: frac"
                    />
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">网页快捷键</label>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-slate-300">
                            <input type="checkbox" checked={m.ctrlKey} onChange={(e) => updateMapping(m.id, 'ctrlKey', e.target.checked)} /> Ctrl
                        </label>
                        <input 
                            type="text" 
                            maxLength={1}
                            value={m.key}
                            onChange={(e) => updateMapping(m.id, 'key', e.target.value)}
                            className="w-10 bg-slate-800 border border-slate-600 text-center text-slate-200 px-1 py-1 rounded uppercase"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">后继键 (切分母等)</label>
                     <select 
                        value={m.nextFieldKey || ''}
                        onChange={(e) => updateMapping(m.id, 'nextFieldKey', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-2 py-1 rounded"
                     >
                         <option value="">无</option>
                         <option value="ArrowRight">右方向键 (→)</option>
                         <option value="Tab">Tab 键</option>
                         <option value="ArrowDown">下方向键 (↓)</option>
                     </select>
                </div>
                 <div>
                    <label className="text-slate-400 block mb-1">退出键 (完成公式)</label>
                     <select 
                        value={m.exitKey || 'ArrowRight'}
                        onChange={(e) => updateMapping(m.id, 'exitKey', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-2 py-1 rounded"
                     >
                         <option value="ArrowRight">右方向键 (→)</option>
                         <option value="Tab">Tab 键</option>
                     </select>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MappingEditor;