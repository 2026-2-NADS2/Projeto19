
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ mensagem: 'API KFKA funcionando!' })
})

app.listen(3333, () => {
    console.log('Servidor rodando em http://localhost:3333')
})
