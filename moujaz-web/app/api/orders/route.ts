import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req:NextRequest){
  try {
    const token=req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if(!token)return NextResponse.json({error:"يجب تسجيل الدخول أولاً"},{status:401});
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key)return NextResponse.json({error:"إعداد Supabase غير مكتمل"},{status:500});
    const db=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
    const {data:{user},error:authError}=await db.auth.getUser(token);
    if(authError||!user)return NextResponse.json({error:"جلسة الدخول غير صالحة"},{status:401});
    const body=await req.json();
    if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"بيانات الطلب غير صالحة"},{status:400});
    const {data,error}=await db.rpc("create_moujaz_order",{p_order:body});
    if(error)return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({order:data},{status:201});
  }catch{return NextResponse.json({error:"تعذّر معالجة الطلب"},{status:400});}
}
