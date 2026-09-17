// Static US-QWERTY layout used by the review heatmap.
export const KEYBOARD_ROWS = [
  [
    { id: 'Backquote', base: '`', shifted: '~' },
    { id: 'Digit1', base: '1', shifted: '!' },
    { id: 'Digit2', base: '2', shifted: '@' },
    { id: 'Digit3', base: '3', shifted: '#' },
    { id: 'Digit4', base: '4', shifted: '$' },
    { id: 'Digit5', base: '5', shifted: '%' },
    { id: 'Digit6', base: '6', shifted: '^' },
    { id: 'Digit7', base: '7', shifted: '&' },
    { id: 'Digit8', base: '8', shifted: '*' },
    { id: 'Digit9', base: '9', shifted: '(' },
    { id: 'Digit0', base: '0', shifted: ')' },
    { id: 'Minus', base: '-', shifted: '_' },
    { id: 'Equal', base: '=', shifted: '+' },
    { id: 'Backspace', label: 'Backspace', wide: true },
  ],
  [
    { id: 'Tab', label: 'Tab', wide: true },
    { id: 'KeyQ', base: 'q', shifted: 'Q' },
    { id: 'KeyW', base: 'w', shifted: 'W' },
    { id: 'KeyE', base: 'e', shifted: 'E' },
    { id: 'KeyR', base: 'r', shifted: 'R' },
    { id: 'KeyT', base: 't', shifted: 'T' },
    { id: 'KeyY', base: 'y', shifted: 'Y' },
    { id: 'KeyU', base: 'u', shifted: 'U' },
    { id: 'KeyI', base: 'i', shifted: 'I' },
    { id: 'KeyO', base: 'o', shifted: 'O' },
    { id: 'KeyP', base: 'p', shifted: 'P' },
    { id: 'BracketLeft', base: '[', shifted: '{' },
    { id: 'BracketRight', base: ']', shifted: '}' },
    { id: 'Backslash', base: '\\', shifted: '|' },
  ],
  [
    { id: 'CapsLock', label: 'Caps Lock', wide: true },
    { id: 'KeyA', base: 'a', shifted: 'A' },
    { id: 'KeyS', base: 's', shifted: 'S' },
    { id: 'KeyD', base: 'd', shifted: 'D' },
    { id: 'KeyF', base: 'f', shifted: 'F' },
    { id: 'KeyG', base: 'g', shifted: 'G' },
    { id: 'KeyH', base: 'h', shifted: 'H' },
    { id: 'KeyJ', base: 'j', shifted: 'J' },
    { id: 'KeyK', base: 'k', shifted: 'K' },
    { id: 'KeyL', base: 'l', shifted: 'L' },
    { id: 'Semicolon', base: ';', shifted: ':' },
    { id: 'Quote', base: "'", shifted: '"' },
    { id: 'Enter', label: 'Enter', wide: true },
  ],
  [
    { id: 'ShiftLeft', label: 'Shift', wide: true },
    { id: 'KeyZ', base: 'z', shifted: 'Z' },
    { id: 'KeyX', base: 'x', shifted: 'X' },
    { id: 'KeyC', base: 'c', shifted: 'C' },
    { id: 'KeyV', base: 'v', shifted: 'V' },
    { id: 'KeyB', base: 'b', shifted: 'B' },
    { id: 'KeyN', base: 'n', shifted: 'N' },
    { id: 'KeyM', base: 'm', shifted: 'M' },
    { id: 'Comma', base: ',', shifted: '<' },
    { id: 'Period', base: '.', shifted: '>' },
    { id: 'Slash', base: '/', shifted: '?' },
    { id: 'ShiftRight', label: 'Shift', wide: true },
  ],
  [
    { id: 'ControlLeft', label: 'Ctrl', wide: true },
    { id: 'AltLeft', label: 'Alt', wide: true },
    { id: 'Space', label: 'Space', base: ' ', wide: 'space' },
    { id: 'AltRight', label: 'Alt', wide: true },
    { id: 'ControlRight', label: 'Ctrl', wide: true },
  ],
]

export const CHAR_TO_KEY_ID = Object.fromEntries(
  KEYBOARD_ROWS.flat()
    .flatMap((key) => [key.base, key.shifted].filter(Boolean).map((character) => [character, key.id]))
)

CHAR_TO_KEY_ID.Tab = 'Tab'
CHAR_TO_KEY_ID.Enter = 'Enter'