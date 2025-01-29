const fs = require("fs");
const path = require("path");

async function fetchLatestOpenSSLTag() {
  const response = await fetch(
    "https://api.github.com/repos/openssl/openssl/tags",
  );
  const data = await response.json();
  // Now only filter out tags with the name openssl-maj.min.patch
  const tag = data
    .filter((tag) => /^openssl-\d+\.\d+\.\d+$/.test(tag.name))
    .map((tag) => tag.name.replace("openssl-", ""))
    .reduce((acc, tag) => {
      const bestVersionParts = acc.split(".");
      const comparingVersionParts = tag.split(".");
      const length = Math.min(
        bestVersionParts.length,
        comparingVersionParts.length,
      );
      for (let i = 0; i < length; i++) {
        const bestPart = parseInt(bestVersionParts[i], 10);
        const comparingPart = parseInt(comparingVersionParts[i], 10);
        if (comparingPart !== bestPart) {
          return comparingPart > bestPart ? tag : acc;
        }
      }

      return acc;
    });

  return tag;
}

async function updateBuildScript(version) {
  const buildScriptPath = path.join(__dirname, "../builds/openssl/build.sh");
  const buildScriptContent = fs.readFileSync(buildScriptPath, "utf8");

  const updatedContent = buildScriptContent.replace(
    /OPENSSL_VERSION="openssl-\d+\.\d+\.\d+"/,
    `OPENSSL_VERSION="openssl-${version}"`,
  );

  fs.writeFileSync(buildScriptPath, updatedContent, "utf8");
}

async function updateBuildScriptToLatestOpenSSL() {
  const latestTag = await fetchLatestOpenSSLTag();
  await updateBuildScript(latestTag);
}

updateBuildScriptToLatestOpenSSL();
