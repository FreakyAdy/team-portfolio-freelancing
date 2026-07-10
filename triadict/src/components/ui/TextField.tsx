"use client"

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  multiline?: boolean
}

export function TextField({ label, value, onChange, type = "text", required, placeholder, multiline }: TextFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-coral ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors resize-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
        />
      )}
    </div>
  )
}
