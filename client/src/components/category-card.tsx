import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  name: string;
  count: number;
  imageUrl: string;
  href: string;
}

export default function CategoryCard({ name, count, imageUrl, href }: CategoryCardProps) {
  return (
    <Link href={href} className="group block">
        <Card className="overflow-hidden transition hover:shadow-lg">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-[#FF8C69]/20 group-hover:bg-[#FF8C69]/30 transition"></div>
          </div>
          <div className="p-4 text-center">
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-neutral-500">{count.toLocaleString()} available</p>
          </div>
        </Card>
    </Link>
  );
}
