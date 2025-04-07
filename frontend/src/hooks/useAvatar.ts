import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

export function useAvatar(name: string) {
    const avatar = useMemo(() => {
        return createAvatar(initials, {
            size: 128,
            seed: name, // Use a unique seed for each user
            // ... other options
        }).toDataUri();
    }, [name]);

    return avatar;
}