import { client } from "@/lib/sanity";
import ArticlePage from "@/components/ArticlePage/ArticlePage";
import { notFound } from "next/navigation";
// או false תלוי בהגדרות
// שימוש ב-Props כפי שמוגדר ב-Next.js 15+
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // הוסף את השורות האלו כדי לראות מה קורה בטרמינל
  console.log("--- DEBUG START ---");
  console.log("Slug from URL:", slug);

const post = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{ 
      title, 
      slug,
      "body": content,             // 🔥 כאן הקסם: אומרים ל-Sanity לקחת את content ולקרוא לו body
      "image": image.asset->url,
      subtitle                     // כדאי להוסיף גם את זה אם אתה רוצה להציג אותו
    }`,
    { slug }
  );

  console.log("Result from Sanity:", post);
  console.log("--- DEBUG END ---");

  if (!post) {
    console.log("Post not found for slug:", slug);
    notFound();
  }

  // 4. שליפת מאמרים קשורים
  const relatedPosts = await client.fetch(
    `*[_type == "article" && slug.current != $slug][0...2]{
       _id, title, subtitle, "image": image.asset->url, slug, _updatedAt
    }`,
    { slug: slug }
  );

  return <ArticlePage post={post} relatedPosts={relatedPosts} />;
}