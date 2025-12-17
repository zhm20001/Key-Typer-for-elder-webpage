import { KeyMapping, OutputType } from './types';

export const DEFAULT_MAPPINGS: KeyMapping[] = [
  {
    id: 'subscript',
    name: 'Subscript (_)',
    trigger: '_',
    type: 'shortcut',
    key: 'l',
    ctrlKey: true,
    exitKey: 'ArrowRight'
  },
  {
    id: 'superscript',
    name: 'Superscript (^)',
    trigger: '^',
    type: 'shortcut',
    key: 'h', // Common default, user can change
    ctrlKey: true,
    exitKey: 'ArrowRight'
  },
  {
    id: 'fraction',
    name: 'Fraction (\\frac)',
    trigger: 'frac',
    type: 'shortcut',
    key: 'f',
    ctrlKey: true,
    nextFieldKey: 'ArrowRight', // Often moves from numerator to denom
    exitKey: 'ArrowRight'
  },
  {
    id: 'sqrt',
    name: 'Square Root (\\sqrt)',
    trigger: 'sqrt',
    type: 'shortcut',
    key: 'r',
    ctrlKey: true,
    exitKey: 'ArrowRight'
  },
  {
    id: 'delta',
    name: 'Delta (\\Delta)',
    trigger: 'Delta',
    type: 'shortcut',
    key: '5',
    ctrlKey: true,
    exitKey: 'ArrowRight'
  }
];

export const INITIAL_MARKDOWN = `Solution:
The quadratic formula is:
$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$

Delta example: \\Delta = b^2 - 4ac

Another example: $ a_1 + a_2 $.`;