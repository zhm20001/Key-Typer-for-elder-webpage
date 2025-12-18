
import React from 'react';
import { KeyMapping } from '../types';
import { Trash2, Plus, Keyboard, Type, Timer } from 'lucide-react';

interface Props {
  mappings: KeyMapping[];
  setMappings: (m: KeyMapping[]) => void;
  isDarkMode?: boolean;
}

const MappingEditor: React.FC<Props> = ({ mappings, setMappings, isDarkMode = true }) => {
  const updateMapping = (id: string, field: keyof KeyMapping, value: any) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addNew = () => {
    const newMap: KeyMapping = {
      id: Date.now().toString(),
      name: '自定义规则',
      trigger: 'new',
      type: 'shortcut',
      key: 'n',
      ctrlKey: true,
      delay: 5,
      exitKey: 'ArrowRight'
    };
    setMappings([...mappings, newMap]);
  };

  const remove = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id));
  };

  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200 shadow-sm';
  const inputBg = isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#fcf9f1] border-stone-100 text-stone-800';

  return (
    <div className={`flex-1 flex flex-col min-h-0 ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">映射配置</h3>
        <button 
          onClick={addNew} 
          className={`text-[9px] flex items-center gap-1 px-2.5 py-1 rounded transition shadow-sm font-bold uppercase ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-stone-600 hover:bg-stone-500 text-white'}`}
        >
          <Plus size={10} /> 新增
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {mappings.map(m => (
          <div key={m.id} className={`p-2.5 rounded border flex flex-col gap-2 transition-colors ${cardBg}`}>
            <div className="flex justify-between items-center">
                <input 
                  type="text" 
                  value={m.name} 
                  onChange={(e) => updateMapping(m.id, 'name', e.target.value)}
                  className={`bg-transparent font-black text-[10px] focus:outline-none w-2/3 ${isDarkMode ? 'text-emerald-400' : 'text-stone-700'}`}
                />
                <button onClick={() => remove(m.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={12} />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="col-span-2">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => updateMapping(m.id, 'type', 'shortcut')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded border transition-colors font-bold ${m.type === 'shortcut' ? (isDarkMode ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' : 'bg-stone-50 border-stone-300 text-stone-800') : (isDarkMode ? 'border-slate-800 text-slate-500' : 'border-stone-50 text-stone-400')}`}
                    >
                      <Keyboard size={10} /> 组合键
                    </button>
                    <button 
                      onClick={() => updateMapping(m.id, 'type', 'sequence')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded border transition-colors font-bold ${m.type === 'sequence' ? (isDarkMode ? 'bg-sky-900/30 border-sky-500 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-800') : (isDarkMode ? 'border-slate-800 text-slate-500' : 'border-stone-50 text-stone-400')}`}
                    >
                      <Type size={10} /> 文本串
                    </button>
                  </div>
                </div>

                <div>
                    <label className="text-slate-500 block mb-0.5 font-bold scale-90 origin-left uppercase opacity-60">触发 (Trigger)</label>
                    <input 
                      type="text" 
                      value={m.trigger}
                      onChange={(e) => updateMapping(m.id, 'trigger', e.target.value)}
                      className={`w-full px-1.5 py-1 rounded outline-none border focus:ring-1 ${inputBg} ${isDarkMode ? 'focus:ring-emerald-500' : 'focus:ring-stone-400'}`}
                    />
                </div>

                <div>
                    <label className="text-slate-500 block mb-0.5 font-bold scale-90 origin-left uppercase opacity-60">延迟 (Delay)</label>
                    <div className={`flex items-center gap-1 border rounded px-1.5 ${inputBg}`}>
                      <Timer size={10} className="text-slate-500" />
                      <input 
                        type="number" 
                        value={m.delay || 0}
                        onChange={(e) => updateMapping(m.id, 'delay', parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent py-1 outline-none font-mono"
                      />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="text-slate-500 block mb-0.5 font-bold scale-90 origin-left uppercase opacity-60">响应动作 (Action)</label>
                    {m.type === 'shortcut' ? (
                      <div className="flex items-center gap-1">
                          <label className={`flex items-center gap-0.5 px-1.5 py-1 rounded border cursor-pointer select-none transition-colors font-bold ${inputBg}`}>
                              <input type="checkbox" className="scale-75 accent-stone-700" checked={m.ctrlKey} onChange={(e) => updateMapping(m.id, 'ctrlKey', e.target.checked)} /> Ctl
                          </label>
                          <label className={`flex items-center gap-0.5 px-1.5 py-1 rounded border cursor-pointer select-none transition-colors font-bold ${inputBg}`}>
                              <input type="checkbox" className="scale-75 accent-stone-700" checked={m.shiftKey} onChange={(e) => updateMapping(m.id, 'shiftKey', e.target.checked)} /> Shf
                          </label>
                          <input 
                              type="text" 
                              maxLength={1}
                              value={m.key}
                              onChange={(e) => updateMapping(m.id, 'key', e.target.value)}
                              className={`flex-1 text-center py-1 rounded border uppercase font-black focus:ring-1 outline-none ${inputBg} ${isDarkMode ? 'focus:ring-emerald-500' : 'focus:ring-stone-400'}`}
                          />
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="模拟键入内容..."
                        value={m.sequence || ''}
                        onChange={(e) => updateMapping(m.id, 'sequence', e.target.value)}
                        className={`w-full px-2 py-1 rounded border focus:ring-1 outline-none font-mono ${inputBg} ${isDarkMode ? 'focus:ring-sky-500' : 'focus:ring-stone-400'}`}
                      />
                    )}
                </div>

                <div>
                    <label className="text-slate-500 block mb-0.5 font-bold scale-90 origin-left uppercase opacity-60">下一栏导航</label>
                     <select 
                        value={m.nextFieldKey || ''}
                        onChange={(e) => updateMapping(m.id, 'nextFieldKey', e.target.value)}
                        className={`w-full py-1 px-1 rounded border outline-none font-medium ${inputBg}`}
                     >
                         <option value="">不导航</option>
                         <option value="ArrowRight">右方向键 →</option>
                         <option value="Tab">Tab 键</option>
                         <option value="ArrowDown">下方向键 ↓</option>
                     </select>
                </div>

                 <div>
                    <label className="text-slate-500 block mb-0.5 font-bold scale-90 origin-left uppercase opacity-60">完成退出</label>
                     <select 
                        value={m.exitKey || 'ArrowRight'}
                        onChange={(e) => updateMapping(m.id, 'exitKey', e.target.value)}
                        className={`w-full py-1 px-1 rounded border outline-none font-medium ${inputBg}`}
                     >
                         <option value="ArrowRight">右方向键 →</option>
                         <option value="Tab">Tab 键</option>
                         <option value="Enter">Enter 回车</option>
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
