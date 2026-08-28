import { CheckIcon, CopyIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button } from './button'

type InputCopyProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  copyValue?: string
  copyLabel?: string
  copiedLabel?: string
  copiedDuration?: number
  onCopy?: (value: string) => void
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref) {
    ;(ref as React.MutableRefObject<T>).current = value
  }
}

async function writeClipboard(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard API is not available')
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!success) {
    throw new Error('Failed to copy text')
  }
}

const InputCopy = React.forwardRef<HTMLInputElement, InputCopyProps>(
  (
    {
      className,
      copyValue,
      copyLabel = 'Copy value',
      copiedLabel = 'Copied',
      copiedDuration = 1500,
      disabled,
      onCopy,
      readOnly = true,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const timeoutRef = React.useRef<number | undefined>(undefined)
    const [isCopied, setIsCopied] = React.useState(false)

    const copiedValue = React.useMemo(() => {
      if (typeof copyValue === 'string') {
        return copyValue
      }

      if (typeof value === 'string') {
        return value
      }

      if (typeof defaultValue === 'string') {
        return defaultValue
      }

      return ''
    }, [copyValue, defaultValue, value])

    const handleCopy = async () => {
      const nextValue = copiedValue || inputRef.current?.value || ''

      if (!nextValue) {
        return
      }

      try {
        await writeClipboard(nextValue)
        setIsCopied(true)
        onCopy?.(nextValue)

        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = window.setTimeout(() => {
          setIsCopied(false)
        }, copiedDuration)
      } catch {
        setIsCopied(false)
      }
    }

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div data-slot="input-copy" className="relative w-full">
        <input
          data-slot="input"
          className={cn(
            'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
            className,
          )}
          readOnly={readOnly}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          ref={(node) => {
            inputRef.current = node
            setRef(ref, node)
          }}
          {...props}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          disabled={disabled}
          aria-label={isCopied ? copiedLabel : copyLabel}
        >
          {isCopied ? (
            <CheckIcon aria-hidden="true" className="size-3.5" />
          ) : (
            <CopyIcon aria-hidden="true" className="size-3.5" />
          )}
          <span className="sr-only">{isCopied ? copiedLabel : copyLabel}</span>
        </Button>
      </div>
    )
  },
)

InputCopy.displayName = 'InputCopy'

export { InputCopy }
