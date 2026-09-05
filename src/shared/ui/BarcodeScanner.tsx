import { useEffect, useRef, useState } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { cameraErrorMessage, createBarcodeDetector, openCamera } from '../lib/barcode'
import styles from './BarcodeScanner.module.css'

interface BarcodeScannerProps {
  open: boolean
  formats: string[]
  onClose: () => void
  onDetect: (code: string) => void
}

/** Entre duas leituras: a câmera entrega 30 quadros por segundo e ler todos
 *  esquentaria o aparelho sem achar nada que 8 por segundo não achem. */
const INTERVALO_MS = 120

export function BarcodeScanner({ open, formats, onClose, onDetect }: BarcodeScannerProps) {
  if (!open) return null
  return <Scanner formats={formats} onClose={onClose} onDetect={onDetect} />
}

/**
 * A câmera lendo o código.
 *
 * Montado só enquanto aberto: assim a câmera é ligada na abertura e desligada
 * na saída pelo próprio ciclo do componente, sem um efeito vigiando `open`
 * para adivinhar quando parar. Câmera que fica ligada depois de fechada é o
 * pior defeito possível aqui — a luz acesa no bolso de quem usa.
 */
function Scanner({ formats, onClose, onDetect }: Omit<BarcodeScannerProps, 'open'>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [lendo, setLendo] = useState(false)

  // A função mais recente, para o laço de leitura não precisar reiniciar a
  // câmera toda vez que a tela redesenha e passa uma função nova. A escrita
  // acontece em efeito, e não no corpo do render: durante o render o React
  // pode descartar o resultado, e a escrita ficaria perdida.
  const onDetectRef = useRef(onDetect)
  useEffect(() => {
    onDetectRef.current = onDetect
  })

  useEffect(() => {
    let stream: MediaStream | null = null
    let timer: number | null = null
    let cancelled = false

    const parar = () => {
      cancelled = true
      if (timer !== null) window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }

    const detector = createBarcodeDetector(formats)

    openCamera()
      .then(async (aberto) => {
        stream = aberto
        if (cancelled || !videoRef.current) {
          aberto.getTracks().forEach((t) => t.stop())
          return
        }

        videoRef.current.srcObject = aberto
        await videoRef.current.play()
        if (cancelled) return
        setLendo(true)

        const procurar = async () => {
          if (cancelled || !videoRef.current || !detector) return

          try {
            const encontrados = await detector.detect(videoRef.current)
            const codigo = encontrados[0]?.rawValue?.trim()
            if (codigo) {
              parar()
              onDetectRef.current(codigo)
              return
            }
          } catch {
            // Um quadro que falhou não é motivo para desistir: acontece quando
            // o vídeo ainda não tem imagem. O próximo tenta de novo.
          }

          timer = window.setTimeout(() => void procurar(), INTERVALO_MS)
        }

        void procurar()
      })
      .catch((causa: unknown) => {
        if (!cancelled) setErro(cameraErrorMessage(causa))
      })

    return parar
  }, [formats])

  return (
    <Dialog
      open
      onClose={onClose}
      title="Ler código de barras"
      subtitle="Aponte a câmera para o código da etiqueta."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      }
    >
      {erro ? (
        <Alert tone="danger">{erro}</Alert>
      ) : (
        <div className={styles.frame}>
          <video ref={videoRef} className={styles.video} playsInline muted />

          {/* A mira mostra onde o código precisa estar; sem ela a pessoa
              aproxima o celular no escuro até acertar por tentativa. */}
          <span className={styles.aim} aria-hidden="true" />

          <span className={styles.hint} role="status">
            {lendo ? 'Procurando o código…' : 'Abrindo a câmera…'}
          </span>
        </div>
      )}
    </Dialog>
  )
}
