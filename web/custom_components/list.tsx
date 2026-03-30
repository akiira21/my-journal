import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ListProps {
  items: any[];
  className?: string;
}

const OrderedList: React.FC<ListProps> = ({ items, className }) => {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item}
          className={cn(
            "flex items-center gap-2 leading-relaxed tracking-wide text-zinc-700 dark:text-zinc-400",
            className
          )}
        >
          <span className="text-blue-500">{index + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
};

const UnorderedList: React.FC<ListProps> = ({ items, className }) => {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-center gap-2 leading-relaxed tracking-wide text-zinc-700 dark:text-zinc-400",
            className
          )}
        >
          <ArrowRight className="h-4 w-4 text-blue-500 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export { OrderedList, UnorderedList };
