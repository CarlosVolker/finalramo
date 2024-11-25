import React, { useState, useEffect } from 'react';
import Producto from './Producto'; 
import { db } from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, updateDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ListaProductos = () => {
    const [carrito, setCarrito] = useState({});
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsuscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUsuario(user);
                console.log('Usuario autenticado:', user);
                await cargarCarrito(user.uid);
            } else {
                console.log('No hay usuario autenticado, redirigiendo...');
                navigate('/');
            }
        });
        return () => unsuscribe();
    }, [navigate]);

    const productos = [
        { id: 1, nombre: 'Monitor', precio: 150, imagen: '/imagenes/monitor.png' },
        { id: 2, nombre: 'Mouse', precio: 30, imagen: '/imagenes/mouse.png' },
        { id: 3, nombre: 'Teclado', precio: 45, imagen: '/imagenes/teclado.jpg' },
    ];

    const guardarCarritoEnFirebase = async (nuevoCarrito) => {
        if (usuario) {
            const carritoArray = Object.values(nuevoCarrito).map((item) => ({
                producto: item.producto,
                cantidad: item.cantidad,
            }));

            try {
                const q = query(collection(db, 'carritos'), where('usuarioId', '==', usuario.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach(async (docSnapshot) => {
                        await updateDoc(doc(db, 'carritos', docSnapshot.id), { carrito: carritoArray });
                    });
                } else {
                    await setDoc(doc(collection(db, 'carritos')), {
                        usuarioId: usuario.uid,
                        carrito: carritoArray,
                    });
                }

                console.log("Carrito guardado correctamente en Firebase");
            } catch (error) {
                console.error("Error al guardar el carrito en Firebase:", error);
            }
        }
    };

    const agregarAlCarrito = (producto) => {
        const nuevoCarrito = { ...carrito };
        if (nuevoCarrito[producto.id]) {
            nuevoCarrito[producto.id].cantidad += 1;
        } else {
            nuevoCarrito[producto.id] = { producto, cantidad: 1 };
        }
        setCarrito(nuevoCarrito);
        guardarCarritoEnFirebase(nuevoCarrito);
    };

    const eliminarDelCarrito = (productoId) => {
        const nuevoCarrito = { ...carrito };

        if (nuevoCarrito[productoId]) {
            nuevoCarrito[productoId].cantidad -= 1;

            if (nuevoCarrito[productoId].cantidad === 0) {
                delete nuevoCarrito[productoId];
            }

            setCarrito(nuevoCarrito);
            guardarCarritoEnFirebase(nuevoCarrito);
        }
    };

    const cargarCarrito = async (uid) => {
        try {
            const productosCargados = {};
            const q = query(collection(db, 'carritos'), where('usuarioId', '==', uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.carrito && Array.isArray(data.carrito)) {
                        data.carrito.forEach((item) => {
                            const { producto, cantidad } = item;
                            productosCargados[producto.id] = { producto, cantidad };
                        });
                    }
                });
                setCarrito(productosCargados);
                console.log("Carrito cargado correctamente desde Firebase");
            } else {
                console.log("No se encontraron carritos para este usuario.");
                setCarrito({});
            }
        } catch (error) {
            console.error("Error al cargar el carrito desde Firebase:", error);
        }
    };

    const cerrarSesion = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            console.log("Sesión cerrada con éxito");
            navigate('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Lista de Productos</h1>
                <button onClick={cerrarSesion} className="btn btn-danger shadow">
                    Cerrar Sesión
                </button>
            </div>

            {usuario ? (
                <div>
                    <h2 className="text-center mb-4">Bienvenido, {usuario.email.split('@')[0]}</h2>
                    <div className="row">
                        {productos.map((producto) => (
                            <div key={producto.id} className="col-md-4 mb-4">
                                <Producto
                                    producto={producto}
                                    agregarAlCarrito={agregarAlCarrito}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-danger">Por favor, inicia sesión para ver los productos.</p>
            )}

            <div className="mt-5">
                <h2>Carrito</h2>
                <ul className="list-group">
                    {Object.values(carrito).map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{item.producto.nombre}</span>
                            <div>
                                <span className="badge bg-primary rounded-pill me-3">
                                    {item.cantidad}
                                </span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => eliminarDelCarrito(item.producto.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
export default ListaProductos;