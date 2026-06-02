import { useEffect, useRef, useState, useCallback } from 'react'

/* ============================================================
   useCamera — browser getUserMedia wrapper.
   Used for QR scanning, photo capture, and the face-recognition
   demo. Fails gracefully when no camera / permission is denied
   (kiosk previews, desktops) so the UI always stays usable.
   ============================================================ */
export function useCamera({ facingMode = 'user' } = {}) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera API not available in this browser.')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setActive(true)
      return true
    } catch (e) {
      setError(
        e?.name === 'NotAllowedError'
          ? 'Camera permission denied. Enable it in Fully Kiosk settings.'
          : 'No camera detected. Use the manual fallback below.'
      )
      return false
    }
  }, [facingMode])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }, [])

  const capture = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d').drawImage(v, 0, 0)
    try { return canvas.toDataURL('image/jpeg', 0.7) } catch { return null }
  }, [])

  useEffect(() => () => stop(), [stop]) // cleanup on unmount

  return { videoRef, active, error, start, stop, capture }
}
