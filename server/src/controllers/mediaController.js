import MediaAsset from '../models/MediaAsset.js'
import SiteMedia from '../models/SiteMedia.js'
import Album from '../models/Album.js'
import SiteSetting from '../models/SiteSetting.js'
import Inquiry from '../models/Inquiry.js'
import {uploadToStorage,deleteFromStorage} from '../services/mediaStorage.js'


export async function listMedia(_req,res){
  res.json({media:await MediaAsset.find().sort({createdAt:-1}).populate('uploadedBy','name email')})
}
export async function listPublishedMedia(_req,res){
  res.json({media:await MediaAsset.find({isPublished:true}).sort({sortOrder:1,createdAt:-1})})
}
export async function uploadMedia(req,res){
  if(!req.file) return res.status(400).json({message:'A media file is required.'})
  const mediaType=req.file.mimetype.startsWith('video/')?'video':'image'
  const requested=(req.body.folder||(mediaType==='video'?'videos':'images')).replace(/[^a-zA-Z0-9/_-]/g,'').replace(/^\/+|\/+$/g,'')
  const folder=requested||(mediaType==='video'?'videos':'images')
  const uploaded=await uploadToStorage(req.file.buffer,req.file.mimetype,req.file.originalname,folder)
  try{
    const media=await MediaAsset.create({
      storagePath:uploaded.path,publicUrl:uploaded.url,filename:req.file.originalname,
      title:req.body.title||req.file.originalname,altText:req.body.alt||'',
      description:req.body.description||'',mediaType,mimeType:req.file.mimetype,
      sizeBytes:req.file.size,folder,uploadedBy:req.user._id,isPublished:req.body.isPublished!=='false',
    })
    res.status(201).json({media})
  }catch(error){await deleteFromStorage(uploaded.path);throw error}
}
export async function updateMedia(req,res){
  const allowed=['title','altText','description','isPublished','sortOrder']
  const updates=Object.fromEntries(Object.entries(req.body).filter(([key])=>allowed.includes(key)))
  const media=await MediaAsset.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true})
  if(!media) return res.status(404).json({message:'Media asset not found.'})
  res.json({media})
}
export async function deleteMedia(req,res){
  const media=await MediaAsset.findById(req.params.id)
  if(!media) return res.status(404).json({message:'Media asset not found.'})
  const assigned=await SiteMedia.exists({media:media._id})
  if(assigned) return res.status(409).json({message:'This media is assigned to a website slot. Replace that slot first.'})
  const albumUse=await Album.exists({'media.asset':media._id})
  if(albumUse) return res.status(409).json({message:'This media is assigned to an album. Remove it from the album first.'})
  await deleteFromStorage(media.storagePath)
  await media.deleteOne()
  res.json({message:'Media deleted successfully.'})
}
export async function listSlots(_req,res){res.json({slots:await SiteMedia.find().sort({slot:1}).populate('media')})}
export async function getSiteMedia(_req,res){res.json({slots:await SiteMedia.find().sort({slot:1}).populate('media')})}
export async function assignSlot(req,res){
  const {slot,mediaId}=req.body
  if(!slot||!mediaId) return res.status(400).json({message:'slot and mediaId are required.'})
  const media=await MediaAsset.findById(mediaId)
  if(!media) return res.status(404).json({message:'Media asset not found.'})
  const assignment=await SiteMedia.findOneAndUpdate({slot},{media:media._id,updatedBy:req.user._id},{new:true,upsert:true,setDefaultsOnInsert:true}).populate('media')
  res.json({assignment})
}
export async function removeSlot(req,res){await SiteMedia.findOneAndDelete({slot:req.params.slot});res.json({message:'Website media slot cleared.'})}

async function albumsWithPopulate(query){
  const albums=await query.populate('coverMedia').populate('media.asset').lean()
  return albums
}
export async function listAlbums(_req,res){res.json({albums:await albumsWithPopulate(Album.find({isPublished:true}).sort({sortOrder:1,createdAt:1}))})}
export async function listAllAlbums(_req,res){res.json({albums:await albumsWithPopulate(Album.find().sort({sortOrder:1,createdAt:1}))})}
export async function createAlbum(req,res){
  const {title,slug,description='',coverMediaId=null,sortOrder=0,isPublished=true}=req.body
  if(!title||!slug) return res.status(400).json({message:'title and slug are required.'})
  const album=await Album.create({title,slug,description,coverMedia:coverMediaId||null,sortOrder,isPublished,createdBy:req.user._id})
  res.status(201).json({album:await album.populate('coverMedia')})
}
export async function updateAlbum(req,res){
  const map={title:'title',slug:'slug',description:'description',coverMediaId:'coverMedia',sortOrder:'sortOrder',isPublished:'isPublished'}
  const updates={}
  for(const [input,column] of Object.entries(map)) if(input in req.body) updates[column]=req.body[input]
  const album=await Album.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true}).populate('coverMedia')
  if(!album) return res.status(404).json({message:'Album not found.'})
  res.json({album})
}
export async function deleteAlbum(req,res){const album=await Album.findByIdAndDelete(req.params.id);if(!album)return res.status(404).json({message:'Album not found.'});res.json({message:'Album deleted successfully.'})}
export async function addMediaToAlbum(req,res){
  const {mediaId,sortOrder=0}=req.body
  if(!mediaId) return res.status(400).json({message:'mediaId is required.'})
  const media=await MediaAsset.findById(mediaId)
  if(!media) return res.status(404).json({message:'Media asset not found.'})
  const album=await Album.findById(req.params.id)
  if(!album) return res.status(404).json({message:'Album not found.'})
  const existing=album.media.find(item=>item.asset.toString()===mediaId)
  if(existing) existing.sortOrder=sortOrder
  else album.media.push({asset:mediaId,sortOrder})
  await album.save()
  await album.populate('media.asset')
  res.status(201).json({item:album.media.find(item=>item.asset._id.toString()===mediaId)})
}
export async function removeMediaFromAlbum(req,res){
  const album=await Album.findById(req.params.id)
  if(!album) return res.status(404).json({message:'Album not found.'})
  album.media=album.media.filter(item=>item.asset.toString()!==req.params.mediaId)
  await album.save()
  res.json({message:'Media removed from album.'})
}
export async function getSettings(_req,res){
  const settings=await SiteSetting.find().lean()
  res.json({settings:Object.fromEntries(settings.map(item=>[item.key,item.value]))})
}
export async function updateSettings(req,res){
  for(const [key,value] of Object.entries(req.body||{})){
    await SiteSetting.findOneAndUpdate({key},{value:String(value??''),updatedBy:req.user._id},{upsert:true,new:true,setDefaultsOnInsert:true})
  }
  res.json({settings:Object.fromEntries((await SiteSetting.find()).map(x=>[x.key,x.value]))})
}
export async function createInquiry(req,res){
  const {name,email,phone='',service='',message}=req.body
  if(!name||!email||!message) return res.status(400).json({message:'Name, email and message are required.'})
  const inquiry=await Inquiry.create({name,email,phone,service,message})
  res.status(201).json({inquiry:{id:inquiry._id,createdAt:inquiry.createdAt},message:'Your enquiry has been received.'})
}
export async function listInquiries(_req,res){res.json({inquiries:await Inquiry.find().sort({createdAt:-1})})}
export async function updateInquiry(req,res){
  const updates=Object.fromEntries(Object.entries(req.body).filter(([key])=>['status','adminNote'].includes(key)))
  const inquiry=await Inquiry.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true})
  if(!inquiry) return res.status(404).json({message:'Inquiry not found.'})
  res.json({inquiry})
}
