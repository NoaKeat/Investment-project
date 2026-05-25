import Header from "@/components/Header/Header";
import BlogSection from "@/components/BlogSection/BlogSection";
import ContactForm from "@/components/ContactForm/ContactForm";
import ArticlesHeader from "@/components/ArticlesHeader/ArticlesHeader";

export default function AllArticlesPage() {
  return (
    <main>

      {/* Header של האתר */}
      <Header />

      {/* כותרת עליונה */}
     <ArticlesHeader />

      {/* כל המאמרים */}
      <BlogSection 
        limit={1000}          // 👈 מביא "הכול"
        showHeader={false}    // 👈 בלי header פנימי
        showAllButton={false} // 👈 בלי כפתור למטה
      />

      {/* טופס יצירת קשר */}
      <ContactForm />

    </main>
  );
}