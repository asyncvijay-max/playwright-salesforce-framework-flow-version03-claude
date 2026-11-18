import { APIRequestContext, APIResponse } from "@playwright/test";

/** Body Salesforce returns from a successful create. */
export interface CreateResult {
  id: string;
  success: boolean;
  errors: unknown[];
}

/** One entry of the error array Salesforce returns on 4xx responses. */
export interface SfError {
  errorCode: string;
  message: string;
  fields?: string[];
}

export interface QueryResult<T> {
  totalSize: number;
  done: boolean;
  records: T[];
}

/**
 * Generic CRUD for any sObject through the Salesforce REST API.
 * Each method returns the raw APIResponse so tests can check status codes themselves.
 * Paths are relative to the request context's baseURL (the org's instance URL).
 */
export class SObjectClient<T extends object = Record<string, unknown>> {
  constructor(
    protected readonly api: APIRequestContext,
    readonly sObjectType: string,
    protected readonly apiVersion: string,
    /** Called with the new record's id after a successful create (used for cleanup). */
    private readonly onCreated?: (sObjectType: string, id: string) => void,
  ) {}

  protected get basePath(): string {
    return `/services/data/v${this.apiVersion}`;
  }

  protected recordPath(id?: string): string {
    const path = `${this.basePath}/sobjects/${this.sObjectType}`;
    return id ? `${path}/${encodeURIComponent(id)}` : path;
  }

  /** POST /sobjects/{Type}. Expect 201. */
  async create(body: Partial<T>): Promise<APIResponse> {
    const response = await this.api.post(this.recordPath(), { data: body });
    if (response.status() === 201 && this.onCreated) {
      const { id } = (await response.json()) as CreateResult;
      this.onCreated(this.sObjectType, id);
    }
    return response;
  }

  /** GET /sobjects/{Type}/{id}, optionally only some fields. Expect 200. */
  async get(id: string, fields?: string[]): Promise<APIResponse> {
    const params = fields?.length ? { fields: fields.join(",") } : undefined;
    return this.api.get(this.recordPath(id), { params });
  }

  /** PATCH /sobjects/{Type}/{id}. Expect 204. */
  async update(id: string, body: Partial<T>): Promise<APIResponse> {
    return this.api.patch(this.recordPath(id), { data: body });
  }

  /** DELETE /sobjects/{Type}/{id}. Expect 204. */
  async delete(id: string): Promise<APIResponse> {
    return this.api.delete(this.recordPath(id));
  }

  /** GET /query?q=SOQL. Expect 200. */
  async query(soql: string): Promise<APIResponse> {
    return this.api.get(`${this.basePath}/query`, { params: { q: soql } });
  }
}
