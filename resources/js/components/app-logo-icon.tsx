import React from 'react';

export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <img
            src="/images/UnsikaLogo.png"
            alt="Unsika Logo"
            className={className ?? 'h-9 w-9 object-contain'}
        />
    );
}
