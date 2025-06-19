// lib/sse-client.ts

export async function* createSSEStream(
  url: string,
  query: string,
): AsyncIterable<string> {
  console.log("Starting createSSEStream with URL:", url, "and query:", query);

  const encoder = new TextEncoder();
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    // console.log("Sending fetch request...");
    const response = await fetch(url, {
      method: "POST", // or "GET" depending on how you're passing the query
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ query }),
      signal,
    });

    // console.log("Fetch response received:", response.status);

    if (!response.ok || !response.body) {
      // console.error("Failed to connect to SSE stream. Response status:", response.status);
      throw new Error("Failed to connect to SSE stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    // console.log("Starting to read SSE stream...");
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // console.log("Stream reading completed.");
        break;
      }

      // console.log("Received chunk of data:", value);
      buffer += decoder.decode(value, { stream: true });

      let lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        console.log("Processing line:", line);
        if (line.startsWith("data: ")) {
          const json = line.replace(/^data:\s*/, "");
          try {
            const parsed = JSON.parse(json);
            // console.log("Parsed JSON:", parsed);
            if (parsed.event === "chunk" && parsed.data.text) {
              const cleanText = parsed.data.text
                .replace(/^```json/, "")
                .replace(/^```/, "")
                .replace(/```$/, "");

              yield cleanText;
            }

            if (parsed.event === "metadata" && parsed.data?.citations) {
              window.dispatchEvent(
                new CustomEvent("citations", { detail: parsed.data.citations }),
              );
            }
            if (parsed?.message) {
              // console.log("Yielding message:", parsed.message);
              yield parsed.message;
            } else if (parsed?.content) {
              // console.log("Yielding content:", parsed.content);
              yield parsed.content;
            }
          } catch (err) {
            // console.warn("Could not parse JSON from SSE:", json, "Error:", err);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in createSSEStream:", error);
    throw error;
  }
}
