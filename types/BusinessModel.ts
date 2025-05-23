export interface BusinessModel {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  upvotes: number;
  comments: number;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  createdAt: string;
  featured: boolean;
  revenue: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToMarket: string;
  initialInvestment: string;
  targetMarket: string;
  image: string;
  website?: string;
}
