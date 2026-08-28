import { useMemo } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { Badge } from '@/shared/ui/Badge'
import type { ImportPlan, RowStatus } from '../../import/plan'
import styles from './ReviewStep.module.css'

const STATUS_LABEL: Record<RowStatus, string> = {
  novo: 'Novo',
  existente: 'Já cadastrado',
  duplicado: 'Repetido',
  invalido: 'Inválido',
}

const TILES: Array<{ status: RowStatus; caption: string }> = [
  { status: 'novo', caption: 'serão importados' },
  { status: 'existente', caption: 'já cadastrados, serão ignorados' },
  { status: 'duplicado', caption: 'repetidos na planilha' },
  { status: 'invalido', caption: 'sem SKU ou sem descrição' },
]

/**
 * O plano é mostrado antes de gravar qualquer coisa: com milhares de linhas,
 * descobrir o resultado depois é tarde demais.
 */
export function ReviewStep({ plan }: { plan: ImportPlan }) {
  return (
    <>
      <div className={styles.summary}>
        {TILES.map(({ status, caption }) => (
          <div className={`${styles.tile} ${styles[status]}`} key={status}>
            <span className={styles.value}>{plan.counts[status].toLocaleString('pt-BR')}</span>
            <span className={styles.caption}>{caption}</span>
          </div>
        ))}
      </div>

      {plan.counts.novo === 0 && (
        <Alert tone="info">
          Nenhum produto novo nesta planilha — tudo que ela traz já está no cadastro.
        </Alert>
      )}

      <PlanPreview plan={plan} />
    </>
  )
}

/** Primeiras linhas classificadas, com o que exige atenção na frente. */
function PlanPreview({ plan }: { plan: ImportPlan }) {
  const rows = useMemo(() => {
    const problemas = plan.rows.filter((r) => r.status === 'invalido' || r.status === 'duplicado')
    const resto = plan.rows.filter((r) => r.status !== 'invalido' && r.status !== 'duplicado')
    return [...problemas, ...resto].slice(0, 60)
  }, [plan])

  const temProblema = plan.counts.invalido + plan.counts.duplicado > 0

  return (
    <>
      <p className={styles.previewTitle}>
        {temProblema
          ? 'Linhas que precisam de atenção, seguidas das demais'
          : 'Primeiras linhas da planilha'}
      </p>

      <div className={styles.preview}>
        {rows.map((row) => (
          <div className={styles.row} key={row.lineNumber}>
            <span className={styles.line}>L{row.lineNumber}</span>
            <span className={styles.desc} title={row.draft.description}>
              {row.draft.description || <em>sem descrição</em>}
            </span>
            <Badge tone={row.status}>{row.reason ?? STATUS_LABEL[row.status]}</Badge>
          </div>
        ))}

        {plan.total > rows.length && (
          <p className={styles.more}>
            e mais {(plan.total - rows.length).toLocaleString('pt-BR')} linhas
          </p>
        )}
      </div>
    </>
  )
}
