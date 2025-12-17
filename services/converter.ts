import { KeyMapping, ParsedAction, OutputType } from '../types';

// A simple recursive descent parser strategy for LaTeX subsets
export const parseMarkdownToActions = (input: string, mappings: KeyMapping[]): ParsedAction[] => {
  const actions: ParsedAction[] = [];
  let i = 0;

  const mappingMap = new Map<string, KeyMapping>();
  mappings.forEach(m => mappingMap.set(m.trigger, m));

  const addText = (text: string) => {
    if (!text) return;
    actions.push({ type: 'text', content: text });
  };

  while (i < input.length) {
    const char = input[i];

    // Check for LaTeX Command Start
    if (char === '\\') {
      // Find command name
      let cmdEnd = i + 1;
      while (cmdEnd < input.length && /[a-zA-Z]/.test(input[cmdEnd])) {
        cmdEnd++;
      }
      const command = input.substring(i + 1, cmdEnd);
      
      const mapping = mappingMap.get(command);

      if (mapping) {
        // It's a configured command (like \frac)
        i = cmdEnd;
        actions.push({ type: 'command', mappingId: mapping.id });

        // Handle arguments based on command type (heuristic)
        // Usually \frac{arg1}{arg2}
        if (command === 'frac') {
           // Parse Numerator
           parseGroup();
           // Move to Denominator
           actions.push({ type: 'nav', content: mapping.nextFieldKey || 'ArrowRight' });
           // Parse Denominator
           parseGroup();
           // Exit Fraction
           actions.push({ type: 'nav', content: mapping.exitKey || 'ArrowRight' });
        } else if (command === 'sqrt') {
           parseGroup();
           actions.push({ type: 'nav', content: mapping.exitKey || 'ArrowRight' });
        }
      } else {
        // Unknown command, treat as text
        addText('\\');
        i++;
      }
    } 
    // Subscript / Superscript
    else if (char === '^' || char === '_') {
      const mapping = mappingMap.get(char);
      if (mapping) {
        actions.push({ type: 'command', mappingId: mapping.id });
        i++;
        // Check if next char is '{'
        if (input[i] === '{') {
           parseGroup();
        } else {
           // Single char argument
           addText(input[i]);
           i++;
        }
        actions.push({ type: 'nav', content: mapping.exitKey || 'ArrowRight' });
      } else {
        addText(char);
        i++;
      }
    }
    // Standard Text
    else if (char === '$') {
      // Skip delimiter
      i++;
    }
    else {
      addText(char);
      i++;
    }
  }

  // Helper to parse { content }
  function parseGroup() {
    // Skip whitespace before '{'
    while(i < input.length && /\s/.test(input[i])) i++;
    
    if (input[i] === '{') {
      i++; // Skip '{'
      let balance = 1;
      let start = i;
      while (i < input.length && balance > 0) {
        if (input[i] === '{') balance++;
        if (input[i] === '}') balance--;
        if (balance > 0) i++;
      }
      const innerContent = input.substring(start, i);
      // Recursively parse inner content
      const innerActions = parseMarkdownToActions(innerContent, mappings);
      actions.push(...innerActions);
      i++; // Skip closing '}'
    } else {
      // Logic error in latex or missing brace, just continue
    }
  }

  return actions;
};

export const generateJavaScriptConsoleScript = (actions: ParsedAction[], mappings: KeyMapping[]): string => {
  const mappingMap = new Map(mappings.map(m => [m.id, m]));

  const lines: string[] = [];
  
  lines.push(`/* 使用说明: */`);
  lines.push(`/* 1. 复制以下代码到 Console (控制台) */`);
  lines.push(`/* 2. 按回车运行 */`);
  lines.push(`/* 3. 注意：你有 3 秒钟的时间用鼠标点击输入框！ */`);
  lines.push(``);
  lines.push(`(async function() {`);
  lines.push(`  const wait = ms => new Promise(r => setTimeout(r, ms));`);
  lines.push(``);
  lines.push(`  // --- 倒计时逻辑，确保用户有时间聚焦输入框 ---`);
  lines.push(`  console.log("%c⏳ 请在 3 秒内点击网页上的答案输入框...", "color: blue; font-size: 20px; font-weight: bold;");`);
  lines.push(`  await wait(3000);`);
  lines.push(``);
  lines.push(`  // 获取当前鼠标点击的输入框`);
  lines.push(`  const target = document.activeElement;`);
  lines.push(`  if (!target || target === document.body) { console.error("❌ 未检测到焦点框，请重试"); return; }`);
  lines.push(`  console.log("✅ 已捕获输入框:", target);`);
  lines.push(`  target.focus();`);
  lines.push(``);
  
  lines.push(`  // 模拟通用按键事件 (核心函数)`);
  lines.push(`  const dispatchKey = (type, key, code, keyCode, ctrl, shift, alt) => {`);
  lines.push(`     const event = new KeyboardEvent(type, {`);
  lines.push(`       key: key,`);
  lines.push(`       code: code,`);
  lines.push(`       keyCode: keyCode, // Legacy`);
  lines.push(`       which: keyCode,   // Legacy`);
  lines.push(`       ctrlKey: ctrl,`);
  lines.push(`       shiftKey: shift,`);
  lines.push(`       altKey: alt,`);
  lines.push(`       bubbles: true,`);
  lines.push(`       cancelable: true,`);
  lines.push(`       composed: true`);
  lines.push(`     });`);
  lines.push(`     Object.defineProperty(event, 'keyCode', {get : () => keyCode});`);
  lines.push(`     Object.defineProperty(event, 'which', {get : () => keyCode});`);
  lines.push(`     target.dispatchEvent(event);`);
  lines.push(`  };`);
  lines.push(``);

  lines.push(`  // 模拟文本输入`);
  lines.push(`  const type = async (txt) => {`);
  lines.push(`      if (!txt) return;`);
  lines.push(`      target.focus(); // 关键：防止光标丢失`);
  lines.push(`      // 1. 尝试标准 execCommand (自动处理光标移动)`);
  lines.push(`      if (document.execCommand('insertText', false, txt)) return;`);
  lines.push(``);
  lines.push(`      // 2. 尝试 TextEvent (部分旧编辑器支持)`);
  lines.push(`      try {`);
  lines.push(`        const textEvent = document.createEvent('TextEvent');`);
  lines.push(`        textEvent.initTextEvent('textInput', true, true, window, txt);`);
  lines.push(`        target.dispatchEvent(textEvent);`);
  lines.push(`      } catch(e) {}`);
  lines.push(``);
  lines.push(`      // 3. 安全回退：仅在标准 input/textarea 使用 value 赋值，避免破坏富文本结构`);
  lines.push(`      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {`);
  lines.push(`         const start = target.selectionStart;`);
  lines.push(`         const end = target.selectionEnd;`);
  lines.push(`         const val = target.value;`);
  lines.push(`         target.value = val.slice(0, start) + txt + val.slice(end);`);
  lines.push(`         target.selectionStart = target.selectionEnd = start + txt.length;`);
  lines.push(`         target.dispatchEvent(new Event('input', { bubbles: true }));`);
  lines.push(`      }`);
  lines.push(`  };`);
  lines.push(``);
  
  lines.push(`  // 模拟 Enter 键`);
  lines.push(`  const pressEnter = async () => {`);
  lines.push(`      target.focus();`);
  lines.push(`      dispatchKey('keydown', 'Enter', 'Enter', 13, false, false, false);`);
  lines.push(`      dispatchKey('keypress', 'Enter', 'Enter', 13, false, false, false);`);
  lines.push(`      await wait(10);`);
  lines.push(`      dispatchKey('keyup', 'Enter', 'Enter', 13, false, false, false);`);
  lines.push(`      await wait(50);`);
  lines.push(`  };`);
  lines.push(``);

  lines.push(`  // 模拟组合快捷键`);
  lines.push(`  const press = async (keyChar, ctrl, shift, alt) => {`);
  lines.push(`      target.focus();`);
  lines.push(`      const upperKey = keyChar.toUpperCase();`);
  lines.push(`      const code = 'Key' + upperKey;`);
  lines.push(`      const keyCode = upperKey.charCodeAt(0);`);
  lines.push(``);
  lines.push(`      // 1. 按下修饰键`);
  lines.push(`      if (ctrl) dispatchKey('keydown', 'Control', 'ControlLeft', 17, true, shift, alt);`);
  lines.push(`      if (shift) dispatchKey('keydown', 'Shift', 'ShiftLeft', 16, ctrl, true, alt);`);
  lines.push(`      if (alt) dispatchKey('keydown', 'Alt', 'AltLeft', 18, ctrl, shift, true);`);
  lines.push(`      await wait(20);`);
  lines.push(``);
  lines.push(`      // 2. 按下主键`);
  lines.push(`      dispatchKey('keydown', keyChar, code, keyCode, ctrl, shift, alt);`);
  lines.push(`      dispatchKey('keypress', keyChar, code, keyCode, ctrl, shift, alt);`);
  lines.push(`      dispatchKey('keyup', keyChar, code, keyCode, ctrl, shift, alt);`);
  lines.push(``);
  lines.push(`      // 3. 增加延时：等待网页弹出公式框并移动光标 (解决乱跑问题的关键)`);
  lines.push(`      await wait(150);`);
  lines.push(``);
  lines.push(`      // 4. 松开修饰键`);
  lines.push(`      if (ctrl) dispatchKey('keyup', 'Control', 'ControlLeft', 17, false, shift, alt);`);
  lines.push(`      if (shift) dispatchKey('keyup', 'Shift', 'ShiftLeft', 16, ctrl, false, alt);`);
  lines.push(`      if (alt) dispatchKey('keyup', 'Alt', 'AltLeft', 18, ctrl, shift, false);`);
  lines.push(`      await wait(50);`);
  lines.push(`  };`);
  lines.push(``);

  lines.push(`  // 模拟导航键`);
  lines.push(`  const nav = async (key) => {`);
  lines.push(`      target.focus();`);
  lines.push(`      let keyCode = 0;`);
  lines.push(`      if (key === 'ArrowLeft') keyCode = 37;`);
  lines.push(`      if (key === 'ArrowUp') keyCode = 38;`);
  lines.push(`      if (key === 'ArrowRight') keyCode = 39;`);
  lines.push(`      if (key === 'ArrowDown') keyCode = 40;`);
  lines.push(`      if (key === 'Tab') keyCode = 9;`);
  lines.push(``);
  lines.push(`      dispatchKey('keydown', key, key, keyCode, false, false, false);`);
  lines.push(`      dispatchKey('keyup', key, key, keyCode, false, false, false);`);
  lines.push(`      await wait(30);`);
  lines.push(`  };`);
  lines.push(``);
  lines.push(`  // --- 开始执行 ---`);

  actions.forEach(action => {
    if (action.type === 'text') {
      // Split text by newlines to handle them as Enter presses
      const parts = (action.content || '').split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
           lines.push(`  await pressEnter();`);
        }
        if (parts[i]) {
           const clean = parts[i].replace(/\\/g, '\\\\').replace(/'/g, "\\'");
           lines.push(`  await type('${clean}');`);
        }
      }
    } 
    else if (action.type === 'command') {
      const m = mappingMap.get(action.mappingId!);
      if (m) {
        lines.push(`  await press('${m.key}', ${m.ctrlKey}, ${m.shiftKey}, ${m.altKey});`);
      }
    }
    else if (action.type === 'nav') {
      lines.push(`  await nav('${action.content}');`);
    }
  });

  lines.push(`  console.log("✅ 输入完成");`);
  lines.push(`})();`);

  return lines.join('\n');
};

export const generateAutoHotkeyScript = (actions: ParsedAction[], mappings: KeyMapping[]): string => {
  const mappingMap = new Map(mappings.map(m => [m.id, m]));
  const lines: string[] = [];

  lines.push(`; KeyMacro 生成的 AutoHotkey 脚本`);
  lines.push(`; 请运行脚本，鼠标点击网页输入框，然后按 F8 开始`);
  lines.push(`F8::`);
  lines.push(`SetKeyDelay, 40, 40 ; 增加按键间隔，防止输入过快`);
  
  actions.forEach(action => {
    if (action.type === 'text') {
      const parts = (action.content || '').split('\n');
      for(let i=0; i<parts.length; i++) {
          if (i > 0) {
             lines.push(`Send, {Enter}`); 
             lines.push(`Sleep, 50`);
          }
          if (parts[i]) {
            let txt = parts[i];
            txt = txt.replace(/\{/g, '{{}').replace(/\}/g, '{}}')
                     .replace(/\^/g, '{^}').replace(/!/g, '{!}')
                     .replace(/\+/g, '{+}').replace(/#/g, '{#}');
            lines.push(`Send, {Raw}${txt}`);
          }
      }
    } 
    else if (action.type === 'command') {
      const m = mappingMap.get(action.mappingId!);
      if (m) {
        let combo = '';
        if (m.ctrlKey) combo += '^';
        if (m.shiftKey) combo += '+';
        if (m.altKey) combo += '!';
        combo += m.key;
        lines.push(`Send, ${combo}`);
        lines.push(`Sleep, 150 ; 等待编辑器创建公式框`);
      }
    }
    else if (action.type === 'nav') {
        const key = action.content === 'ArrowRight' ? 'Right' : action.content;
        lines.push(`Send, {${key}}`);
        lines.push(`Sleep, 30`);
    }
  });
  
  lines.push(`Return`);
  return lines.join('\n');
};