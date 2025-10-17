import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubUser } from './github';
import UserCard from './UserCard';
import RecentSearches from './RecentSearches';

const UserSearch = () => {
    const [username, setUsername] = useState('');
    const [submittedUsername, setSubmittedUsername] = useState('');
    const [recentUsers, setRecentUser] = useState<string[]>([]);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['users', submittedUsername],
        queryFn: () => fetchGithubUser(submittedUsername),

        enabled: !!submittedUsername,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = username.trim();
        if (!trimmed) return;
        setSubmittedUsername(trimmed);

        setRecentUser((prev) => {
            const updated = [trimmed, ...prev.filter((u) => u != trimmed)];
            return updated.slice(0, 5);
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit} className='form'>
                <input
                    type="text"
                    placeholder='Enter Github Username...'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <button type='submit'>Search</button>
            </form>

            {isLoading && <p className='status'>Loading...</p>}
            {isError && <p className='status'>Error...</p>}
            {error && <p className='status error'>{error.message}</p>}

            {
                data && <UserCard user={data} />
            }

            {
                recentUsers.length > 0 && (
                    <RecentSearches
                        users={recentUsers}
                        onSelect={(username) => {
                            setUsername(username);
                            setSubmittedUsername(username);
                        }}
                    />
                )
            }
        </>
    );
};

export default UserSearch;