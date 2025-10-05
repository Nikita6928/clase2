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
    response.json({ status: false })

})

// get product
server.get("/products", (request, response) => {
    response.json(products)

})


//add product.  
server.post("/products", (request, response) => {
    const body = request.body

    const newProduct = { id: crypto.randomUUID(), ...body }
    products.push(newProduct)
    writeDb(products)

    response.json({ data: "agregando productos!" })
})

//Método patch
server.patch("/products/:id", (request, response) => {
    const body = request.body
    const id = request.params.id

    const index = products.findIndex(product => product.id === id)

    products[index] = { ...products[index], ...body }

    console.log(products[index])

    response.json({ status: "Actualizando un producto!" })




})

server.listen(1111, () => {
    console.log(`Server conenctado en http://localhost:1111`)
})