-- The anon column grant on reports (set in 0024/0025) lists columns
-- explicitly — related_report_id (added in 0030) needs to be added too,
-- or anon's read access to it silently fails.
grant select (related_report_id) on reports to anon;
