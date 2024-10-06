import { getArticleMetas } from "@/lib/data/article";
import { getDB } from "@/lib/db";
import { ListGroup, ListGroupItem } from "flowbite-react";

export const runtime = "edge";

export default async function Articles() {
  const [release, db] = await getDB();
  const articles = await getArticleMetas(db, 10, 0);
  release();
  return (
    <div className="flex justify-center">
      <ListGroup className="w-full">
        {articles.map((article) => (
          <ListGroupItem href={`/articles/${article.id}`} key={article.id}>
            {article.title}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}
