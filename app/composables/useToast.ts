export const useToast = () => {
  const show = useState<boolean>('toast_show', () => false)
  const message = useState<string>('toast_message', () => '')
  let timer: any = null

  const triggerToast = (msg: string, durationMs = 2800) => {
    message.value = msg
    show.value = true

    if (process.client) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        show.value = false
      }, durationMs)
    }
  }

  return {
    show,
    message,
    triggerToast,
  }
}

