import mongoose from 'mongoose'

const schema=new mongoose.Schema({
  slot:{type:String,required:true,unique:true,index:true},
  media:{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset'},
  mediaItems:[{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset'}],
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
},{timestamps:true})

export default mongoose.model('SiteMedia',schema)
