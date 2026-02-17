import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function fetchAndDisplayNews() {
    const newsContainer = document.getElementById('newsContainer');
    
    try {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        newsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            newsContainer.innerHTML = '<h2 style="color:white; text-align:center; grid-column: 1/-1;">لا توجد أخبار حالياً. قم بإضافة خبر من لوحة التحكم!</h2>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const article = doc.data();
            const articleId = doc.id; 
            
            const cardHTML = `
                <div class="news-card">
                    <img src="${article.imageUrl}" alt="صورة الخبر" class="news-img" onerror="this.src='https://via.placeholder.com/400x200/1e293b/22c55e?text=HattrickPlus'">
                    <div class="news-content">
                        <h3 class="news-title">${article.title}</h3>
                        <p class="news-excerpt">${article.content}</p>
                        <a href="#" class="read-more">التفاصيل كاملة ←</a>
                    </div>
                </div>
            `;
            newsContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("خطأ: ", error);
        newsContainer.innerHTML = '<h2 style="color:red; text-align:center; grid-column: 1/-1;">تأكد من إعدادات قاعدة البيانات (Rules) في Firebase.</h2>';
    }
}

fetchAndDisplayNews();
