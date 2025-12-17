import React, { useState, useEffect } from 'react';
import { DEFAULT_MAPPINGS, INITIAL_MARKDOWN } from './constants';
import { KeyMapping, OutputType } from './types';
import MappingEditor from './components/MappingEditor';
import { parseMarkdownToActions, generateJavaScriptConsoleScript, generateAutoHotkeyScript } from './services/converter';
import { cleanMarkdownWithGemini } from './services/gemini';
import { Terminal, Wand2, Copy, FileCode, Keyboard, HelpCircle, Eraser } from 'lucide-react';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [mappings, setMappings] = useState<KeyMapping[]>(DEFAULT_MAPPINGS);
  const [outputType, setOutputType] = useState<OutputType>(OutputType.JS_CONSOLE);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate code when markdown or mappings change
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
      setGeneratedCode('解析错误：请检查 Markdown/LaTeX 语法。');
    }
  }, [markdown, mappings, outputType]);

  const handleGeminiClean = async () => {
    setIsProcessingAI(true);
    try {
      const clean = await cleanMarkdownWithGemini(markdown);
      setMarkdown(clean);
    } catch (error) {
      alert("连接 AI 失败，请检查 API Key。");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleLocalClean = () => {
    let text = markdown;
    // 1. Remove LaTeX block delimiters \[ \] \( \)
    text = text.replace(/\\\[|\\\]|\\\(|\\\)/g, '');
    // 2. Remove $$ and $ delimiters
    text = text.replace(/\$\$/g, '').replace(/\$/g, '');
    // 3. Replace \quad with 2 spaces
    text = text.replace(/\\quad/g, '  ');
    // 4. Remove lines that are purely whitespace
    text = text.replace(/^\s*[\r\n]/gm, '');
    setMarkdown(text.trim());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col md:flex-row">
      {/* Left Sidebar: Settings */}
      <aside className="w-full md:w-80 bg-slate-950 p-4 border-r border-slate-800 flex flex-col gap-6 overflow-y-auto max-h-screen">
        <div>
          <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2 mb-2">
            <Keyboard /> 公式宏生成器
          </h1>
          <p className="text-xs text-slate-500">
            将 Markdown/LaTeX 公式转换为网页按键宏。
          </p>
        </div>

        <MappingEditor mappings={mappings} setMappings={setMappings} />

        <div className="bg-slate-900 p-4 rounded border border-slate-700">
           <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
             <HelpCircle size={14} /> 核心使用步骤
           </h3>
           <ol className="list-decimal list-inside text-xs text-slate-400 space-y-3">
             <li>
               <span className="text-slate-200">输入内容</span>：在右侧粘贴你的 Markdown 格式答案。
             </li>
             <li>
               <span className="text-slate-200">格式清洗</span>：建议先点击顶部的“本地格式清洗”。
             </li>
             <li>
               <span className="text-slate-200">配置映射</span>：在上方设置目标网站的公式快捷键。
             </li>
             <li>
               <span className="text-slate-200">复制脚本</span>：点击右下角的“复制代码”。
             </li>
             <li className="p-2 bg-slate-800 rounded border border-slate-600">
               <strong className="text-emerald-400 block mb-1">如何执行 (JS模式):</strong>
               1. 在目标网页按 <kbd className="bg-slate-700 px-1 rounded">F12</kbd> 打开 Console。<br/>
               2. 粘贴代码并回车。<br/>
               3. <span className="text-yellow-400 font-bold">立刻 (3秒内) 点击网页上的输入框。</span><br/>
               4. 等待脚本自动输入。
             </li>
           </ol>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-600">
          <span>KeyMacro Converter</span>
          <span className="font-mono bg-slate-800 text-emerald-500 px-2 py-0.5 rounded">v1.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Toolbar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex gap-4">
             <button 
                onClick={() => setOutputType(OutputType.JS_CONSOLE)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition ${outputType === OutputType.JS_CONSOLE ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
             >
                <Terminal size={16} /> JS 控制台脚本
             </button>
             <button 
                onClick={() => setOutputType(OutputType.AUTOHOTKEY)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition ${outputType === OutputType.AUTOHOTKEY ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
             >
                <FileCode size={16} /> AutoHotkey 脚本
             </button>
          </div>

          <div className="flex gap-3">
             <button 
              onClick={handleLocalClean}
              className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 border border-sky-800 bg-sky-900/30 px-3 py-1.5 rounded transition hover:bg-sky-900/50"
              title="去除 \[ \] $ $ 和 \quad"
            >
              <Eraser size={16} /> 本地格式清洗
            </button>
            <button 
              onClick={handleGeminiClean}
              disabled={isProcessingAI}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
            >
              <Wand2 size={16} /> {isProcessingAI ? 'AI 正在修复...' : 'AI 智能修复'}
            </button>
          </div>
        </header>

        {/* Workspace Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
            {/* Input Column - Full Height Now */}
            <div className="flex flex-col border-r border-slate-800 h-full overflow-hidden">
                <div className="flex-1 p-0 relative min-h-0">
                    <textarea 
                        className="w-full h-full bg-slate-900 p-6 resize-none focus:outline-none text-slate-300 font-mono text-sm leading-relaxed overflow-y-auto"
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        placeholder="在此粘贴你的 Markdown / LaTeX 标准答案..."
                    />
                </div>
            </div>

            {/* Output Column */}
            <div className="flex flex-col bg-black h-full overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 shrink-0">
                    <span className="text-xs text-emerald-500 font-mono">
                        {outputType === OutputType.JS_CONSOLE ? 'generated_script.js' : 'macro.ahk'}
                    </span>
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded transition"
                    >
                        {copied ? '已复制!' : <><Copy size={14} /> 复制代码</>}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                    <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap break-all">
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