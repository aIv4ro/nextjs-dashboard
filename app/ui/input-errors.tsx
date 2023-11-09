export function InputErrors ({
  errors,
  ariaLive,
  id
}: {
  errors?: string[] | string | null
  ariaLive?: 'off' | 'assertive' | 'polite'
  id?: string
}) {
  if (errors == null || (Array.isArray(errors) && errors.length <= 0)) return null
  if (typeof errors === 'string') errors = [errors]
  return (
    <div
      id={id}
      aria-live={ariaLive}
      className="mt-2 text-sm text-red-500"
    >
      {errors.map((error: string, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  )
}
