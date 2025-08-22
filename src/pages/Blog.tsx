import { useState } from "react";
import { Search, Calendar, Clock, User, Tag, ArrowRight, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalization } from "@/contexts/LocalizationContext";

const Blog = () => {
  const { t } = useLocalization();

  // Mock blog data with translations
  const blogPosts = [
    {
      id: 1,
      title: t('blog.article.top10Destinations.title'),
      excerpt: t('blog.article.top10Destinations.excerpt'),
      author: t('blog.article.top10Destinations.author'),
      publishDate: "2024-01-15",
      readTime: t('blog.article.top10Destinations.readTime'),
      category: t('blog.category.travelGuides'),
      tags: [t('blog.tag.easternEurope'), t('blog.tag.culture'), t('blog.tag.history'), t('blog.tag.travelTips')],
      featured: true,
      image: "/images/blog/prague-castle-eastern-europe.jpg",
      content: t('blog.article.top10Destinations.content')
    },
    {
      id: 2,
      title: t('blog.article.comfortableTravel.title'),
      excerpt: t('blog.article.comfortableTravel.excerpt'),
      author: t('blog.article.comfortableTravel.author'),
      publishDate: "2024-01-12",
      readTime: t('blog.article.comfortableTravel.readTime'),
      category: t('blog.category.travelTips'),
      tags: [t('blog.tag.comfort'), t('blog.tag.longDistance'), t('blog.tag.travelTips')],
      image: "/images/blog/comfortable-bus-travel-long-distance.jpg",
      content: t('blog.article.comfortableTravel.content')
    },
    {
      id: 3,
      title: t('blog.article.romaniaGuide.title'),
      excerpt: t('blog.article.romaniaGuide.excerpt'),
      author: t('blog.article.romaniaGuide.author'),
      publishDate: "2024-01-10",
      readTime: t('blog.article.romaniaGuide.readTime'),
      category: t('blog.category.travelGuides'),
      tags: [t('blog.tag.romania'), t('blog.tag.busNetwork'), t('blog.tag.travelTips')],
      image: "/images/blog/romania-bus-network-bucharest.jpg",
      content: t('blog.article.romaniaGuide.content')
    },
    {
      id: 4,
      title: t('blog.article.bestTimeToVisit.title'),
      excerpt: t('blog.article.bestTimeToVisit.excerpt'),
      author: t('blog.article.bestTimeToVisit.author'),
      publishDate: "2024-01-08",
      readTime: t('blog.article.bestTimeToVisit.readTime'),
      category: t('blog.category.travelPlanning'),
      tags: [t('blog.tag.easternEurope'), t('blog.tag.travelTips'), t('blog.tag.culture')],
      image: "/images/blog/spring-eastern-europe-blooming-gardens.jpg",
      content: t('blog.article.bestTimeToVisit.content')
    },
    {
      id: 5,
      title: t('blog.article.budgetTravel.title'),
      excerpt: t('blog.article.budgetTravel.excerpt'),
      author: t('blog.article.budgetTravel.author'),
      publishDate: "2024-01-05",
      readTime: t('blog.article.budgetTravel.readTime'),
      category: t('blog.category.budgetTravel'),
      tags: [t('blog.tag.easternEurope'), t('blog.tag.travelTips'), t('blog.tag.culture')],
      image: "/images/blog/budget-travel-eastern-europe-hostel.jpg",
      content: t('blog.article.budgetTravel.content')
    },
    {
      id: 6,
      title: t('blog.article.localCuisine.title'),
      excerpt: t('blog.article.localCuisine.excerpt'),
      author: t('blog.article.localCuisine.author'),
      publishDate: "2024-01-03",
      readTime: t('blog.article.localCuisine.readTime'),
      category: t('blog.category.travelGuides'),
      tags: [t('blog.tag.culture'), t('blog.tag.easternEurope'), t('blog.tag.history')],
      image: "/images/blog/eastern-european-cuisine-sarmale-mamaliga.jpg",
      content: t('blog.article.localCuisine.content')
    },
    {
      id: 7,
      title: t('blog.article.safetyTips.title'),
      excerpt: t('blog.article.safetyTips.excerpt'),
      author: t('blog.article.safetyTips.author'),
      publishDate: "2024-01-01",
      readTime: t('blog.article.safetyTips.readTime'),
      category: t('blog.category.travelTips'),
      tags: [t('blog.tag.travelTips'), t('blog.tag.comfort'), t('blog.tag.busNetwork')],
      image: "/images/blog/bus-safety-tips-luggage-security.jpg",
      content: t('blog.article.safetyTips.content')
    },
    {
      id: 8,
      title: t('blog.article.winterTravel.title'),
      excerpt: t('blog.article.winterTravel.excerpt'),
      author: t('blog.article.winterTravel.author'),
      publishDate: "2023-12-28",
      readTime: t('blog.article.winterTravel.readTime'),
      category: t('blog.category.travelGuides'),
      tags: [t('blog.tag.easternEurope'), t('blog.tag.travelTips'), t('blog.tag.culture')],
      image: "/images/blog/winter-eastern-europe-christmas-markets.jpg",
      content: t('blog.article.winterTravel.content')
    },
    {
      id: 9,
      title: t('blog.article.culturalEtiquette.title'),
      excerpt: t('blog.article.culturalEtiquette.excerpt'),
      author: t('blog.article.culturalEtiquette.author'),
      publishDate: "2023-12-25",
      readTime: t('blog.article.culturalEtiquette.readTime'),
      category: t('blog.category.travelTips'),
      tags: [t('blog.tag.culture'), t('blog.tag.easternEurope'), t('blog.tag.travelTips')],
      image: "/images/blog/cultural-etiquette-eastern-europe-greetings.jpg",
      content: t('blog.article.culturalEtiquette.content')
    }
  ];

  const categories = [t('blog.category.all'), t('blog.category.travelGuides'), t('blog.category.travelTips'), t('blog.category.budgetTravel'), t('blog.category.travelPlanning')];
  const tags = [t('blog.tag.easternEurope'), t('blog.tag.culture'), t('blog.tag.history'), t('blog.tag.travelTips'), t('blog.tag.comfort'), t('blog.tag.longDistance'), t('blog.tag.romania'), t('blog.tag.busNetwork')];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t('blog.category.all'));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<typeof blogPosts[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter posts based on search, category, and tags
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === t('blog.category.all') || post.category === selectedCategory;
    
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
    setSelectedCategory(t('blog.category.all'));
    setSelectedTags([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const openArticleModal = (article: typeof blogPosts[0]) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeArticleModal = () => {
    setSelectedArticle(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('blog.travelBlog')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('blog.discoverTravelTips')}
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
                    placeholder={t('blog.searchArticles')}
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
                    <SelectValue placeholder={t('blog.allCategories')} />
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
                {t('blog.filterByTags')}
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
                {t('blog.clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? t('blog.articleFound') : t('blog.articlesFound')}
            </span>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('blog.noArticlesFound')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('blog.tryAdjusting')}
            </p>
            <Button onClick={clearFilters}>
              {t('blog.clearAllFilters')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover-lift border-border group">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="fallback text-muted-foreground text-sm flex items-center justify-center" style={{display: 'none'}}>
                      {t('blog.blogImage')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.featured && (
                      <Badge variant="default" className="text-xs">
                        {t('blog.featured')}
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
                    onClick={() => openArticleModal(post)}
                  >
                    {t('blog.readMore')}
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Article Modal */}
      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {selectedArticle.category}
                </Badge>
                {selectedArticle.featured && (
                  <Badge variant="default">
                    {t('blog.featured')}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeArticleModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Article Image */}
              <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="fallback text-muted-foreground text-lg flex items-center justify-center" style={{display: 'none'}}>
                  {t('blog.blogImage')}
                </div>
              </div>

              {/* Article Title */}
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {selectedArticle.title}
              </h1>

              {/* Article Meta */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{selectedArticle.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedArticle.publishDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>

              {/* Article Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedArticle.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Article Content */}
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {selectedArticle.excerpt}
                </p>
                
                <div className="text-foreground leading-relaxed space-y-4">
                  {selectedArticle.content ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                  ) : (
                    <div className="space-y-4">
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                      <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {t('blog.articleBy')} {selectedArticle.author}
              </div>
              <Button onClick={closeArticleModal}>
                {t('blog.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
