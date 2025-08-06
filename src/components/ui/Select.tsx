import { forwardRef } from 'react'

const Select = forwardRef(({ children, error, className = '', ...props }: any, ref) => {
  return (
    <div>
      <select
        ref={ref}
        className={`w-full px-3 py-2 border ${error ? 'border-error-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'

export default Select