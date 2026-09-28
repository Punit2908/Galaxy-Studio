import crypto from 'node:crypto'
import {supabase,STORAGE_BUCKET} from '../config/supabase.js'

export async function uploadToStorage(buffer,mimeType,originalName,folder){
  if(!supabase) throw new Error('Supabase Storage is not configured.')
  const safeName=originalName.replace(/[^a-zA-Z0-9._-]/g,'-').toLowerCase()
  const path=`${folder}/1790571541853-${crypto.randomUUID()}-${safeName}`
  const {error}=await supabase.storage.from(STORAGE_BUCKET).upload(path,buffer,{contentType:mimeType,cacheControl:'31536000',upsert:false})
  if(error) throw error
  const {data}=supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return {path,url:data.publicUrl}
}
export async function deleteFromStorage(path){
  if(!supabase) return
  const {error}=await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if(error) throw error
}
