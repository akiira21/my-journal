import CategoriesBody from "./categories-body";
import CategoryTabs from "@/app/navigation/category-tabs";

export default async function CategoriesSection() {
  return (
    <div>
      <CategoryTabs categories={popularCategories} />
      <div className="my-8 px-2">
        <CategoriesBody activeCategory={popularCategories[0]} />
      </div>
    </div>
  );
}

const popularCategories = [
  "Linear Algebra",
  "Transformer",
  "Natural Language Processing",
];
