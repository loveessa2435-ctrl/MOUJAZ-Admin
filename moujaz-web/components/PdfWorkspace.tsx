"use client";
import {useEffect,useState} from "react";
import {PDFDocument} from "pdf-lib";
import {Files,Scissors,Upload,Download,Trash2,Images,ArrowUp,ArrowDown} from "lucide-react";

type Mode="pdf"|"images";
const save=(bytes:Uint8Array,name:string)=>{
 const blob=new Blob([new Uint8Array(bytes)],{type:"application/pdf"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;a.rel="noopener";
 document.body.appendChild(a);a.click();a.remove();
 return {url,name};
};
function parsePages(value:string,total:number){const result:number[]=[];for(const segment of value.split(",")){const s=segment.trim();if(!s)continue;const m=s.match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!m)throw Error("اكتب أرقام الصفحات مثل 1-3, 5, 8-10");const a=Number(m[1]),b=m[2]?Number(m[2]):a;if(a<1||b>total||a>b)throw Error(`الصفحات لازم تكون بين 1 و ${total}`);for(let i=a;i<=b;i++)if(!result.includes(i-1))result.push(i-1)}if(!result.length)throw Error("حدد صفحة واحدة على الأقل");return result}
export default function PdfWorkspace({mode}:{mode:Mode}){
 const [files,setFiles]=useState<File[]>([]),[tab,setTab]=useState<"merge"|"split">("merge"),[pages,setPages]=useState("1-3"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState(""),[size,setSize]=useState("a4");
 const [result,setResult]=useState<{url:string;name:string}|null>(null);
 useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url)},[result]);
 const clearResult=()=>setResult(null);
 const isImages=mode==="images";
 const accept=isImages?"image/jpeg,image/png,image/webp":"application/pdf,.pdf";
 const add=(incoming:FileList|null)=>{if(!incoming)return;const arr=Array.from(incoming);const valid=arr.filter(f=>isImages?/^image\/(jpeg|png|webp)$/.test(f.type):f.type==="application/pdf"||f.name.toLowerCase().endsWith(".pdf"));setError(valid.length!==arr.length?"بعض الملفات غير مدعومة وتم تجاهلها.":"");setMessage("");clearResult();setFiles(prev=>[...prev,...valid].slice(0,40))};
 const move=(i:number,delta:number)=>setFiles(prev=>{const next=[...prev],j=i+delta;if(j<0||j>=next.length)return prev;[next[i],next[j]]=[next[j],next[i]];return next});
 const run=async()=>{setError("");setMessage("");clearResult();setBusy(true);try{
  if(!files.length)throw Error("اختر الملفات أولاً.");const out=await PDFDocument.create();
  if(isImages){for(const file of files){let data:Uint8Array;let kind:"png"|"jpg";if(file.type==="image/webp"){const bitmap=await createImageBitmap(file);const canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext("2d");if(!ctx)throw Error("المتصفح لا يدعم معالجة الصورة");ctx.drawImage(bitmap,0,0);bitmap.close();data=new Uint8Array(await (await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("تعذر تحويل الصورة")),"image/png"))).arrayBuffer());kind="png"}else{data=new Uint8Array(await file.arrayBuffer());kind=file.type==="image/png"?"png":"jpg"}
    const image=kind==="png"?await out.embedPng(data):await out.embedJpg(data);const [pw,ph]=size==="a4"?[595.28,841.89]:[image.width,image.height];const page=out.addPage([pw,ph]);const scale=Math.min(pw/image.width,ph/image.height);const w=image.width*scale,h=image.height*scale;page.drawImage(image,{x:(pw-w)/2,y:(ph-h)/2,width:w,height:h});}
   setResult(save(await out.save(),"MOUJAZ-Images.pdf"));
  }else if(tab==="merge"){
   for(const file of files){const src=await PDFDocument.load(await file.arrayBuffer());const copied=await out.copyPages(src,src.getPageIndices());copied.forEach(p=>out.addPage(p))}setResult(save(await out.save(),"MOUJAZ-Merged.pdf"));
  }else{const src=await PDFDocument.load(await files[0].arrayBuffer());const indices=parsePages(pages,src.getPageCount());const copied=await out.copyPages(src,indices);copied.forEach(p=>out.addPage(p));setResult(save(await out.save(),"MOUJAZ-Selected-Pages.pdf"))}
  setMessage("تم تجهيز ملفك. إذا ما بدأ التنزيل تلقائياً، اضغط زر تنزيل الملف أدناه.");
 }catch(e){setError(e instanceof Error?e.message:"تعذرت معالجة الملف. تأكد أنه غير محمي بكلمة مرور وأنه سليم.")}finally{setBusy(false)}};
 return <div className="pdfTool">
 {!isImages&&<div className="pdfTabs"><button className={tab==="merge"?"selected":""} onClick={()=>{setTab("merge");setFiles([]);setError("")}}><Files size={19}/> دمج PDF</button><button className={tab==="split"?"selected":""} onClick={()=>{setTab("split");setFiles([]);setError("")}}><Scissors size={19}/> تقسيم PDF</button></div>}
 <div className="card pdfPanel"><div className="pdfPanelIntro"><h2>{isImages?"صورك في ملف PDF واحد":tab==="merge"?"اجمع ملفاتك بملف واحد":"استخرج الصفحات اللي تحتاجها"}</h2><p>{isImages?"ارفع الصور ورتّبها حسب رغبتك قبل التحويل.":tab==="merge"?"اختر ملفين أو أكثر ورتّبهن بالترتيب المطلوب.":"ارفع ملف PDF واحد وحدد الصفحات المطلوبة."}</p></div>
 <label className="pdfDrop"><Upload size={30}/><strong>{isImages?"اختيار الصور":"اختيار ملفات PDF"}</strong><span>اضغط هنا لإضافة الملفات من جهازك</span><input type="file" accept={accept} multiple={isImages||tab==="merge"} onChange={e=>{add(e.target.files);e.target.value=""}}/></label>
 {files.length>0&&<div className="pdfFileList"><div className="pdfListTitle"><b>الملفات المختارة ({files.length})</b><button onClick={()=>setFiles([])}>مسح الكل</button></div>{files.map((f,i)=><div className="pdfFile" key={`${f.name}-${i}`}><span className="pdfFileName">{isImages?<Images size={17}/>:<Files size={17}/>} {f.name}</span><span className="pdfFileActions"><button aria-label="تحريك للأعلى" disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp size={16}/></button><button aria-label="تحريك للأسفل" disabled={i===files.length-1} onClick={()=>move(i,1)}><ArrowDown size={16}/></button><button aria-label="حذف" onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))}><Trash2 size={16}/></button></span></div>)}</div>}
 {!isImages&&tab==="split"&&<label className="pdfField">أرقام الصفحات المطلوبة <input dir="ltr" placeholder="1-3, 5, 8-10" value={pages} onChange={e=>setPages(e.target.value)}/><small>مثال: 1-3, 5, 8-10 — تنحفظ الصفحات المحددة بملف واحد</small></label>}
 {isImages&&<label className="pdfField">حجم الصفحة <select value={size} onChange={e=>setSize(e.target.value)}><option value="a4">A4 — مناسب للطباعة</option><option value="auto">بحجم الصورة الأصلي</option></select></label>}
 {error&&<p className="pdfError" role="alert">{error}</p>}{message&&<p className="pdfSuccess" role="status">{message}</p>}
 {result&&<div className="pdfDownloadResult" style={{display:"grid",gap:10,marginTop:14,marginBottom:14}}>
 <a className="primary pdfRun" href={result.url} download={result.name} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}}><Download size={19}/> تنزيل الملف الجاهز ({result.name})</a>
 <p className="pdfPrivacy">إذا فتح الملف للمعاينة بدل التنزيل، استخدم زر المشاركة ثم «حفظ في الملفات» على الآيفون، أو قائمة المتصفح ثم «تنزيل» على أندرويد. ويفضّل فتح موجز في Chrome أو Safari مباشرة بدل متصفح تيليجرام.</p>
 </div>}
 <button className="primary pdfRun" disabled={busy||files.length===0||(!isImages&&tab==="merge"&&files.length<2)} onClick={()=>void run()}><Download size={19}/>{busy?"جاري تجهيز الملف...":isImages?"تحويل الصور إلى PDF":tab==="merge"?"دمج وتنزيل PDF":"تقسيم وتنزيل PDF"}</button>
 <p className="pdfPrivacy">🔒 ملفاتك تنعالج داخل متصفحك، وما تنرفع إلى خوادم موجز. الملفات المحمية بكلمة مرور غير مدعومة.</p></div></div>
}
