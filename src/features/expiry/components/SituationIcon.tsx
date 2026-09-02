import type { SVGProps } from 'react'
import type { Situation } from '../situation'

interface SituationIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  situation: Situation
  size?: number
}

/**
 * Uma forma diferente por faixa, não só uma cor diferente.
 *
 * O X, o triângulo, o visto e a interrogação são distinguíveis em preto e
 * branco — que é o teste de que a informação não depende da cor.
 */
export function SituationIcon({ situation, size = 16, ...rest }: SituationIconProps) {
  const paths: Record<Situation, React.ReactNode> = {
    venceu: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.7 8.7 6.6 6.6" />
        <path d="m15.3 8.7-6.6 6.6" />
      </>
    ),
    'vence-antes': (
      <>
        <path d="M12 4 2.8 20h18.4L12 4Z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
      </>
    ),
    'vende-antes': (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
      </>
    ),
    'sem-estimativa': (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.9c-.6.2-.9.7-.9 1.3v.4" />
        <path d="M12 17h.01" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[situation]}
    </svg>
  )
}
