const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const newUser = async () => {
    const response = await axios.get('https://randomuser.me/api');
    const user = response.data.results[0];
    const roommate = {
        id: uuidv4(),
        correo: user.email,
        nombre: `${user.name.first} ${user.name.last}`,
        debe: 0,
        recibe: 0,
    };
    return roommate;
};

const addGasto = (body) => {
    let roommates = JSON.parse(fs.readFileSync('roommates.json', 'utf8')).roommates;
    let count = roommates.length;

    roommates.forEach(rm => {
        if (rm.nombre === body.roommate) {
            rm.recibe += body.monto / count;
        } else {
            rm.debe += body.monto / count;
        }
    });

    fs.writeFileSync('roommates.json', JSON.stringify({ roommates }, null, 2), 'utf8');
};

const modGasto = (body) => {
    let roommates = JSON.parse(fs.readFileSync('roommates.json', 'utf8')).roommates;
    let count = roommates.length;

    roommates.forEach(rm => {
        if (rm.nombre === body.roommate) {
            rm.recibe = body.monto / count;
        } else {
            rm.debe = body.monto / count;
        }
    });

    fs.writeFileSync('roommates.json', JSON.stringify({ roommates }, null, 2), 'utf8');
};

module.exports = { newUser, addGasto, modGasto };

