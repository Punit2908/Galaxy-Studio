import mongoose from 'mongoose'

const schema=new mongoose.Schema({
  slot:{type:String,required:true,unique:true,index:true},
  media:{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset'},
  mediaItems:[{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset'}],
  backgroundMedia:{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset'},
  useFallback:{type:Boolean,default:true},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
},{timestamps:true})

export default mongoose.model('SiteMedia',schema)
