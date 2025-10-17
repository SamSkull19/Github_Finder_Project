export const fetchGithubUser = async (username: string) => {
    const res = await fetch(`${import.meta.env.VITE_GITHUB_API}/users/${username}`);

    if (!res.ok) throw new Error('User not found');

    const data = await res.json();
    return data;
}

export const searchGithubUser = async (query: string) => {
    const res = await fetch(`${import.meta.env.VITE_GITHUB_API}/search/users?q=${query}`);

    if (!res.ok) throw new Error('User not found');

    const data = await res.json();
    return data.items;
}