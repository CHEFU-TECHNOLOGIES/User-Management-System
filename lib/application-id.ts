export function applicationId(name: string) {
    const slug = name.normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    if (!slug) return "";
    const id = /^[a-z]/.test(slug) && slug.length > 1 ? slug : `app-${slug}`;
    return id.slice(0, 64).replace(/-+$/, "");
}