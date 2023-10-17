import cloudinary from 'cloudinary'

export function uploadImage(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream((err, result) => {
            if (err) reject(err)
            else resolve(result)
        }).end(buffer)
    })
}