import { useCallback, useMemo, useState } from 'react'
import type { IsoDate } from '@/shared/lib/date'
import { addToRecord, createLossRecord, findSameRecord } from '../api'
import { readOrigins, readReasons, writeOrigins, writeReasons } from '../tags'
import type { AttachmentKind, LossRecord, LossRecordDraft, Tag } from '../types'
import type { ChosenProduct } from '../components/ProductPicker'

export interface FormErrors {
  product?: string
  reason?: string
}

/**
 * Estado do formulário de registro de quebra, separado do desenho.
 *
 * Fica aqui tudo que decide *o que* acontece: montar o rascunho, checar se já
 * existe registro igual, e gravar — como um registro novo ou somando ao que já
 * existe.
 */
export function useLossRecordForm(createdBy: string, onSaved: () => void) {
  const [product, setProduct] = useState<ChosenProduct | null>(null)
  const [expiryDate, setExpiryDate] = useState<IsoDate | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [reasonId, setReasonId] = useState('')
  const [originId, setOriginId] = useState('')
  const [note, setNote] = useState('')
  const [attachments, setAttachments] = useState<LossRecordDraft['attachments']>([])

  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  // As listas são da loja e mudam quando alguém cria uma etiqueta; guardar em
  // estado mantém a tela em dia sem reler o storage a cada render.
  const [reasons, setReasons] = useState<Tag[]>(() => readReasons())
  const [origins, setOrigins] = useState<Tag[]>(() => readOrigins())

  /** Registro igual encontrado; quando presente, o aviso está aberto. */
  const [duplicate, setDuplicate] = useState<LossRecord | null>(null)

  const draft = useMemo<LossRecordDraft>(
    () => ({
      productId: product?.productId ?? '',
      sku: product?.sku ?? '',
      description: product?.description ?? '',
      barcode: product?.barcode ?? '',
      pendingProduct: product?.pendingProduct ?? false,
      expiryDate,
      quantity,
      reasonId,
      originId,
      note,
      attachments,
    }),
    [product, expiryDate, quantity, reasonId, originId, note, attachments],
  )

  const addReason = useCallback((tag: Tag) => {
    setReasons((current) => {
      const next = [...current, tag]
      writeReasons(next)
      return next
    })
  }, [])

  const addOrigin = useCallback((tag: Tag) => {
    setOrigins((current) => {
      const next = [...current, tag]
      writeOrigins(next)
      return next
    })
  }, [])

  const toggleAttachment = useCallback((kind: AttachmentKind) => {
    setAttachments((current) => {
      if (current.some((a) => a.kind === kind)) return current.filter((a) => a.kind !== kind)

      const nomes: Record<AttachmentKind, string> = {
        'foto-produto': 'foto-produto.jpg',
        'foto-etiqueta': 'etiqueta-lote.jpg',
        documento: 'documento.pdf',
      }
      return [...current, { id: `${kind}-${Date.now()}`, kind, fileName: nomes[kind] }]
    })
  }, [])

  const persist = useCallback(async () => {
    setSaving(true)
    await createLossRecord(draft, createdBy)
    setSaving(false)
    setDuplicate(null)
    onSaved()
  }, [draft, createdBy, onSaved])

  /**
   * Grava o registro, avisando antes se já existe um igual.
   *
   * A checagem acontece no envio, não enquanto a pessoa preenche: um aviso que
   * aparece no meio da digitação interrompe sem que haja decisão a tomar.
   */
  const submit = useCallback(async () => {
    // A validação vive aqui dentro em vez de numa função à parte: uma função
    // recriada a cada render entraria nas dependências e derrubaria a
    // memoização deste callback a cada tecla digitada.
    const found: FormErrors = {}
    if (!product) found.product = 'Escolha o produto.'
    if (!reasonId) found.reason = 'Escolha o motivo.'

    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    const igual = await findSameRecord(draft)
    setSaving(false)

    if (igual) {
      setDuplicate(igual)
      return
    }

    await persist()
  }, [draft, product, reasonId, persist])

  const mergeIntoExisting = useCallback(async () => {
    if (!duplicate) return

    setSaving(true)
    await addToRecord(duplicate.id, quantity)
    setSaving(false)
    setDuplicate(null)
    onSaved()
  }, [duplicate, quantity, onSaved])

  return {
    product,
    setProduct,
    expiryDate,
    setExpiryDate,
    quantity,
    setQuantity,
    reasonId,
    setReasonId,
    originId,
    setOriginId,
    note,
    setNote,
    attachments,
    toggleAttachment,
    reasons,
    origins,
    addReason,
    addOrigin,
    errors,
    saving,
    duplicate,
    dismissDuplicate: () => setDuplicate(null),
    submit,
    createSeparate: persist,
    mergeIntoExisting,
    /** Descrição digitada para um produto ainda sem cadastro. */
    setPendingDescription: (description: string) =>
      setProduct((current) => (current ? { ...current, description } : current)),
  }
}
