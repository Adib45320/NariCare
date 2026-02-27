-- Assign admin role to the already-created admin user

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@naricare.com'
ON CONFLICT (user_id, role) DO NOTHING;
