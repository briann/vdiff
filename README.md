vdiff
=====

Capture screenshots of webservers and perform visual diffs of them.

0) install postgres, create a vdiff_development table, create a vdiff user, grant all privs to that table to the user
1) npm install
2) in a separate window, start up a manet server (./node_modules/.bin/manet) by default on port 8891
3) gulp develop
