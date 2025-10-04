/* /users -> GET () /users -> POST (Agregar), /users/id: -> PATCH (Actualizar), /users/id: -> DELETE (Borrar)
peticion fetch/users/3ej con el método PATCH(Actualizar), petición fetch/users/3 con el método DELETE (Borrar)*/

import express from 'express'
import fs from 'node:fs'
import cors from "cors"

const server = express()
server.use(cors())


//helper/utilidad
const products = JSON.parse(fs.readFileSync("./products.json"))
const writeDb = (data) => fs.writeFileSync("./product.json", JSON.stringify(data))


server.get("/", (request, response) => {
    response.json({ status: "false" })

})

server.get("/products", (request, response) => {

    response.json(products)

})

server.listen(1111, () => {
    console.log(`Server conenctado en http://localhost:1111`)
})