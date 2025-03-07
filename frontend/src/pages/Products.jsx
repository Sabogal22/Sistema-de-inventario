import React from "react";

const products = [
    { id: 1, name: "Laptop Gamer", price: "$1200", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Teléfono Inteligente", price: "$800", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Auriculares Bluetooth", price: "$150", image: "https://via.placeholder.com/150" },
];

const Products = () => {
    return (
        <div style={styles.container}>
            <h2>Productos</h2>
            <div style={styles.products}>
                {products.map((product) => (
                    <div key={product.id} style={styles.card}>
                        <img src={product.image} alt={product.name} style={styles.image} />
                        <h3>{product.name}</h3>
                        <p>{product.price}</p>
                        <button style={styles.button}>Comprar</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        textAlign: "center",
    },
    products: {
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    card: {
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        width: "200px",
        textAlign: "center",
    },
    image: {
        width: "100%",
        borderRadius: "8px",
    },
    button: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "8px 12px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "10px",
    },
};

export default Products;
