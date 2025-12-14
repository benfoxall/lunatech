import { z, ZodType } from "zod";
import { auth, positions, trackers } from "./TractiveSchemas.ts";

const CLIENT_ID = "6536c228870a3c8857d452e8";

export class TractiveClient {
  private authResponse: z.infer<typeof auth> | null = null;

  private async request<S>(
    url: string,
    init: RequestInit = {},
    schema: ZodType<S> = z.any()
  ): Promise<S> {
    const headers = new Headers(init.headers);

    headers.set("X-Tractive-Client", CLIENT_ID);
    headers.set("Content-Type", "application/json");

    if (this.authResponse) {
      headers.set("Authorization", `Bearer ${this.authResponse.access_token}`);
    }

    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json();

    const parsed = schema.parse(json);

    return parsed;
  }

  async login(email: string, password: string) {
    this.authResponse = null;

    const url = `https://graph.tractive.com/4/auth/token?${new URLSearchParams({
      grant_type: "tractive",
      platform_email: email,
      platform_token: password,
    })}`;

    this.authResponse = await this.request(
      url,
      {
        method: "POST",
      },
      auth
    );
  }

  async getTrackers() {
    if (!this.authResponse) throw new Error("Not authenticated");

    const url = `https://graph.tractive.com/4/user/${this.authResponse.user_id}/trackers`;

    return this.request(url, {}, trackers);
  }

  async getPositions(tracker: string, from: Date, to: Date) {
    if (!this.authResponse) throw new Error("Not authenticated");

    function format(date: Date) {
      return (date.getTime() / 1000).toFixed(0);
    }

    const params = new URLSearchParams({
      format: "json_segments",
      time_from: format(from),
      time_to: format(to),
    });

    const url = `https://graph.tractive.com/4/tracker/${tracker}/positions?${params}`;

    return this.request(url, {}, positions);
  }
}
