/* /users -> GET (Obtener información) /users -> POST (Agregar información), /users/id: -> PATCH (Actualizar info), /users/id: -> DELETE (Borrar info)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/
//import index from 'index.html'
//import home from 'views/home.html'
import express from 'express'
import cors from "cors"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'




const server = express()
server.use(cors())
server.use(express.json())



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
const travelSchema = new mongoose.Schema({
    destination: { type: String, required: true },
    price: { type: Number, default: 0 },
    description: { type: String },
    hotel: { type: String, required: true }

}, {
    versionKey: false
})

//Creación de esquema de Mongodb para usuarios
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    versionKey: false
})


//Modelo es un objeto que nos da acceso a los métodos de mongoDb
//findByIdUpdate()Es una función que existe en mongodb para encontrar un producto por su id y modificar
const Travel = mongoose.model("Travel", travelSchema)
const User = mongoose.model("User", userSchema)

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

//Agregar un usuario
//Agregar un usuario en la db
server.post("/auth/register", async (request, response) => {
    const body = request.body

    const user = await User.findOne({ email: body.email })

    if (user) {
        return response.status(400).json({ message: "El usuario ya existe en nuestra base de datos" })
    }


    const hash = await bcrypt.hash(body.password, 10)

    const newUser = new User({
        email: body.email,
        password: hash
    })

    await newUser.save()

    response.json({ newUser })
})

//Creación de sesión -> una sesión me permite ingresar a los datos por cierto tiempo
server.post("/auth/login", async (request, response) => {
    const body = request.body

    const user = await User.findOne({ email: body.email })

    if (!user) {
        return response.status(401).json({ status: "Usuario no encontrado, credenciales inválidas" })
    }

    const passwordValidada = await bcrypt.compare(body.password, user.password)
    if (!passwordValidada) {
        return response.status(401).json({ status: "Usuario no encontrado, credenciales inválidas" })
    }


    const token = jwt.sign({ id: user.id, email: user.email }, "CLAVE_SECRETA", { expiresIn: "1h" })

    response.json({ token })

})


// get product---
server.get("/travels", authMiddleware, async (request, response) => {
    const travels = await Travel.find()
    response.json(travels)

})


//add product. post/agregar--  
server.post("/travels", authMiddleware, async (request, response) => {
    const body = request.body

    const { destination, price, description, hotel } = body

    //Valido todo lo que necesito 
    if (!destination || !price || !description || !hotel) {
        return response.status(400).json({ status: "Data invalida, intentando nuevamente" })

    }

    const newTravel = new Travel({

        destination,
        price,
        description,
        hotel
    })

    //Validar si existe o no el destino
    //Si existe el destino 400
    //Si no existe, lo agrego


    await newTravel.save()

    response.json({ newTravel })
})

//Método patch/modificar
server.patch("/travels/:id", authMiddleware, async (request, response) => {
    const body = request.body
    const id = request.params.id

    const updateTravel = await Product.findByIdAndUpdate(id, body, { new: true })

    if (!updateTravel) {
        return response.status(404).json({ error: "Destino no encontrado" })
    }
    response.json(updateTravel)

})

//Método delete/borrar
server.delete("/travels/:id", authMiddleware, async (request, response) => {
    const id = request.params.id

    const deletedTravel = await Product.findByIdAndDelete(id)

    if (!deletedTravel) {
        return response.status(404).json({ error: "No se encuentra el destino para borrar" })
    }

    response.json({ deletedTravel })
})



server.listen(1111, () => {
    connectDb()
    console.log(`Server conectado en http://localhost:1111`)
})

