-- Run this migration once in the Supabase Dashboard SQL Editor.
-- It schedules daily cleanup at 03:00 in the pg_cron scheduler timezone (UTC by default).
create extension if not exists pg_cron;

select cron.schedule(
  'contact-messages-retention',
  '0 3 * * *',
  $job$
    delete from public.contact_messages
    where created_at < now() - interval '12 months'
       or (status = 'spam' and created_at < now() - interval '30 days');
  $job$
);

-- Check the scheduled job:
-- select jobid, schedule, command from cron.job
-- where jobname = 'contact-messages-retention';
--
-- Remove the scheduled job:
-- select cron.unschedule(jobid) from cron.job
-- where jobname = 'contact-messages-retention';