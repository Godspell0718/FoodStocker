// src/Inicio/inicio.jsx
import React from 'react';

const Inicio = () => {
  return (
    <div>
      <h1>Bienvenido a FoodStocker</h1>
      <p>Esta es la página de inicio del proyecto</p>
      
      {/* Aquí puedes agregar tarjetas de resumen, estadísticas, etc. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Proveedores</h3>
          <p>Gestiona tus proveedores</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Insumos</h3>
          <p>Control de inventario</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Entradas</h3>
          <p>Registro de entradas</p>
        </div>
      </div>
    </div>
  );
};

export default Inicio;