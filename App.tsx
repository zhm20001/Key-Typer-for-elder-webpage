import React, { useState, useEffect } from 'react';
import { DEFAULT_MAPPINGS, INITIAL_MARKDOWN } from './constants';
import { KeyMapping, OutputType } from './types';
import MappingEditor from './components/MappingEditor';
import { parseMarkdownToActions, generateJavaScriptConsoleScript, generateAutoHotkeyScript } from './services/converter';
import { Terminal, Copy, FileCode, Keyboard, HelpCircle, Eraser, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [mappings, setMappings] = useState<KeyMapping[]>(DEFAULT_MAPPINGS);
  const [outputType, setOutputType] = useState<OutputType>(OutputType.JS_CONSOLE);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    try {
      const actions = parseMarkdownToActions(markdown, mappings);
      let code = '';
      if (outputType === OutputType.JS_CONSOLE) {
        code = generateJavaScriptConsoleScript(actions, mappings);
      } else {
        code = generateAutoHotkeyScript(actions, mappings);
      }
      setGeneratedCode(code);
    } catch (e) {
      setGeneratedCode('解析错误：请检查语法。');
    }
  }, [markdown, mappings, outputType]);

  const handleLocalClean = () => {
    let text = markdown;
    text = text.replace(/\\\[|\\\]|\\\(|\\\)/g, '');
    text = text.replace(/\$\$/g, '').replace(/\$/g, '');
    text = text.replace(/\\quad/g, '  ');
    text = text.replace(/^\s*[\r\n]/gm, '');
    text = text.replace(/\\(text|mathrm|mbox)\{([^{}]+)\}/g, '$2');
    text = text.replace(/\\left\s*/g, '').replace(/\\right\s*/g, '');
    text = text.replace(/\\(sin|cos|tan|csc|sec|cot|ln|log|exp|lim|min|max)/g, '$1');
    text = text.replace(/\\,/g, ' ');
    setMarkdown(text.trim());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeClass = isDarkMode 
    ? "bg-slate-900 text-slate-200" 
    : "bg-[#fcf9f1] text-stone-700";
  
  const sidebarClass = isDarkMode
    ? "bg-slate-950 border-slate-800"
    : "bg-[#f3efe4] border-stone-200";

  const getButtonClass = (type: OutputType) => {
    const isActive = outputType === type;
    if (isActive) {
      return isDarkMode ? "bg-emerald-600 text-white shadow-md" : "bg-stone-700 text-white shadow-md";
    }
    return isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-stone-400 hover:bg-stone-50";
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-300 ${themeClass}`}>
      {/* Left Sidebar: Settings */}
      <aside className={`w-full md:w-80 p-4 border-r flex flex-col gap-4 overflow-y-auto max-h-screen shrink-0 ${sidebarClass}`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-xl font-bold flex items-center gap-2 mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-stone-800'}`}>
              <Keyboard size={24} /> 公式宏生成器
            </h1>
            <p className={`text-[10px] font-medium tracking-tight ${isDarkMode ? 'text-slate-500' : 'text-stone-500'}`}>
              Tex / Markdown 自动化按键转换工具
            </p>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Core Steps */}
        <div className={`p-3 rounded border text-[11px] leading-relaxed ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-stone-100 text-stone-600'}`}>
           <h3 className={`font-bold mb-2 flex items-center gap-1 uppercase tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-stone-800'}`}>
             <HelpCircle size={14} /> 核心使用步骤
           </h3>
           <ol className="list-decimal list-inside space-y-2">
             <li>粘贴你的 <span className="font-bold">Tex / Markdown</span> 源码（支持普通文本与公式混合）。</li>
             <li>点击上方 <span className="font-bold text-sky-500">“本地格式清洗”</span> 去除公式包裹符号。</li>
             <li>检查下方 <span className="font-bold">映射配置</span>，确保触发词与延迟符合需求。</li>
             <li>复制脚本，在目标网页按下 <span className="font-bold text-amber-600">F12</span> 呼出控制台 (Console) 粘贴并回车。</li>
           </ol>
           <div className={`mt-3 p-2 rounded border leading-tight ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-[#fcf9f1] border-stone-100 text-stone-700'}`}>
             <span className={`font-bold block mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-amber-800'}`}>执行小贴士:</span>
             回车后请在<span className="text-red-500 font-bold underline"> 3 秒内 </span>点击目标网页的输入框，使焦点置入。
           </div>
        </div>

        {/* Mapping Editor */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <MappingEditor mappings={mappings} setMappings={setMappings} isDarkMode={isDarkMode} />
        </div>

        <div className={`mt-auto pt-2 border-t flex justify-between items-center text-[10px] ${isDarkMode ? 'border-slate-800 text-slate-600' : 'border-stone-200 text-stone-400'}`}>
          <span>KeyMacro v1.5</span>
          <span className={`font-mono px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-800 text-emerald-500' : 'bg-white text-stone-600'}`}>Production</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Toolbar */}
        <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-100'}`}>
          <div className="flex gap-2">
             <button 
                onClick={() => setOutputType(OutputType.JS_CONSOLE)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${getButtonClass(OutputType.JS_CONSOLE)}`}
             >
                <Terminal size={14} /> JS 控制台脚本
             </button>
             <button 
                onClick={() => setOutputType(OutputType.AUTOHOTKEY)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${getButtonClass(OutputType.AUTOHOTKEY)}`}
             >
                <FileCode size={14} /> AHK 宏脚本
             </button>
          </div>

          <div className="flex gap-3">
             <button 
              onClick={handleLocalClean}
              className={`flex items-center gap-2 text-xs px-4 py-1.5 rounded transition font-bold border ${isDarkMode ? 'text-sky-400 border-sky-900 bg-sky-900/10 hover:bg-sky-900/30' : 'text-stone-600 border-stone-200 bg-stone-50 hover:bg-stone-100'}`}
            >
              <Eraser size={14} /> 本地格式清洗
            </button>
          </div>
        </header>

        {/* Workspace Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
            <div className={`flex flex-col border-r h-full overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-stone-100'}`}>
                <div className="flex-1 p-0 relative min-h-0">
                    <textarea 
                        className={`w-full h-full p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed overflow-y-auto transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-300 placeholder:text-slate-700' : 'bg-[#fcf9f1] text-stone-700 placeholder:text-stone-300'}`}
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        placeholder="在此粘贴你的 Tex / Markdown 源码..."
                    />
                </div>
            </div>

            <div className={`flex flex-col h-full overflow-hidden ${isDarkMode ? 'bg-black' : 'bg-[#f5f2e9]'}`}>
                <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'}`}>
                    <span className={`text-[9px] font-mono tracking-widest uppercase font-bold opacity-50 ${isDarkMode ? 'text-emerald-500' : 'text-stone-600'}`}>
                        {outputType === OutputType.JS_CONSOLE ? 'Generated JS Payload' : 'Generated AHK Script'}
                    </span>
                    <button 
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 text-[10px] px-4 py-1.5 rounded transition font-black uppercase tracking-tight shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-stone-700 hover:bg-stone-800 text-white'}`}
                    >
                        {copied ? '已成功复制!' : <><Copy size={12} /> 复制代码到剪贴板</>}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
                    <pre className={`font-mono text-xs whitespace-pre-wrap break-all leading-relaxed ${isDarkMode ? 'text-green-400' : 'text-stone-600'}`}>
                        {generatedCode}
                    </pre>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;