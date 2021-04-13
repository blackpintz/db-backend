import { v4 as uuidv4 } from 'uuid'
import Art from '../../types/art/Art.type'
import db from '../../db'

async function createArt(art: Art) {
    if(!art.id) art.id = uuidv4();
    const {id, title, quantity, network, contractID, asset} = art
    try {
        const query = `INSERT INTO arts (id, title, quantity, network, contractID, asset) VALUES(:id, :title, :quantity, :network, :contractID, :asset)`
        await db.query(query, {id, title, quantity, network, contractID, asset})
        return art
    } catch(err) {
        console.log("Postgress error", err)
        return err
    }
}

export default createArt;