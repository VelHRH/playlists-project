import { describe, expect, it } from "vitest";
import { createResendMailer } from "./resend-mailer";

function recordingFetch(response: Response) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetch = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return response;
  };
  return { fetch, calls };
}

describe("Resend mailer", () => {
  it("posts the email to the Resend API with the API key and sender", async () => {
    const { fetch, calls } = recordingFetch(new Response(JSON.stringify({ id: "1" }), { status: 200 }));
    const mailer = createResendMailer({ apiKey: "re_test", from: "Плейлисти <noreply@example.com>", fetch });

    await mailer.send({ to: "olena@example.com", subject: "Скидання пароля", text: "Посилання: https://x" });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    expect(calls[0].init.method).toBe("POST");
    expect(new Headers(calls[0].init.headers).get("authorization")).toBe("Bearer re_test");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      from: "Плейлисти <noreply@example.com>",
      to: ["olena@example.com"],
      subject: "Скидання пароля",
      text: "Посилання: https://x",
    });
  });

  it("fails when Resend rejects the email", async () => {
    const { fetch } = recordingFetch(
      new Response(JSON.stringify({ message: "Invalid API key" }), { status: 401 }),
    );
    const mailer = createResendMailer({ apiKey: "bad", from: "noreply@example.com", fetch });

    await expect(
      mailer.send({ to: "olena@example.com", subject: "s", text: "t" }),
    ).rejects.toThrow(/401.*Invalid API key/);
  });
});
