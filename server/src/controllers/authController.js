import User from '../models/User.js'
import {clearAuthCookie,setAuthCookie,signAccessToken} from '../utils/auth.js'

function validate(email,password){
  if(!email||!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  if(!password||password.length<8) return 'Password must be at least 8 characters.'
  return null
}
export async function login(req,res){
  const {email,password}=req.body
  const error=validate(email,password)
  if(error) return res.status(400).json({message:error})
  const user=await User.findOne({email:email.toLowerCase().trim()}).select('+password')
  if(!user||!(await user.comparePassword(password))) return res.status(401).json({message:'Invalid email or password.'})
  if(!['admin','superadmin'].includes(user.role)) return res.status(403).json({message:'Admin access required.'})
  const token=signAccessToken(user)
  setAuthCookie(res,token)
  res.json({user:user.toSafeJSON(),token})
}
export function logout(_req,res){clearAuthCookie(res);res.json({message:'Logged out successfully.'})}
export async function me(req,res){res.json({user:req.user.toSafeJSON()})}
