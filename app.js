/* /users -> GET (Obtener información) /users -> POST (Agregar información), /users/id: -> PATCH (Actualizar info), /users/id: -> DELETE (Borrar info)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/

import express from 'express'
import fs from 'node:fs'
import cors from "cors"

const server = express()
server.use(cors())
server.use(express.json())


//helper/utilidad
const products = JSON.parse(fs.readFileSync("./products.json"))
const writeDb = data => fs.writeFileSync("./products.json", JSON.stringify(data))

//Status
server.get("/", (request, response) => {
    response.json({ status: "false" })

})

//add product.  Método get
server.get("/products", (request, response) => {

    response.json(products)
})
//Método post
server.post("/products", (request, response) => {
    const body = request.body
    console.log(body)

    response.json({ data: "agregando productos!" })
})

server.listen(1111, () => {
    console.log(`Server conenctado en http://localhost:1111`)
})