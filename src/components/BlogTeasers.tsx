import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BlogTeasers = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Must-Visit Cities in Eastern Europe",
      excerpt: "Discover the hidden gems and cultural treasures of Eastern Europe. From historic architecture to vibrant nightlife, these cities offer unforgettable experiences.",
      category: "Travel Guide",
      readTime: "8 min read",
      publishDate: "2024-01-15",
      image: "/public/placeholder.svg",
      tags: ["Eastern Europe", "Culture", "Travel Tips"]
    },
    {
      id: 2,
      title: "How to Pack Smart for Long Bus Journeys",
      excerpt: "Learn the essential packing tips and tricks for comfortable long-distance bus travel. From entertainment to comfort items, we've got you covered.",
      category: "Travel Tips",
      readTime: "6 min read",
      publishDate: "2024-01-12",
      image: "/public/placeholder.svg",
      tags: ["Packing", "Comfort", "Long Journeys"]
    },
    {
      id: 3,
      title: "The Ultimate Guide to Bus Travel Safety",
      excerpt: "Your comprehensive guide to staying safe while traveling by bus. Learn about security measures, emergency procedures, and best practices.",
      category: "Safety",
      readTime: "10 min read",
      publishDate: "2024-01-10",
      image: "/public/placeholder.svg",
      tags: ["Safety", "Security", "Travel Tips"]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 bg-surface">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Travel Insights & Tips
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get inspired with our latest travel guides, tips, and stories from the road
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover-lift border-border group overflow-hidden">
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.publishDate)}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-muted-foreground line-clamp-3 mb-4">
                  {post.excerpt}
                </CardDescription>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto font-medium text-primary hover:text-primary/80 group-hover:translate-x-1 transition-transform"
                >
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Posts CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            View All Posts
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogTeasers;
