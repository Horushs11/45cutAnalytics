import { Search } from 'lucide-react';

interface SearchFieldProps { value: string; onChange: (value: string) => void; placeholder?: string; }
interface SelectFieldProps { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; label?: string; }

export function SearchField({ value, onChange, placeholder = 'Buscar...' }: SearchFieldProps) {
  return <label className="search-field"><Search size={17} aria-hidden="true" />
    <input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </label>;
}

export function SelectField({ value, onChange, options, label }: SelectFieldProps) {
  return <label className="select-field">{label && <span className="sr-only">{label}</span>}
    <select value={value} onChange={event => onChange(event.target.value)} aria-label={label || 'Seleccionar filtro'}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}
