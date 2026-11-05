import { initials } from '../../lib/format';

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={`avatar ${small ? 'avatar--small' : ''}`} aria-hidden="true">{initials(name)}</span>;
}
