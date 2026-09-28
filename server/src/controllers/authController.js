import User from '../models/User.js'
import {clearAuthCookie,setAuthCookie,signAccessToken} from '../utils/auth.js'

function validate(name,email,password,requireName=false){
  if(requireName&&(!name||name.trim().length<2)) return 'Name must contain at least 2 characters.'
  if(!email||!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  if(!password||password.length<8) return 'Password must be at least 8 characters.'
  return null
}
export async function register(req,res){
  const {name,email,password}=req.body
  const error=validate(name,email,password,true)
  if(error) return res.status(400).json({message:error})
  const normalized=email.toLowerCase().trim()
  if(await User.findOne({email:normalized})) return res.status(409).json({message:'An account with this email already exists.'})
  const user=await User.create({name:name.trim(),email:normalized,password,role:'user'})
  const token=signAccessToken(user)
  setAuthCookie(res,token)
  res.status(201).json({user:user.toSafeJSON(),token})
}
export async function login(req,res){
  const {email,password}=req.body
  const error=validate('',email,password)
  if(error) return res.status(400).json({message:error})
  const user=await User.findOne({email:email.toLowerCase().trim()}).select('+password')
  if(!user||!(await user.comparePassword(password))) return res.status(401).json({message:'Invalid email or password.'})
  const token=signAccessToken(user)
  setAuthCookie(res,token)
  res.json({user:user.toSafeJSON(),token})
}
export function logout(_req,res){clearAuthCookie(res);res.json({message:'Logged out successfully.'})}
export async function me(req,res){res.json({user:req.user.toSafeJSON()})}
