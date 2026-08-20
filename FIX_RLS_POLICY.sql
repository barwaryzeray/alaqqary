-- Add missing RLS policy for profile INSERT
-- Run this in Supabase SQL Editor

CREATE POLICY "New users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
