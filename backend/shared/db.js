export async function firebaseGet(path, firebaseDatabaseUrl, databaseSecret = "") {
  const authPart = databaseSecret ? `?auth=${encodeURIComponent(databaseSecret)}` : "";
  const res = await fetch(`${firebaseDatabaseUrl}/${path}.json${authPart}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`firebaseGet failed: ${res.status}`);
  }

  return res.json();
}

export async function firebaseSet(path, value, firebaseDatabaseUrl, databaseSecret = "") {
  const authPart = databaseSecret ? `?auth=${encodeURIComponent(databaseSecret)}` : "";
  const res = await fetch(`${firebaseDatabaseUrl}/${path}.json${authPart}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    throw new Error(`firebaseSet failed: ${res.status}`);
  }

  return res.json();
}

export async function firebasePatch(path, value, firebaseDatabaseUrl, databaseSecret = "") {
  const authPart = databaseSecret ? `?auth=${encodeURIComponent(databaseSecret)}` : "";
  const res = await fetch(`${firebaseDatabaseUrl}/${path}.json${authPart}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    throw new Error(`firebasePatch failed: ${res.status}`);
  }

  return res.json();
}
