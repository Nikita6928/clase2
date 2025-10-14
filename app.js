/* /users -> GET (Obtener información) /users -> POST (Agregar información), /users/id: -> PATCH (Actualizar info), /users/id: -> DELETE (Borrar info)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/
//import index from 'index.html'
//import home from 'views/home.html'
import express from 'express'
import fs from 'node:fs'
import cors from "cors"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'




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
    //Validar el token -> Validar la sesión
    /*let analisis = true

    if (!analisis) {
        return response.status(401).json({ message: "No cuentas con los permisos para ingresar" })//El código 401 en http significa desautorizado/No autorizado
    }*/
    const token = request.headers.autorization
    // console.log(token, "<- Hay token!!!") 
    //copiar en el token en el valor del get/products del postman, luego de agregar autorization(key)
    //Bueno, como no tengo autorización, porque el token tenía validéz por una hora y ya pasaron varias horas, tengo que generarlo nuevamente.
    if (!token) {
        response.json({ status: "Se necesita el permiso" })
    }

    const decoded = jwt.verify(token, "CLAVE_SECRETA")
    console.log(decoded)
    next()
}

//endpoint para registrar un usuario
//Agregar un usuario en la db
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

//Creación de sesión -> una sesión me permite ingresar a los datos por cierto tiempo
server.post("/auth/login", async (request, response) => {
    const body = request.body
    const usuario = users.find(user => user.email === body.email)

    if (!usuario) {
        return response.status(401).json({ status: "Usuario no encontrado, credenciales inválidas" })
    }

    const passwordValidada = await bcrypt.compare(body.password, usuario.password)
    if (!passwordValidada) {
        return response.status(401).json({ status: "Usuario no encontrado, credenciales inválidas" })
    }


    //CREAR UNA SESIÓN!!!

    //1 - payload -> Información del usuario loggeado
    //2 - clave secreta
    //3 - Objeto de configuración
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, "CLAVE_SECRETA", { expiresIn: "1h" })

    response.json({ token })

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
server.patch("/products/:id", authMiddleware, (request, response) => {
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
server.delete("/products/:id", authMiddleware, (request, response) => {
    const id = request.params.id

    const newProducts = products.filter((product) => product.id !== id)
    writeDb("./products.json", newProducts)

    response.json({ status: "Producto borrado con éxito", id })
})



server.listen(1111, () => {
    console.log(`Server conectado en http://localhost:1111`)
})