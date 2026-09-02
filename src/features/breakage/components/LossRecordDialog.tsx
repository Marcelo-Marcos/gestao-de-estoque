import type { FormEvent } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { AlertIcon } from '@/shared/ui/icons'
import { daysUntil, parseDate } from '@/shared/lib/date'
import { useAuth } from '@/features/auth'
import { useLossRecordForm } from '../hooks/useLossRecordForm'
import { AttachmentSlots } from './AttachmentSlots'
import { DuplicateWarning } from './DuplicateWarning'
import { ProductPicker } from './ProductPicker'
import { QuantityField } from './QuantityField'
import { TagPicker } from './TagPicker'
import styles from './LossRecordDialog.module.css'

interface LossRecordDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

/**
 * Registro de uma perda.
 *
 * Costura as partes; toda a lógica vive em `useLossRecordForm`. A ordem dos
 * campos é a ordem do trabalho no corredor: primeiro o produto na mão, depois
 * quanto e por quê, e só então o que comprova.
 */
export function LossRecordDialog({ open, onClose, onSaved }: LossRecordDialogProps) {
  if (!open) return null
  return <LossRecordForm onClose={onClose} onSaved={onSaved} />
}

function LossRecordForm({ onClose, onSaved }: Omit<LossRecordDialogProps, 'open'>) {
  const { user } = useAuth()
  const form = useLossRecordForm(user?.name ?? 'Sistema', () => {
    onSaved()
    onClose()
  })

  const restantes = daysUntil(form.expiryDate)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void form.submit()
  }

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title="Registrar quebra"
        subtitle="Aponte o que saiu do estoque sem ser vendido."
        footer={
          <>
            {form.product?.pendingProduct && (
              <span className={styles.pendingNotice}>
                <AlertIcon className={styles.pendingIcon} width={15} height={15} />
                Vai entrar como <span className={styles.pendingStrong}>pendente de cadastro</span>
              </span>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="loss-record-form" loading={form.saving}>
              Salvar registro
            </Button>
          </>
        }
      >
        <form className={styles.form} id="loss-record-form" onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <span className={styles.label}>Produto</span>
            <ProductPicker
              chosen={form.product}
              onChoose={form.setProduct}
              onDescriptionChange={form.setPendingDescription}
            />
            {form.errors.product && <Alert tone="danger">{form.errors.product}</Alert>}
          </div>

          <div className={styles.pair}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="loss-expiry">
                Validade <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="loss-expiry"
                className={styles.date}
                type="date"
                value={form.expiryDate ?? ''}
                onChange={(event) => form.setExpiryDate(parseDate(event.target.value))}
              />
              {restantes !== null && (
                <span className={`${styles.remaining} ${restantes < 0 ? styles.overdue : ''}`}>
                  {restantes < 0
                    ? `venceu há ${Math.abs(restantes)} dias`
                    : restantes === 0
                      ? 'vence hoje'
                      : `vence em ${restantes} dias`}
                </span>
              )}
            </div>

            <QuantityField
              value={form.quantity}
              stock={form.product?.stock ?? 0}
              pendingProduct={form.product?.pendingProduct ?? false}
              onChange={form.setQuantity}
            />
          </div>

          <TagPicker
            label="Motivo"
            tags={form.reasons}
            value={form.reasonId}
            error={form.errors.reason}
            onChange={form.setReasonId}
            onCreate={form.addReason}
          />

          <TagPicker
            label="Origem"
            tags={form.origins}
            value={form.originId}
            optional
            onChange={form.setOriginId}
            onCreate={form.addOrigin}
          />

          <AttachmentSlots
            attachments={form.attachments}
            onToggle={form.toggleAttachment}
          />

          <div className={styles.field}>
            <label className={styles.label} htmlFor="loss-note">
              Observação <span className={styles.optional}>(opcional)</span>
            </label>
            <textarea
              id="loss-note"
              className={styles.note}
              value={form.note}
              onChange={(event) => form.setNote(event.target.value)}
              placeholder="O que aconteceu, se ajudar a entender depois"
            />
          </div>
        </form>
      </Dialog>

      <DuplicateWarning
        open={form.duplicate !== null}
        existing={form.duplicate}
        reasons={form.reasons}
        quantity={form.quantity}
        busy={form.saving}
        onClose={form.dismissDuplicate}
        onCreateSeparate={() => void form.createSeparate()}
        onAddToExisting={() => void form.mergeIntoExisting()}
      />
    </>
  )
}
