import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const UserSearch = () => {
    const [username, setUsername] = useState('');
    const [submittedUsername, setSubmittedUsername] = useState('');

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['users', submittedUsername],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_GITHUB_API}/users/${submittedUsername}`);

            if (!res.ok) throw new Error('User not Found');

            const data = await res.json();
            console.log(data);
            return data;
        },

        enabled: !!submittedUsername,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmittedUsername(username.trim())
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
            {error && <p className='status error'>{error.message}</p>}

            {
                data && data && (
                    <div className='user-card'>
                        <img src={data.avatar_url} alt={data.name} className='avatar' />
                        <h2>{data.name || data.login}</h2>
                        <p className='bio'>{data.bio}</p>
                        <a
                            href={data.html_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='profile-btn'
                        >
                            View GitHub Profile
                        </a>
                    </div>
                )
            }
        </>
    );
};

export default UserSearch;