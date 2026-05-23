"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWP = void 0;
const DEFAULT_NODE = 'https://awp-net.up.railway.app';
class AWP {
    constructor(options) {
        this.nodeUrl = (options?.node ?? DEFAULT_NODE).replace(/\/$/, '');
        this.timeout = options?.timeout ?? 30000;
    }
    async query(question) {
        const url = `${this.nodeUrl}/query?q=${encodeURIComponent(question)}`;
        const response = await fetch(url, {
            signal: AbortSignal.timeout(this.timeout),
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(`AWP query failed: ${response.status} — ${body.error ?? response.statusText}`);
        }
        return response.json();
    }
    async getEntry(id) {
        const url = `${this.nodeUrl}/entry/${encodeURIComponent(id)}`;
        const response = await fetch(url, {
            signal: AbortSignal.timeout(this.timeout),
        });
        if (response.status === 404)
            return null;
        if (!response.ok)
            throw new Error(`AWP getEntry failed: ${response.status}`);
        return response.json();
    }
    async isHealthy() {
        try {
            const response = await fetch(`${this.nodeUrl}/health`, {
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
exports.AWP = AWP;
