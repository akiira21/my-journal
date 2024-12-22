export default function FeaturedQueries({
  setSearchQuery,
}: {
  setSearchQuery: (query: string) => void;
}) {
  const featuredSearchQueries = [
    { query: "What is KNN Algorithm?" },
    { query: "How to use Linear Regression for prediction?" },
    { query: "Code: Logistic Regression" },
    { query: "Understanding Decision Trees" },
    { query: "A Guide to Support Vector Machines" },
    { query: "Clustering with K-Means" },
    { query: "Introduction to Neural Networks" },
    { query: "Natural Language Processing Basics" },
  ];

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {featuredSearchQueries.map((query, index) => (
        <div
          className="cursor-pointer rounded-sm px-2 py-1 bg-blue-50 text-blue-600 dark:bg-[#0e121f] dark:text-[#5982ec]"
          key={index}
          onClick={() => setSearchQuery(query.query)}
        >
          {query.query}
        </div>
      ))}
    </div>
  );
}
