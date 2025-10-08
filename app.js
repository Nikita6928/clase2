/* /users -> GET (Obtener información) /users -> POST (Agregar información), /users/id: -> PATCH (Actualizar info), /users/id: -> DELETE (Borrar info)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/
//import index from 'index.html'
//import home from 'views/home.html'
import express from 'express'
import fs from 'node:fs'
import cors from "cors"

const server = express()
server.use(cors())
server.use(express.json())


//helper/util
const products = JSON.parse(fs.readFileSync("./products.json"))
const writeDb = data => fs.writeFileSync("./products.json", JSON.stringify(data))



//Status
server.get("/", (request, response) => {
    response.json({ status: false })

})

/*Página 17 express-direccionamiento.  Voy a ver si puedo ver los productos en el home
const express = require("express");
const router = express.Router();
/Get home page
router.get('/', function (req, res, next) {
    res.render('index', { title: "Express" });  No funcionó
});*
module.exports = router;*/

// get product
server.get("/products", (request, response) => {
    response.json(products)

})


//add product. post/agregar  
server.post("/products", (request, response) => {
    const body = request.body

    const { nombre, precio, stock, descripcion, categoria } = body

    //Valido todo lo que necesito 
    if (!nombre || !precio || !stock || !descripcion || !categoria) {
        return response.status(400).json({ status: "Data invalida, intentando nuevamente" })

    }

    const newProduct = {
        id: crypto.randomUUID(),
        nombre,
        precio,
        stock,
        descripcion,
        categoria
    }

    //Validar si existe o no el producto
    //Si existe el producto 400
    //Si no existe, lo agrego

    products.push(newProduct)
    console.log(products)
    writeDb(products)

    response.json({ data: "agregando productos!" })
})

//Método patch/modificar
server.patch("/products/:id", (request, response) => {
    const body = request.body
    const id = request.params.id

    const index = products.findIndex(product => product.id === id)

    if (index === -1) {
        return response.status(404).json({ status: "No se encuentra el recurso" })
    }

    products[index] = { ...products[index], ...body }
    writeDb(products)

    response.json(products[index])

    response.json({ status: "Actualizando un producto!" })

})

//Método delete/borrar
server.delete("/products/:id", (request, response) => {
    const id = request.params.id

    const newProducts = products.filter((product) => product.id !== id)
    console.log(newProducts)
    writeDb(newProducts)

    response.json({ status: "Producto borrado con éxito", id })
})



server.listen(1111, () => {
    console.log(`Server conenctado en http://localhost:1111`)
})