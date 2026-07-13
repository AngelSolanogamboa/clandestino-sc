export async function uploadToCloudinary(file, resourceType = 'auto') {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error('Error al subir archivo a Cloudinary')
  }

  const data = await res.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    width: data.width,
    height: data.height,
  }
}