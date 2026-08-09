// Metadata for every language track. Adding a new language later means
// adding an entry here + a content/<id>/lessons.json file — nothing else
// in the app needs to change.

export const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    trackType: 'dsa',
    accent: 'var(--color-js)',
    extension: 'js',
    available: true,
  },
  { id: 'python', name: 'Python', trackType: 'dsa', accent: 'var(--color-python)', extension: 'py', available: false },
  { id: 'cpp', name: 'C++', trackType: 'dsa', accent: 'var(--color-cpp)', extension: 'cpp', available: false },
  { id: 'java', name: 'Java', trackType: 'dsa', accent: 'var(--color-java)', extension: 'java', available: false },
  { id: 'c', name: 'C', trackType: 'dsa', accent: 'var(--color-c)', extension: 'c', available: false },
  { id: 'html', name: 'HTML', trackType: 'practice', accent: 'var(--color-html)', extension: 'html', available: false },
  { id: 'css', name: 'CSS', trackType: 'practice', accent: 'var(--color-css)', extension: 'css', available: false },
  { id: 'react', name: 'React', trackType: 'practice', accent: 'var(--color-react)', extension: 'jsx', available: false },
]

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id)
}
