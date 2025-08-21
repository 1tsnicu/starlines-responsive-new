import { useState } from "react";
import { Search, Calendar, Clock, User, Tag, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock blog data
const blogPosts = [
  {
    id: 1,
    title: "Top 10 Must-Visit Destinations in Eastern Europe",
    excerpt: "Discover the hidden gems and cultural treasures of Eastern Europe. From historic cities to breathtaking landscapes, these destinations will leave you speechless.",
    author: "Maria Popescu",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    category: "Travel Guides",
    tags: ["Eastern Europe", "Culture", "History", "Travel Tips"],
    featured: true
  },
  {
    id: 2,
    title: "How to Travel Comfortably on Long Bus Journeys",
    excerpt: "Essential tips and tricks for making your long-distance bus travel comfortable and enjoyable. Learn about seating, entertainment, and comfort essentials.",
    author: "Alexandru Ionescu",
    publishDate: "2024-01-12",
    readTime: "6 min read",
    category: "Travel Tips",
    tags: ["Comfort", "Long Distance", "Travel Tips", "Bus Travel"]
  },
  {
    id: 3,
    title: "The Ultimate Guide to Bus Travel in Romania",
    excerpt: "Everything you need to know about traveling by bus in Romania. From booking tickets to understanding the network and finding the best deals.",
    author: "Elena Dumitrescu",
    publishDate: "2024-01-10",
    readTime: "10 min read",
    category: "Travel Guides",
    tags: ["Romania", "Bus Network", "Travel Guide", "Transportation"]
  }
];

const categories = ["All", "Travel Guides", "Travel Tips", "Budget Travel", "Travel Planning"];
const tags = ["Eastern Europe", "Culture", "History", "Travel Tips", "Comfort", "Long Distance", "Romania", "Bus Network"];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter posts based on search, category, and tags
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => post.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedTags([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Travel Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover travel tips, destination guides, and insights to make your journeys unforgettable.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"} found
            </span>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No articles found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover-lift border-border group">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">Blog Image</div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.featured && (
                      <Badge variant="default" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.publishDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>

                  {/* Read More Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
