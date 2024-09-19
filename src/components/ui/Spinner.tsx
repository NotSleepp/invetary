import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  // Implementación del spinner
  // Usa la prop 'size' para ajustar el tamaño del spinner
  return ( 
    <p>cargando</p>
  );
}

export default Spinner;