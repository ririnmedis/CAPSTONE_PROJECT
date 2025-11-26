<?php

return [
    // List of admin emails allowed to access admin pages (alternative to users.is_admin flag)
    'emails' => array_filter([
        env('ADMIN_EMAIL') ?: null,
        // add static emails here if desired
        // 'admin@example.com',
    ]),
];
