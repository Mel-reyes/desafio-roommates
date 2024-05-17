const fs = require('fs');
const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const { newUser, addGasto, modGasto } = require('./roommates.js');
const port = 3000;

const readJSONFile = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJSONFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const handleHomePage = (res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync('index.html', 'utf8'));
};

const handleGetRoommates = (res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(fs.readFileSync('roommates.json', 'utf8'));
};

const handleAddRoommate = async (res) => {
    try {
        const roommate = await newUser();
        const roommatesJSON = readJSONFile('roommates.json');
        roommatesJSON.roommates.push(roommate);
        writeJSONFile('roommates.json', roommatesJSON);
        res.writeHead(201).end(JSON.stringify(roommate));
    } catch (e) {
        res.writeHead(500).end("Error agregando usuario");
    }
};

const handleDeleteRoommate = (req, res) => {
    const { id } = url.parse(req.url, true).query;
    let roommatesJSON = readJSONFile('roommates.json');
    roommatesJSON.roommates = roommatesJSON.roommates.filter((g) => g.id !== id);
    writeJSONFile('roommates.json', roommatesJSON);
    res.writeHead(200).end("Roommate borrado exitosamente!");
};

const handleGetGastos = (res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(fs.readFileSync('gastos.json', 'utf8'));
};

const handleAddGasto = (req, res) => {
    let data = "";
    req.on('data', (payload) => {
        data += payload;
    });

    req.on('end', () => {
        try {
            let body = JSON.parse(data);
            let gasto = {
                id: uuidv4(),
                roommate: body.roommate,
                descripcion: body.descripcion,
                monto: body.monto
            };

            let gastosJSON = readJSONFile('gastos.json');
            gastosJSON.gastos.push(gasto);
            writeJSONFile('gastos.json', gastosJSON);

            addGasto(body);

            res.writeHead(201).end("Gasto creado!");
        } catch (e) {
            res.writeHead(500).end("Error al agregar gasto");
        }
    });
};

const handleUpdateGasto = (req, res) => {
    let data = "";
    const { id } = url.parse(req.url, true).query;

    req.on("data", (payload) => {
        data += payload;
    });

    req.on("end", () => {
        try {
            let body = JSON.parse(data);
            body.id = id;
            modGasto(body);

            let gastosJSON = readJSONFile('gastos.json');
            gastosJSON.gastos = gastosJSON.gastos.map((g) => g.id === id ? body : g);
            writeJSONFile('gastos.json', gastosJSON);

            res.writeHead(201).end("Gasto actualizado!");
        } catch (e) {
            res.writeHead(500).end("Error al actualizar gasto");
        }
    });
};

const handleDeleteGasto = (req, res) => {
    const { id } = url.parse(req.url, true).query;
    let gastosJSON = readJSONFile('gastos.json');
    gastosJSON.gastos = gastosJSON.gastos.filter((g) => g.id !== id);
    writeJSONFile('gastos.json', gastosJSON);
    res.writeHead(200).end("Gasto borrado exitosamente!");
};

http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        handleHomePage(res);
    } else if (req.url === '/roommates' && req.method === 'GET') {
        handleGetRoommates(res);
    } else if (req.url.startsWith('/roommate') && req.method === 'POST') {
        handleAddRoommate(res);
    } else if (req.url.startsWith('/roommate') && req.method === 'DELETE') {
        handleDeleteRoommate(req, res);
    } else if (req.url.startsWith('/gastos') && req.method === 'GET') {
        handleGetGastos(res);
    } else if (req.url.startsWith('/gasto') && req.method === 'POST') {
        handleAddGasto(req, res);
    } else if (req.url.startsWith('/gasto') && req.method === 'PUT') {
        handleUpdateGasto(req, res);
    } else if (req.url.startsWith('/gasto') && req.method === 'DELETE') {
        handleDeleteGasto(req, res);
    } else {
        res.writeHead(404).end("Ruta no encontrada");
    }
}).listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));

