import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// مفاتيح الاتصال الخاصة بك (جاهزة)
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

// 1. نظام سحب أخبار كورة بلس
document.getElementById('fetchNewsBtn').addEventListener('click', async () => {
    const feedContainer = document.getElementById('feedContainer');
    feedContainer.innerHTML = "<p style='text-align:center; color:#22c55e;'>جاري سحب أحدث أخبار كورة بلس... ⏳</p>";
    
    try {
        const koraPlusQuery = "site:koraplus.com";
        const rssUrl = `https://news.google.com/rss/search?q=${koraPlusQuery}&hl=ar&gl=EG&ceid=EG:ar`;
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        feedContainer.innerHTML = ""; 
        
        if (!data.items || data.items.length === 0) {
             feedContainer.innerHTML = "<p style='text-align:center;'>لا توجد أخبار جديدة حالياً.</p>";
             return;
        }

        data.items.forEach(item => {
            const cleanText = item.description.replace(/<[^>]*>?/gm, '').trim(); 
            
            let imgUrl = item.enclosure?.link || item.thumbnail;
            if (!imgUrl) {
                const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                imgUrl = imgMatch ? imgMatch[1] : "https://via.placeholder.com/400x200/1e293b/22c55e?text=HattrickPlus+News";
            }

            const cleanTitle = item.title.replace(' - كورة بلس', '').replace(' - Kora Plus', '');

            const div = document.createElement('div');
            div.className = 'feed-item';
            div.innerHTML = `
                <img src="${imgUrl}" alt="صورة الخبر">
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
                        createdAt: serverTimestamp()
                    });
                    btn.innerHTML = "تم النشر ✅";
                    btn.style.background = "#16a34a"; 
                    btn.style.color = "white";
                } catch (error) {
                    btn.innerHTML = "فشل النشر ❌";
                    btn.style.background = "#ef4444";
                }
            });
        });
    } catch (error) {
        feedContainer.innerHTML = "<p style='color:red; text-align:center;'>فشل جلب الأخبار، تأكد من اتصالك بالإنترنت.</p>";
    }
});

// 2. النشر اليدوي العادي
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

