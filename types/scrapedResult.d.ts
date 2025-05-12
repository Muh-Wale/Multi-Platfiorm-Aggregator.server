// types/scrapedResult.d.ts
declare module 'scrapedResult' {
    export type Platform = 'reddit' | 'youtube' | 'stackoverflow';

    export interface ScrapedResult {
        content: string;
        platform: Platform;
        metadata: {
            url: string;
            author: string;
            score: number;
            upvotes?: number;
            viewCount?: number;
            isAnswered?: boolean;
            channel?: string;
            tags?: string[];
        };
    }
}