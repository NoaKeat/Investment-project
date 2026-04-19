import { client } from "@/lib/sanity";
import ArticlePageComponent from "@/components/ArticlePage/ArticlePage";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {

  // 🔥 מקבלים slug מ-Next
  const { slug } = await params;

  // 🔥 פותרים בעיית עברית / encoding
  const decodedSlug = decodeURIComponent(slug);

  console.log("SLUG:", decodedSlug);

  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{
      title,
      subtitle,
      content,
      "image": image.asset->url
    }`,
    {
      slug: decodedSlug, // 🔥 זה החלק הקריטי
    }
  );

  if (!article) return <div>לא נמצא מאמר</div>;

  return <ArticlePageComponent article={article} />;
}