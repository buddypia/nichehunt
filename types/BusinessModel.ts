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
  image: string;
  website?: string;
  userCount?: number;
}
