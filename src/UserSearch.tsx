import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGithubUser, searchGithubUser } from './github';
import UserCard from './UserCard';
import RecentSearches from './RecentSearches';
import { useDebounce } from 'use-debounce';
import SuggestionDropdown from './SuggestionDropDown';

const UserSearch = () => {
    const [username, setUsername] = useState('');
    const [submittedUsername, setSubmittedUsername] = useState('');
    const [recentUsers, setRecentUser] = useState<string[]>(() => {
        const stored = localStorage.getItem('recentUsers');
        return stored ? JSON.parse(stored) : [];
    });

    const [debouncedUsername] = useDebounce(username, 300);
    const [showSuggestion, setShowSuggestion] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['users', submittedUsername],
        queryFn: () => fetchGithubUser(submittedUsername),

        enabled: !!submittedUsername,
    });

    const { data: suggestions } = useQuery({
        queryKey: ['github-user-suggestions', debouncedUsername],
        queryFn: () => searchGithubUser(debouncedUsername),
        enabled: debouncedUsername.length > 1,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = username.trim();
        if (!trimmed) return;
        setSubmittedUsername(trimmed);
        setUsername('');

        setRecentUser((prev) => {
            const updated = [trimmed, ...prev.filter((u) => u != trimmed)];
            return updated.slice(0, 5);
        })
    }

    useEffect(() => {
        localStorage.setItem('recentUsers', JSON.stringify(recentUsers))
    }, [recentUsers])

    return (
        <>
            <form onSubmit={handleSubmit} className='form'>
                <div className='dropdown-wrapper'>
                    <input
                        type='text'
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setShowSuggestion(true);
                        }}
                        placeholder='Enter GitHub username'
                    />

                    {
                        showSuggestion && suggestions?.length > 0 && (
                            <SuggestionDropdown
                                suggestions={suggestions || []}
                                show={showSuggestion}

                                onSelect={(selected) => {
                                    setUsername(selected);
                                    setShowSuggestion(false);

                                    if(submittedUsername !== selected) {
                                        setSubmittedUsername(selected);
                                    } 
                                    else {
                                        refetch();
                                    }

                                    setRecentUser((prev) => {
                                        const updated = [selected, ...prev.filter((u) => u !== selected)];
                                        return updated.slice(0, 5);
                                    });
                                }}
                            />
                        )
                    }
                </div>

                <button type='submit'>Search</button>
            </form>

            {isLoading && <p className='status'>Loading...</p>}
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