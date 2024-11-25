import React from 'react';

const Producto = ({ producto, agregarAlCarrito }) => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
            <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <h3>{producto.nombre}</h3>
            <p>Precio: ${producto.precio}</p>
            <button onClick={() => agregarAlCarrito(producto)}>Agregar al Carrito</button>
        </div>
    );
};

export default Producto;