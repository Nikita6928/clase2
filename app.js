/* /users -> GET (Obtener información) /users -> POST (Agregar información), /users/id: -> PATCH (Actualizar info), /users/id: -> DELETE (Borrar info)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/
//import index from 'index.html'
//import home from 'views/home.html'
import express from 'express'
import fs from 'node:fs'
import cors from "cors"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { useDeferredValue } from 'react'




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

const connectDb = async () => {
    await mongoose.connect("mongodb://localhost:27017/curso-node")
    console.log("Conectado a MongoDb con éxito")
}

//Creación de esquema de Mongodb
//Los datos que voy a agregar, están basados en estas validaciones
const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    descripcion: { type: String },
    categoria: { type: String, required: true }
}, {
    versionKey: false
})

//Modelo es un objeto que nos da acceso a los métodos de mongoDb
//findByIdUpdate()Es una función que existe en mongodb para encontrar un producto por su id y modificar
const Product = mongoose.model("Product", productSchema)


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
server.get("/products", async (request, response) => {
    const listOfProducts = await Product.find()
    response.json(listOfProducts)

})


//add product. post/agregar--  
server.post("/products", async (request, response) => {
    const body = request.body

    const { nombre, precio, stock, descripcion, categoria } = body

    //Valido todo lo que necesito 
    if (!nombre || !precio || !stock || !descripcion || !categoria) {
        return response.status(400).json({ status: "Data invalida, intentando nuevamente" })

    }

    const newProduct = new Product({

        nombre,
        precio,
        stock,
        descripcion,
        categoria
    })

    //Validar si existe o no el producto
    //Si existe el producto 400
    //Si no existe, lo agrego


    await newProduct.save()

    response.json({ newProduct })
})

//Método patch/modificar
server.patch("/products/:id", async (request, response) => {
    const body = request.body
    const id = request.params.id

    const updateProduct = await Product.findByIdAndUpdate(id, body, { new: true })

    if (!updateProduct) {
        return response.status(404).json({ error: "Producto no encontrado" })
    }
    response.json(updateProduct)

    // response.json({ status: "Actualizando un producto!" })

})

//Método delete/borrar
server.delete("/products/:id", authMiddleware, async (request, response) => {
    const id = request.params.id

    const deletedProduct = await Product.findByIdAndDelete(id)

    response.json({ deletedProduct })
})



server.listen(1111, () => {
    connectDb()
    console.log(`Server conectado en http://localhost:1111`)
})

