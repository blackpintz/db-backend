import Art from './types/art/Art.type'
import artList from './dao/art/artList.dao'
import createArt from './dao/art/createArt.dao'


type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        art: Art,
        artId: string
    }
}

exports.handler = async (event: AppSyncEvent) => {
    switch(event.info.fieldName) {
        case 'artList':
            return await artList()
        case 'createArt':
            return await createArt(event.arguments.art)
        default:
            return null;
    }
}