import db from '../../db';

async function artList() {
    try {
        const data = await db.query(`SELECT * FROM arts`)
        return data.records
    } catch(err) {
        console.log(err)
        return null
    }
}

export default artList;