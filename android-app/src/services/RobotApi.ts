import { PairResponse, HealthResponse, InfoResponse } from '../types/protocol';

export class RobotApi {
  private static getBaseUrl(host: string, port: number): string {
    return `http://${host}:${port}`;
  }

  static async pair(host: string, port: number, pairCode: string): Promise<PairResponse> {
    const url = `${this.getBaseUrl(host, port)}/api/v1/pair`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairCode }),
    });
    return response.json();
  }

  static async getHealth(host: string, port: number): Promise<HealthResponse> {
    const url = `${this.getBaseUrl(host, port)}/api/v1/health`;
    const response = await fetch(url);
    return response.json();
  }

  static async getInfo(host: string, port: number): Promise<InfoResponse> {
    const url = `${this.getBaseUrl(host, port)}/api/v1/info`;
    const response = await fetch(url);
    return response.json();
  }

  static async emergencyStop(host: string, port: number): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl(host, port)}/api/v1/emergency-stop`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  static async emergencyReset(
    host: string,
    port: number,
    token: string
  ): Promise<{ success: boolean; reason?: string }> {
    try {
      const url = `${this.getBaseUrl(host, port)}/api/v1/emergency-reset`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    } catch (e: any) {
      return { success: false, reason: e.message };
    }
  }

  static async getCameraTicket(host: string, port: number, token: string): Promise<string | null> {
    try {
      const url = `${this.getBaseUrl(host, port)}/api/v1/camera/ticket`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.ticket || null;
    } catch {
      return null;
    }
  }

  static async getRecentLogs(host: string, port: number, token: string): Promise<string[]> {
    try {
      const url = `${this.getBaseUrl(host, port)}/api/v1/logs/recent`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.logs || [];
    } catch {
      return [];
    }
  }

  static async revokeSession(host: string, port: number, token: string): Promise<boolean> {
    try {
      const url = `${this.getBaseUrl(host, port)}/api/v1/session`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
