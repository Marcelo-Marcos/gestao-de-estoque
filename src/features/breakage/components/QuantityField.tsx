import { useId } from 'react'
import { MinusIcon, PlusIcon } from '@/shared/ui/icons'
import styles from './QuantityField.module.css'

interface QuantityFieldProps {
  value: number
  /** Saldo do produto; 0 quando ainda não há cadastro. */
  stock: number
  pendingProduct: boolean
  onChange: (value: number) => void
}

export function QuantityField({ value, stock, pendingProduct, onChange }: QuantityFieldProps) {
  const id = useId()

  // Apontar mais do que existe no saldo é possível — o saldo importado pode
  // estar velho —, mas o aviso aparece para a pessoa conferir antes de salvar.
  const acimaDoSaldo = !pendingProduct && stock > 0 && value > stock

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        Quantidade
      </label>

      <div className={styles.row}>
        <button
          type="button"
          className={styles.step}
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          aria-label="Diminuir quantidade"
        >
          <MinusIcon width={18} height={18} />
        </button>

        <input
          id={id}
          className={styles.input}
          type="number"
          inputMode="numeric"
          min={1}
          value={value}
          onChange={(event) => {
            const n = Number(event.target.value)
            onChange(Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1)
          }}
        />

        <button
          type="button"
          className={styles.step}
          onClick={() => onChange(value + 1)}
          aria-label="Aumentar quantidade"
        >
          <PlusIcon width={18} height={18} />
        </button>
      </div>

      {pendingProduct ? (
        <span className={styles.hint}>Sem cadastro, o saldo ainda não é conhecido.</span>
      ) : acimaDoSaldo ? (
        <span className={`${styles.hint} ${styles.warning}`}>
          Maior que o saldo de {stock}. Confira antes de salvar.
        </span>
      ) : (
        <span className={styles.hint}>de {stock} em estoque</span>
      )}
    </div>
  )
}
