
export interface KeyMapping {
  id: string;
  name: string;
  trigger: string; // The LaTeX trigger, e.g., 'frac' or '^'
  type: 'shortcut' | 'sequence';
  // For 'shortcut' type
  key?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  delay?: number; // Milliseconds to wait after triggering
  // For 'sequence' type
  sequence?: string; // e.g. "/frac "
  // Navigation keys
  nextFieldKey?: string;
  exitKey?: string;
}

export interface ParsedAction {
  type: 'text' | 'command' | 'nav' | 'delete';
  content?: string;
  mappingId?: string;
}

export enum OutputType {
  JS_CONSOLE = 'JS_CONSOLE',
  AUTOHOTKEY = 'AUTOHOTKEY'
}
