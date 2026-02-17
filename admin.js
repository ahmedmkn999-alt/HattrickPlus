import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ ضع بيانات الـ Firebase الخاصة بك هنا ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyD5rQnC621wOnUwPZJnvCPILNRiSxAwcJg",
  authDomain: "hattrickplus-9134d.firebaseapp.com",
  projectId: "hattrickplus-9134d",
  storageBucket: "hattrickplus-9134d.firebasestorage.app",
  messagingSenderId: "507008376401",
  appId: "1:507008376401:web:c342d9a5dd16f6fb3ca270",
  measurementId: "G-FY8MDNG7ZG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// سحب الأخبار
document.getElementById('fetchNewsBtn').addEventListener('click', async () => {
    const feedContainer = document.getElementById('feedContainer');
    const fetchBtn = document.getElementById('fetchNewsBtn');
    
    fetchBtn.innerHTML = "جاري السحب... ⏳";
    fetchBtn.disabled = true;
    feedContainer.innerHTML = "<p style='text-align:center; color:#22c55e;'>جاري سحب الأخبار (آخر 30 يوم)... 📡</p>";
    
    try {
        // إضافة when:30d لمحاولة جلب أخبار أقدم قدر الإمكان من جوجل
        const globalNewsQuery = "كرة قدم عالمية OR دوري أبطال أوروبا OR الدوري الإنجليزي OR ريال مدريد when:30d";
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(globalNewsQuery)}&hl=ar&gl=EG&ceid=EG:ar`;
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        feedContainer.innerHTML = ""; 
        
        if (!data.items || data.items.length === 0) {
             feedContainer.innerHTML = "<p style='text-align:center;'>لا توجد أخبار جديدة حالياً.</p>";
             return;
        }

        data.items.forEach(item => {
            let cleanTitle = item.title.split(' - ')[0]; 
            
            let imgUrl = "https://via.placeholder.com/600x300/1e293b/22c55e?text=HattrickPlus+News"; 
            if (item.enclosure && item.enclosure.link) imgUrl = item.enclosure.link;
            else if (item.thumbnail) imgUrl = item.thumbnail;
            else {
                const imgMatch = item.description.match(/src="([^"]+)"/);
                if (imgMatch && imgMatch[1]) imgUrl = imgMatch[1];
            }

            let cleanText = item.description.replace(/<[^>]*>?/gm, '').trim(); 
            cleanText = cleanText.replaceAll('كورة بلس', 'HattrickPlus').replaceAll('يلا كورة', 'HattrickPlus').replaceAll('في الجول', 'HattrickPlus');

            // سحب التاريخ الأصلي وتنسيقه
            const originalDate = item.pubDate ? new Date(item.pubDate) : new Date();
            const dateString = originalDate.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            const div = document.createElement('div');
            div.className = 'feed-item';
            div.innerHTML = `
                <img src="${imgUrl}" alt="صورة الخبر" onerror="this.src='https://via.placeholder.com/600x300/1e293b/22c55e?text=HattrickPlus+News'">
                <span class="feed-date">📅 نُشر في: ${dateString}</span>
                <h4>${cleanTitle}</h4>
                <div class="action-buttons">
                    <button class="btn-edit" id="edit-${item.guid}">تعديل ✍️</button>
                    <button class="btn-quick" id="quick-${item.guid}">نشر سريع ⚡</button>
                </div>
            `;
            feedContainer.appendChild(div);

            document.getElementById(`edit-${item.guid}`).addEventListener('click', () => {
                document.getElementById('newsTitle').value = cleanTitle;
                document.getElementById('newsImage').value = imgUrl;
                document.getElementById('newsContent').value = cleanText;
            });

            document.getElementById(`quick-${item.guid}`).addEventListener('click', async (e) => {
                const btn = e.target;
                btn.innerHTML = "جاري النشر..⏳";
                btn.disabled = true;
                
                try {
                    await addDoc(collection(db, "articles"), {
                        title: cleanTitle,
                        imageUrl: imgUrl,
                        content: cleanText,
                        publishDate: item.pubDate, // حفظ التاريخ الأصلي في قاعدة البيانات
                        createdAt: serverTimestamp() // حفظ وقت الإضافة للترتيب
                    });
                    btn.innerHTML = "تم النشر ✅";
                    btn.style.background = "#16a34a"; 
                    btn.style.color = "white";
                } catch (error) {
                    btn.innerHTML = "فشل النشر ❌";
                }
            });
        });
    } catch (error) {
        feedContainer.innerHTML = "<p style='color:red; text-align:center;'>فشل جلب الأخبار، تأكد من اتصالك بالإنترنت.</p>";
    } finally {
        fetchBtn.innerHTML = "تحديث وسحب أحدث الأخبار";
        fetchBtn.disabled = false;
    }
});

// النشر اليدوي العادي
document.getElementById('addNewsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newsTitle').value;
    const imageUrl = document.getElementById('newsImage').value;
    const content = document.getElementById('newsContent').value;
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.innerHTML = "جاري النشر... ⏳";
    submitBtn.disabled = true;

    try {
        await addDoc(collection(db, "articles"), {
            title: title,
            imageUrl: imageUrl,
            content: content,
            publishDate: new Date().toISOString(), // للخبر اليدوي، نأخذ تاريخ اللحظة
            createdAt: serverTimestamp()
        });
        alert("تم رفع الخبر على موقعك بنجاح! ⚽️🔥");
        document.getElementById('addNewsForm').reset();
    } catch (error) {
        alert("حدث خطأ أثناء النشر.");
    } finally {
        submitBtn.innerHTML = "نشر في الموقع 🚀";
        submitBtn.disabled = false;
    }
});
