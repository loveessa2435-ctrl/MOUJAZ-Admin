"use client";
import {useState} from "react";
import {BrainCircuit,Copy,FileUp,LoaderCircle,CheckCircle2} from "lucide-react";
import {supabase} from "../lib/supabase";

type Kind="mcq"|"true_false"|"definition"|"essay";
type Question={type:Kind;question:string;options?:string[];answer:string;explanation?:string};
const kinds:{id:Kind;label:string}[]=[{id:"mcq",label:"اختيار متعدد"},{id:"true_false",label:"صح وخطأ"},{id:"definition",label:"تعريفية"},{id:"essay",label:"مقالية"}];
export default function QuestionGenerator({onLogin}:{onLogin:()=>void}){
 const [text,setText]=useState("");const [file,setFile]=useState<File|null>(null);
 const [selected,setSelected]=useState<Kind[]>(["mcq","true_false","definition","essay"]);
 const [count,setCount]=useState(10);const [language,setLanguage]=useState("source");
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [questions,setQuestions]=useState<Question[]>([]);
 const [showAnswers,setShowAnswers]=useState(false);const [remaining,setRemaining]=useState<number|null>(null);const [resetAt,setResetAt]=useState<string|null>(null);
 const toggle=(kind:Kind)=>setSelected(old=>old.includes(kind)?old.filter(x=>x!==kind):[...old,kind]);
 async function generate(){
  setError("");setQuestions([]);setShowAnswers(false);
  if(!file&&text.trim().length<100){setError("الصق 100 حرف على الأقل، أو ارفع ملف PDF نصي.");return;}
  if(!selected.length){setError("اختار نوع سؤال واحد على الأقل.");return;}
  setBusy(true);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session){onLogin();setError("سجّل دخولك بحساب Google أولاً.");return;}
   const payload=new FormData();payload.append("text",text);payload.append("count",String(count));payload.append("language",language);payload.append("types",JSON.stringify(selected));if(file)payload.append("file",file);
   const response=await fetch("/api/questions",{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`},body:payload});
   const data=await response.json().catch(()=>({error:"الخادم رجّع استجابة غير صالحة. تأكد أن API شغال."}));
   if(typeof data.remaining==="number")setRemaining(data.remaining);if(typeof data.resetAt==="string")setResetAt(data.resetAt);
   if(!response.ok)throw new Error(data.error||"تعذّر توليد الأسئلة");
   setQuestions(data.questions);if(typeof data.remaining==="number")setRemaining(data.remaining);
  }catch(e){const message=e instanceof Error?e.message:"حدث خطأ غير متوقع";setError(message.includes("did not match the expected pattern")||message.includes("Invalid URL")?"تعذّر الاتصال بالخدمة بسبب رابط غير صالح. تأكد من NEXT_PUBLIC_SUPABASE_URL وأن الموقع مفتوح من عنوان صحيح، ثم أعد تشغيل الخادم.":message);}finally{setBusy(false);}
 }
 const copy=async()=>{const output=questions.map((q,i)=>`${i+1}. ${q.question}\n${(q.options||[]).join("\n")}\nالإجابة: ${q.answer}${q.explanation?"\nالتوضيح: "+q.explanation:""}`).join("\n\n");try{await navigator.clipboard.writeText(output);}catch{setError("تعذّر النسخ من المتصفح");}};
 return <div className="qg">
  <div className="card qgCard"><h2><BrainCircuit size={22}/> إعداد الأسئلة</h2>
   <label>نص المحاضرة<textarea rows={8} value={text} onChange={e=>setText(e.target.value)} placeholder="الصق نص المحاضرة هنا، أو ارفع PDF من الأسفل..." maxLength={25000}/><small>حتى 25,000 حرف. يتم توليد الأسئلة اعتماداً على المحتوى الذي تقدمه فقط.</small></label>
   <label className="qgUpload"><FileUp size={22}/> {file?file.name:"اختار ملف PDF نصي (حتى 5 MB)"}<input type="file" accept=".pdf,application/pdf" onChange={e=>{const f=e.target.files?.[0]||null;setFile(f);}}/></label>
   <label>أنواع الأسئلة</label><div className="qgKinds">{kinds.map(k=><label key={k.id} className="qgKind"><input type="checkbox" checked={selected.includes(k.id)} onChange={()=>toggle(k.id)}/>{k.label}</label>)}</div>
   <div className="qgOptions"><label>عدد الأسئلة<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[5,10,15,20].map(n=><option key={n} value={n}>{n} أسئلة</option>)}</select></label><label>لغة الأسئلة<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="source">نفس لغة المحاضرة</option><option value="ar">العربية</option><option value="en">English</option></select></label></div>
   <p className="muted">الحد المجاني: محاولتان خلال 24 ساعة من أول محاولة لكل حساب. ملفات PDF المصوّرة تحتاج OCR وغير مدعومة حالياً.</p>
   {remaining!==null&&<p className="muted">المحاولات المتبقية: {remaining}</p>}
   {resetAt&&<p className="muted">تتجدد المحاولات: {new Date(resetAt).toLocaleString("ar-IQ")}</p>}
   {error&&<p className="qgError" role="alert">{error}</p>}
   <button className="primary action" disabled={busy} onClick={generate}>{busy?<LoaderCircle className="qgSpin" size={19}/>:<BrainCircuit size={19}/>} {busy?"جاري إنشاء الأسئلة...":"ولّد الأسئلة"}</button>
  </div>
  {questions.length>0&&<div className="card qgCard"><div className="qgResultsHead"><h2><CheckCircle2 size={21}/> أسئلتك جاهزة ({questions.length})</h2><button className="outline" onClick={copy}><Copy size={16}/> نسخ الكل</button></div><button className="outline full" onClick={()=>setShowAnswers(x=>!x)}>{showAnswers?"إخفاء الإجابات":"إظهار الإجابات"}</button>{questions.map((q,i)=><div className="qgQuestion" key={i}><small>{i+1} · {kinds.find(k=>k.id===q.type)?.label||q.type}</small><h3>{q.question}</h3>{q.options?.length?<ol>{q.options.map((o,j)=><li key={j}>{o}</li>)}</ol>:null}{showAnswers&&<div className="qgAnswer"><b>الإجابة:</b> {q.answer}{q.explanation&&<p>{q.explanation}</p>}</div>}</div>)}</div>}
 </div>;
}
