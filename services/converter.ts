
import { KeyMapping, ParsedAction, OutputType } from '../types';

const LATEX_SYMBOLS: Record<string, string> = {
  'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'epsilon': 'ε', 'zeta': 'ζ',
  'eta': 'η', 'theta': 'θ', 'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ',
  'nu': 'ν', 'xi': 'ξ', 'omicron': 'ο', 'pi': 'π', 'rho': 'ρ', 'sigma': 'σ',
  'tau': 'τ', 'upsilon': 'υ', 'phi': 'ϕ', 'chi': 'χ', 'psi': 'ψ', 'omega': 'ω',
  'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ', 'Epsilon': 'Ε', 'Zeta': 'Ζ',
  'Eta': 'Ｈ', 'Theta': 'Θ', 'Iota': 'Ｉ', 'Kappa': 'Ｋ', 'Lambda': 'Λ', 'Mu': 'Ｍ',
  'Nu': 'Ｎ', 'Xi': 'Ｘ', 'Omicron': 'Ｏ', 'Pi': 'Π', 'Rho': 'Ｒ', 'Sigma': 'Σ',
  'Tau': 'Ｔ', 'Upsilon': 'Ｕ', 'Phi': 'Φ', 'Chi': 'Ｘ', 'Psi': 'Ψ', 'Omega': 'Ω',
  'le': '≤', 'leq': '≤', 'ge': '≥', 'geq': '≥', 'ne': '≠', 'neq': '≠',
  'approx': '≈', 'equiv': '≡', 'sim': '∼', 'simeq': '≃', 'cong': '≅',
  'subset': '⊂', 'subseteq': '⊆', 'supset': '⊃', 'supseteq': '⊇', 'in': '∈', 'notin': '∉',
  'times': '×', 'cdot': '·', 'div': '÷', 'pm': '±', 'mp': '∓',
  'cup': '∪', 'cap': '∩', 'vee': '∨', 'wedge': '∧', 'oplus': '⊕', 'otimes': '⊗',
  'leftarrow': '←', 'rightarrow': '→', 'uparrow': '↑', 'downarrow': '↓',
  'Leftarrow': '⇐', 'Rightarrow': '⇒', 'leftrightarrow': '↔', 'Leftrightarrow': '⇔',
  'to': '→', 'gets': '←',
  'infty': '∞', 'partial': '∂', 'nabla': '∇', 'forall': '∀', 'exists': '∃',
  'empty': '∅', 'emptyset': '∅', 'angle': '∠', 'therefore': '∴', 'because': '∵'
};

export const parseMarkdownToActions = (input: string, mappings: KeyMapping[]): ParsedAction[] => {
  const actions: ParsedAction[] = [];
  let i = 0;
  const mappingMap = new Map<string, KeyMapping>();
  mappings.forEach(m => mappingMap.set(m.trigger, m));

  const addText = (text: string) => {
    if (!text) return;
    if (actions.length > 0 && actions[actions.length - 1].type === 'text') {
      actions[actions.length - 1].content += text;
    } else {
      actions.push({ type: 'text', content: text });
    }
  };

  while (i < input.length) {
    const char = input[i];
    if (char === '\\') {
      if (input[i+1] === ',') { addText(' '); i += 2; continue; }
      let cmdEnd = i + 1;
      while (cmdEnd < input.length && /[a-zA-Z]/.test(input[cmdEnd])) cmdEnd++;
      const command = input.substring(i + 1, cmdEnd);
      const mapping = mappingMap.get(command);

      if (mapping) {
        i = cmdEnd;
        actions.push({ type: 'command', mappingId: mapping.id });
        if (command === 'frac') {
           parseGroup();
           actions.push({ type: 'nav', content: mapping.nextFieldKey || 'ArrowRight' });
           parseGroup();
           actions.push({ type: 'nav', content: mapping.exitKey || 'ArrowRight' });
        } else if (command === 'sqrt') {
           parseGroup();
           actions.push({ type: 'nav', content: mapping.exitKey || 'ArrowRight' });
        }
      } else if (['text', 'mathrm', 'mbox'].includes(command)) {
        i = cmdEnd; parseGroup();
      } else if (['sin', 'cos', 'tan', 'ln', 'log', 'lim'].includes(command)) {
        i = cmdEnd; addText(command);
      } else if (command === 'left' || command === 'right') {
        i = cmdEnd;
      } else if (LATEX_SYMBOLS[command]) {
        i = cmdEnd; addText(LATEX_SYMBOLS[command]);
        if (i < input.length && input[i] === ' ') i++;
      } else {
        addText('\\'); i++;
      }
    } else if (char === '^' || char === '_') {
      const mapping = mappingMap.get(char);
      if (mapping) {
        actions.push({ type: 'command', mappingId: mapping.id });
        i++;
        if (input[i] === '{') parseGroup();
        else { addText(input[i]); i++; }
        actions.push({ type: 'nav', content: mapping.exitKey || 'ArrowRight' });
      } else {
        addText(char); i++;
      }
    } else if (char === '$') {
      i++;
    } else {
      addText(char); i++;
    }
  }

  function parseGroup() {
    while(i < input.length && /\s/.test(input[i])) i++;
    if (input[i] === '{') {
      i++; let balance = 1; let start = i;
      while (i < input.length && balance > 0) {
        if (input[i] === '{') balance++;
        if (input[i] === '}') balance--;
        if (balance > 0) i++;
      }
      const innerContent = input.substring(start, i);
      const innerActions = parseMarkdownToActions(innerContent, mappings);
      actions.push(...innerActions);
      i++;
    }
  }
  return actions;
};

export const generateJavaScriptConsoleScript = (actions: ParsedAction[], mappings: KeyMapping[]): string => {
  const mappingMap = new Map(mappings.map(m => [m.id, m]));
  const lines: string[] = [];
  
  lines.push(`(async function() {`);
  lines.push(`  const wait = ms => new Promise(r => setTimeout(r, ms));`);
  lines.push(`  console.log("%c⏳ 3秒内点击输入框...", "color: blue; font-size: 16px;");`);
  lines.push(`  await wait(3000);`);
  lines.push(`  const target = document.activeElement;`);
  lines.push(`  if (!target || target === document.body) return;`);
  lines.push(`  target.focus();`);
  
  lines.push(`  const dispatchKey = (type, key, code, keyCode, ctrl, shift, alt) => {`);
  lines.push(`     const event = new KeyboardEvent(type, { key, code, keyCode, which: keyCode, ctrlKey: ctrl, shiftKey: shift, altKey: alt, bubbles: true });`);
  lines.push(`     target.dispatchEvent(event);`);
  lines.push(`  };`);

  lines.push(`  const typeText = async (txt) => {`);
  lines.push(`      if (!txt) return;`);
  lines.push(`      if (document.execCommand('insertText', false, txt)) return;`);
  lines.push(`      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {`);
  lines.push(`         const start = target.selectionStart; const end = target.selectionEnd;`);
  lines.push(`         target.value = target.value.slice(0, start) + txt + target.value.slice(end);`);
  lines.push(`         target.selectionStart = target.selectionEnd = start + txt.length;`);
  lines.push(`         target.dispatchEvent(new Event('input', { bubbles: true }));`);
  lines.push(`      }`);
  lines.push(`  };`);

  lines.push(`  const press = async (keyChar, ctrl, shift, alt, delay = 150) => {`);
  lines.push(`      const upperKey = keyChar.toUpperCase();`);
  lines.push(`      const code = /^[0-9]$/.test(keyChar) ? 'Digit' + keyChar : 'Key' + upperKey;`);
  lines.push(`      const keyCode = { 'ArrowRight': 39, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowDown': 40, 'Tab': 9, 'Enter': 13 }[keyChar] || upperKey.charCodeAt(0);`);
  lines.push(`      if (ctrl) dispatchKey('keydown', 'Control', 'ControlLeft', 17, true, false, false);`);
  lines.push(`      if (shift) dispatchKey('keydown', 'Shift', 'ShiftLeft', 16, ctrl, true, false);`);
  lines.push(`      dispatchKey('keydown', keyChar, code, keyCode, ctrl, shift, alt);`);
  lines.push(`      await wait(50);`);
  lines.push(`      dispatchKey('keyup', keyChar, code, keyCode, ctrl, shift, alt);`);
  lines.push(`      if (shift) dispatchKey('keyup', 'Shift', 'ShiftLeft', 16, ctrl, false, false);`);
  lines.push(`      if (ctrl) dispatchKey('keyup', 'Control', 'ControlLeft', 17, false, false, false);`);
  lines.push(`      await wait(delay);`);
  lines.push(`  };`);

  actions.forEach(action => {
    if (action.type === 'text') {
      const clean = action.content!.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`  await typeText('${clean}');`);
    } else if (action.type === 'command') {
      const m = mappingMap.get(action.mappingId!);
      if (m?.type === 'shortcut') {
        lines.push(`  await press('${m.key}', ${m.ctrlKey}, ${m.shiftKey}, ${!!m.altKey}, ${m.delay || 150});`);
      } else if (m?.type === 'sequence') {
        const seq = m.sequence!.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        lines.push(`  await typeText('${seq}'); await wait(${m.delay || 150});`);
      }
    } else if (action.type === 'nav') {
      lines.push(`  await press('${action.content}', false, false, false, 100);`);
    }
  });

  lines.push(`  console.log("✅ 完成");`);
  lines.push(`})();`);
  return lines.join('\n');
};

export const generateAutoHotkeyScript = (actions: ParsedAction[], mappings: KeyMapping[]): string => {
  const mappingMap = new Map(mappings.map(m => [m.id, m]));
  const lines: string[] = [`; F8 开始`, `F8::`, `SetKeyDelay, 40, 40` ];
  
  actions.forEach(action => {
    if (action.type === 'text') {
      let txt = action.content!.replace(/[\{\}\^\!\+\#]/g, '{$&}');
      lines.push(`Send, {Raw}${txt}`);
    } else if (action.type === 'command') {
      const m = mappingMap.get(action.mappingId!);
      if (m?.type === 'shortcut') {
        let combo = (m.ctrlKey ? '^' : '') + (m.shiftKey ? '+' : '') + (m.altKey ? '!' : '') + m.key;
        lines.push(`Send, ${combo}`, `Sleep, ${m.delay || 200}`);
      } else if (m?.type === 'sequence') {
        lines.push(`Send, {Raw}${m.sequence}`, `Sleep, ${m.delay || 200}`);
      }
    } else if (action.type === 'nav') {
      const key = action.content === 'ArrowRight' ? 'Right' : action.content;
      lines.push(`Send, {${key}}`, `Sleep, 100`);
    }
  });
  lines.push(`Return`);
  return lines.join('\n');
};
