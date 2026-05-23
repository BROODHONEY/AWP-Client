export interface AWPFact {
    claim: string;
    type: 'text' | 'numeric' | 'boolean' | 'date';
    value?: string | number | boolean;
    unit?: string;
}
export interface AWPResult {
    hit: boolean;
    source: 'cache' | 'web';
    topic: string;
    facts: AWPFact[];
    source_url: string;
    fetched_at: string;
    confidence: number;
    confidence_label: 'high' | 'medium' | 'low' | 'stale';
    flag_count: number;
    similarity?: number;
}
export interface AWPOptions {
    node?: string;
    timeout?: number;
}
export declare class AWP {
    private nodeUrl;
    private timeout;
    constructor(options?: AWPOptions);
    query(question: string): Promise<AWPResult>;
    getEntry(id: string): Promise<AWPResult | null>;
    isHealthy(): Promise<boolean>;
}
