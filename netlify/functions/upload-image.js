// Netlify Function: /.netlify/functions/upload-image
// Uploads an image to a GitHub repo (Enkhjin's usual image-storage pattern)
// and returns the raw.githubusercontent.com URL to store on the tour.
//
// Requires env vars set in Netlify:
//   GITHUB_TOKEN       — a GitHub personal access token with Contents: read/write
//                         on the target repo (fine-grained token scoped to just
//                         that repo is safest)
//   GITHUB_REPO        — "username/repo-name"
//   GITHUB_BRANCH      — optional, defaults to "main"
//   GITHUB_IMAGE_PATH  — optional, defaults to "images/tours" (folder inside the repo)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
  const BASE_PATH = process.env.GITHUB_IMAGE_PATH || "images/tours";

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return { statusCode: 500, body: "Image storage not configured (missing GITHUB_TOKEN or GITHUB_REPO)" };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { filename, contentBase64, folder } = data;
  if (!filename || !contentBase64) {
    return { statusCode: 400, body: "Missing filename or contentBase64" };
  }

  // Strip any data: URL prefix if present
  const base64 = contentBase64.includes(",") ? contentBase64.split(",")[1] : contentBase64;

  const safeFolder = (folder || "misc").replace(/[^a-z0-9-]/gi, "-");
  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `${BASE_PATH}/${safeFolder}/${Date.now()}-${safeFilename}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
          message: `Upload image: ${path}`,
          content: base64,
          branch: GITHUB_BRANCH
        })
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("GitHub upload error:", errText);
      return { statusCode: 502, body: "Failed to upload to GitHub" };
    }

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
    return {
      statusCode: 200,
      body: JSON.stringify({ url: rawUrl })
    };
  } catch (err) {
    console.error("upload-image function error:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
