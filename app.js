/* /users -> GET (Obtener información) /users -> POST (Agregar información), /users/id: -> PATCH (Actualizar info), /users/id: -> DELETE (Borrar info)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/
//import index from 'index.html'
//import home from 'views/home.html'
import express from 'express'
import fs from 'node:fs'
import cors from "cors"
import bcrypt from 'bcryptjs'





const server = express()
server.use(cors())
server.use(express.json())


//helper/util
const products = JSON.parse(fs.readFileSync("./products.json"))
const users = JSON.parse(fs.readFileSync("./users.json"))
const writeDb = (path, data) => fs.writeFileSync(path, JSON.stringify(data))



//Status----
server.get("/", (request, response) => {
    response.json({ status: false })

})

const authMiddleware = (request, response, next) => {
    let analisis = true

    if (!analisis) {
        return response.status(401).json({ message: "No cuentas con los permisos para ingresar" })//El código 401 en http significa desautorizado/No autorizado
    }

    next()
}

//endpoint para registrar un usuario
server.post("/auth/register", async (request, response) => {
    const body = request.body

    const usuario = users.find(user => user.email === body.email)

    if (usuario) {
        return response.status(400).json({ message: "El usuario ya existe en nuestra base de datos" })
    }


    const hash = await bcrypt.hash(body.password, 10)

    const nuevoUsuario = {
        id: crypto.randomUUID(),
        email: body.email,
        password: hash
    }


    users.push(nuevoUsuario)
    writeDb("./users.json", users)

    response.json({ status: "Agregando usuario" })
})



// get product---
server.get("/products", authMiddleware, (request, response) => {
    response.json(products)

})


//add product. post/agregar--  
server.post("/products", authMiddleware, (request, response) => {
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
    writeDb("./products.json", products)

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
    writeDb("./products.json", products)

    response.json(products[index])

    // response.json({ status: "Actualizando un producto!" })

})

//Método delete/borrar
server.delete("/products/:id", (request, response) => {
    const id = request.params.id

    const newProducts = products.filter((product) => product.id !== id)
    writeDb("./products.json", newProducts)

    response.json({ status: "Producto borrado con éxito", id })
})



server.listen(1111, () => {
    console.log(`Server conectado en http://localhost:1111`)
})