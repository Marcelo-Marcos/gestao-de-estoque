/**
 * Listas de motivo e origem.
 *
 * São editáveis por qualquer usuário, mas a lista é **uma só, da loja**. Se
 * cada pessoa mantivesse a própria, "danificado", "danificada" e "avaria"
 * virariam três motivos e a soma por motivo deixaria de fechar — o mesmo
 * problema que manter o cadastro de produtos sob o administrador evita.
 */
import { readJson, storageKey, writeJson } from '@/shared/lib/storage'
import type { Tag } from './types'

const REASONS_KEY = storageKey('motivos')
const ORIGINS_KEY = storageKey('origens')

/** Os casos que a loja já usa, para o primeiro uso não começar com nada. */
const DEFAULT_REASONS: Tag[] = [
  { id: 'vencido', label: 'Vencido', builtIn: true },
  { id: 'danificado', label: 'Danificado', builtIn: true },
  { id: 'avaria-transporte', label: 'Avaria de transporte', builtIn: true },
  { id: 'divergencia', label: 'Divergência de quantidade', builtIn: true },
  { id: 'furto', label: 'Furto ou perda', builtIn: true },
]

const DEFAULT_ORIGINS: Tag[] = [
  { id: 'cd', label: 'Centro de distribuição', builtIn: true },
  { id: 'loja', label: 'Loja', builtIn: true },
  { id: 'fornecedor', label: 'Fornecedor', builtIn: true },
]

function isTagList(value: unknown): value is Tag[] {
  return (
    Array.isArray(value) &&
    value.every(
      (t) =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as Tag).id === 'string' &&
        typeof (t as Tag).label === 'string',
    )
  )
}

function read(key: string, fallback: Tag[]): Tag[] {
  const stored = readJson<unknown>(key, null)
  return isTagList(stored) && stored.length > 0 ? stored : fallback
}

export function readReasons(): Tag[] {
  return read(REASONS_KEY, DEFAULT_REASONS)
}

export function readOrigins(): Tag[] {
  return read(ORIGINS_KEY, DEFAULT_ORIGINS)
}

export function writeReasons(tags: Tag[]): void {
  writeJson(REASONS_KEY, tags)
}

export function writeOrigins(tags: Tag[]): void {
  writeJson(ORIGINS_KEY, tags)
}

/** Identificador a partir do texto, para a etiqueta nova não colidir. */
export function tagIdFrom(label: string, existing: Tag[]): string {
  const base =
    label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'etiqueta'

  let id = base
  let n = 2
  while (existing.some((t) => t.id === id)) id = `${base}-${n++}`
  return id
}

export function labelOf(tags: Tag[], id: string): string {
  return tags.find((t) => t.id === id)?.label ?? ''
}
