import { useCallback, useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { Progress } from '@/shared/ui/Progress'
import { Select } from '@/shared/ui/Select'
import { CheckIcon, UploadIcon } from '@/shared/ui/icons'
import { cellToText } from '@/shared/lib/cell'
import { readSpreadsheet, SpreadsheetError, type SheetData } from '@/shared/lib/spreadsheet'
import { bulkCreate, getAllProducts } from '../api'
import { PRODUCT_FIELDS, detectMapping, type ColumnMapping, type ProductField } from '../import/columns'
import { buildImportPlan, draftsToImport, type ImportPlan, type RowStatus } from '../import/plan'
import styles from './ImportWizard.module.css'

type Step = 'arquivo' | 'mapeamento' | 'revisao' | 'aplicando' | 'resumo'

const STEP_LABELS: Array<{ id: Step; label: string }> = [
  { id: 'arquivo', label: 'Arquivo' },
  { id: 'mapeamento', label: 'Colunas' },
  { id: 'revisao', label: 'Revisão' },
  { id: 'resumo', label: 'Conclusão' },
]

const STATUS_LABEL: Record<RowStatus, string> = {
  novo: 'Novo',
  existente: 'Já cadastrado',
  duplicado: 'Repetido',
  invalido: 'Inválido',
}

interface ImportWizardProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

export function ImportWizard({ open, onClose, onImported }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('arquivo')
  const [fileName, setFileName] = useState('')
  const [sheet, setSheet] = useState<SheetData | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [imported, setImported] = useState(0)

  const reset = useCallback(() => {
    setStep('arquivo')
    setFileName('')
    setSheet(null)
    setMapping(null)
    setPlan(null)
    setError(null)
    setBusy(false)
    setDragging(false)
    setProgress({ done: 0, total: 0 })
    setImported(0)
  }, [])

  const close = useCallback(() => {
    onClose()
    // Espera a animação de saída antes de zerar, para o conteúdo não sumir
    // na frente do usuário enquanto o diálogo ainda está visível.
    setTimeout(reset, 200)
  }, [onClose, reset])

  const handleFile = useCallback(async (file: File) => {
    setBusy(true)
    setError(null)
    setFileName(file.name)

    try {
      const data = await readSpreadsheet(file)

      if (!data.rows.length) {
        setError('A planilha tem cabeçalho, mas nenhuma linha de dados.')
        setBusy(false)
        return
      }

      setSheet(data)
      setMapping(detectMapping(data.headers, data.rows))
      setStep('mapeamento')
    } catch (err) {
      setError(
        err instanceof SpreadsheetError
          ? err.message
          : 'Não foi possível ler o arquivo. Confira se ele não está aberto no Excel e tente de novo.',
      )
    }

    setBusy(false)
  }, [])

  const columnOptions = useMemo(() => {
    if (!sheet) return []
    return [
      { value: '-1', label: 'Não importar' },
      ...sheet.headers.map((header, index) => ({
        value: String(index),
        label: header || `Coluna ${index + 1}`,
      })),
    ]
  }, [sheet])

  const missingRequired = useMemo(() => {
    if (!mapping) return []
    return PRODUCT_FIELDS.filter((f) => f.required && mapping[f.field] === -1).map((f) => f.label)
  }, [mapping])

  async function goToReview() {
    if (!sheet || !mapping) return
    setBusy(true)
    const existing = await getAllProducts()
    setPlan(buildImportPlan(sheet.rows, mapping, existing))
    setBusy(false)
    setStep('revisao')
  }

  async function apply() {
    if (!plan) return

    const drafts = draftsToImport(plan)
    setStep('aplicando')
    setProgress({ done: 0, total: drafts.length })

    const count = await bulkCreate(drafts, (done, total) => setProgress({ done, total }))

    setImported(count)
    setStep('resumo')
    onImported()
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  /** Amostra do primeiro valor não vazio da coluna, para conferir o mapeamento. */
  function sampleOf(column: number): string {
    if (!sheet || column < 0) return ''
    for (const row of sheet.rows.slice(0, 20)) {
      const text = cellToText(row[column])
      if (text) return text
    }
    return '(vazio nas primeiras linhas)'
  }

  const currentIndex = STEP_LABELS.findIndex(
    (s) => s.id === (step === 'aplicando' ? 'resumo' : step),
  )

  return (
    <Dialog
      open={open}
      onClose={close}
      wide
      title="Importar planilha"
      subtitle={fileName || 'Traga a base de produtos do ERP para o sistema.'}
      footer={footerFor()}
    >
      <ol className={styles.steps}>
        {STEP_LABELS.map((s, index) => (
          <li
            key={s.id}
            className={[
              styles.step,
              index === currentIndex ? styles.stepCurrent : '',
              index < currentIndex ? styles.stepDone : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={index === currentIndex ? 'step' : undefined}
          >
            <span className={styles.stepNumber}>{index < currentIndex ? '✓' : index + 1}</span>
            {s.label}
            {index < STEP_LABELS.length - 1 && <span className={styles.stepDivider} />}
          </li>
        ))}
      </ol>

      {error && <Alert tone="danger">{error}</Alert>}

      {step === 'arquivo' && (
        <label
          className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <UploadIcon width={32} height={32} />
          <span className={styles.dropzoneTitle}>
            {busy ? 'Lendo a planilha…' : 'Arraste a planilha aqui'}
          </span>
          <span className={styles.dropzoneHint}>
            ou clique para escolher — aceita .xlsx e .csv
          </span>
          <input
            className={styles.fileInput}
            type="file"
            accept=".xlsx,.csv,.txt,.tsv"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              // Permite escolher o mesmo arquivo de novo depois de um erro.
              e.target.value = ''
            }}
          />
        </label>
      )}

      {step === 'mapeamento' && sheet && mapping && (
        <div className={styles.mapping}>
          <Alert tone="info">
            Reconhecemos as colunas pelo cabeçalho da planilha. Confira antes de continuar —{' '}
            {sheet.rows.length.toLocaleString('pt-BR')} linhas encontradas na aba{' '}
            <strong>{sheet.sheetName}</strong>.
          </Alert>

          {PRODUCT_FIELDS.map((spec) => (
            <div className={styles.mappingField} key={spec.field}>
              <div className={styles.mappingHead}>
                <span className={styles.mappingLabel}>{spec.label}</span>
                {spec.required ? (
                  <Badge tone="marca">obrigatório</Badge>
                ) : (
                  <Badge tone="neutro">opcional</Badge>
                )}
              </div>

              <p className={styles.mappingHint}>{spec.hint}</p>

              <Select
                label={`Coluna para ${spec.label}`}
                hiddenLabel
                value={String(mapping[spec.field])}
                options={columnOptions}
                onChange={(e) =>
                  setMapping((m) =>
                    m ? { ...m, [spec.field as ProductField]: Number(e.target.value) } : m,
                  )
                }
              />

              {mapping[spec.field] >= 0 && (
                <p className={styles.sample}>exemplo: {sampleOf(mapping[spec.field])}</p>
              )}
            </div>
          ))}

          {missingRequired.length > 0 && (
            <Alert tone="danger">
              Escolha a coluna de {missingRequired.join(' e ')} para continuar.
            </Alert>
          )}
        </div>
      )}

      {step === 'revisao' && plan && (
        <>
          <div className={styles.summary}>
            <div className={`${styles.tile} ${styles.tileNovo}`}>
              <span className={styles.tileValue}>{plan.counts.novo.toLocaleString('pt-BR')}</span>
              <span className={styles.tileLabel}>serão importados</span>
            </div>
            <div className={`${styles.tile} ${styles.tileExistente}`}>
              <span className={styles.tileValue}>
                {plan.counts.existente.toLocaleString('pt-BR')}
              </span>
              <span className={styles.tileLabel}>já cadastrados, serão ignorados</span>
            </div>
            <div className={`${styles.tile} ${styles.tileDuplicado}`}>
              <span className={styles.tileValue}>
                {plan.counts.duplicado.toLocaleString('pt-BR')}
              </span>
              <span className={styles.tileLabel}>repetidos na planilha</span>
            </div>
            <div className={`${styles.tile} ${styles.tileInvalido}`}>
              <span className={styles.tileValue}>
                {plan.counts.invalido.toLocaleString('pt-BR')}
              </span>
              <span className={styles.tileLabel}>sem SKU ou sem descrição</span>
            </div>
          </div>

          {plan.counts.novo === 0 && (
            <Alert tone="info">
              Nenhum produto novo nesta planilha — tudo que ela traz já está no cadastro.
            </Alert>
          )}

          <PlanPreview plan={plan} />
        </>
      )}

      {step === 'aplicando' && (
        <div className={styles.progressWrap}>
          <Progress value={progress.done} max={progress.total} label="Importando produtos" />
        </div>
      )}

      {step === 'resumo' && (
        <div className={styles.center}>
          <span className={styles.centerIcon}>
            <CheckIcon width={26} height={26} />
          </span>
          <p className={styles.centerText}>
            <strong>{imported.toLocaleString('pt-BR')}</strong> produtos foram adicionados ao
            cadastro.
            {plan && plan.counts.existente > 0 && (
              <>
                {' '}
                Outros {plan.counts.existente.toLocaleString('pt-BR')} já existiam e ficaram como
                estavam.
              </>
            )}
          </p>
        </div>
      )}
    </Dialog>
  )

  function footerFor() {
    switch (step) {
      case 'arquivo':
        return (
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
        )

      case 'mapeamento':
        return (
          <>
            <Button variant="secondary" onClick={() => setStep('arquivo')}>
              Trocar arquivo
            </Button>
            <Button onClick={goToReview} loading={busy} disabled={missingRequired.length > 0}>
              Conferir o que será importado
            </Button>
          </>
        )

      case 'revisao':
        return (
          <>
            <Button variant="secondary" onClick={() => setStep('mapeamento')}>
              Voltar
            </Button>
            <Button onClick={apply} disabled={!plan || plan.counts.novo === 0}>
              Importar {plan?.counts.novo.toLocaleString('pt-BR')} produtos
            </Button>
          </>
        )

      case 'aplicando':
        return null

      case 'resumo':
        return <Button onClick={close}>Concluir</Button>
    }
  }
}

/** Mostra as primeiras linhas classificadas, priorizando o que exige atenção. */
function PlanPreview({ plan }: { plan: ImportPlan }) {
  const rows = useMemo(() => {
    const problemas = plan.rows.filter((r) => r.status === 'invalido' || r.status === 'duplicado')
    const resto = plan.rows.filter((r) => r.status !== 'invalido' && r.status !== 'duplicado')
    return [...problemas, ...resto].slice(0, 60)
  }, [plan])

  return (
    <>
      <p className={styles.previewTitle}>
        {plan.counts.invalido + plan.counts.duplicado > 0
          ? 'Linhas que precisam de atenção, seguidas das demais'
          : 'Primeiras linhas da planilha'}
      </p>

      <div className={styles.preview}>
        {rows.map((row) => (
          <div className={styles.previewRow} key={row.lineNumber}>
            <span className={styles.previewLine}>L{row.lineNumber}</span>
            <span className={styles.previewDesc} title={row.draft.description}>
              {row.draft.description || <em>sem descrição</em>}
            </span>
            <Badge tone={row.status}>{row.reason ?? STATUS_LABEL[row.status]}</Badge>
          </div>
        ))}

        {plan.total > rows.length && (
          <p className={styles.previewMore}>
            e mais {(plan.total - rows.length).toLocaleString('pt-BR')} linhas
          </p>
        )}
      </div>
    </>
  )
}
