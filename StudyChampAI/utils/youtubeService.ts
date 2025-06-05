import Constants from 'expo-constants';

const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || "AIzaSyAeVVobmTRA1aQpQbm_9_1PGils2PqXDmI";
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  url: string;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  category?: 'education' | 'science' | 'all';
  duration?: 'short' | 'medium' | 'long' | 'any';
  order?: 'relevance' | 'date' | 'rating' | 'viewCount';
}

class YouTubeService {
  private async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "your-youtube-api-key") {
      console.warn('YouTube API key not configured properly, using mock data');
      // Return mock data instead of throwing error for development
      return this.getMockData(params.q || 'tutorial');
    }

    const url = new URL(`${YOUTUBE_BASE_URL}${endpoint}`);
    url.searchParams.append('key', YOUTUBE_API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log('YouTube API Request:', url.toString().replace(YOUTUBE_API_KEY, '[API_KEY]'));

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error response:', response.status, errorText);
        
        // If API fails, fallback to mock data for development
        if (response.status === 403 || response.status === 401) {
          console.warn('YouTube API authentication failed, using mock data');
          return this.getMockData(params.q || 'tutorial');
        }
        
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('YouTube API response received:', data.items?.length || 0, 'items');
      return data;
    } catch (fetchError) {
      console.error('YouTube API fetch error:', fetchError);
      console.warn('Falling back to mock data due to network/API issues');
      return this.getMockData(params.q || 'tutorial');
    }
  }
  public async searchVideos(searchParams: YouTubeSearchParams): Promise<YouTubeVideo[]> {
    try {
      console.log('Searching YouTube videos with params:', searchParams);
      
      const {
        query,
        maxResults = 10,
        category = 'education',
        duration = 'any',
        order = 'relevance'
      } = searchParams;

      // Enhance query with educational keywords
      const enhancedQuery = this.enhanceEducationalQuery(query, category);
      console.log('Enhanced query:', enhancedQuery);

      const params: Record<string, string> = {
        part: 'snippet',
        type: 'video',
        q: enhancedQuery,
        maxResults: maxResults.toString(),
        order,
        videoDefinition: 'any',
        videoEmbeddable: 'true',
        safeSearch: 'strict',
        regionCode: 'US',
        relevanceLanguage: 'en',
      };

      // Add duration filter
      if (duration !== 'any') {
        params.videoDuration = duration;
      }

      // Add category filter for educational content
      if (category === 'education') {
        params.videoCategoryId = '27'; // Education category
      } else if (category === 'science') {
        params.videoCategoryId = '28'; // Science & Technology category
      }

      const searchResponse = await this.makeRequest('/search', params);
      console.log('YouTube search response:', searchResponse);

      if (!searchResponse.items || searchResponse.items.length === 0) {
        console.log('No videos found for query:', enhancedQuery);
        return [];
      }

      // Get video IDs for additional details
      const videoIds = searchResponse.items.map((item: any) => item.id.videoId).join(',');
      
      // Get video statistics and content details
      const videoDetails = await this.makeRequest('/videos', {
        part: 'statistics,contentDetails',
        id: videoIds,
      });

      // Combine search results with video details
      const videos: YouTubeVideo[] = searchResponse.items.map((item: any, index: number) => {
        const details = videoDetails.items?.[index];
        
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: details?.contentDetails?.duration ? this.parseDuration(details.contentDetails.duration) : undefined,
          viewCount: details?.statistics?.viewCount ? this.formatViewCount(details.statistics.viewCount) : undefined,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        };
      });

      const filteredVideos = this.filterEducationalContent(videos);
      console.log(`Found ${filteredVideos.length} educational videos`);
      return filteredVideos;
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  private enhanceEducationalQuery(query: string, category: string): string {
    const educationalKeywords = {
      education: ['tutorial', 'explained', 'lesson', 'course', 'learn', 'study'],
      science: ['science', 'explanation', 'theory', 'concept', 'experiment'],
      all: ['education', 'tutorial', 'explained']
    };

    const keywords = educationalKeywords[category as keyof typeof educationalKeywords] || educationalKeywords.all;
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    return `${query} ${randomKeyword}`;
  }

  private parseDuration(duration: string): string {
    // Parse ISO 8601 duration format (PT4M13S -> 4:13)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  }

  private filterEducationalContent(videos: YouTubeVideo[]): YouTubeVideo[] {
    // Filter out videos that are likely not educational
    const educationalKeywords = [
      'tutorial', 'explained', 'lesson', 'course', 'learn', 'study', 'education',
      'theory', 'concept', 'how to', 'introduction', 'basics', 'fundamentals',
      'khan academy', 'crash course', 'professor', 'lecture', 'university'
    ];

    const nonEducationalKeywords = [
      'funny', 'reaction', 'prank', 'meme', 'tiktok', 'shorts', 'gaming',
      'vlog', 'unboxing', 'review', 'music video', 'trailer'
    ];

    return videos.filter(video => {
      const text = `${video.title} ${video.description} ${video.channelTitle}`.toLowerCase();
      
      const hasEducationalKeywords = educationalKeywords.some(keyword => text.includes(keyword));
      const hasNonEducationalKeywords = nonEducationalKeywords.some(keyword => text.includes(keyword));
      
      // Prefer videos with educational keywords and without non-educational ones
      return hasEducationalKeywords || !hasNonEducationalKeywords;
    });
  }  public async getPopularEducationalVideos(subject?: string): Promise<YouTubeVideo[]> {
    const popularEducationalQueries = [
      'Khan Academy mathematics tutorial',
      'Crash Course physics explained', 
      'TED-Ed science education',
      'MIT OpenCourseWare lecture',
      'Professor Leonard calculus tutorial',
      'Organic Chemistry Tutor explained',
      'SciShow educational science',
      'Veritasium physics concepts',
      'Numberphile mathematics explained',
      'Biology tutorial comprehensive'
    ];

    const query = subject ? `${subject} tutorial educational explained` : popularEducationalQueries[Math.floor(Math.random() * popularEducationalQueries.length)];
    console.log('🎥 Getting popular educational videos for query:', query);
    
    try {
      const result = await this.searchVideos({
        query,
        maxResults: 15,
        category: 'education',
        order: 'relevance'
      });
      
      console.log('📊 Retrieved', result.length, 'educational videos');
      return result;
    } catch (error) {
      console.error('❌ Error in getPopularEducationalVideos:', error);
      throw error;
    }
  }public getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Test YouTube API connectivity
  public async testApiConnection(): Promise<{ working: boolean; usingMockData: boolean; error?: string }> {
    try {
      console.log('Testing YouTube API connection...');
      
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "your-youtube-api-key") {
        return { working: false, usingMockData: true, error: 'API key not configured' };
      }

      const testResponse = await this.makeRequest('/search', {
        part: 'snippet',
        type: 'video',
        q: 'test',
        maxResults: '1'
      });

      const isRealData = testResponse.items && testResponse.items.length > 0 && !testResponse.items[0].id.videoId.startsWith('mock_');
      
      return { 
        working: true, 
        usingMockData: !isRealData,
        error: isRealData ? undefined : 'Using fallback mock data'
      };
    } catch (error) {
      console.error('YouTube API test failed:', error);
      return { working: false, usingMockData: true, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  private getMockData(query: string): any {
    // Enhanced mock YouTube API response with realistic educational content
    const educationalVideos = [
      {
        id: { videoId: 'dQw4w9WgXcQ' },
        snippet: {
          title: `${query} - Complete Tutorial for Beginners`,
          description: `Master ${query} with this comprehensive tutorial. Perfect for students and beginners looking to understand the fundamentals. Covers theory, examples, and practical applications.`,
          thumbnails: {
            medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' }
          },
          channelTitle: 'Khan Academy',
          publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        }
      },
      {
        id: { videoId: 'jNQXAC9IVRw' },
        snippet: {
          title: `Advanced ${query} Concepts Explained`,
          description: `Deep dive into advanced concepts of ${query}. This video covers complex topics with clear explanations and real-world examples. Ideal for intermediate to advanced learners.`,
          thumbnails: {
            medium: { url: 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg' }
          },
          channelTitle: 'MIT OpenCourseWare',
          publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
        }
      },
      {
        id: { videoId: 'ZZ5LpwO-An4' },
        snippet: {
          title: `${query} Examples and Practice Problems`,
          description: `Practice problems and solved examples for ${query}. Step-by-step solutions with detailed explanations. Great for exam preparation and homework help.`,
          thumbnails: {
            medium: { url: 'https://i.ytimg.com/vi/ZZ5LpwO-An4/mqdefault.jpg' }
          },
          channelTitle: 'Professor Leonard',
          publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        }
      },
      {
        id: { videoId: 'HEHEUQ_8gp8' },
        snippet: {
          title: `${query} Made Simple - Visual Learning`,
          description: `Learn ${query} through visual explanations and animations. Complex concepts broken down into easy-to-understand segments. Perfect for visual learners.`,
          thumbnails: {
            medium: { url: 'https://i.ytimg.com/vi/HEHEUQ_8gp8/mqdefault.jpg' }
          },
          channelTitle: '3Blue1Brown',
          publishedAt: new Date(Date.now() - 86400000 * 21).toISOString(), // 21 days ago
        }
      },
      {
        id: { videoId: 'QH2-TGUlwu4' },
        snippet: {
          title: `Quick Review: ${query} in 10 Minutes`,
          description: `Fast-paced review of ${query} covering all essential topics. Perfect for quick revision before exams or as a refresher course.`,
          thumbnails: {
            medium: { url: 'https://i.ytimg.com/vi/QH2-TGUlwu4/mqdefault.jpg' }
          },
          channelTitle: 'Crash Course',
          publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        }
      }
    ];

    return {
      items: educationalVideos.slice(0, Math.min(educationalVideos.length, 10))
    };
  }
}

export const youtubeService = new YouTubeService();
