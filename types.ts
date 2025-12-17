export interface KeyMapping {
  id: string;
  name: string;
  trigger: string; // The LaTeX trigger, e.g., 'frac' or '^'
  type: 'shortcut' | 'sequence';
  key?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  // Navigation keys to exit the structure or move between parts
  nextFieldKey?: string; // e.g. 'ArrowRight' or 'Tab'
  exitKey?: string; // e.g., 'ArrowRight'
}

export interface ParsedAction {
  type: 'text' | 'command' | 'nav';
  content?: string;
  mappingId?: string;
}

export enum OutputType {
  JS_CONSOLE = 'JS_CONSOLE',
  AUTOHOTKEY = 'AUTOHOTKEY'
}