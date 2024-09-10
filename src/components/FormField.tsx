// components/ui/FormField.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  options?: { value: string | number, label: string }[]; // Solo se usará para selects
  placeholder?: string;
  step?: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, type = 'text', options, placeholder, step, error }) => {
  const { register } = useFormContext();

  return (
    <div className="mt-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          id={name}
          {...register(name, { required: `${label} is required` })}
          className={`mt-1 block w-full py-2 px-3 border ${error ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          step={step}
          placeholder={placeholder}
          {...register(name, { required: `${label} is required` })}
          className={`mt-1 block w-full py-2 px-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        />
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
