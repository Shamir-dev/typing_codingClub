// Metadata for every language track. Adding a new language later means
// adding an entry here + a content/<id>/lessons.json file — nothing else
// in the app needs to change.
//
// autoIndent: when true, pressing Enter automatically inserts the next
// line's leading whitespace — the user still SEES real, properly
// indented code (same visual pattern as autoIndent: false languages),
// but doesn't need to press Tab to produce it. This is a beginner-
// friendly default for languages where indentation is purely cosmetic
// (brace/semicolon-terminated) rather than syntactically meaningful.
// JS/Python/React keep manual indentation since typing it is part of
// the practice for those tracks.

export const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    trackType: 'dsa',
    accent: 'var(--color-js)',
    extension: 'js',
    autoIndent: false,
    available: true,
  },
  { id: 'python',
     name: 'Python',
    trackType: 'dsa', 
    accent: 'var(--color-python)', 
    extension: 'py', 
    autoIndent: false, 
    available: true 
  },

  { id: 'cpp',
     name: 'C++', 
     trackType: 'dsa',
      accent: 'var(--color-cpp)', 
      extension: 'cpp', 
      autoIndent: true, 
      available: true },

  { id: 'java', name: 'Java', trackType: 'dsa', accent: 'var(--color-java)', extension: 'java', autoIndent: true, 
    available: true },

  { id: 'c', name: 'C', trackType: 'dsa', accent: 'var(--color-c)', extension: 'c', autoIndent: true, available:  true},

  { id: 'html', name: 'HTML', trackType: 'practice', accent: 'var(--color-html)', extension: 'html', autoIndent: true, available: true },

  { id: 'css', name: 'CSS', trackType: 'practice', accent: 'var(--color-css)', extension: 'css', autoIndent: true, available: true },
  
  { id: 'react', name: 'React', trackType: 'practice', accent: 'var(--color-react)', extension: 'jsx', autoIndent: false, available: true },
]

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id)
}