
import { KeyMapping } from './types';

export const DEFAULT_MAPPINGS: KeyMapping[] = [
  {
    id: 'subscript',
    name: '下标 (_)',
    trigger: '_',
    type: 'shortcut',
    key: 'l',
    ctrlKey: true,
    delay: 5,
    exitKey: 'ArrowRight'
  },
  {
    id: 'superscript',
    name: '上标 (^)',
    trigger: '^',
    type: 'shortcut',
    key: 'h',
    ctrlKey: true,
    delay: 5,
    exitKey: 'ArrowRight'
  },
  {
    id: 'fraction',
    name: '分数 (\\frac)',
    trigger: 'frac',
    type: 'shortcut',
    key: 'f',
    ctrlKey: true,
    delay: 5,
    nextFieldKey: 'ArrowRight',
    exitKey: 'ArrowRight'
  },
  {
    id: 'sqrt',
    name: '根号 (\\sqrt)',
    trigger: 'sqrt',
    type: 'shortcut',
    key: 'r',
    ctrlKey: true,
    delay: 5,
    exitKey: 'ArrowRight'
  }
];

export const INITIAL_MARKDOWN = `解题过程：
二次项公式为：
$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$

判别式示例：\\Delta = b^2 - 4ac

其他示例：$ a_1 + a_2 $。`;
