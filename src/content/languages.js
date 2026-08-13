// Metadata for every language track — icons/colors/typing behavior only.
// "Available" is NOT stored here anymore; it's auto-derived in
// allLessons.js from which content/<id>/lessons.json files actually
// exist, so this file never needs a manual true/false flip.
//
// autoIndent: when true, pressing Enter automatically inserts the next
// line's leading whitespace — the user still SEES real, properly
// indented code, but doesn't need to press Tab to produce it. Beginner-
// friendly default for languages where indentation is purely cosmetic.
// JS/Python/React keep manual indentation since typing it is part of
// the practice for those tracks.

export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', shortCode: 'JS', trackType: 'dsa', accent: 'var(--color-js)', extension: 'js', autoIndent: false, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { id: 'python', name: 'Python', shortCode: 'PY', trackType: 'dsa', accent: 'var(--color-python)', extension: 'py', autoIndent: false, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { id: 'cpp', name: 'C++', shortCode: 'C++', trackType: 'dsa', accent: 'var(--color-cpp)', extension: 'cpp', autoIndent: true, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
  { id: 'java', name: 'Java', shortCode: 'JV', trackType: 'dsa', accent: 'var(--color-java)', extension: 'java', autoIndent: true, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { id: 'c', name: 'C', shortCode: 'C', trackType: 'dsa', accent: 'var(--color-c)', extension: 'c', autoIndent: true, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { id: 'html', name: 'HTML', shortCode: 'HT', trackType: 'practice', accent: 'var(--color-html)', extension: 'html', autoIndent: true, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { id: 'css', name: 'CSS', shortCode: 'CS', trackType: 'practice', accent: 'var(--color-css)', extension: 'css', autoIndent: true, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { id: 'react', name: 'React', shortCode: 'JSX', trackType: 'practice', accent: 'var(--color-react)', extension: 'jsx', autoIndent: false, iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
]

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id)
}