import crypto from 'node:crypto'
import { supabase, STORAGE_BUCKET } from '../config/supabase.js'

const publicUrl = (path) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl

export async function listMedia(_req, res) {
  const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending:false })
  if (error) throw error
  res.json({ media:data })
}

export async function listPublishedMedia(_req, res) {
  const { data, error } = await supabase.from('media_assets').select('*')
    .eq('is_published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false})
  if (error) throw error
  res.json({ media:data })
}

export async function uploadMedia(req,res) {
  if (!req.file) return res.status(400).json({message:'A media file is required.'})
  const type=req.file.mimetype.startsWith('video/')?'video':'image'
  const requestedFolder=req.body.folder || (type==='video'?'videos':'images')
  const folder=requestedFolder.replace(/[^a-zA-Z0-9/_-]/g,'').replace(/^\/+|\/+$/g,'') || (type==='video'?'videos':'images')
  const safeName=req.file.originalname.replace(/[^a-zA-Z0-9._-]/g,'-').toLowerCase()
  const path=`${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`

  const {error:uploadError}=await supabase.storage.from(STORAGE_BUCKET).upload(path,req.file.buffer,{
    contentType:req.file.mimetype,cacheControl:'31536000',upsert:false,
  })
  if(uploadError) throw uploadError

  const {data,error}=await supabase.from('media_assets').insert({
    storage_path:path,public_url:publicUrl(path),filename:req.file.originalname,
    title:req.body.title||req.file.originalname,alt_text:req.body.alt||'',
    description:req.body.description||'',media_type:type,mime_type:req.file.mimetype,
    size_bytes:req.file.size,folder,uploaded_by:req.user.id,
    is_published:req.body.isPublished!=='false',
  }).select('*').single()

  if(error){
    await supabase.storage.from(STORAGE_BUCKET).remove([path])
    throw error
  }
  res.status(201).json({media:data})
}

export async function updateMedia(req,res) {
  const allowed=['title','alt_text','description','is_published','sort_order']
  const updates=Object.fromEntries(Object.entries(req.body).filter(([key])=>allowed.includes(key)))
  const {data,error}=await supabase.from('media_assets').update(updates).eq('id',req.params.id).select('*').single()
  if(error) throw error
  res.json({media:data})
}

export async function deleteMedia(req,res) {
  const {data:media,error}=await supabase.from('media_assets').select('storage_path').eq('id',req.params.id).maybeSingle()
  if(error) throw error
  if(!media) return res.status(404).json({message:'Media asset not found.'})
  const {data:assigned}=await supabase.from('site_media').select('slot').eq('media_id',req.params.id)
  if(assigned?.length) return res.status(409).json({message:'This media is assigned to website slots. Replace those slots before deleting it.',slots:assigned.map((x)=>x.slot)})
  const {error:storageError}=await supabase.storage.from(STORAGE_BUCKET).remove([media.storage_path])
  if(storageError) throw storageError
  const {error:deleteError}=await supabase.from('media_assets').delete().eq('id',req.params.id)
  if(deleteError) throw deleteError
  res.json({message:'Media deleted successfully.'})
}

export async function listSlots(_req,res) {
  const {data,error}=await supabase.from('site_media').select('slot,updated_at,media:media_id(*)').order('slot')
  if(error) throw error
  res.json({slots:data})
}

export async function assignSlot(req,res) {
  const {slot,mediaId}=req.body
  if(!slot||!mediaId) return res.status(400).json({message:'slot and mediaId are required.'})
  const {data:media}=await supabase.from('media_assets').select('id').eq('id',mediaId).maybeSingle()
  if(!media) return res.status(404).json({message:'Media asset not found.'})
  const {data,error}=await supabase.from('site_media').upsert({slot,media_id:mediaId,updated_by:req.user.id},{onConflict:'slot'})
    .select('slot,updated_at,media:media_id(*)').single()
  if(error) throw error
  res.json({assignment:data})
}

export async function removeSlot(req,res) {
  const {error}=await supabase.from('site_media').delete().eq('slot',req.params.slot)
  if(error) throw error
  res.json({message:'Website media slot cleared.'})
}

export async function getSiteMedia(_req,res) {
  const {data,error}=await supabase.from('site_media').select('slot,media:media_id(*)').order('slot')
  if(error) throw error
  res.json({slots:data})
}

export async function listAlbums(_req,res) {
  const {data,error}=await supabase.from('albums')
    .select('*,album_media(media_id,sort_order,media:media_id(*))')
    .eq('is_published',true).order('sort_order',{ascending:true})
  if(error) throw error
  res.json({albums:data})
}

export async function listAllAlbums(_req,res) {
  const {data,error}=await supabase.from('albums')
    .select('*,album_media(media_id,sort_order,media:media_id(*))')
    .order('sort_order',{ascending:true})
  if(error) throw error
  res.json({albums:data})
}

export async function createAlbum(req,res) {
  const {title,slug,description='',coverMediaId=null,sortOrder=0,isPublished=true}=req.body
  if(!title||!slug) return res.status(400).json({message:'title and slug are required.'})
  const {data,error}=await supabase.from('albums').insert({
    title,slug,description,cover_media_id:coverMediaId,sort_order:sortOrder,
    is_published:isPublished,created_by:req.user.id,
  }).select('*').single()
  if(error) throw error
  res.status(201).json({album:data})
}

export async function updateAlbum(req,res) {
  const map={title:'title',slug:'slug',description:'description',coverMediaId:'cover_media_id',sortOrder:'sort_order',isPublished:'is_published'}
  const updates={}
  for(const [input,column] of Object.entries(map)) if(input in req.body) updates[column]=req.body[input]
  const {data,error}=await supabase.from('albums').update(updates).eq('id',req.params.id).select('*').single()
  if(error) throw error
  res.json({album:data})
}

export async function deleteAlbum(req,res) {
  const {error}=await supabase.from('albums').delete().eq('id',req.params.id)
  if(error) throw error
  res.json({message:'Album deleted successfully.'})
}

export async function addMediaToAlbum(req,res) {
  const {mediaId,sortOrder=0}=req.body
  if(!mediaId) return res.status(400).json({message:'mediaId is required.'})
  const {data,error}=await supabase.from('album_media').upsert({
    album_id:req.params.id,media_id:mediaId,sort_order:sortOrder,
  },{onConflict:'album_id,media_id'}).select('*,media:media_id(*)').single()
  if(error) throw error
  res.status(201).json({item:data})
}

export async function removeMediaFromAlbum(req,res) {
  const {error}=await supabase.from('album_media').delete().eq('album_id',req.params.id).eq('media_id',req.params.mediaId)
  if(error) throw error
  res.json({message:'Media removed from album.'})
}

export async function getSettings(_req,res) {
  const {data,error}=await supabase.from('site_settings').select('key,value').order('key')
  if(error) throw error
  res.json({settings:Object.fromEntries(data.map((x)=>[x.key,x.value]))})
}

export async function updateSettings(req,res) {
  const rows=Object.entries(req.body||{}).map(([key,value])=>({
    key,value:String(value??''),updated_by:req.user.id,updated_at:new Date().toISOString(),
  }))
  if(!rows.length) return res.status(400).json({message:'No settings supplied.'})
  const {data,error}=await supabase.from('site_settings').upsert(rows,{onConflict:'key'}).select('key,value')
  if(error) throw error
  res.json({settings:Object.fromEntries(data.map((x)=>[x.key,x.value]))})
}

export async function createInquiry(req,res) {
  const {name,email,phone='',service='',message}=req.body
  if(!name||!email||!message) return res.status(400).json({message:'Name, email and message are required.'})
  const {data,error}=await supabase.from('inquiries').insert({name,email,phone,service,message,status:'new'})
    .select('id,created_at').single()
  if(error) throw error
  res.status(201).json({inquiry:data,message:'Your enquiry has been received.'})
}

export async function listInquiries(_req,res) {
  const {data,error}=await supabase.from('inquiries').select('*').order('created_at',{ascending:false})
  if(error) throw error
  res.json({inquiries:data})
}

export async function updateInquiry(req,res) {
  const allowed=['status','admin_note']
  const updates=Object.fromEntries(Object.entries(req.body).filter(([key])=>allowed.includes(key)))
  const {data,error}=await supabase.from('inquiries').update(updates).eq('id',req.params.id).select('*').single()
  if(error) throw error
  res.json({inquiry:data})
}
