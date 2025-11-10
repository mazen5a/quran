 function openReciter(reciter) {
            // يمكنك ربط كل شيخ بصفحة أو مشغل صوت خاص به
            if(reciter === 'minshawi') {
                window.location.href = 'minshawi.html';
            } else if(reciter === 'basit') {
                window.location.href = 'basit.html';
            } else if(reciter === 'hosary') {
                window.location.href = 'hosary.html';
            } else if(reciter === 'ismail') {
                window.location.href = 'ismail.html';
            }
        }
        // إظهار رسالة الصلاة على النبي عند الدخول
        function closeSalatModal() {
            document.getElementById('salatModal').style.display = 'none';
        }
        window.onload = function() {
            document.getElementById('salatModal').style.display = 'flex';
        }

function normalizeArabic(str) {
  if (!str) return "";
  // تحويل لحروف صغيرة، حذف تشكيل ومسافات زائدة
  str = str.toLowerCase().trim();
  // ازالة التشكيل
  str = str.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, "");
  // توحيد الأحرف الشائعة
  str = str.replace(/[آأإا]/g, "ا");
  str = str.replace(/ؤ/g, "و");
  str = str.replace(/ئ/g, "ي");
  str = str.replace(/ة/g, "ه");
  str = str.replace(/ى/g, "ي");
  // ازالة حروف غير الحروف والأرقام (نخلي الحروف العربية واللاتينية والأرقام فقط)
  str = str.replace(/[^0-9\u0621-\u064A a-z]/g, "");
  // ازالة مسافات داخلية لتسهيل المقارنة (اختياري)
  str = str.replace(/\s+/g, "");
  return str;
}

// ---------- دالة ليفنشتاين (اختياري لاستخدام التشابه) ----------
function levenshtein(a, b) {
  if (!a || !b) return (a||"").length + (b||"").length;
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i=0;i<=m;i++) dp[i][0] = i;
  for (let j=0;j<=n;j++) dp[0][j] = j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    }
  }
  return dp[m][n];
}

// ---------- البحث وعرض النتائج ----------
document.addEventListener("DOMContentLoaded", function(){
  const input = document.getElementById("reciterSearch");
  // تحديد عناصر "الشيخ" في صفحتك - نقوم بالبحث داخل عناصر تحمل الصنف .reciter .reciter-name
  const reciters = Array.from(document.querySelectorAll(".reciter"));
  // نصوص التطبيع المحفوظة لكل شيخ لتسريع البحث
  const reciterData = reciters.map(el => {
    const nameEl = el.querySelector(".reciter-name");
    const name = nameEl ? nameEl.textContent.trim() : "";
    return { el, name, norm: normalizeArabic(name) };
  });

  input.addEventListener("input", function(){
    const q = normalizeArabic(this.value);
    if (!q) {
      // لو البحث فاضي: عرض الكل
      reciterData.forEach(r => r.el.style.display = "");
      return;
    }
    // لو عايز استخدام فقط الـ includes السريع:
    reciterData.forEach(r => {
      // تطابق احتوائي
      if (r.norm.includes(q)) {
        r.el.style.display = "";
      } else {
        // فشل الاحتواء، نجرب ليفنشتاين للمطابقة التقريبية
        const dist = levenshtein(r.norm, q);
        // عتبة يمكن تعديلها: 1 أو 2 مناسب للأخطاء الصغيرة
        const threshold = Math.max(1, Math.floor(r.norm.length * 0.25)); // ديناميكي
        if (dist <= threshold) r.el.style.display = "";
        else r.el.style.display = "none";
      }
    });
  });

  // اختياري: بحث عند الضغط Enter يركز أول نتيجة
  input.addEventListener("keydown", function(e){
    if (e.key === "Enter") {
      const visible = reciterData.find(r => r.el.style.display !== "none");
      if (visible) {
        const btn = visible.el.querySelector(".enter-btn");
        if (btn) btn.focus();
      }
    }
  });
});

document.title = "القرآن الكريم | تلاوات خاشعة ومباشرة";
let altTitles = [
  "القرآن الكريم كامل",
  "استمع للقرآن الكريم مجاناً",
  "تلاوة القرآن بصوت المنشاوي",
  "القرآن الكريم بدون إعلانات",
  "Quran Online - Holy Quran",
  "تلاوات مؤثرة من كبار القراء"
];
setInterval(() => {
  document.title = altTitles[Math.floor(Math.random() * altTitles.length)];
}, 8000);