import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { BoxIcon, UploadIcon } from '@/shared/ui/icons'
import styles from './ProductsEmptyState.module.css'

/** Cadastro vazio e busca sem resultado pedem saídas diferentes. */
interface EmptyStateProps {
  filtered: boolean
  /** Só o administrador alimenta o cadastro; ao operador resta avisar. */
  podeImportar: boolean
  onClear: () => void
  onImport: () => void
}

export function ProductsEmptyState({
  filtered,
  podeImportar,
  onClear,
  onImport,
}: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <span className={styles.icon}>
        <BoxIcon width={26} height={26} />
      </span>

      {filtered ? (
        <>
          <p className={styles.title}>Nenhum produto encontrado</p>
          <p className={styles.text}>
            Nenhum produto corresponde à busca. Tente outro termo ou limpe os filtros.
          </p>
          <Button variant="secondary" onClick={onClear}>
            Limpar filtros
          </Button>
        </>
      ) : podeImportar ? (
        <>
          <p className={styles.title}>O cadastro está vazio</p>
          <p className={styles.text}>
            Importe a planilha do ERP para trazer a base de produtos de uma vez. Depois é só
            completar o que faltar manualmente.
          </p>
          <Button onClick={onImport}>
            <UploadIcon width={18} height={18} />
            Importar planilha
          </Button>
        </>
      ) : (
        <>
          <p className={styles.title}>O cadastro ainda está vazio</p>
          <p className={styles.text}>
            Quem carrega a base de produtos é o administrador. Assim que ele importar a
            planilha, os produtos aparecem aqui.
          </p>
        </>
      )}
    </div>
  )
}

export function ProductsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.state}>
      <Alert tone="danger">
        Não foi possível carregar os produtos. Verifique a conexão e tente novamente.
      </Alert>
      <Button variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  )
}
