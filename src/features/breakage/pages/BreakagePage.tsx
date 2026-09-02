import { useState } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { PlusIcon, SearchIcon } from '@/shared/ui/icons'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { LossRecordCard } from '../components/LossRecordCard'
import { LossRecordDialog } from '../components/LossRecordDialog'
import { UndoBar } from '../components/UndoBar'
import { useLossRecordList } from '../hooks/useLossRecordList'
import { readOrigins, readReasons } from '../tags'
import type { LossRecordQuery } from '../types'
import styles from './BreakagePage.module.css'

const ABAS: { value: LossRecordQuery['stockState']; label: string }[] = [
  { value: 'no-estoque', label: 'No estoque' },
  { value: 'zerados', label: 'Zerados' },
  { value: 'todos', label: 'Todos' },
]

/**
 * Quebra: tudo que saiu do estoque sem ser vendido.
 *
 * A ação principal é registrar, não consultar — por isso o botão fica no
 * topo e, no celular, fixo sobre a lista: quem está no corredor abre a tela
 * para apontar uma perda que tem na mão.
 */
export function BreakagePage() {
  const list = useLossRecordList()
  const isNarrow = useMediaQuery('(max-width: 719px)')
  const [dialogOpen, setDialogOpen] = useState(false)

  // As listas mudam pouco e são lidas do storage; reler a cada render seria
  // trabalho repetido sem ganho.
  const [reasons] = useState(() => readReasons())
  const [origins] = useState(() => readOrigins())

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.title}>Quebra</h1>
          <span className={styles.count}>
            {list.status === 'ready'
              ? `${list.records.length.toLocaleString('pt-BR')} ${
                  list.records.length === 1 ? 'registro' : 'registros'
                }`
              : 'carregando…'}
          </span>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon width={18} height={18} />
          <span>
            Registrar<span className={styles.labelExtra}> quebra</span>
          </span>
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <SearchIcon className={styles.searchIcon} width={18} height={18} />
          <input
            className={styles.input}
            type="search"
            value={list.filters.search}
            onChange={(event) => list.setSearch(event.target.value)}
            placeholder={isNarrow ? 'Buscar produto' : 'Buscar por descrição, SKU ou código de barras'}
            aria-label="Buscar registros"
            autoComplete="off"
          />
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Situação do saldo">
          {ABAS.map((aba) => (
            <button
              key={aba.value}
              type="button"
              role="tab"
              aria-selected={list.filters.stockState === aba.value}
              className={`${styles.tab} ${
                list.filters.stockState === aba.value ? styles.tabActive : ''
              }`}
              onClick={() => list.setStockState(aba.value)}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro restaurado precisa ser visível e fácil de desfazer: uma lista
          filtrada que parece a lista inteira engana (ver CLAUDE.md). */}
      {list.isFiltered && (
        <div className={styles.active} role="status">
          <SearchIcon className={styles.activeIcon} width={16} height={16} />
          <span className={styles.activeText}>
            Mostrando {list.records.length.toLocaleString('pt-BR')}{' '}
            {list.records.length === 1 ? 'registro' : 'registros'}
            {list.filters.stockState !== 'todos' && (
              <> {list.filters.stockState === 'zerados' ? 'com saldo zerado' : 'no estoque'}</>
            )}
            {list.filters.search.trim() && (
              <>
                {' '}
                para <span className={styles.term}>“{list.filters.search.trim()}”</span>
              </>
            )}
            .
          </span>
          <Button variant="secondary" onClick={list.clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}

      {list.status === 'loading' && (
        <div className={styles.list} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {list.status === 'error' && (
        <div className={styles.state}>
          <Alert tone="danger">
            Não foi possível carregar os registros. Verifique a conexão e tente novamente.
          </Alert>
          <Button variant="secondary" onClick={list.reload}>
            Tentar de novo
          </Button>
        </div>
      )}

      {list.status === 'ready' && list.records.length === 0 && (
        <div className={styles.state}>
          <span className={styles.stateIcon}>
            <SearchIcon width={26} height={26} />
          </span>
          <p className={styles.stateTitle}>
            {list.isFiltered ? 'Nenhum registro encontrado' : 'Nenhuma quebra registrada'}
          </p>
          <p className={styles.stateText}>
            {list.isFiltered
              ? 'Nenhum registro corresponde à busca. Tente outro termo ou limpe os filtros.'
              : 'Registre o que saiu do estoque sem ser vendido — vencido, danificado ou divergência.'}
          </p>
          <Button
            variant={list.isFiltered ? 'secondary' : 'primary'}
            onClick={list.isFiltered ? list.clearFilters : () => setDialogOpen(true)}
          >
            {list.isFiltered ? 'Limpar filtros' : 'Registrar quebra'}
          </Button>
        </div>
      )}

      {list.status === 'ready' && list.records.length > 0 && (
        <div className={styles.list}>
          {list.records.map((record) => (
            <LossRecordCard
              key={record.id}
              record={record}
              reasons={reasons}
              origins={origins}
              onDelete={(alvo) => void list.remove(alvo)}
            />
          ))}
        </div>
      )}

      <UndoBar record={list.undoable} onUndo={() => void list.undo()} onDismiss={list.dismissUndo} />

      <LossRecordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={list.reload}
      />
    </div>
  )
}
