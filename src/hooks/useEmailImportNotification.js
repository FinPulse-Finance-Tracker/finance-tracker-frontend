import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { expenseService } from '../services/financeService';
import { useAuth } from '@clerk/clerk-react';

export function useEmailImportNotification() {
    const { isLoaded, isSignedIn } = useAuth();
    const [isDismissed, setIsDismissed] = useState(false);

    // Only run this query once per session, when auth is ready
    const { data: newData, isLoading } = useQuery({
        queryKey: ['new-email-expenses-since-login'],
        queryFn: expenseService.getNewSinceLogin,
        enabled: isLoaded && isSignedIn,
        staleTime: Infinity, // Never automatically fetch again during the session
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    // Fire toast exactly once if there's new data
    useEffect(() => {
        if (newData && newData.count > 0) {
            // Check session storage to avoid re-toasting on hot reloads
            const toastedKey = `email-import-toasted-${newData.count}-${newData.total}`;
            if (!sessionStorage.getItem(toastedKey)) {
                toast.success(`${newData.count} new expense${newData.count > 1 ? 's' : ''} auto-imported from Gmail!`, {
                    duration: 5000,
                    icon: '📬'
                });
                sessionStorage.setItem(toastedKey, 'true');
            }
        }
    }, [newData]);

    const dismiss = () => setIsDismissed(true);

    return {
        hasNew: !!newData && newData.count > 0,
        count: newData?.count || 0,
        total: newData?.total || 0,
        isLoading,
        isDismissed,
        dismiss
    };
}
