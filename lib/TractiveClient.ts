const CLIENT_ID = "6536c228870a3c8857d452e8";

// todo: parse with zod to ensure user_id is valid
type AuthResponse = {
  user_id: string;
  client_id: string;
  expires_at: number;
  access_token: string;
};

type GetTrackersResponse = {
  _id: string;
  _type: string;
  _version: string;
}[];

type PositionsResponse = [
  {
    time: number;
    latlong: [number, number];
    alt: number;
    speed: null | number;
    course: null | number;
    pos_uncertainty: number;
    sensor_used: string;
  }[]
];

export class TractiveClient {
  private authResponse?: AuthResponse;

  async auth(email: string, password: string) {
    const params = new URLSearchParams({
      grant_type: "tractive",
      platform_email: email,
      platform_token: password,
    });

    const url = `https://graph.tractive.com/4/auth/token?${params}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tractive-Client": CLIENT_ID,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    this.authResponse = await response.json();

    return true;
  }

  async getTrackers(): Promise<GetTrackersResponse> {
    if (!this.authResponse) throw new Error("Not authenticated");

    const url = `https://graph.tractive.com/4/user/${this.authResponse.user_id}/trackers`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Tractive-Client": CLIENT_ID,
        Authorization: `Bearer ${this.authResponse.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  }

  async getPositions(
    tracker: string,
    from: Date,
    to: Date
  ): Promise<PositionsResponse> {
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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tractive-Client": CLIENT_ID,
        Authorization: `Bearer ${this.authResponse.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  }
}
