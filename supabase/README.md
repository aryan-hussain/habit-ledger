# Supabase setup

1) Create a Supabase project.
2) Run `supabase/schema.sql` in the SQL editor.
3) Add env vars:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The app is local-first: it reads from IndexedDB and syncs changes to Supabase when online.
