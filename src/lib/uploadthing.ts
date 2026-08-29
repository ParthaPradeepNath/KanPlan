import 'server-only'

import { UTApi } from 'uploadthing/server'

export const utapi = new UTApi()

export const uploadImage = async (
  file: File
): Promise<string | undefined> => {
  const result = await utapi.uploadFiles([file])
  const first = result[0]
  if (!first || first.error || !first.data) {
    return undefined
  }
  return first.data.url
}
