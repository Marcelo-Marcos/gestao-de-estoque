import styles from './ProductsSkeleton.module.css'

/** Ocupa o lugar da lista enquanto ela carrega, na mesma altura de linha. */
export function ProductsSkeleton({ rowHeight }: { rowHeight: number }) {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Carregando produtos">
      {Array.from({ length: 12 }, (_, index) => (
        <div
          className={styles.row}
          key={index}
          style={{ height: rowHeight, animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  )
}
